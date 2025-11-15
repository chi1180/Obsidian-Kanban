/**
 * Kanban Bases View
 *
 * Bases Plugin の View として動作する Kanban ボード
 */

import { BasesView, HoverParent, HoverPopover, TFile } from "obsidian";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import React from "react";

import { basesToKanbanData } from "../adapters/basesToKanban";
import { CardManager } from "../core/cardManager";
import { KanbanBoard } from "../ui/KanbanBoard";
import { SettingsPanel } from "../ui/SettingsPanel";
import type ObsidianBetterKanbanPlugin from "../index";
import type { CardSize } from "../types/settings";

/**
 * Kanban Bases View クラス
 */
export class KanbanBasesView extends BasesView implements HoverParent {
  readonly type = "kanban-board-view";

  private root: Root | null = null;
  private cardManager: CardManager;
  private plugin: ObsidianBetterKanbanPlugin;
  private containerEl: HTMLElement;
  private queryController: any;
  private newlyCreatedCardPath: string | null = null;
  private newlyCreatedCardPosition: "top" | "bottom" | null = null;

  hoverPopover: HoverPopover | null = null;

  constructor(
    controller: any,
    parentEl: HTMLElement,
    plugin: ObsidianBetterKanbanPlugin,
  ) {
    super(controller);
    this.queryController = controller;
    this.plugin = plugin;
    this.cardManager = new CardManager(plugin.app);

    // コンテナ要素を作成
    this.containerEl = parentEl.createDiv({ cls: "kanban-root" });

    // React ルートを作成
    this.root = createRoot(this.containerEl);
  }

  /**
   * データが更新されたときに呼ばれる
   * Bases プラグインから呼び出される主要なライフサイクルメソッド
   */
  onDataUpdated(): void {
    this.render();
  }

  /**
   * React コンポーネントをレンダリング
   */
  private render(): void {
    if (!this.root) {
      return;
    }

    try {
      // Bases からデータを取得
      // this.data.groupedData から全エントリーを取得
      const allEntries: unknown[] = [];
      if (this.data?.groupedData) {
        for (const group of this.data.groupedData) {
          allEntries.push(...group.entries);
        }
      }

      // Base の config から設定を取得
      const columnPropertyValue = this.config.get("columnProperty") || "status";
      const columnProperty =
        typeof columnPropertyValue === "string"
          ? columnPropertyValue
          : "status";
      const cardSize =
        (this.config.get("cardSize") as CardSize) ||
        this.plugin.settings.defaultCardSize;
      const enableDragAndDrop = this.config.get("enableDragAndDrop") !== false;
      const showCardCount = this.config.get("showCardCount") !== false;
      const compactMode = this.config.get("compactMode") === true;

      // Properties メニューで選択されたプロパティのリストを取得
      const visibleProperties = this.config.getOrder();

      // カラム順序を取得
      const savedColumnOrder = this.config.get("columnOrder") as
        | string[]
        | undefined;

      // カラムの色表示設定を取得
      const showColumnColors =
        this.config.get("showColumnColors") !== false &&
        this.plugin.settings.showColumnColors !== false;

      // 削除確認ダイアログの表示設定を取得
      const showDeleteConfirmDialog =
        this.plugin.settings.showDeleteConfirmDialog !== false;

      // Kanban データに変換
      const boardData = basesToKanbanData(
        allEntries,
        columnProperty,
        savedColumnOrder,
        showColumnColors,
        this.newlyCreatedCardPath,
        this.newlyCreatedCardPosition,
      );

      // React コンポーネントをレンダリング
      this.root.render(
        React.createElement(KanbanBoard, {
          boardData,
          cardSize,
          enableDragAndDrop,
          showCardCount,
          compactMode,
          visibleProperties,
          columnProperty,
          onCardMove: this.handleCardMove.bind(this),
          onCardClick: this.handleCardClick.bind(this),
          onCardTitleEdit: this.handleCardTitleEdit.bind(this),
          onCreateCard: this.handleCreateCard.bind(this),
          onPropertyEdit: this.handlePropertyEdit.bind(this),
          onCardDelete: this.handleCardDelete.bind(this),
          onSettingsClick: this.handleSettingsClick.bind(this),
          onColumnReorder: this.handleColumnReorder.bind(this),
          showDeleteConfirmDialog,
          onUpdateSettings: this.handleUpdateSettings.bind(this),
        }),
      );
    } catch {
      // エラーハンドリング（必要に応じて）
    }
  }

