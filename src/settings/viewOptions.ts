import type { ViewOption } from "obsidian";
import { PLUGIN_SETTING_OPTIONS, SETTING_KEYS } from "src/config";
import type { PluginSettings } from "src/types/setting";

export function KANBAN_VIEW_OPTIONS(settings: PluginSettings) {
  const options: ViewOption[] = [
    {
      type: "dropdown",
      displayName: "Card size",
      key: SETTING_KEYS.CARD_SIZE,
      default: settings.cardSize,
      options: PLUGIN_SETTING_OPTIONS[SETTING_KEYS.CARD_SIZE],
    },
    {
      type: "toggle",
      displayName: "Show column colors",
      key: SETTING_KEYS.SHOW_COLUMN_COLOR,
      default: settings.showColumnColor,
    },
  ];

  return options;
}
