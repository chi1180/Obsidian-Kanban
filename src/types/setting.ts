export interface ViewOptions {
  cardSize: "small" | "medium" | "large";
  showColumnColor: boolean;
}

export interface PluginSettings extends ViewOptions {
  confirmCardDeletion: boolean;
}