  /**
   * カードを別のカラムに移動
   */
  private async handleCardMove(
    cardId: string,
    newColumnId: string,
  ): Promise<void> {
    try {
      // cardId はファイルパス
      const file = this.plugin.app.vault.getAbstractFileByPath(cardId);

      if (!(file instanceof TFile)) {
        return;
      }

      // カラムプロパティを取得
      const columnPropertyValue = this.config.get("columnProperty") || "status";
      const columnProperty =
        typeof columnPropertyValue === "string"
          ? columnPropertyValue
          : "status";

      // カラムプロパティを更新
      await this.cardManager.moveCardToColumn(
        file,
        columnProperty,
        newColumnId,
      );
    } catch {
      // エラーハンドリング（必要に応じて）
    }
  }

  /**
   * カードをクリック（ファイルを開く）
   */
  private async handleCardClick(file: TFile): Promise<void> {
    try {
      // ファイルを開く
      await this.plugin.app.workspace.getLeaf(false).openFile(file);
    } catch {
      // エラーハンドリング（必要に応じて）
    }
  }

  /**
   * カードのタイトルを編集
   */
  private async handleCardTitleEdit(
    file: TFile,
    newTitle: string,
  ): Promise<void> {
    try {
      await this.cardManager.updateCardTitle(file, newTitle);
    } catch {
      // エラーハンドリング（必要に応じて）
    }
  }

  /**
   * カードを削除
   */
  private async handleCardDelete(file: TFile): Promise<void> {
    try {
      await this.cardManager.deleteCard(file);
    } catch {
      // エラーハンドリング（必要に応じて）
    }
  }

  /**
   * ビューが閉じられるときに呼ばれる
   */
  onClose(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  /**
   * 新しいカードを作成するフォルダパスを決定
   * 優先順位：
   * 1. 現在のKanban Viewのフィルター
   * 2. All Viewsのグローバルフィルター
   * 3. Kanban Viewの設定（default new file location）
   */
  private getNewCardFolderPath(): string {
    try {
      // デバッグ: controller の内容を確認
      console.log("Controller keys:", Object.keys(this.queryController));
      console.log("Controller:", this.queryController);

      // 1. 現在のビューのフィルター情報を取得
      // 可能性のあるメソッド名をすべて試す
      const viewFilter =
        this.queryController.getFilter?.() ||
        this.queryController.filter ||
        this.queryController.getFilters?.() ||
        this.queryController.filters;

      console.log("View filter:", viewFilter);

      if (viewFilter) {
        const folderPath = this.extractFolderFromFilter(viewFilter);
        if (folderPath) {
          console.log("Found folder from view filter:", folderPath);
          return folderPath;
        }
      }

      // 2. All Viewsのグローバルフィルター情報を取得
      const globalFilter =
        this.queryController.getGlobalFilter?.() ||
        this.queryController.globalFilter ||
        this.queryController.getGlobalFilters?.() ||
        this.queryController.globalFilters;

      console.log("Global filter:", globalFilter);

      if (globalFilter) {
        const folderPath = this.extractFolderFromFilter(globalFilter);
        if (folderPath) {
          console.log("Found folder from global filter:", folderPath);
          return folderPath;
        }
      }

      // 3. 現在表示されているエントリーから共通フォルダを推測
      const commonFolder = this.getCommonFolderFromEntries();
      if (commonFolder && commonFolder !== "/") {
        console.log("Found common folder from entries:", commonFolder);
        return commonFolder;
      }
    } catch (error) {
      console.warn("Failed to get filter information:", error);
    }

    // 4. デフォルトの設定値を使用
    console.log(
      "Using default location:",
      this.plugin.settings.defaultNewFileLocation,
    );
    return this.plugin.settings.defaultNewFileLocation;
  }

  /**
   * 現在表示されているエントリーから共通の親フォルダを取得
   */
  private getCommonFolderFromEntries(): string | null {
    if (!this.data?.groupedData) {
      return null;
    }

    const allPaths: string[] = [];

    // すべてのエントリーのフォルダパスを収集
    for (const group of this.data.groupedData) {
      for (const entry of group.entries) {
        if ((entry as any).file?.parent?.path) {
          allPaths.push((entry as any).file.parent.path);
        }
      }
    }

    if (allPaths.length === 0) {
      return null;
    }

    // 最も頻繁に出現するフォルダパスを返す（多数決）
    const pathCounts = new Map<string, number>();
    for (const path of allPaths) {
      pathCounts.set(path, (pathCounts.get(path) || 0) + 1);
    }

    let maxCount = 0;
    let commonPath: string | null = null;

    for (const [path, count] of pathCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        commonPath = path;
      }
    }

    return commonPath;
  }

