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
import {
  inferPropertyType,
  formatPropertyValue,
  type PropertyMetadata,
} from "../utils/propertyUtils";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { PropertyEditor } from "./editors/PropertyEditor";
import { getColumnColorForTheme } from "../utils/colorUtils";
import {
  SquareCheckBig,
  Calendar,
  Clock,
  Tags,
  List,
  Binary,
  AlignLeft,
} from "lucide-react";

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
  onUpdateSettings?: (key: string, value: unknown) => void;

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
  const titleInputRef = useRef<HTMLInputElement>(null);

  // 新規作成されたカードは自動的に編集モードを開く
  useEffect(() => {
    if (card.isNew && !isEditMode) {
      setIsEditMode(true);
      // タイトル編集モードも開く
      setIsEditingTitle(true);
    }
  }, [card.isNew, isEditMode]);

  // 編集モード時にタイトル入力欄にフォーカスして選択
  useEffect(() => {
    if (isEditMode && isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();

      // カードを表示領域にスクロール（bottom 挿入の場合）
      if (card.insertPosition === "bottom" && cardRef.current) {
        setTimeout(() => {
          cardRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }, 100);
      }
    }
  }, [isEditMode, isEditingTitle, card.insertPosition]);

  // 編集モード時に外側クリックで閉じる
  useEffect(() => {
    if (!isEditMode) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsEditMode(false);
        // 新規カードの場合は isNew フラグをクリア
        if (card.isNew && onPropertyEdit) {
          onPropertyEdit(card.file, "_clearIsNew", true);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditMode, card.isNew, onPropertyEdit, card.file]);

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

    // 新規カードの場合は編集モードを閉じて isNew フラグをクリア
    if (card.isNew) {
      setIsEditMode(false);
      if (onPropertyEdit) {
        onPropertyEdit(card.file, "_clearIsNew", true);
      }
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

      // 新規カードの場合は編集モードを閉じて isNew フラグをクリア
      if (card.isNew) {
        setIsEditMode(false);
        if (onPropertyEdit) {
          onPropertyEdit(card.file, "_clearIsNew", true);
        }
      }
    }
  };

  // カードクリック
  const handleCardClick = () => {
    if (
      onClick &&
      !isEditingTitle &&
      !editingProperty &&
      !showDeleteModal &&
      !isEditMode
    ) {
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
    // 新規作成フラグをクリア
    if (card.isNew && onPropertyEdit) {
      // isNew フラグを削除するためにプロパティを更新
      onPropertyEdit(card.file, "_clearIsNew", true);
    }
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
            ref={titleInputRef}
            type="text"
            className="kanban-card__title-input"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              e.stopPropagation();
              handleTitleKeyDown(e);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <button
            type="button"
            className="kanban-card__title-text"
            onClick={handleTitleClick}
            title={card.title}
          >
            {card.title}
          </button>
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
              <title>Edit</title>
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
                <title>Delete</title>
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
            const hasValue =
              value !== undefined && value !== null && value !== "";
            const isEditing = editingProperty === prop.name;

            // カラムプロパティかどうかを判定（tags用）
            const isColumnProperty = columnProperty === prop.name;

            return (
              <div key={prop.name} className="kanban-card__edit-property">
                <button
                  type="button"
                  className={`kanban-card__edit-property-item ${!hasValue && !isEditing ? "kanban-card__edit-property-item--empty" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    // チェックボックス以外のみクリックで編集モードに
                    if (prop.type !== PropertyType.Checkbox && !isEditing) {
                      handlePropertyClick(prop.name);
                    }
                  }}
                >
                  <div className="kanban-card__edit-property-icon">
                    {prop.type === PropertyType.Checkbox && (
                      <SquareCheckBig size={16} />
                    )}
                    {prop.type === PropertyType.Date && <Calendar size={16} />}
                    {prop.type === PropertyType.DateTime && <Clock size={16} />}
                    {prop.type === PropertyType.Tags && <Tags size={16} />}
                    {prop.type === PropertyType.List && <List size={16} />}
                    {prop.type === PropertyType.Number && <Binary size={16} />}
                    {prop.type === PropertyType.Text && <AlignLeft size={16} />}
                  </div>
                  <div className="kanban-card__edit-property-content">
                    {prop.type === PropertyType.Checkbox ? (
                      // チェックボックスは view-mode と同じレンダリング
                      <div className="kanban-card__property-checkbox">
                        <label className="kanban-card__property-checkbox-label">
                          <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handlePropertyChange(prop.name, e.target.checked);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="kanban-card__property-name">
                            {prop.name}
                          </span>
                        </label>
                      </div>
                    ) : prop.type === PropertyType.Tags ? (
                      // Tags は view-mode と同じレンダリング
                      hasValue ? (
                        <button
                          type="button"
                          className={
                            isColumnProperty
                              ? "kanban-card__property-value kanban-card__property-value--column"
                              : "kanban-card__property-value"
                          }
                          style={
                            isColumnProperty && columnColor
                              ? ({
                                  "--property-bg-color": columnColor.background,
                                  "--property-text-color": columnColor.text,
                                  "--property-dot-color": columnColor.dot,
                                } as React.CSSProperties)
                              : undefined
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePropertyClick(prop.name);
                          }}
                        >
                          {isColumnProperty && columnColor && (
                            <span className="kanban-card__property-dot" />
                          )}
                          {formatPropertyValue(value, prop.type)}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="kanban-card__edit-property-placeholder"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePropertyClick(prop.name);
                          }}
                        >
                          Add {prop.name}
                        </button>
                      )
                    ) : isEditing ? (
                      // 編集中は他のプロパティもエディタを表示
                      <PropertyEditor
                        propertyName={prop.name}
                        value={value}
                        onChange={(newValue) =>
                          handlePropertyChange(prop.name, newValue)
                        }
                        onClose={handlePropertyClose}
                        availableOptions={prop.options}
                        forceType={prop.type}
                      />
                    ) : hasValue ? (
                      // 値がある場合は表示
                      <div className="kanban-card__edit-property-value">
                        {prop.type === PropertyType.List &&
                        Array.isArray(value) ? (
                          <div className="kanban-card__property-list">
                            {value.map((item) => {
                              const itemColor = getColumnColorForTheme(
                                String(item),
                              );
                              return (
                                <span
                                  key={`${prop.name}-${String(item)}`}
                                  className="kanban-card__property-list-item"
                                  style={{
                                    backgroundColor: itemColor.background,
                                    color: itemColor.text,
                                  }}
                                >
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
                      // 値がない場合はプレースホルダー
                      <div className="kanban-card__edit-property-placeholder">
                        Add {prop.name}
                      </div>
                    )}
                  </div>
                </button>
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
                  <button
                    type="button"
                    className="kanban-card__property-checkbox"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePropertyClick(propName);
                    }}
                    aria-label={propName}
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
                  </button>
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
                  <button
                    type="button"
                    className={`kanban-card__property-value-button ${propertyClassName}`}
                    style={propertyStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePropertyClick(propName);
                    }}
                    aria-label={`Edit ${propName}`}
                  >
                    {propertyType === PropertyType.List &&
                    Array.isArray(value) ? (
                      <div className="kanban-card__property-list">
                        {value.map((item) => {
                          const itemColor = getColumnColorForTheme(
                            String(item),
                          );
                          return (
                            <span
                              key={`${propName}-list-${String(item)}`}
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
                      <>
                        {isColumnProperty && columnColor && (
                          <span className="kanban-card__property-dot" />
                        )}
                        {formatPropertyValue(value, propertyType)}
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
