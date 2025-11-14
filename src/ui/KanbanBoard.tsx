/**
 * KanbanBoard コンポーネント
 *
 * カンバンボード全体を表示します。
 * ドラッグ&ドロップ機能を含みます。
 */

import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { TFile } from "obsidian";
import { KanbanBoardData } from "../types/kanban";
import { CardSize } from "../types/settings";
import { Column } from "./Column";
import { UndoToast } from "./UndoToast";
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

  /** カラムプロパティ名（分類用のプロパティ） */
  columnProperty?: string;

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

  /** カード削除時のコールバック */
  onCardDelete?: (file: TFile) => void;

  /** 設定ボタンクリック時のコールバック */
  onSettingsClick?: () => void;

  /** カラム並び替え時のコールバック */
  onColumnReorder?: (
    sourceIndex: number,
    destinationIndex: number,
    newColumnOrder: string[],
  ) => void;

  /** 削除確認ダイアログを表示するか */
  showDeleteConfirmDialog?: boolean;

  /** 設定更新時のコールバック */
  onUpdateSettings?: (key: string, value: any) => void;
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
  columnProperty,
  onCardMove,
  onCardClick,
  onCardTitleEdit,
  onCreateCard,
  onPropertyEdit,
  onCardDelete,
  onSettingsClick,
  onColumnReorder,
  showDeleteConfirmDialog = true,
  onUpdateSettings,
}) => {
  // 削除待ちのカード情報を保持
  const [pendingDelete, setPendingDelete] = useState<{
    file: TFile;
    timer: NodeJS.Timeout;
  } | null>(null);

  // 非表示にするカードのIDセット
  const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(new Set());

  // カード削除（遅延実行）
  const handleCardDelete = (file: TFile) => {
    // 既存の削除タイマーをクリア
    if (pendingDelete) {
      clearTimeout(pendingDelete.timer);
      // 前のカードを非表示リストから削除
      setHiddenCardIds((prev) => {
        const next = new Set(prev);
        next.delete(pendingDelete.file.path);
        return next;
      });
    }

    // カードを即座に非表示
    setHiddenCardIds((prev) => new Set(prev).add(file.path));

    // 5秒後に削除を実行
    const timer = setTimeout(() => {
      if (onCardDelete) {
        onCardDelete(file);
      }
      setPendingDelete(null);
      // 削除完了後、さらに少し待ってから非表示リストから削除（フラッシュ防止）
      setTimeout(() => {
        setHiddenCardIds((prev) => {
          const next = new Set(prev);
          next.delete(file.path);
          return next;
        });
      }, 300); // 300ms の追加遅延
    }, 5000);

    setPendingDelete({ file, timer });
  };

  // Undo（削除をキャンセル）
  const handleUndo = () => {
    if (pendingDelete) {
      clearTimeout(pendingDelete.timer);
      // カードを再表示
      setHiddenCardIds((prev) => {
        const next = new Set(prev);
        next.delete(pendingDelete.file.path);
        return next;
      });
      setPendingDelete(null);
    }
  };

  // トーストを閉じる（削除を実行）
  const handleToastClose = () => {
    setPendingDelete(null);
  };

  // 設定更新ハンドラー
  const handleUpdateSettings = (key: string, value: any) => {
    if (onUpdateSettings) {
      onUpdateSettings(key, value);
    }
  };

  // ドラッグ&ドロップ終了時の処理
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

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

    // カラムのドラッグの場合
    if (type === "column") {
      if (onColumnReorder) {
        // 新しいカラム順序を計算
        const newColumns = Array.from(boardData.columns);
        const [movedColumn] = newColumns.splice(source.index, 1);
        newColumns.splice(destination.index, 0, movedColumn);
        const newColumnOrder = newColumns.map((col) => col.id);

        onColumnReorder(source.index, destination.index, newColumnOrder);
      }
      return;
    }

    // カードのドラッグの場合
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
            type="button"
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
        <Droppable
          droppableId="board"
          type="column"
          direction="horizontal"
          isDropDisabled={!enableDragAndDrop}
          renderClone={(provided, _snapshot, rubric) => {
            const column = boardData.columns[rubric.source.index];
            return (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                className="kanban-board__column-wrapper kanban-board__column-wrapper--dragging"
                style={provided.draggableProps.style}
              >
                <Column
                  column={column}
                  cardSize={cardSize}
                  compact={compactMode}
                  showCardCount={showCardCount}
                  visibleProperties={visibleProperties}
                  enableDragAndDrop={enableDragAndDrop}
                  columnProperty={columnProperty}
                  onCardClick={onCardClick}
                  onCardTitleEdit={onCardTitleEdit}
                  onCreateCard={onCreateCard}
                  onPropertyEdit={onPropertyEdit}
                  dragHandleProps={provided.dragHandleProps}
                  availableTags={boardData.availableTags}
                  showDeleteConfirmDialog={showDeleteConfirmDialog}
                  onUpdateSettings={handleUpdateSettings}
                />
              </div>
            );
          }}
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`kanban-board__columns ${
                snapshot.isDraggingOver ? "kanban-board__columns--dragging" : ""
              }`}
            >
              {boardData.columns.map((column, index) => (
                <Draggable
                  key={column.id}
                  draggableId={`column-${column.id}`}
                  index={index}
                  isDragDisabled={!enableDragAndDrop}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`kanban-board__column-wrapper ${
                        snapshot.isDragging
                          ? "kanban-board__column-wrapper--dragging"
                          : ""
                      }`}
                      style={provided.draggableProps.style}
                    >
                      <Column
                        column={column}
                        cardSize={cardSize}
                        compact={compactMode}
                        showCardCount={showCardCount}
                        visibleProperties={visibleProperties}
                        enableDragAndDrop={enableDragAndDrop}
                        columnProperty={columnProperty}
                        onCardClick={onCardClick}
                        onCardTitleEdit={onCardTitleEdit}
                        onCreateCard={onCreateCard}
                        onPropertyEdit={onPropertyEdit}
                        onCardDelete={handleCardDelete}
                        dragHandleProps={provided.dragHandleProps}
                        availableTags={boardData.availableTags}
                        hiddenCardIds={hiddenCardIds}
                        showDeleteConfirmDialog={showDeleteConfirmDialog}
                        onUpdateSettings={handleUpdateSettings}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
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

      {/* Undo Toast */}
      {pendingDelete && (
        <UndoToast
          message={`Deleted "${pendingDelete.file.basename}"`}
          onUndo={handleUndo}
          onClose={handleToastClose}
          duration={5000}
        />
      )}
    </div>
  );
};
