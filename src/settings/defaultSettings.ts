/**
 * デフォルト設定
 *
 * プラグイン全体のデフォルト設定値を定義します。
 * ビュー固有の設定は Base プラグインの config で管理されます。
 */

import { KanbanPluginSettings } from "../types/settings";

/**
 * プラグインのデフォルト設定
 */
export const DEFAULT_PLUGIN_SETTINGS: KanbanPluginSettings = {
  defaultCardSize: "medium",
  defaultNewFileLocation: "/",
  defaultSortOrder: "created",
  enableDragAndDrop: true,
  showCardCount: true,
  compactMode: false,
  showColumnColors: true,
};
