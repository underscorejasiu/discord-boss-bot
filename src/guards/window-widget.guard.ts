import {
    GroupWindowConfig,
    NotificatioWidgetConfig,
    SingleWindowConfig,
    WidgetConfig,
    WindowWidgetConfig,
} from '../models/boss-config';

export function isWindowWidget(
    widget: WidgetConfig<WindowWidgetConfig | NotificatioWidgetConfig>
): widget is WidgetConfig<WindowWidgetConfig> {
    return widget.type === 'window';
}

export function isSingleEntityWindowWidget(
    widget: WidgetConfig<WindowWidgetConfig>
): widget is WidgetConfig<SingleWindowConfig> {
    return widget.properties.display === 'single';
}

export function isGroupEntityWindowWidget(
    widget: WidgetConfig<WindowWidgetConfig>
): widget is WidgetConfig<GroupWindowConfig> {
    return widget.properties.display === 'group';
}
