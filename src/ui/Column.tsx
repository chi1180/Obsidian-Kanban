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

  /** ドラッグハンドルのプロパティ */
  dragHandleProps?: DraggableProvidedDragHandleProps | null;

  /** プロパティごとの利用可能なタグ値 */
  availableTags?: Record<string, string[]>;

  /** 非表示にするカードのIDセット */
  hiddenCardIds?: Set<string>;
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
  onCardClick,
  onCardTitleEdit,
  onCreateCard,
  onPropertyEdit,
  onCardDelete,
  dragHandleProps,
  availableTags,
  hiddenCardIds,
}) => {
  // カラムの色を CSS 変数として設定
  const columnStyle = column.color
    ? ({
        "--column-bg-color": column.color.background,
        "--column-text-color": column.color.text,
        "--column-dot-color": column.color.dot,
      } as React.CSSProperties)
    : undefined;

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
              onClick={() => onCreateCard(column.id, "Untitled")}
              aria-label="新しいカードを追加"
              title="新しいカードを追加"
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
          const card = column.cards[rubric.source.index];
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
                availableTags={availableTags}
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
            {column.cards.map((card, index) => {
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
                        availableTags={availableTags}
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
                onCreateCard={onCreateCard}
                compact={compact}
              />
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
