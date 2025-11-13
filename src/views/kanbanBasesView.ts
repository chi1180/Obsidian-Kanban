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

  hoverPopover: HoverPopover | null = null;

  constructor(
    controller: any,
    parentEl: HTMLElement,
    plugin: ObsidianBetterKanbanPlugin,
  ) {
    super(controller);
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

      // Kanban データに変換
      const boardData = basesToKanbanData(allEntries, columnProperty);

      // React コンポーネントをレンダリング
      this.root.render(
        React.createElement(KanbanBoard, {
          boardData,
          cardSize,
          enableDragAndDrop,
          showCardCount,
          compactMode,
          visibleProperties,
          onCardMove: this.handleCardMove.bind(this),
          onCardClick: this.handleCardClick.bind(this),
          onCardTitleEdit: this.handleCardTitleEdit.bind(this),
          onCreateCard: this.handleCreateCard.bind(this),
          onPropertyEdit: this.handlePropertyEdit.bind(this),
          onSettingsClick: this.handleSettingsClick.bind(this),
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
   * 新しいカードを作成
   */
  private async handleCreateCard(
    columnId: string,
    title: string,
  ): Promise<void> {
    try {
      const folderPath = this.plugin.settings.defaultNewFileLocation;
      const columnPropertyValue = this.config.get("columnProperty") || "status";
      const columnProperty =
        typeof columnPropertyValue === "string"
          ? columnPropertyValue
          : "status";

      await this.cardManager.createCard(
        {
          title,
          columnProperty,
          columnValue: columnId,
          properties: {},
        },
        folderPath,
      );
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
   * 設定ボタンをクリック
   */
  private handleSettingsClick(): void {
    const settingsPanel = new SettingsPanel(
      this.plugin.app,
      this.config,
      () => {
        // 設定保存後に再レンダリング
        this.render();
      },
    );
    settingsPanel.open();
  }
}
