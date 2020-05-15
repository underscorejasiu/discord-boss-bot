import fs from 'fs';
import config from 'config';

import { Bosses } from '../consts/bosses';
import { BossStatus } from '../models/boss-status';
import { formatDate } from '../helpers/date-formater.helper';
import {
    parseBossList,
    readBossId,
    readBossStatus,
} from '../helpers/boss-update.helper';
import { bossToBossIdMap } from '../consts/boss-id';
import { readBossTOD } from '../helpers/boss-update.helper';
import { asyncForEach } from '../helpers/async-for-each.helper';

export interface BossStateEntity {
    id: number;
    status: BossStatus;
    tod: Date;
}

const mapUpdatePath = config.get('bossUpdate.path');

// todo: rewrite to manager class
const store: Map<number, BossStateEntity> = new Map();
let mTime = new Date();

type BossStatusListener = (entries: Map<number, BossStateEntity>) => void;

const listeners: Set<BossStatusListener> = new Set();

function getStore(): Map<number, BossStateEntity> {
    return new Map(store);
}
function getAllBossState(): BossStateEntity[] {
    return Array.from(store.values());
}

function getModificationTime() {
    return mTime;
}

function getBossStateByName(bossName: Bosses): BossStateEntity {
    return store.get(bossToBossIdMap.get(bossName));
}

function getBossStateById(bossId: number): BossStateEntity {
    return store.get(bossId);
}

function registerListener(listener: BossStatusListener) {
    listeners.add(listener);

    return () => listeners.delete(listener);
}

function watchBosses(): () => void {
    fs.watchFile(mapUpdatePath, async (value) => {
        console.log(`${formatDate(new Date())} -- boss list changed`);
        mTime = value.mtime;
        readBossFile();
        await notifySubscribers();
    });

    return () => fs.unwatchFile(mapUpdatePath);
}

function readBossFile() {
    const updatedList = fs.readFileSync(mapUpdatePath, 'utf8');
    const bossList: string[] = parseBossList(updatedList);

    bossList.forEach((rawBossStatus: string) => {
        const id = readBossId(rawBossStatus);

        const bossState: BossStateEntity = {
            id,
            status: readBossStatus(rawBossStatus),
            tod: readBossTOD(rawBossStatus),
        };
        store.set(id, bossState);
    });
}

async function notifySubscribers() {
    return await asyncForEach<BossStatusListener>(
        Array.from(listeners.values()),
        async (listener) => await listener(new Map(store))
    );
}

console.log(`${formatDate(new Date())} -- initialising boss list`);
readBossFile();
notifySubscribers();

export const bossStatusStoreService = {
    getStore,
    watchBosses,
    registerListener,
    getAllBossState,
    getBossStateByName,
    getBossStateById,
    getModificationTime,
};
