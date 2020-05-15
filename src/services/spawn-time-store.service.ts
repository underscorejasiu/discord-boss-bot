import { addHours } from 'date-fns';
import { BossStatus } from 'src/models/boss-status';
import { bossToBossNameMap } from '../consts/boss-names';
import { SPAWN_WINDOWS } from '../consts/boss-windows';
import { Bosses } from '../consts/bosses';
import {
    BossStateEntity,
    bossStatusStoreService,
} from './boss-status-store.service';

export const bossesNames = Object.keys(SPAWN_WINDOWS);

function getBossSpawnTime(
    bossName: string,
    bossState: BossStateEntity | null
): [Date, Date] {
    const [minSpawnTime, maxSpawnTime] = SPAWN_WINDOWS[bossName];
    const bossTOD = bossState ? bossState.tod : new Date(2001, 9, 11);
    return [addHours(bossTOD, minSpawnTime), addHours(bossTOD, maxSpawnTime)];
}

export function getAll(): Record<
    Bosses,
    { window: [Date, Date]; label: string; status: BossStatus }
> {
    return bossesNames.reduce((accumulator, bossName: Bosses) => {
        const bossState = bossStatusStoreService.getBossStateByName(bossName);
        accumulator[bossName] = {
            window: getBossSpawnTime(bossName, bossState),
            status: bossState.status,
            label: bossToBossNameMap.get(bossName),
        };
        return accumulator;
    }, {} as Record<Bosses, { window: [Date, Date]; label: string; status: BossStatus }>);
}
