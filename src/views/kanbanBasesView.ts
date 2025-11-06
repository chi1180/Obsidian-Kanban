/**
 * Kanban Bases View
 * Obsidian Bases プラグインと統合する Kanban ビュー
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BasesView } from "obsidian";
import type { QueryController } from "obsidian";
import type { BoardData } from "../ui/board";
import BoardView from "../ui/board";
import {
  basesDataToBoardData,
  updateEntryOnCardMove,
} from "../adapters/basesDataAdapter";
import type ObsidianBetterKanbanPlugin from "../index";

/**
 * Kanban Bases View クラス
 * Bases View を継承し、React の Kanban Board コンポーネントを統合
 */
export class KanbanBasesView extends BasesView {
  type = "kanban-board-view";
  private containerEl: HTMLDivElement;
  private reactRoot: ReactDOM.Root | null = null;
  private currentBoardData: BoardData | null = null;
  private plugin: ObsidianBetterKanbanPlugin;

  constructor(
    controller: QueryController,
    parentEl: HTMLElement,
    plugin: ObsidianBetterKanbanPlugin,
  ) {
    super(controller);
    this.plugin = plugin;

    console.log("Kanban Bases View: Constructor called", {
      parentEl,
      controller,
    });

    try {
      // parentEl を空にしてから、コンテナ要素を作成
      parentEl.empty();

      // コンテナ要素を作成
      this.containerEl = parentEl.createDiv("kanban-bases-view-container");
      this.containerEl.setCssStyles({
        width: "100%",
        height: "100%",
        overflow: "auto",
        position: "relative",
        contain: "layout style paint",
      });

      console.log("Kanban Bases View: Container element created", {
        containerEl: this.containerEl,
      });

      // React ルートを作成
      this.reactRoot = ReactDOM.createRoot(this.containerEl);

      console.log("Kanban Bases View: React root created");

      // 初期レンダリング
      this.render();
    } catch (error) {
      console.error("Kanban Bases View: Error in constructor", error);
      throw error;
    }
  }

  /**
   * Component のライフサイクルメソッド
   */
  onload(): void {
    console.log("Kanban Bases View: onload called");
    // 必要に応じて初期化処理を追加
  }

  /**
   * Component のクリーンアップメソッド
   */
  onunload(): void {
    console.log("Kanban Bases View: onunload called");
    this.onClose();
  }

  /**
   * データが更新されたときに呼ばれる
   */
  onDataUpdated(): void {
    try {
      console.log("Kanban Bases View: Data updated", {
        hasData: !!this.data,
        data: this.data,
        groupedDataLength: this.data?.groupedData?.length ?? 0,
        dataLength: this.data?.data?.length ?? 0,
        groupedData: this.data?.groupedData,
        rawData: this.data?.data,
      });
      this.render();
    } catch (error) {
      console.error("Kanban Bases View: Error in onDataUpdated", error);
    }
  }

  /**
   * ビューが閉じられるときに呼ばれる
   */
  onClose(): void {
    console.log("Kanban Bases View: onClose called");
    if (this.reactRoot) {
      try {
        console.log("Kanban Bases View: Unmounting React root");
        this.reactRoot.unmount();
        console.log("Kanban Bases View: React root unmounted successfully");
      } catch (error) {
        console.error("Kanban Bases View: Error unmounting React root:", error);
      }
      this.reactRoot = null;
    }
    if (this.containerEl) {
      console.log("Kanban Bases View: Emptying container element");
      this.containerEl.empty();
    }
    console.log("Kanban Bases View: Cleanup complete");
  }

