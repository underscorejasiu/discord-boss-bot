import {
    NotificatioWidgetConfig,
    WidgetConfig,
    WindowWidgetConfig,
} from '../models/boss-config';

export function isNotificationWidget(
    widget: WidgetConfig<WindowWidgetConfig | NotificatioWidgetConfig>
): widget is WidgetConfig<NotificatioWidgetConfig> {
    return widget.type === 'notify';
}
