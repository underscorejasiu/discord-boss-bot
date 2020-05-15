import * as Discord from 'discord.js';
import config from 'config';

import { TextChannel, Message } from 'discord.js';
import { asyncForEach } from '../helpers/async-for-each.helper';
import {
    BossStateEntity,
    bossStatusStoreService,
} from './boss-status-store.service';
import { formatDate, formatTime } from '../helpers/date-formater.helper';
import {
    BossConfiguration,
    FixedWeekDay,
    Spawn,
    WidgetConfig,
    WindowWidgetConfig,
} from '../models/boss-config';
import {
    isGroupEntityWindowWidget,
    isSingleEntityWindowWidget,
    isWindowWidget,
} from '../guards/window-widget.guard';
import {
    currentTimeDifference,
    isWindowOpen,
} from '../helpers/check-window.helper';
import { utcToZonedTime } from 'date-fns-tz';
import { add, addHours, isFuture, isPast, nextDay, set } from 'date-fns';
import { BossStatus } from '../models/boss-status';

const channelId = config.get('discord.windowChannel');

enum BossWindowState {
    Alive,
    InCombat,
    InWindow,
    BeforeWindow,
    Unknown,
}

const icons = {
    greenCircle: ':green_circle:',
    yellowCircle: ':yellow_circle:',
    redCircle: ':red_circle:',
    loudSpeaker: ':loudspeaker:',
    combat: ':crossed_swords:',
};

const windowStateToIcons = {
    [BossWindowState.Alive]: icons.greenCircle,
    [BossWindowState.BeforeWindow]: icons.redCircle,
    [BossWindowState.InCombat]: icons.combat,
    [BossWindowState.InWindow]: icons.yellowCircle,
    [BossWindowState.Unknown]: icons.loudSpeaker,
};

class Group {
    type = 'group';
    entries: BossEntry[] = [];

    constructor(public name: string) {}

    addBossEntry(bossEntry: BossEntry) {
        this.entries.push(bossEntry);
    }

    toWindowString(bossState: Map<number, BossStateEntity>): string {
        const upcommingBosses = this.entries
            .filter(
                (entry) => entry.getBossStatus(bossState) === BossStatus.DEAD
            )
            .map((entry) => ({
                name: entry.name,
                spawnDate: entry.getNextBossSpawnDate(
                    entry.getBossTod(bossState)
                ),
            }))
            .filter(({ spawnDate }) => spawnDate && isFuture(spawnDate))
            .sort(
                ({ spawnDate: a }, { spawnDate: b }) =>
                    a.getTime() - b.getTime()
            );

        return `${this.name}: ${this.entries
            .map((entry) =>
                entry.getBossStatusIcon(entry.resolveBossWindowState(bossState))
            )
            .join(' ')}${
            upcommingBosses[0]
                ? ` next ${upcommingBosses[0].name} in ${formatTime(
                      currentTimeDifference(upcommingBosses[0].spawnDate)
                  )}`
                : ''
        }`;
    }
}

class BossEntry {
    type = 'boss';

    constructor(
        public id: number,
        public name: string,
        public spawn: Spawn | FixedWeekDay
    ) {}

    calculateTimeUntilSpawn(tod: Date): Duration {
        return currentTimeDifference(this.getNextBossSpawnDate(tod));
    }

