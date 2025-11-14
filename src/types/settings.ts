/**
 * 設定の型定義
 *
 * プラグイン全体の設定の型を定義しています。
 * ビュー固有の設定は Base プラグインの config で管理されます。
 */

import type { CardSize, SortOrder } from "./kanban";

export type { CardSize, SortOrder };

/**
 * プラグイン全体の設定
 * Obsidian の設定タブで管理されるグローバル設定
 */
export interface KanbanPluginSettings {
  /** デフォルトのカードサイズ */
  defaultCardSize: CardSize;

  /** デフォルトの新規ファイル作成場所 */
  defaultNewFileLocation: string;

  /** デフォルトのソート順 */
  defaultSortOrder: SortOrder;

  /** ドラッグ&ドロップを有効にするか */
  enableDragAndDrop: boolean;

  /** カード数を表示するか */
  showCardCount: boolean;

  /** コンパクトモードを有効にするか */
  compactMode: boolean;

  /** カラムごとに色を表示するか */
  showColumnColors: boolean;
}

/**
 * 設定のキー定数
 */
export const SETTINGS_KEYS = {
  CARD_SIZE: "cardSize",
  SORT_ORDER: "sortOrder",
  ENABLE_DRAG_AND_DROP: "enableDragAndDrop",
  SHOW_CARD_COUNT: "showCardCount",
  COMPACT_MODE: "compactMode",
  COLUMN_PROPERTY: "columnProperty",
  SHOW_COLUMN_COLORS: "showColumnColors",
} as const;

/**
 * カードサイズの選択肢
 */
export const CARD_SIZES: CardSize[] = ["small", "medium", "large"];

/**
 * ソート順の選択肢
 */
export const SORT_ORDERS: SortOrder[] = [
  "created",
  "updated",
  "title",
  "custom",
];