  /**
   * フィルター情報からフォルダパスを抽出
   * Basesプラグインのフィルター形式に対応
   */
  private extractFolderFromFilter(filter: any): string | null {
    if (!filter) {
      return null;
    }

    console.log("Extracting folder from filter:", filter);

    // フィルターが配列の場合（複数の条件）
    if (Array.isArray(filter)) {
      for (const condition of filter) {
        const folderPath = this.extractFolderFromFilter(condition);
        if (folderPath) {
          return folderPath;
        }
      }
      return null;
    }

    // フィルターがオブジェクトの場合
    if (typeof filter === "object") {
      // パターン1: { type: "folder", value: "Task" }
      if (filter.type === "folder" && filter.value) {
        return filter.value;
      }

      // パターン2: { type: "in-folder", folder: "Task" }
      if (
        (filter.type === "in-folder" || filter.type === "infolder") &&
        filter.folder
      ) {
        return filter.folder;
      }

      // パターン3: { field: "file", operator: "in", value: "Task" }
      if (filter.field === "file" && filter.operator === "in" && filter.value) {
        return filter.value;
      }

      // パターン4: path プロパティを直接持つ
      if (filter.path) {
        return filter.path;
      }

      // パターン5: folder プロパティを直接持つ
      if (filter.folder) {
        return filter.folder;
      }

      // パターン6: ネストされた条件（where/conditions）
      if (filter.where) {
        return this.extractFolderFromFilter(filter.where);
      }

      if (filter.conditions) {
        return this.extractFolderFromFilter(filter.conditions);
      }

      // パターン7: clauses（複数の条件節）
      if (filter.clauses) {
        return this.extractFolderFromFilter(filter.clauses);
      }
    }

    return null;
  }

  /**
   * 新しいカードを作成
   */
  private async handleCreateCard(
    columnId: string,
    title: string,
    insertPosition?: "top" | "bottom",
  ): Promise<void> {
    try {
      const folderPath = this.getNewCardFolderPath();
      const columnPropertyValue = this.config.get("columnProperty") || "status";
      const columnProperty =
        typeof columnPropertyValue === "string"
          ? columnPropertyValue
          : "status";

      const newFile = await this.cardManager.createCard(
        {
          title,
          columnProperty,
          columnValue: columnId,
          properties: {},
        },
        folderPath,
      );

      // 新規作成されたカードのパスと位置を保存（編集モードを自動で開くため）
      this.newlyCreatedCardPath = newFile.path;
      this.newlyCreatedCardPosition = insertPosition || "top";
    } catch {
      // エラーハンドリング（必要に応じて）
    }
  }

  /**
   * プロパティを編集
   */
  private async handlePropertyEdit(
    file: TFile,
    property: string,
    newValue: unknown,
  ): Promise<void> {
    try {
      // 新規作成フラグをクリアする特殊なプロパティ
      if (property === "_clearIsNew") {
        this.newlyCreatedCardPath = null;
        this.newlyCreatedCardPosition = null;
        return;
      }

      // プロパティを更新
      await this.plugin.app.fileManager.processFrontMatter(
        file,
        (frontmatter) => {
          frontmatter[property] = newValue;
        },
      );
    } catch {
      // エラーハンドリング（必要に応じて）
    }
  }

  /**
   * カラムを並び替え
   */
  private async handleColumnReorder(
    sourceIndex: number,
    destinationIndex: number,
    newColumnOrder: string[],
  ): Promise<void> {
    try {
      console.log("Column reordered:", {
        sourceIndex,
        destinationIndex,
        newColumnOrder,
      });

      // カラム順序を config に保存
      this.config.set("columnOrder", newColumnOrder);

      // 再レンダリング
      this.render();
    } catch (error) {
      console.error("Failed to reorder column:", error);
    }
  }

  /**
   * 設定ボタンをクリック
   */
  private handleSettingsClick(): void {
    const settingsPanel = new SettingsPanel(
      this.plugin.app,
      this.config as any,
      () => {
        // 設定保存後に再レンダリング
        this.render();
      },
    );
    settingsPanel.open();
  }

  /**
   * 設定を更新
   */
  private async handleUpdateSettings(key: string, value: any): Promise<void> {
    try {
      // プラグイン設定を更新
      (this.plugin.settings as any)[key] = value;
      await this.plugin.saveSettings();

      // 再レンダリング
      this.render();
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  }
}
