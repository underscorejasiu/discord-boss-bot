import { intervalToDuration, Duration } from 'date-fns';

export function isSameTime(windowOpen: Date, windowClose: Date): boolean {
    return windowOpen.getTime() === windowClose.getTime();
}

export function isWindowOpen(windowOpen: Date, windowClose: Date): boolean {
    const now = new Date().getTime();
    return now >= windowOpen.getTime() && windowClose.getTime() >= now;
}

export function isBeforeWindow(windowOpen: Date): boolean {
    return new Date().getTime() < windowOpen.getTime();
}

export function isWindowMiss(windowClose: Date): boolean {
    return new Date().getTime() > windowClose.getTime();
}

export function currentTimeDifference(date: Date): Duration {
    return intervalToDuration({ start: new Date(), end: date });
}
