/**
 * Settings Type Definitions
 * プラグイン設定とビュー設定の型定義
 */

// カードサイズの選択肢
export const CARD_SIZES = {
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
} as const;

export type CardSize = (typeof CARD_SIZES)[keyof typeof CARD_SIZES];

// 設定のキー定数
export const SETTINGS_KEYS = {
  CARD_SIZE: "card-size",
  MAX_CARDS_PER_COLUMN: "max-cards-per-column",
  DRAGGABLE: "draggable",
  SHOW_CARD_COUNT: "show-card-count",
  COMPACT_MODE: "compact-mode",
} as const;

/**
 * プラグイン全体の設定
 * 新規ボードのデフォルト設定として使用
 */
export interface KanbanPluginSettings {
  /** Default card size */
  cardSize: CardSize;
  /** Maximum number of cards per column (0 = unlimited) */
  maxCardsPerColumn: number;
  /** Enable drag and drop by default */
  draggable: boolean;
  /** Show card count by default */
  showCardCount: boolean;
  /** Use compact mode by default */
  compactMode: boolean;
}

/**
 * ビュー固有の設定
 * プラグイン設定を上書きする場合に使用
 */
export interface KanbanViewSettings {
  cardSize?: CardSize;
  maxCardsPerColumn?: number;
  draggable?: boolean;
  showCardCount?: boolean;
  compactMode?: boolean;
}

/**
 * 有効な設定値とその取得元を返す型
 */
export interface EffectiveSetting<T> {
  /** The actual value to use */
  value: T;
  /** Whether this setting is overridden by view-specific settings */
  isOverridden: boolean;
}