  /**
   * React コンポーネントをレンダリング
   */
  private render(): void {
    console.log("Kanban Bases View: render() called", {
      hasData: !!this.data,
      hasReactRoot: !!this.reactRoot,
    });

    if (!this.reactRoot) {
      console.warn("Kanban Bases View: React root is not initialized");
      return;
    }

    if (!this.data) {
      console.warn("Kanban Bases View: No data available", {
        dataKeys: this.data ? Object.keys(this.data) : [],
        dataType: typeof this.data,
      });
      return;
    }

    try {
      console.log("Kanban Bases View: Converting data to board format", {
        dataKeys: Object.keys(this.data),
        hasGroupedData: !!this.data.groupedData,
        hasData: !!this.data.data,
      });

      // Bases データを Kanban ボードデータに変換
      const boardData = basesDataToBoardData(this.data);
      this.currentBoardData = boardData;

      console.log("Kanban Bases View: Board data converted", {
        columnsCount: boardData.columns.length,
        columns: boardData.columns.map((col) => ({
          id: col.id,
          title: col.title,
          cardCount: col.cards.length,
        })),
      });

      // グループ化プロパティを取得
      // TODO: グループ化プロパティの取得方法を確認
      const groupByProperty: string | undefined = undefined;

      // React コンポーネントをレンダリング
      const element = React.createElement(BoardView, {
        data: boardData,
        config: this.config,
        pluginSettings: this.plugin.settings,
        onDataChange: async (newData: BoardData) => {
          await this.handleBoardDataChange(newData, groupByProperty);
        },
      });

      this.reactRoot.render(element);
      console.log("Kanban Bases View: React component rendered");
    } catch (error) {
      console.error("Kanban Bases View: Error in render", error);
    }
  }

  /**
   * ボードデータの変更を処理
   * カードの移動や並び替えに応じて Bases のデータを更新
   */
  private async handleBoardDataChange(
    newData: BoardData,
    groupByProperty?: string,
  ): Promise<void> {
    if (!this.currentBoardData) {
      console.warn("Kanban Bases View: No current board data to compare");
      return;
    }

    try {
      // 変更を検出して適切な更新を行う
      await this.detectAndApplyChanges(
        this.currentBoardData,
        newData,
        groupByProperty,
      );

      // 現在のデータを更新
      this.currentBoardData = newData;
      console.log("Kanban Bases View: Board data change handled successfully");
    } catch (error) {
      console.error(
        "Kanban Bases View: Failed to handle board data change:",
        error,
      );
      // エラーが発生した場合は、データを再読み込みして UI を元に戻す
      try {
        this.render();
      } catch (renderError) {
        console.error("Kanban Bases View: Failed to re-render:", renderError);
      }
    }
  }

  /**
   * ボードデータの変更を検出し、適切な更新を適用
   */
  private async detectAndApplyChanges(
    oldData: BoardData,
    newData: BoardData,
    groupByProperty?: string,
  ): Promise<void> {
    // 各列を比較してカードの移動や並び替えを検出
    for (const newColumn of newData.columns) {
      const oldColumn = oldData.columns.find((col) => col.id === newColumn.id);

      if (!oldColumn) {
        // 新しい列が追加された場合（現時点では対応不要）
        continue;
      }

      // カードの移動を検出
      for (let i = 0; i < newColumn.cards.length; i++) {
        const newCard = newColumn.cards[i];
        const oldCardIndex = oldColumn.cards.findIndex(
          (card) => card.id === newCard.id,
        );

        // このカードが元の列に存在しなかった場合、他の列から移動してきた
        if (oldCardIndex === -1) {
          // 移動元の列を探す
          const sourceColumn = oldData.columns.find((col) =>
            col.cards.some((card) => card.id === newCard.id),
          );

          if (sourceColumn && sourceColumn.id !== newColumn.id) {
            // カードが別の列に移動した
            console.log(
              `Card moved from ${sourceColumn.id} to ${newColumn.id}:`,
              newCard.id,
            );

            // プロパティを更新
            await updateEntryOnCardMove(
              newCard,
              sourceColumn.id,
              newColumn.id,
              groupByProperty,
            );
          }
        }
      }

      // TODO: 列内でのカードの並び替えを検出して順序を更新
      // 現時点では、Obsidian のノートに順序プロパティを持たせる仕組みが必要
      // 将来的な拡張として実装可能
    }
  }
}
