/**
 * Column コンポーネント
 *
 * カンバンボードの1つのカラム（列）を表示します。
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Droppable,
  Draggable,
  DraggableProvidedDragHandleProps,
} from "@hello-pangea/dnd";
import { KanbanColumn, KanbanCard } from "../types/kanban";
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
  onCreateCard?: (columnId: string, title: string) => void;

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
  // 一時的な新規カードの管理
  const [tempNewCard, setTempNewCard] = useState<KanbanCard | null>(null);
  const cardInputRef = useRef<HTMLInputElement>(null);

  // 新規カード作成時にフォーカスを当てる
  useEffect(() => {
    if (tempNewCard && cardInputRef.current) {
      cardInputRef.current.focus();
    }
  }, [tempNewCard]);

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
    // 一時的な新規カードを作成
    const newCard: KanbanCard = {
      id: `temp-${Date.now()}`,
      title: "Untitled",
      properties: {},
      file: null as any, // 一時的にnullを設定
      columnId: column.id,
    };
    setTempNewCard(newCard);
  };

  // 新規カードのフォーカスが切れた時の処理
  const handleTempCardBlur = () => {
    // フォーカスが切れたら、既存のカード作成処理を実行
    if (tempNewCard && onCreateCard) {
      onCreateCard(column.id, tempNewCard.title);
    }
    // 一時カードをクリア
    setTempNewCard(null);
  };

  // 表示するカードのリスト（一時カードを先頭に追加）
  const displayCards = tempNewCard
    ? [tempNewCard, ...column.cards]
    : column.cards;

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
            {displayCards.map((card, index) => {
              // 非表示にするカードはスキップ
              const isHidden = hiddenCardIds?.has(card.id);

              // 一時カードかどうかを判定
              const isTempCard = card.id === tempNewCard?.id;

              // 一時カードの場合はドラッグ不可で、特別な処理を適用
              if (isTempCard) {
                return (
                  <div
                    key={card.id}
                    className="kanban-column__card-wrapper kanban-column__card-wrapper--temp"
                  >
                    <div className="kanban-card kanban-card--medium kanban-card--editing">
                      <div className="kanban-card__title">
                        <input
                          ref={cardInputRef}
                          type="text"
                          className="kanban-card__title-input"
                          value={card.title}
                          onChange={(e) => {
                            if (tempNewCard) {
                              setTempNewCard({
                                ...tempNewCard,
                                title: e.target.value,
                              });
                            }
                          }}
                          onBlur={handleTempCardBlur}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleTempCardBlur();
                            } else if (e.key === "Escape") {
                              setTempNewCard(null);
                            }
                          }}
                          placeholder="Enter card title..."
                        />
                      </div>
                    </div>
                  </div>
                );
              }

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
