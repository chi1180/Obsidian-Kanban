/**
 * カード管理のコアロジック
 *
 * カードの作成、更新、削除などの操作を統括します。
 * FileOperations と PropertyManager を組み合わせて使用します。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { App, TFile } from "obsidian";
import { FileOperations } from "./fileOperations";
import { PropertyManager } from "./propertyManager";
import {
  CreateCardParams,
  UpdateCardParams,
  KanbanCard,
} from "../types/kanban";

/**
 * カード管理クラス
 */
export class CardManager {
  private fileOps: FileOperations;
  private propertyManager: PropertyManager;

  constructor(private app: App) {
    this.fileOps = new FileOperations(app);
    this.propertyManager = new PropertyManager(app);
  }

  /**
   * 新しいカードを作成
   *
   * @param params - カード作成パラメータ
   * @param folderPath - 作成先フォルダパス
   * @returns 作成されたファイル
   */
  async createCard(
    params: CreateCardParams,
    folderPath?: string,
  ): Promise<TFile> {
    try {
      const file = await this.fileOps.createFile(params, folderPath);
      return file;
    } catch (error) {
      console.error("Failed to create card:", error);
      throw error;
    }
  }

  /**
   * カードのプロパティを更新
   *
   * @param params - 更新パラメータ
   */
  async updateCard(params: UpdateCardParams): Promise<void> {
    try {
      await this.propertyManager.updateProperties(params);
    } catch (error) {
      console.error("Failed to update card:", error);
      throw error;
    }
  }

  /**
   * カードのタイトルを更新（ファイル名を変更）
   *
   * @param file - 対象のファイル
   * @param newTitle - 新しいタイトル
   */
  async updateCardTitle(file: TFile, newTitle: string): Promise<void> {
    try {
      await this.fileOps.renameFile(file, newTitle);
    } catch (error) {
      console.error("Failed to update card title:", error);
      throw error;
    }
  }

  /**
   * カードを削除
   *
   * @param file - 削除対象のファイル
   */
  async deleteCard(file: TFile): Promise<void> {
    try {
      await this.fileOps.deleteFile(file);
    } catch (error) {
      console.error("Failed to delete card:", error);
      throw error;
    }
  }

  /**
   * カードを別のカラムに移動（プロパティ値を更新）
   *
   * @param file - 移動対象のファイル
   * @param columnProperty - カラムプロパティ名
   * @param newColumnValue - 新しいカラムの値
   */
  async moveCardToColumn(
    file: TFile,
    columnProperty: string,
    newColumnValue: string,
  ): Promise<void> {
    try {
      await this.propertyManager.setProperty(
        file,
        columnProperty,
        newColumnValue,
      );
    } catch (error) {
      console.error("Failed to move card to column:", error);
      throw error;
    }
  }

  /**
   * BasesEntry を KanbanCard に変換
   *
   * @param entry - Bases エントリー
   * @param columnProperty - カラムプロパティ名
   * @returns Kanban カード
   */
  entryToCard(entry: any, columnProperty: string): KanbanCard {
    const columnValue = entry.properties[columnProperty] || "未分類";

    return {
      id: entry.file.path,
      title: entry.file.basename,
      file: entry.file,
      properties: entry.properties,
      columnId: String(columnValue),
      order: 0, // 将来的にカスタム順序をサポート
    };
  }

  /**
   * 複数の BasesEntry を KanbanCard 配列に変換
   *
   * @param entries - Bases エントリーの配列
   * @param columnProperty - カラムプロパティ名
   * @returns Kanban カードの配列
   */
  entriesToCards(entries: any[], columnProperty: string): KanbanCard[] {
    return entries.map((entry) => this.entryToCard(entry, columnProperty));
  }

  /**
   * カードの特定のプロパティ値を取得
   *
   * @param file - 対象のファイル
   * @param propertyName - プロパティ名
   * @returns プロパティ値
   */
  async getCardProperty(file: TFile, propertyName: string): Promise<unknown> {
    try {
      return await this.propertyManager.getProperty(file, propertyName);
    } catch (error) {
      console.error("Failed to get card property:", error);
      return undefined;
    }
  }

  /**
   * カードのすべてのプロパティを取得
   *
   * @param file - 対象のファイル
   * @returns プロパティのオブジェクト
   */
  async getCardProperties(file: TFile): Promise<Record<string, unknown>> {
    try {
      return await this.propertyManager.getProperties(file);
    } catch (error) {
      console.error("Failed to get card properties:", error);
      return {};
    }
  }
}
