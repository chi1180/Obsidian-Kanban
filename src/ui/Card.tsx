/**
 * Card コンポーネント
 *
 * カンバンボード上の1枚のカードを表示します。
 */

import React, { useState, useRef, useEffect } from "react";
import type { TFile } from "obsidian";
import type { KanbanCard } from "../types/kanban";
import type { CardSize } from "../types/settings";
import { PropertyType } from "../types/kanban";
import { inferPropertyType, formatPropertyValue, PropertyMetadata } from "../utils/propertyUtils";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { PropertyEditor } from "./editors/PropertyEditor";
import { getColumnColorForTheme } from "../utils/colorUtils";

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

  /** カラムの色情報 */
  columnColor?: {
    background: string;
    text: string;
    dot: string;
  };

  /** カラムプロパティ名（分類用のプロパティ） */
  columnProperty?: string;

  /** プロパティごとの利用可能なタグ値 */
  availableTags?: Record<string, string[]>;

  /** カード削除時のコールバック */
  onDelete?: (file: TFile) => void;

  /** 削除確認ダイアログを表示するかどうか */
  showDeleteConfirmDialog?: boolean;

  /** 設定更新時のコールバック */
  onUpdateSettings?: (key: string, value: any) => void;
  
  /** すべてのプロパティのメタデータ */
  allProperties?: PropertyMetadata[];
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
  columnColor,
  columnProperty,
  availableTags: _availableTags,
  onDelete,
  showDeleteConfirmDialog = true,
  onUpdateSettings,
  allProperties = [],
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card.title);
  const [editingProperty, setEditingProperty] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 編集モード時に外側クリックで閉じる
  useEffect(() => {
    if (!isEditMode) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsEditMode(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditMode]);

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
    if (onClick && !isEditingTitle && !editingProperty && !showDeleteModal && !isEditMode) {
      onClick(card.file);
    }
  };

  // 編集ボタンのクリック
  const handleEditButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditMode(true);
  };

  // Done ボタンのクリック
  const handleDoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditMode(false);
  };

  // プロパティ編集を開始
  const handlePropertyClick = (propName: string) => {
    if (onPropertyEdit) {
      setEditingProperty(propName);
    }
  };

  // プロパティ編集を完了
  const handlePropertyChange = (propName: string, newValue: unknown) => {
    if (onPropertyEdit) {
      onPropertyEdit(card.file, propName, newValue);
    }
    setEditingProperty(null);
  };

  // プロパティ編集をキャンセル
  const handlePropertyClose = () => {
    setEditingProperty(null);
  };

  // カードのクラス名を生成
  const cardClassName = [
    "kanban-card",
    `kanban-card--${size}`,
    compact ? "kanban-card--compact" : "",
    draggable ? "kanban-card--draggable" : "",
    isEditMode ? "kanban-card--edit-mode" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // visibleProperties から "note." などのプレフィックスを除去し、
  // タイトル系のプロパティを除外
  const normalizedVisibleProperties = visibleProperties
    .filter((prop) => {
      // 正規化前のプロパティ名でタイトルをチェック
      const lastDotIndex = prop.lastIndexOf(".");
      const normalizedProp =
        lastDotIndex !== -1 ? prop.substring(lastDotIndex + 1) : prop;
      // title, name などのタイトル系プロパティをスキップ
      return normalizedProp !== "title" && normalizedProp !== "name";
    })
    .map((prop) => {
      // "note.tags" -> "tags", "file.path" -> "path" など
      const lastDotIndex = prop.lastIndexOf(".");
      return lastDotIndex !== -1 ? prop.substring(lastDotIndex + 1) : prop;
    });

  // 削除ボタンのクリック
  const handleDeleteButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // ダイアログをスキップする設定の場合は直接削除
    if (!showDeleteConfirmDialog) {
      if (onDelete) {
        onDelete(card.file);
      }
      return;
    }

    setShowDeleteModal(true);
  };

  // カード削除確定
  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(card.file);
    }
    setShowDeleteModal(false);
  };

  // カード削除キャンセル
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  // "Never show again" がチェックされたときの処理
  const handleNeverShowAgain = () => {
    if (onUpdateSettings) {
      onUpdateSettings("showDeleteConfirmDialog", false);
    }
  };


  // 編集モードで表示するプロパティリストを生成
  const editModeProperties = (): PropertyMetadata[] => {
    // カードに設定済みのプロパティと未設定のプロパティを分ける
    const setProperties: PropertyMetadata[] = [];
    const unsetProperties: PropertyMetadata[] = [];

    for (const prop of allProperties) {
      // title と name はスキップ
      if (prop.name === "title" || prop.name === "name") {
        continue;
      }

      const value = card.properties[prop.name];
      const hasValue = value !== undefined && value !== null && value !== "";

      if (hasValue) {
        setProperties.push(prop);
      } else {
        unsetProperties.push(prop);
      }
    }

    // 設定済みプロパティを先に、未設定を後に
    return [...setProperties, ...unsetProperties];
  };
  return (
    <div
      ref={cardRef}
      className={`${cardClassName} ${showDeleteModal ? "kanban-card--modal-open" : ""}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

      {/* 編集・削除ボタン */}
      {isHovered && !isEditMode && (
        <div className="kanban-card__action-buttons">
          {/* 編集ボタン */}
          <button
            type="button"
            className="kanban-card__edit-button"
            onClick={handleEditButtonClick}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            aria-label="Edit card"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          {/* 削除ボタン */}
          {onDelete && (
            <button
              type="button"
              className="kanban-card__delete-button"
              onClick={handleDeleteButtonClick}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              aria-label="Delete card"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* 削除確認モーダル */}
      {showDeleteModal && (
        <DeleteConfirmModal
          cardTitle={card.title}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          onNeverShowAgain={handleNeverShowAgain}
        />
      )}

      {/* 編集モード */}
      {isEditMode ? (
        <div className="kanban-card__edit-mode">
          {editModeProperties().map((prop) => {
            const value = card.properties[prop.name];
            const hasValue = value !== undefined && value !== null && value !== "";
            const isEditing = editingProperty === prop.name;

            return (
              <div key={prop.name} className="kanban-card__edit-property">
                {isEditing ? (
                  <PropertyEditor
                    propertyName={prop.name}
                    value={value}
                    onChange={(newValue) => handlePropertyChange(prop.name, newValue)}
                    onClose={handlePropertyClose}
                    availableOptions={prop.options}
                    forceType={prop.type}
                  />
                ) : (
                  <div
                    className={`kanban-card__edit-property-item ${!hasValue ? "kanban-card__edit-property-item--empty" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePropertyClick(prop.name);
                    }}
                  >
                    <div className="kanban-card__edit-property-icon">
                      {prop.type === PropertyType.Checkbox && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                        </svg>
                      )}
                      {prop.type === PropertyType.Date && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      )}
                      {prop.type === PropertyType.DateTime && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      )}
                      {prop.type === PropertyType.Tags && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                          <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                      )}
                      {prop.type === PropertyType.List && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="8" y1="6" x2="21" y2="6" />
                          <line x1="8" y1="12" x2="21" y2="12" />
                          <line x1="8" y1="18" x2="21" y2="18" />
                          <line x1="3" y1="6" x2="3.01" y2="6" />
                          <line x1="3" y1="12" x2="3.01" y2="12" />
                          <line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                      )}
                      {prop.type === PropertyType.Number && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="4" y1="9" x2="20" y2="9" />
                          <line x1="4" y1="15" x2="20" y2="15" />
                          <line x1="10" y1="3" x2="8" y2="21" />
                          <line x1="16" y1="3" x2="14" y2="21" />
                        </svg>
                      )}
                      {prop.type === PropertyType.Text && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="4 7 4 4 20 4 20 7" />
                          <line x1="9" y1="20" x2="15" y2="20" />
                          <line x1="12" y1="4" x2="12" y2="20" />
                        </svg>
                      )}
                    </div>
                    <div className="kanban-card__edit-property-content">
                      <div className="kanban-card__edit-property-name">{prop.name}</div>
                      {hasValue ? (
                        <div className="kanban-card__edit-property-value">
                          {prop.type === PropertyType.List && Array.isArray(value) ? (
                            <div className="kanban-card__property-list">
                              {value.map((item, index) => {
                                const itemColor = getColumnColorForTheme(String(item));
                                return (
                                  <span
                                    key={index}
                                    className="kanban-card__property-list-item"
                                    style={{
                                      backgroundColor: itemColor.background,
                                      color: itemColor.text,
                                    }}
                                  >
                                    <span
                                      className="kanban-card__property-list-dot"
                                      style={{ backgroundColor: itemColor.dot }}
                                    />
                                    {String(item)}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            formatPropertyValue(value, prop.type)
                          )}
                        </div>
                      ) : (
                        <div className="kanban-card__edit-property-placeholder">
                          Add {prop.name}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Done ボタン */}
          <button
            type="button"
            className="kanban-card__done-button"
            onClick={handleDoneClick}
          >
            Done
          </button>
        </div>
      ) : (
        /* 通常モード: プロパティ */
        <div className="kanban-card__properties">
          {normalizedVisibleProperties.map((propName) => {
            const value = card.properties[propName];

            // 値が空の場合はスキップ
            if (value === undefined || value === null || value === "") {
              return null;
            }

            // カラムプロパティかどうかを判定
            const isColumnProperty = columnProperty === propName;

            // カラムプロパティの場合、カラムの色を適用
            const propertyStyle =
              isColumnProperty && columnColor
                ? ({
                    "--property-bg-color": columnColor.background,
                    "--property-text-color": columnColor.text,
                    "--property-dot-color": columnColor.dot,
                  } as React.CSSProperties)
                : undefined;

            const propertyClassName = `kanban-card__property-value ${
              isColumnProperty ? "kanban-card__property-value--column" : ""
            }`;

            // プロパティタイプを推測
            const propertyType = inferPropertyType(value, propName);
            const isEditingProperty =
              editingProperty === propName && !!onPropertyEdit;

            // チェックボックスタイプの場合は常に表示（編集可能状態）
            if (propertyType === PropertyType.Checkbox && !isEditingProperty) {
              return (
                <div key={propName} className="kanban-card__property">
                  <div
                    className="kanban-card__property-checkbox"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePropertyClick(propName);
                    }}
                    title={propName}
                  >
                    <label className="kanban-card__property-checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handlePropertyChange(propName, e.target.checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="kanban-card__property-name">
                        {propName}
                      </span>
                    </label>
                  </div>
                </div>
              );
            }

            return (
              <div key={propName} className="kanban-card__property">
                {isEditingProperty ? (
                  <PropertyEditor
                    propertyName={propName}
                    value={value}
                    onChange={(newValue) =>
                      handlePropertyChange(propName, newValue)
                    }
                    onClose={handlePropertyClose}
                    availableOptions={_availableTags?.[propName] || []}
                  />
                ) : (
                  <>
                    {propertyType === PropertyType.List &&
                    Array.isArray(value) ? (
                      <div
                        className="kanban-card__property-list"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePropertyClick(propName);
                        }}
                        title={propName}
                      >
                        {value.map((item, index) => {
                          const itemColor = getColumnColorForTheme(
                            String(item),
                          );
                          return (
                            <span
                              key={index}
                              className="kanban-card__property-list-item"
                              style={{
                                backgroundColor: itemColor.background,
                                color: itemColor.text,
                              }}
                            >
                              <span
                                className="kanban-card__property-list-dot"
                                style={{ backgroundColor: itemColor.dot }}
                              />
                              {String(item)}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        className={propertyClassName}
                        style={propertyStyle}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePropertyClick(propName);
                        }}
                        title={propName}
                      >
                        {isColumnProperty && columnColor && (
                          <span className="kanban-card__property-dot" />
                        )}
                        {formatPropertyValue(value, propertyType)}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
      )
    </div>
  );
};