    getNextBossSpawnDate(tod: Date): Date {
        if (!this.spawn) {
            return null;
        }

        if (this.spawn.type === 'fixed-time') {
            const currentDateInServerTZ = utcToZonedTime(
                tod,
                config.get('timeZone')
            );
            const nextDayInServerTZ = add(currentDateInServerTZ, { days: 1 });
            const spawns = [
                ...this.spawn.value.map((spawnHour) =>
                    set(currentDateInServerTZ, {
                        hours: spawnHour,
                        minutes: 0,
                        seconds: 0,
                        milliseconds: 0,
                    })
                ),
                ...this.spawn.value.map((spawnHour) =>
                    set(nextDayInServerTZ, {
                        hours: spawnHour,
                        minutes: 0,
                        seconds: 0,
                        milliseconds: 0,
                    })
                ),
            ].filter((spawnDate) => !isPast(spawnDate));
            const nextSpawn = spawns[0] ? spawns[0] : new Date();

            return nextSpawn;
        }

        if (this.spawn.type === 'fixed-week-day') {
            const currentDateInServerTZ = utcToZonedTime(
                tod,
                config.get('timeZone')
            );
            const spawns = this.spawn.value
                .map(([weekDay, dayHour, hourMin]) =>
                    set(nextDay(currentDateInServerTZ, weekDay), {
                        hours: dayHour,
                        minutes: hourMin,
                        seconds: 0,
                        milliseconds: 0,
                    })
                )
                .filter((spawnDate) => !isPast(spawnDate))
                .sort((a, b) => a.getTime() - b.getTime());
            const nextSpawn = spawns[0] ? spawns[0] : new Date();

            return nextSpawn;
        }

        if (this.spawn.type === 'fixed-range') {
            const spawnDate = addHours(tod, this.spawn.value[0]);
            return spawnDate;
        }

        if (this.spawn.type === 'range') {
            const windowStartDate = addHours(tod, this.spawn.value[0]);
            const windowEndDate = addHours(tod, this.spawn.value[1]);
            return isFuture(windowStartDate) ? windowStartDate : windowEndDate;
        }

        throw new Error(`Incorrect spawn type: ${this.spawn.type}!`);
    }

    getBossStatus(bossState: Map<number, BossStateEntity>): BossStatus {
        return bossState.get(this.id).status;
    }

    getBossTod(bossState: Map<number, BossStateEntity>): Date {
        const tod = bossState.get(this.id).tod;
        return utcToZonedTime(tod, config.get('timeZone'));
    }

    isInWindow(tod: Date): boolean {
        if (this.spawn.type !== 'range') {
            throw new Error(
                'isInWindow() can only be called over range spawn type!'
            );
        }

        const windowStartDate = addHours(tod, this.spawn.value[0]);
        const windowEndDate = addHours(tod, this.spawn.value[1]);
        return isWindowOpen(windowStartDate, windowEndDate);
    }

    isBeforeWindowStarts(tod: Date): boolean {
        if (this.spawn.type !== 'range' && this.spawn.type !== 'fixed-range') {
            throw new Error(
                'isInWindow() can only be called over range spawn type!'
            );
        }

        const windowStartDate = addHours(tod, this.spawn.value[0]);
        return isFuture(windowStartDate);
    }

    resolveBossWindowState(
        bossState: Map<number, BossStateEntity>
    ): BossWindowState {
        const bossStatus = this.getBossStatus(bossState);
        if (bossStatus === BossStatus.ALIVE) {
            return BossWindowState.Alive;
        }

        if (bossStatus === BossStatus.IN_COMBAT) {
            return BossWindowState.InCombat;
        }

        if (!this.spawn) {
            return BossWindowState.BeforeWindow;
        }

        const isFixedSpawn =
            this.spawn.type === 'fixed-time' ||
            this.spawn.type === 'fixed-week-day';
        if (
            isFixedSpawn &&
            isFuture(this.getNextBossSpawnDate(this.getBossTod(bossState)))
        ) {
            return BossWindowState.BeforeWindow;
        }

        if (
            !isFixedSpawn &&
            this.isBeforeWindowStarts(this.getBossTod(bossState))
        ) {
            return BossWindowState.BeforeWindow;
        }

        if (
            this.spawn.type === 'range' &&
            this.isInWindow(this.getBossTod(bossState))
        ) {
            return BossWindowState.InWindow;
        }

        return BossWindowState.Unknown;
    }

    getBossStatusIcon(windowState: BossWindowState): string {
        return windowStateToIcons[windowState];
    }

