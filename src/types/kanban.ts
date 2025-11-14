/**
 * Kanban 固有の型定義
 *
 * カンバンボードで使用するデータ構造の型を定義しています。
 */

import { TFile } from "obsidian";

/**
 * カンバンカード
 * 1つのファイルを表すカード
 */
export interface KanbanCard {
  /** カードの一意な ID（ファイルパス） */
  id: string;

  /** カードのタイトル（ファイル名） */
  title: string;

  /** 元のファイルオブジェクト */
  file: TFile;

  /** カードのプロパティ（フロントマター） */
  properties: Record<string, unknown>;

  /** カードが属するカラムの ID */
  columnId: string;

  /** カード内での並び順（将来の拡張用） */
  order?: number;
}

/**
 * カンバンカラム（列）
 */
export interface KanbanColumn {
  /** カラムの一意な ID */
  id: string;

  /** カラムのタイトル */
  title: string;

  /** このカラムに属するカードの配列 */
  cards: KanbanCard[];

  /** カラム内でのカード数 */
  count: number;

  /** カラムの並び順 */
  order: number;

  /** カラムの色情報（オプション） */
  color?: {
    background: string;
    text: string;
    dot: string;
  };
}

/**
 * カンバンボード全体のデータ
 */
export interface KanbanBoardData {
  /** すべてのカラム */
  columns: KanbanColumn[];

  /** カラムプロパティ名（どのプロパティでグループ化するか） */
  columnProperty: string;

  /** カラムの並び順（カラムIDの配列） */
  columnOrder?: string[];

  /** プロパティごとの利用可能なタグ値（プロパティ名 → タグ値の配列） */
  availableTags?: Record<string, string[]>;
}

/**
 * カード作成時のパラメータ
 */
export interface CreateCardParams {
  /** カードのタイトル */
  title: string;

  /** カードが属するカラムの値 */
  columnValue: string;

  /** カラムプロパティ名 */
  columnProperty: string;

  /** その他の初期プロパティ */
  properties?: Record<string, unknown>;
}

/**
 * カード更新時のパラメータ
 */
export interface UpdateCardParams {
  /** 更新対象のファイル */
  file: TFile;

  /** 更新するプロパティ */
  properties: Record<string, unknown>;
}

/**
 * カードサイズ
 */
export type CardSize = "small" | "medium" | "large";

/**
 * ソート順
 */
export type SortOrder = "created" | "updated" | "title" | "custom";
