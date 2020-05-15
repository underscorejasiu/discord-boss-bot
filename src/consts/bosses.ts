export enum Bosses {
    AQ = 'AQ',
    Core = 'Core',
    Zaken = 'Zaken',
    Orfen = 'Orfen',
    Baium = 'Baium',
    PriestAQ = 'PriestAQ',
    PriestCore = 'PriestCore',
    PriestOrfen = 'PriestOrfen',
    PriestBaium = 'PriestBaium',
    Lv80_Hisilrome = 'Lv80_Hisilrome',
    Lv80_Minotaur = 'Lv80_Minotaur',
    Lv80_Tamash = 'Lv80_Tamash',
    Lv80_Tabris = 'Lv80_Tabris',
    Lv85_Palibati = 'Lv85_Palibati',
    Lv85_Bulleroth = 'Lv85_Bulleroth',
    Lv85_Kuroboros = 'Lv85_Kuroboros',
    Lv85_Dephracor = 'Lv85_Dephracor',
    ToiRamdal = 'ToiRamdal',
    ToiHallate = 'ToiHallate',
    ToiMardil = 'ToiMardil',
    ToiKorim = 'ToiKorim',
    ToiKernon = 'ToiKernon',
    ToiGolkonda = 'ToiGolkonda',
    ToiShuriel = 'ToiShuriel',
    ToiGalaxia = 'ToiGalaxia',
    DvKatuba = 'DvKatuba',
}

export type windowedBosses = Extract<
    Bosses,
    Bosses.Zaken | Bosses.AQ | Bosses.Core | Bosses.Orfen
>;
