import {
    currentTimeDifference,
    isSameTime,
    isWindowMiss,
    isWindowOpen,
} from './check-window.helper';
import { formatTime } from './date-formater.helper';
import { Bosses } from '../consts/bosses';

export function formatOpenWindows(
    bossTimers: Record<Bosses, { window: [Date, Date]; label: string }>
): string {
    const icons = {
        greenCircle: ':green_circle:',
        redCircle: ':red_circle:',
        loudSpeaker: ':loudspeaker:',
        combat: ':crossed_swords:',
    };

    return Object.values(bossTimers)
        .map((bossInfo) => {
            const [timeOpen, timeClose] = bossInfo.window;
            const name = bossInfo.label;

            if (isSameTime(timeOpen, timeClose)) {
                const timeDifference = formatTime(
                    currentTimeDifference(timeOpen)
                );
                const message = isWindowMiss(timeOpen)
                    ? `${icons.greenCircle} spawned ${timeDifference} ago`
                    : `${icons.redCircle} spawns in ${timeDifference}`;

                return `${name}: ${message}`;
            }

            if (isWindowOpen(timeOpen, timeClose)) {
                return `${name}: :green_circle: closes in ${formatTime(
                    currentTimeDifference(timeClose)
                )}`;
            }

            if (isWindowMiss(timeClose)) {
                return `${name}: :loudspeaker: timer missed!`;
            }

            return `${name}: :red_circle: opens in ${formatTime(
                currentTimeDifference(timeOpen)
            )}`;
        })
        .join('\n');
}

const icons = {
    greenCircle: ':green_circle:',
    redCircle: ':red_circle:',
    loudSpeaker: ':loudspeaker:',
    combat: ':crossed_swords:',
};

export function formatBossWindow(
    bossTimers: Record<Bosses, { window: [Date, Date]; label: string }>
): string {
    return Object.values(bossTimers)
        .map((bossInfo) => {
            const [timeOpen, timeClose] = bossInfo.window;
            const name = bossInfo.label;

            if (isSameTime(timeOpen, timeClose)) {
                const timeDifference = formatTime(
                    currentTimeDifference(timeOpen)
                );
                const message = isWindowMiss(timeOpen)
                    ? `${icons.greenCircle} spawned ${timeDifference} ago`
                    : `${icons.redCircle} spawns in ${timeDifference}`;

                return `${name}: ${message}`;
            }

            if (isWindowOpen(timeOpen, timeClose)) {
                return `${name}: :green_circle: closes in ${formatTime(
                    currentTimeDifference(timeClose)
                )}`;
            }

            if (isWindowMiss(timeClose)) {
                return `${name}: :loudspeaker: timer missed!`;
            }

            return `${name}: :red_circle: opens in ${formatTime(
                currentTimeDifference(timeOpen)
            )}`;
        })
        .join('\n');
}
