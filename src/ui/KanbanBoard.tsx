/**
 * KanbanBoard コンポーネント
 *
 * カンバンボード全体を表示します。
 * ドラッグ&ドロップ機能を含みます。
 */

import React from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { TFile } from "obsidian";
import { KanbanBoardData } from "../types/kanban";
import { CardSize } from "../types/settings";
import { Column } from "./Column";
import { setIcon } from "obsidian";

interface KanbanBoardProps {
  /** ボードデータ */
  boardData: KanbanBoardData;

  /** カードサイズ */
  cardSize: CardSize;

  /** ドラッグ&ドロップを有効にするか */
  enableDragAndDrop: boolean;

  /** カード数を表示するか */
  showCardCount: boolean;

  /** コンパクトモード */
  compactMode: boolean;

  /** 表示するプロパティのリスト */
  visibleProperties: string[];

  /** カードが別のカラムに移動されたときのコールバック */
  onCardMove?: (cardId: string, newColumnId: string) => void;

  /** カードクリック時のコールバック */
  onCardClick?: (file: TFile) => void;

  /** カードタイトル編集時のコールバック */
  onCardTitleEdit?: (file: TFile, newTitle: string) => void;

  /** 新規カード作成時のコールバック */
  onCreateCard?: (columnId: string, title: string) => void;

  /** プロパティ編集時のコールバック */
  onPropertyEdit?: (file: TFile, property: string, newValue: any) => void;

  /** 設定ボタンクリック時のコールバック */
  onSettingsClick?: () => void;
}

/**
 * KanbanBoard コンポーネント
 */
export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  boardData,
  cardSize,
  enableDragAndDrop,
  showCardCount,
  compactMode,
  visibleProperties,
  onCardMove,
  onCardClick,
  onCardTitleEdit,
  onCreateCard,
  onPropertyEdit,
  onSettingsClick,
}) => {
  // ドラッグ&ドロップ終了時の処理
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // ドロップ先がない場合は何もしない
    if (!destination) {
      return;
    }

    // 同じ位置にドロップした場合は何もしない
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // カラム間の移動の場合
    if (destination.droppableId !== source.droppableId) {
      if (onCardMove) {
        onCardMove(draggableId, destination.droppableId);
      }
    }

    // TODO: 同じカラム内での並び替えは将来実装
  };

  return (
    <div className="kanban-board">
      {/* ツールバー */}
      <div className="kanban-board__toolbar">
        <div className="kanban-board__toolbar-right">
          <button
            className="kanban-board__settings-button clickable-icon"
            aria-label="Settings"
            onClick={onSettingsClick}
            ref={(el) => {
              if (el && !el.querySelector("svg")) {
                setIcon(el, "settings");
              }
            }}
          />
        </div>
      </div>

      {/* ボードコンテンツ */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board__columns">
          {boardData.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              cardSize={cardSize}
              compact={compactMode}
              showCardCount={showCardCount}
              visibleProperties={visibleProperties}
              enableDragAndDrop={enableDragAndDrop}
              onCardClick={onCardClick}
              onCardTitleEdit={onCardTitleEdit}
              onCreateCard={onCreateCard}
              onPropertyEdit={onPropertyEdit}
            />
          ))}
        </div>
      </DragDropContext>

      {/* 空のボード表示 */}
      {boardData.columns.length === 0 && (
        <div className="kanban-board__empty">
          <p>No columns found.</p>
          <p className="kanban-board__empty-hint">
            Make sure the column property "{boardData.columnProperty}" exists in
            your files.
          </p>
        </div>
      )}
    </div>
  );
};
