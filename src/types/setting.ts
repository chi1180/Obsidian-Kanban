/**
 * Options of view configuration
 */
export interface ViewOptions {
  cardSize: "small" | "medium" | "large";
  showColumnColor: boolean;
}

/**
 * Used in the plugin setting tab. Not in view options
 */
export interface PluginSettings extends ViewOptions {
  confirmCardDeletion: boolean;
}
