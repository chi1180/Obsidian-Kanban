/**
 * Card コンポーネント
 *
 * カンバンボード上の1枚のカードを表示します。
 */

import React, { useState } from "react";
import type { TFile } from "obsidian";
import type { KanbanCard } from "../types/kanban";
import type { CardSize } from "../types/settings";

interface EditingState {
  property: string | null;
  value: string;
}

interface CardProps {
  /** カードのデータ */
  card: KanbanCard;

  /** カードサイズ */
  size: CardSize;

  /** コンパクトモード */
  compact: boolean;

  /** 表示するプロパティのリスト */
  visibleProperties: string[];

  /** カードクリック時のコールバック */
  onClick?: (file: TFile) => void;

  /** タイトル編集時のコールバック */
  onTitleEdit?: (file: TFile, newTitle: string) => void;

  /** ドラッグ可能かどうか */
  draggable?: boolean;

  /** プロパティ編集時のコールバック */
  onPropertyEdit?: (file: TFile, property: string, newValue: unknown) => void;
}

/**
 * Card コンポーネント
 */
export const Card: React.FC<CardProps> = ({
  card,
  size,
  compact,
  visibleProperties,
  onClick,
  onTitleEdit,
  onPropertyEdit,
  draggable = true,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card.title);
  const [editingProperty, setEditingProperty] = useState<EditingState>({
    property: null,
    value: "",
  });

  // タイトル編集を開始
  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTitleEdit) {
      setIsEditingTitle(true);
      setEditedTitle(card.title);
    }
  };

  // タイトル編集を確定
  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (editedTitle.trim() && editedTitle !== card.title && onTitleEdit) {
      onTitleEdit(card.file, editedTitle.trim());
    } else {
      setEditedTitle(card.title);
    }
  };

  // Enter キーで確定、Escape キーでキャンセル
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleBlur();
    } else if (e.key === "Escape") {
      setIsEditingTitle(false);
      setEditedTitle(card.title);
    }
  };

  // カードクリック
  const handleCardClick = () => {
    if (onClick && !isEditingTitle && !editingProperty.property) {
      onClick(card.file);
    }
  };

  // プロパティ編集を開始
  const handlePropertyClick = (propName: string, currentValue: unknown) => {
    if (onPropertyEdit) {
      setEditingProperty({
        property: propName,
        value: formatPropertyValue(currentValue),
      });
    }
  };

  // プロパティ編集を確定
  const handlePropertyBlur = () => {
    if (editingProperty.property && editingProperty.value.trim() !== "") {
      const propName = editingProperty.property;
      const originalValue = card.properties[propName];
      const newValue = editingProperty.value.trim();

      // 値が変更されている場合のみ保存
      if (newValue !== formatPropertyValue(originalValue) && onPropertyEdit) {
        // 配列の場合はカンマ区切りで分割
        let parsedValue: unknown = newValue;
        if (Array.isArray(originalValue)) {
          parsedValue = newValue.split(",").map((v) => v.trim());
        }
        onPropertyEdit(card.file, propName, parsedValue);
      }
    }
    setEditingProperty({ property: null, value: "" });
  };

  // Enter キーで確定、Escape キーでキャンセル
  const handlePropertyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handlePropertyBlur();
    } else if (e.key === "Escape") {
      setEditingProperty({ property: null, value: "" });
    }
  };

  // プロパティ値を表示用に整形
  const formatPropertyValue = (value: unknown): string => {
    if (value === undefined || value === null) {
      return "";
    }
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  };

  // カードのクラス名を生成
  const cardClassName = [
    "kanban-card",
    `kanban-card--${size}`,
    compact ? "kanban-card--compact" : "",
    draggable ? "kanban-card--draggable" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // visibleProperties から "note." などのプレフィックスを除去
  const normalizedVisibleProperties = visibleProperties.map((prop) => {
    // "note.tags" -> "tags", "file.path" -> "path" など
    const lastDotIndex = prop.lastIndexOf(".");
    return lastDotIndex !== -1 ? prop.substring(lastDotIndex + 1) : prop;
  });

  return (
    <div
      className={cardClassName}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {/* タイトル */}
      <div className="kanban-card__title">
        {isEditingTitle ? (
          <input
            type="text"
            className="kanban-card__title-input"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <div
            className="kanban-card__title-text"
            onClick={handleTitleClick}
            title={card.title}
          >
            {card.title}
          </div>
        )}
      </div>

      {/* プロパティ */}
      {!compact && normalizedVisibleProperties.length > 0 && (
        <div className="kanban-card__properties">
          {normalizedVisibleProperties.map((propName) => {
            // タイトルは既に表示しているのでスキップ
            if (propName === "title") {
              return null;
            }

            const value = card.properties[propName];

            // 値が空の場合はスキップ
            if (value === undefined || value === null || value === "") {
              return null;
            }

            const isEditing =
              editingProperty.property === propName && !!onPropertyEdit;

            return (
              <div key={propName} className="kanban-card__property">
                {isEditing ? (
                  <input
                    type="text"
                    className="kanban-card__property-input"
                    value={editingProperty.value}
                    onChange={(e) =>
                      setEditingProperty({
                        ...editingProperty,
                        value: e.target.value,
                      })
                    }
                    onBlur={handlePropertyBlur}
                    onKeyDown={handlePropertyKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    title={propName}
                    autoFocus
                  />
                ) : (
                  <div
                    className="kanban-card__property-value"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePropertyClick(propName, value);
                    }}
                    title={propName}
                  >
                    {formatPropertyValue(value)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
