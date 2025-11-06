/**
 * Default Settings
 * Default configuration values for the plugin
 */

import type { KanbanPluginSettings } from "../types/settings";
import { CARD_SIZES } from "../types/settings";

/**
 * Plugin default settings
 * Used on fresh installation or when resetting settings
 */
export const DEFAULT_SETTINGS: KanbanPluginSettings = {
  /** Default card size: Medium */
  cardSize: CARD_SIZES.MEDIUM,

  /** Maximum cards per column: unlimited (0) */
  maxCardsPerColumn: 0,

  /** Enable drag and drop by default */
  draggable: true,

  /** Show card count by default */
  showCardCount: true,

  /** Compact mode disabled by default */
  compactMode: false,
};