    toWindowString(bossState: Map<number, BossStateEntity>): string {
        const windowState = this.resolveBossWindowState(bossState);
        const icon = this.getBossStatusIcon(windowState);

        if (windowState === BossWindowState.Alive) {
            return `${this.name}: ${icon} is alive.`;
        }

        if (windowState === BossWindowState.InCombat) {
            return `${this.name}: ${icon} is in combat!`;
        }

        if (windowState === BossWindowState.InWindow) {
            return `${this.name}: ${icon} window ends in ${formatTime(
                this.calculateTimeUntilSpawn(this.getBossTod(bossState))
            )}.`;
        }

        if (windowState === BossWindowState.BeforeWindow) {
            if (this.spawn.type === 'range') {
                return `${this.name}: ${icon} window starts in ${formatTime(
                    this.calculateTimeUntilSpawn(this.getBossTod(bossState))
                )}.`;
            }

            return `${this.name}: ${icon} spawn in ${formatTime(
                this.calculateTimeUntilSpawn(this.getBossTod(bossState))
            )}!`;
        }

        return `${this.name}: ${icon} BOSS STATE DESYNCED!`;
    }
}

const windowList: Array<Group | BossEntry> = consumeBossConfig(
    config.get('bossConfig')
);

async function init(client: Discord.Client) {
    await removeAllChannelMessages(client);

    const message = await addWindowMessage(client);

    bossStatusStoreService.registerListener(async (bossState) => {
        try {
            const newMessage = await getWindowMessage(bossState);
            return await message.edit(newMessage);
        } catch (error) {
            console.log(`Error durgin reading new message: `, error);
            return null;
        }
    });
}

async function removeAllChannelMessages(client: Discord.Client) {
    const windowChannel: TextChannel = client.channels.cache.get(
        channelId
    ) as TextChannel;

    let messages = (await windowChannel.messages.fetch()).array();
    while (messages.length > 0) {
        await asyncForEach<Message>(messages, async (message: Message) => {
            await message.delete();
        });

        messages = (await windowChannel.messages.fetch()).array();
    }
}

async function addWindowMessage(client: Discord.Client) {
    const windowChannel: TextChannel = client.channels.cache.get(
        channelId
    ) as TextChannel;
    return windowChannel.send(
        await getWindowMessage(bossStatusStoreService.getStore())
    );
}

async function getWindowMessage(bossState: Map<number, BossStateEntity>) {
    return `${windowList
        .map((windowEntry) => windowEntry.toWindowString(bossState))
        .join('\n')}

Last update: ${formatDate(bossStatusStoreService.getModificationTime())}`;
}

export const constantWindowService = {
    init,
};

function consumeBossConfig(
    bossConfig: BossConfiguration[]
): Array<Group | BossEntry> {
    const windowEntriesMap: Record<
        string,
        Group | BossEntry
    > = bossConfig.reduce((state, { name, widgets, id }) => {
        const windowWidget = widgets.find((widget) =>
            isWindowWidget(widget)
        ) as WidgetConfig<WindowWidgetConfig>;
        if (!windowWidget) {
            return state;
        }

        if (isGroupEntityWindowWidget(windowWidget)) {
            const groupName = windowWidget.properties.name;
            if (!state[groupName]) {
                state[groupName] = new Group(groupName);
            }

            if (state[groupName].type === 'boss') {
                throw new Error(
                    `Group name colision with boss named: ${groupName}!`
                );
            }

            const group = state[groupName] as Group;
            group.addBossEntry(
                new BossEntry(id, name, windowWidget.properties.spawn)
            );
        }

        if (isSingleEntityWindowWidget(windowWidget)) {
            if (state[name]) {
                throw new Error(`Duplicated boss name: "${name}"!`);
            }

            state[name] = new BossEntry(
                id,
                name,
                windowWidget.properties.spawn
            );
        }

        return state;
    }, {} as Record<string, Group | BossEntry>);
    return Object.values(windowEntriesMap);
}
