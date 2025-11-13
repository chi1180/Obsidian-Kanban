/**
 * Column コンポーネント
 *
 * カンバンボードの1つのカラム（列）を表示します。
 */

import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { KanbanColumn } from "../types/kanban";
import { CardSize } from "../types/settings";
import { Card } from "./Card";
import { NewCardButton } from "./NewCardButton";
import { TFile } from "obsidian";

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
}) => {
  return (
    <div className="kanban-column">
      {/* カラムヘッダー */}
      <div className="kanban-column__header">
        <h3 className="kanban-column__title">{column.title}</h3>
        {showCardCount && (
          <span className="kanban-column__count">{column.count}</span>
        )}
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
            {column.cards.map((card, index) => (
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
                    style={provided.draggableProps.style}
                  >
                    <Card
                      card={card}
                      size={cardSize}
                      compact={compact}
                      visibleProperties={visibleProperties}
                      onClick={onCardClick}
                      onTitleEdit={onCardTitleEdit}
                      onPropertyEdit={onPropertyEdit}
                      draggable={enableDragAndDrop}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {/* 新規カード作成ボタン */}
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
