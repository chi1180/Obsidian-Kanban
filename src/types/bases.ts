/**
 * Bases Plugin API Type Definitions
 * Obsidian Basesプラグインの公式型定義が存在しないため、
 * ドキュメントとAPIの実装を元に型定義を作成
 */

import { Component } from "obsidian";
import type { TFile } from "obsidian";

/**
 * Basesのエントリ（データベースの1行に相当）
 */
export interface BasesEntry {
  /** エントリのファイル */
  file: TFile;
  /** プロパティの値（key-value形式） */
  properties: Record<string, unknown>;
  /** エントリのID */
  id?: string;
}

/**
 * グループ化されたデータ
 */
export interface GroupedData {
  /** グループの値（例: ステータスが "To Do" の場合は "To Do"） */
  value: string;
  /** このグループに属するエントリ */
  entries: BasesEntry[];
}

/**
 * Basesのデータ構造
 */
export interface BasesData {
  /** グループ化されたデータ（カラムに対応） */
  groupedData?: GroupedData[];
  /** 全てのデータ（フラットな配列） */
  data?: BasesEntry[];
  /** グループ化に使用されているプロパティ名 */
  groupBy?: string;
}

/**
 * クエリコントローラー
 * データの取得や更新を管理
 */
export interface QueryController {
  /** データを取得 */
  getData(): BasesData | null;
  /** データが更新されたときのコールバックを登録 */
  onDataUpdated(callback: () => void): void;
}

/**
 * Bases View の設定
 */
export interface BasesViewConfig {
  /** 設定値を取得 */
  get(key: string): unknown;
  /** 設定値を設定 */
  set(key: string, value: unknown): void;
  /** 設定値を削除（オプショナル） */
  delete?(key: string): void;
}

/**
 * Bases View の基底クラス
 */
export abstract class BasesView extends Component {
  /** ビュータイプ */
  abstract type: string;

  /** クエリコントローラー */
  protected controller: QueryController;

  /** ビューの設定 */
  protected config: BasesViewConfig;

  /** データ */
  protected data: BasesData | null;

  constructor(controller: QueryController) {
    super();
    this.controller = controller;
    this.data = controller.getData();

    // データ更新時のコールバックを登録
    this.controller.onDataUpdated(() => {
      this.data = this.controller.getData();
      this.onDataUpdated();
    });
  }

  /** データが更新されたときに呼ばれる */
  abstract onDataUpdated(): void;

  /** ビューが閉じられるときに呼ばれる */
  abstract onClose(): void;
}

/**
 * Bases View の登録情報
 */
export interface BasesViewRegistration {
  /** ビューの表示名 */
  name: string;
  /** ビューのアイコン */
  icon: string;
  /** ビューのファクトリ関数 */
  factory: (controller: QueryController, containerEl: HTMLElement) => BasesView;
}
