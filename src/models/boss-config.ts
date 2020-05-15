export interface WidgetConfig<T> {
    type: string;
    properties: T;
}

export interface GroupWindowConfig {
    display: 'group';
    name: string;
    spawn: Spawn | FixedWeekDay;
}

export interface Spawn {
    type: 'fixed-range' | 'fixed-time' | 'range';
    value: number[];
}

export interface FixedWeekDay {
    type: 'fixed-week-day';
    value: [Day, number, number][];
}

export interface SingleWindowConfig {
    display: 'single';
    spawn: Spawn;
}

export type WindowWidgetConfig = GroupWindowConfig | SingleWindowConfig;

export interface NotificatioWidgetConfig {
    mention: 'all' | 'non';
}

export interface BossConfiguration {
    type: string;
    id: number;
    name: string;
    widgets: WidgetConfig<WindowWidgetConfig | NotificatioWidgetConfig>[];
}
