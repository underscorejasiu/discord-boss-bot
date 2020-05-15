import { BossStatus } from '../models/boss-status';

export function split(input: string, len: number): string[] {
    return input.match(
        new RegExp(
            '.{1,' + len + '}(?=(.{' + len + '})+(?!.))|.{1,' + len + '}$',
            'g'
        )
    );
}

export function parseBossList(bossBinHex: string): string[] {
    return split(bossBinHex.substring(16), 24);
}

export function readLittleEndian(endian: string): number {
    return parseInt('0x' + (endian.match(/../g) || []).reverse().join(''));
}

export function readBossId(bossStatus: string): number {
    return readLittleEndian(bossStatus.substr(0, 4));
}

export function readBossStatus(bossStatus: string): BossStatus {
    return Number(bossStatus[9]);
}

export function readBossTOD(bossStatus: string): Date {
    return new Date(readLittleEndian(bossStatus.substring(16, 24)) * 1000);
}
