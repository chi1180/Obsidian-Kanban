/**
 * Column コンポーネント
 *
 * カンバンボードの1つのカラム（列）を表示します。
 */

import React from "react";
import {
  Droppable,
  Draggable,
  DraggableProvidedDragHandleProps,
} from "@hello-pangea/dnd";
import { KanbanColumn } from "../types/kanban";
import { CardSize } from "../types/settings";
import { Card } from "./Card";
import { NewCardButton } from "./NewCardButton";
import { TFile } from "obsidian";
import { GripVertical } from "lucide-react";
import { PropertyMetadata } from "../utils/propertyUtils";

interface ColumnProps {
  /** カラムのデータ */
  column: KanbanColumn;

  /** カードサイズ */
  cardSize: CardSize;

  /** コンパクトモード */
  compact: boolean;

  /** カード数を表示するか */
  showCardCount: boolean;

  /** 表示するプロパティのリスト */
  visibleProperties: string[];

  /** ドラッグ&ドロップを有効にするか */
  enableDragAndDrop: boolean;

  /** カラムプロパティ名（分類用のプロパティ） */
  columnProperty?: string;

  /** カードクリック時のコールバック */
  onCardClick?: (file: TFile) => void;

  /** カードタイトル編集時のコールバック */
  onCardTitleEdit?: (file: TFile, newTitle: string) => void;

  /** 新規カード作成時のコールバック */
  onCreateCard?: (
    columnId: string,
    title: string,
    insertPosition?: "top" | "bottom",
  ) => void;

  /** プロパティ編集時のコールバック */
  onPropertyEdit?: (file: TFile, property: string, newValue: any) => void;

  /** カード削除時のコールバック */
  onCardDelete?: (file: TFile) => void;

  /** 削除確認ダイアログを表示するか */
  showDeleteConfirmDialog?: boolean;

  /** 設定更新時のコールバック */
  onUpdateSettings?: (key: string, value: any) => void;

  /** ドラッグハンドルのプロパティ */
  dragHandleProps?: DraggableProvidedDragHandleProps | null;

  /** プロパティごとの利用可能なタグ値 */
  availableTags?: Record<string, string[]>;

  /** 非表示にするカードのIDセット */
  hiddenCardIds?: Set<string>;

  /** すべてのプロパティのメタデータ */
  allProperties?: PropertyMetadata[];
}

/**
 * Column コンポーネント
 */
