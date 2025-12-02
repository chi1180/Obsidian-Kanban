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

  /* LOCALSTORAGE */
  column_order_key: "kanban-view-column-order",
};

/**
 * Keys for plugin settings
 */
export const SETTING_KEYS = {
  CARD_SIZE: "cardSize" as keyof PluginSettings as string,
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

/**
 * Base colors for columns
 */
export const BASE_COLORS: Record<string, string> = {
  gray: "#6B7280",
  sky: "#0284C7",
  emerald: "#059669",
  amber: "#D97706",
  violet: "#7C3AED",
  rose: "#E11D48",
  slate: "#64748B",
  stone: "#78716C",
};
