/**
 * カード管理のコアロジック
 *
 * カードの作成、更新、削除などの操作を統括します。
 * FileOperations と PropertyManager を組み合わせて使用します。
 */

import type { App, TFile } from "obsidian";
import { FileOperations } from "./fileOperations";
import { PropertyManager } from "./propertyManager";
import type {
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

  constructor(app: App) {
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
  entryToCard(entry: unknown, columnProperty: string): KanbanCard {
    const entryData = entry as {
      file: TFile;
      properties: Record<string, unknown>;
    };
    const columnValue = entryData.properties[columnProperty] || "未分類";

    return {
      id: entryData.file.path,
      title: entryData.file.basename,
      file: entryData.file,
      properties: entryData.properties,
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
  entriesToCards(entries: unknown[], columnProperty: string): KanbanCard[] {
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
    } catch {
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
    } catch {
      return {};
    }
  }
}