export const Column: React.FC<ColumnProps> = ({
  column,
  cardSize,
  compact,
  showCardCount,
  visibleProperties,
  enableDragAndDrop,
  columnProperty,
  onCardClick,
  onCardTitleEdit,
  onCreateCard,
  onPropertyEdit,
  onCardDelete,
  showDeleteConfirmDialog,
  onUpdateSettings,
  dragHandleProps,
  availableTags,
  hiddenCardIds,
  allProperties,
}) => {
  // カラムの色を CSS 変数として設定
  const columnStyle = column.color
    ? ({
        "--column-bg-color": column.color.background,
        "--column-text-color": column.color.text,
        "--column-dot-color": column.color.dot,
      } as React.CSSProperties)
    : undefined;

  // カラム右上の「+」ボタンクリック時の処理
  const handleHeaderAddClick = () => {
    // 直接カード作成処理を実行（上部に追加）
    if (onCreateCard) {
      onCreateCard(column.id, "Untitled", "top");
    }
  };

  // カラム下部の「+ New Card」ボタンクリック時の処理
  const handleBottomAddClick = () => {
    // 直接カード作成処理を実行（下部に追加）
    if (onCreateCard) {
      onCreateCard(column.id, "Untitled", "bottom");
    }
  };

  // 新規作成カード（isNew）の位置を制御
  const sortedCards = [...column.cards].sort((a, b) => {
    // insertPosition が 'top' のカードを先頭に
    if (
      a.isNew &&
      a.insertPosition === "top" &&
      (!b.isNew || b.insertPosition !== "top")
    )
      return -1;
    if (
      b.isNew &&
      b.insertPosition === "top" &&
      (!a.isNew || a.insertPosition !== "top")
    )
      return 1;

    // insertPosition が 'bottom' のカードを末尾に
    if (
      a.isNew &&
      a.insertPosition === "bottom" &&
      (!b.isNew || b.insertPosition !== "bottom")
    )
      return 1;
    if (
      b.isNew &&
      b.insertPosition === "bottom" &&
      (!a.isNew || a.insertPosition !== "bottom")
    )
      return -1;

    // それ以外は元の順序を維持
    return 0;
  });

  return (
    <div
      className={`kanban-column ${column.color ? "kanban-column--colored" : ""}`}
      style={columnStyle}
    >
      {/* カラムヘッダー */}
      <div className="kanban-column__header">
        {/* ドラッグハンドル */}
        {enableDragAndDrop && dragHandleProps && (
          <button
            type="button"
            {...dragHandleProps}
            className="kanban-column__drag-handle"
            aria-label="カラムをドラッグして並び替え"
          >
            <GripVertical size={16} />
          </button>
        )}
        <h3 className="kanban-column__title">
          {column.color && <span className="kanban-column__title-dot" />}
          {column.title}
        </h3>
        <div className="kanban-column__header-right">
          {showCardCount && (
            <span className="kanban-column__count">
              {
                column.cards.filter((card) => !hiddenCardIds?.has(card.id))
                  .length
              }
            </span>
          )}
          {onCreateCard && (
            <button
              type="button"
              className="kanban-column__add-button"
              onClick={handleHeaderAddClick}
              aria-label="新しいカードを追加"
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* カードリスト */}
      <Droppable
        droppableId={column.id}
        isDropDisabled={!enableDragAndDrop}
        renderClone={(provided, _snapshot, rubric) => {
          const card = sortedCards[rubric.source.index];
          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="kanban-column__card-wrapper kanban-column__card-wrapper--dragging"
              style={provided.draggableProps.style}
            >
              <Card
                card={card}
                size={cardSize}
                compact={compact}
                visibleProperties={visibleProperties}
                draggable={enableDragAndDrop}
                columnColor={column.color}
                columnProperty={columnProperty}
                availableTags={availableTags}
                showDeleteConfirmDialog={showDeleteConfirmDialog}
                onUpdateSettings={onUpdateSettings}
                allProperties={allProperties}
              />
            </div>
          );
        }}
      >
        {(provided, _snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`kanban-column__cards ${
              _snapshot.isDraggingOver
                ? "kanban-column__cards--dragging-over"
                : ""
            }`}
          >
            {sortedCards.map((card, index) => {
              // 非表示にするカードはスキップ
              const isHidden = hiddenCardIds?.has(card.id);

              return (
                <Draggable
                  key={card.id}
                  draggableId={card.id}
                  index={index}
                  isDragDisabled={!enableDragAndDrop}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`kanban-column__card-wrapper ${
                        snapshot.isDragging
                          ? "kanban-column__card-wrapper--dragging"
                          : ""
                      }`}
                      style={{
                        ...provided.draggableProps.style,
                        display: isHidden ? "none" : undefined,
                      }}
                    >
                      <Card
                        card={card}
                        size={cardSize}
                        compact={compact}
                        visibleProperties={visibleProperties}
                        onClick={onCardClick}
                        onTitleEdit={onCardTitleEdit}
                        onPropertyEdit={onPropertyEdit}
                        onDelete={onCardDelete}
                        draggable={enableDragAndDrop}
                        columnColor={column.color}
                        columnProperty={columnProperty}
                        availableTags={availableTags}
                        showDeleteConfirmDialog={showDeleteConfirmDialog}
                        onUpdateSettings={onUpdateSettings}
                        allProperties={allProperties}
                      />
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}

            {/* 新規カード作成ボタン（カラム下部） */}
            {onCreateCard && (
              <NewCardButton
                columnId={column.id}
                columnTitle={column.title}
                onCreateCard={handleBottomAddClick}
                compact={compact}
              />
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
