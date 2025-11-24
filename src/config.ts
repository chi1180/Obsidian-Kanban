import type { PluginSettings, ViewOptions } from "./types/setting";

/**
 * Basic plugin information
 */
export const PLUGIN_CONFIG = {
  /* PLUGIN (!same values with manifest.json) */
  plugin_id: "kanban-view",
  plugin_name: "Kanban view",

  /* BASES */
  bases_view_type: "kanban-view",
  bases_view_name: "Kanban",
  bases_view_icon: "kanban",
};

/**
 * Keys for plugin settings
 */
export const SETTING_KEYS = {
  CARD_SIZE: "cardSize" as keyof PluginSettings,
  SHOW_COLUMN_COLOR: "showColumnColor" as keyof PluginSettings,
  CONFIRM_CARD_DELETION: "confirmCardDeletion" as keyof PluginSettings,
};

/**
 * Plugin setting properties' options
 * Because below options can be used in view options panel and plugin settigng tab,
 * they are defined here.
 */
export const PLUGIN_SETTING_OPTIONS = {
  [SETTING_KEYS.CARD_SIZE]: {
    small: "Small",
    medium: "Medium",
    large: "Large",
  },
};

/**
 * Default settings for the plugin
 */
export const DEFAULT_PLUGIN_SETTINGS: PluginSettings = {
  cardSize: "medium" as ViewOptions["cardSize"],
  showColumnColor: true,
  confirmCardDeletion: true,
};
