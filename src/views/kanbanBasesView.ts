/**
 * Kanban Bases View
 *
 * Bases Plugin の View として動作する Kanban ボード
 */

 
 

import { BasesView, TFile, HoverParent, HoverPopover } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import React from "react";

import { basesToKanbanData } from "../adapters/basesToKanban";
import { CardManager } from "../core/cardManager";
import { KanbanBoard } from "../ui/KanbanBoard";
import { SettingsPanel } from "../ui/SettingsPanel";
import ObsidianBetterKanbanPlugin from "../index";
import { CardSize } from "../types/settings";

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

    console.log("KanbanBasesView: constructor");
  }

  /**
   * データが更新されたときに呼ばれる
   * Bases プラグインから呼び出される主要なライフサイクルメソッド
   */
  onDataUpdated(): void {
    console.log("KanbanBasesView: onDataUpdated");
    this.render();
  }

  /**
   * React コンポーネントをレンダリング
   */
  private render(): void {
    if (!this.root) {
      console.warn("KanbanBasesView: Cannot render, root is null");
      return;
    }

    try {
      // Bases からデータを取得
      // this.data.groupedData から全エントリーを取得
      const allEntries: any[] = [];
      if (this.data?.groupedData) {
        for (const group of this.data.groupedData) {
          allEntries.push(...group.entries);
        }
      }

      // Base の config から設定を取得
      const columnProperty = String(
        this.config.get("columnProperty") || "status",
      );
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
    } catch (error) {
      console.error("KanbanBasesView: Failed to render", error);
    }
  }

  /**
   * カードを別のカラムに移動
   */
  private async handleCardMove(
    cardId: string,
    newColumnId: string,
  ): Promise<void> {
    console.log("KanbanBasesView: handleCardMove called", {
      cardId,
      newColumnId,
    });

    try {
      // cardId はファイルパス
      const file = this.plugin.app.vault.getAbstractFileByPath(cardId);

      if (!(file instanceof TFile)) {
        console.error("KanbanBasesView: File not found", cardId);
        return;
      }

      // カラムプロパティを取得
      const columnProperty = String(
        this.config.get("columnProperty") || "status",
      );

      console.log("KanbanBasesView: Moving card", {
        fileName: file.basename,
        columnProperty,
        newColumnId,
      });

      // カラムプロパティを更新
      await this.cardManager.moveCardToColumn(
        file,
        columnProperty,
        newColumnId,
      );

      console.log(
        `KanbanBasesView: Successfully moved card "${file.basename}" to column "${newColumnId}"`,
      );
    } catch (error) {
      console.error("KanbanBasesView: Failed to move card", error);
    }
  }

  /**
   * カードをクリック（ファイルを開く）
   */
  private async handleCardClick(file: TFile): Promise<void> {
    try {
      // ファイルを開く
      await this.plugin.app.workspace.getLeaf(false).openFile(file);
    } catch (error) {
      console.error("KanbanBasesView: Failed to open file", error);
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
      console.log(`KanbanBasesView: Updated card title to "${newTitle}"`);
    } catch (error) {
      console.error("KanbanBasesView: Failed to update card title", error);
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
      const columnProperty = String(
        this.config.get("columnProperty") || "status",
      );

      await this.cardManager.createCard(
        {
          title,
          columnProperty,
          columnValue: columnId,
          properties: {},
        },
        folderPath,
      );

      console.log(
        `KanbanBasesView: Created new card "${title}" in column "${columnId}"`,
      );
    } catch (error) {
      console.error("KanbanBasesView: Failed to create card", error);
    }
  }

  /**
   * プロパティを編集
   */
  private async handlePropertyEdit(
    file: TFile,
    property: string,
    newValue: any,
  ): Promise<void> {
    try {
      // プロパティを更新
      await this.plugin.app.fileManager.processFrontMatter(
        file,
        (frontmatter) => {
          frontmatter[property] = newValue;
        },
      );

      console.log(
        `KanbanBasesView: Updated property "${property}" to "${newValue}"`,
      );
    } catch (error) {
      console.error("KanbanBasesView: Failed to update property", error);
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
