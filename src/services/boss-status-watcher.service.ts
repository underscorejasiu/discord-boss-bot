import * as Discord from 'discord.js';
import config from 'config';

import { TextChannel } from 'discord.js';
import { BossStatus } from '../models/boss-status';
import { asyncForEach } from '../helpers/async-for-each.helper';
import {
    BossStateEntity,
    bossStatusStoreService,
} from './boss-status-store.service';
import {
    BossConfiguration,
    NotificatioWidgetConfig,
    WidgetConfig,
} from '../models/boss-config';
import { isNotificationWidget } from '../guards/notification-widget.guard';

interface BossState {
    status: BossStatus;
    id: number;
    name: string;
    notificationType: 'all' | 'non';
}

const bossesState: Map<number, BossState> = consumeBossConfig(
    config.get('bossConfig')
);

function init(client: Discord.Client) {
    const unsubscribe = bossStatusStoreService.registerListener(
        bossStatusChangeCb
    );

    return unsubscribe;

    async function bossStatusChangeCb(
        state: Map<number, BossStateEntity>
    ): Promise<void> {
        await asyncForEach(
            Array.from(bossesState.values()),
            async ({
                id,
                name,
                status: oldStatus,
                notificationType,
            }: BossState) => {
                const newState = state.get(id);
                if (!newState || oldStatus === newState.status) {
                    return;
                }

                const newStatus = newState.status;
                bossesState.set(id, {
                    id,
                    name,
                    notificationType,
                    status: newStatus,
                });

                const allyChannel: TextChannel = client.channels.cache.get(
                    config.get('discord.notificationChannel')
                ) as TextChannel;

                if (
                    newStatus === BossStatus.ALIVE &&
                    oldStatus === BossStatus.DEAD
                ) {
                    await allyChannel.send(
                        `${getBossNotification(
                            notificationType
                        )}${name} Has Spawned.`
                    );
                } else if (newStatus === BossStatus.IN_COMBAT) {
                    await allyChannel.send(`${name} - in combat.`);
                } else if (newStatus === BossStatus.DEAD) {
                    await allyChannel.send(`${name} - died.`);
                }
            }
        );
    }
}

export const bossStatusWatcherService = {
    init,
};

function getBossNotification(notificationType: 'all' | 'non') {
    return notificationType === 'all'
        ? `${config.get('discord.allNotificationType')} - `
        : '';
}

function consumeBossConfig(
    bossConfig: BossConfiguration[]
): Map<number, BossState> {
    return bossConfig.reduce((state, bossConfig) => {
        const notificationWidget = bossConfig.widgets.find((widget) =>
            isNotificationWidget(widget)
        ) as WidgetConfig<NotificatioWidgetConfig>;
        if (!notificationWidget) {
            return state;
        }

        state.set(bossConfig.id, {
            status: BossStatus.DEAD,
            id: bossConfig.id,
            name: bossConfig.name,
            notificationType: notificationWidget.properties.mention,
        });

        return state;
    }, new Map<number, BossState>());
}
