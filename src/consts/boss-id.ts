import { Bosses } from './bosses';

export const bossIdToBossMap = new Map<number, Bosses>([
    [29022, Bosses.Zaken],
    [29014, Bosses.Orfen],
    [29001, Bosses.AQ],
    [29006, Bosses.Core],
    [29020, Bosses.Baium],
    [25742, Bosses.PriestCore],
    [25738, Bosses.PriestAQ],
    [25743, Bosses.PriestOrfen],
    [25739, Bosses.PriestBaium],
    [25766, Bosses.Lv80_Minotaur],
    [25767, Bosses.Lv85_Bulleroth],
    [25773, Bosses.Lv80_Tabris],
    [25775, Bosses.Lv85_Dephracor],
    [25241, Bosses.Lv80_Tamash],
    [25366, Bosses.Lv85_Kuroboros],
    [25478, Bosses.Lv80_Hisilrome],
    [25252, Bosses.Lv85_Palibati],
    [25444, Bosses.ToiRamdal],
    [25220, Bosses.ToiHallate],
    [25447, Bosses.ToiMardil],
    [25092, Bosses.ToiKorim],
    [25054, Bosses.ToiKernon],
    [25126, Bosses.ToiGolkonda],
    [25143, Bosses.ToiShuriel],
    [25450, Bosses.ToiGalaxia],
    [25756, Bosses.DvKatuba],
]);

export const bossToBossIdMap = new Map<Bosses, number>(
    Array.from(bossIdToBossMap.entries()).map(([key, value]) => [value, key])
);
