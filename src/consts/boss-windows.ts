import { Bosses } from './bosses';

export const SPAWN_WINDOWS: Record<
    Exclude<
        Bosses,
        | Bosses.ToiRamdal
        | Bosses.ToiGalaxia
        | Bosses.ToiGolkonda
        | Bosses.ToiHallate
        | Bosses.ToiKernon
        | Bosses.ToiKorim
        | Bosses.ToiMardil
        | Bosses.ToiRamdal
        | Bosses.ToiShuriel
    >,
    [number, number]
> = {
    [Bosses.AQ]: [7, 9],
    [Bosses.Core]: [6, 10],
    [Bosses.Zaken]: [2, 14],
    [Bosses.Orfen]: [4, 12],
    [Bosses.Baium]: [8, 8],
    [Bosses.PriestAQ]: [22, 22],
    [Bosses.PriestCore]: [22, 22],
    [Bosses.PriestOrfen]: [22, 22],
    [Bosses.PriestBaium]: [22, 22],
    [Bosses.Lv80_Hisilrome]: [22, 22],
    [Bosses.Lv80_Minotaur]: [22, 22],
    [Bosses.Lv80_Tabris]: [22, 22],
    [Bosses.Lv80_Tamash]: [22, 22],
    [Bosses.Lv85_Bulleroth]: [22, 22],
    [Bosses.Lv85_Dephracor]: [22, 22],
    [Bosses.Lv85_Kuroboros]: [22, 22],
    [Bosses.Lv85_Palibati]: [22, 22],
    [Bosses.DvKatuba]: [22, 22],
};
