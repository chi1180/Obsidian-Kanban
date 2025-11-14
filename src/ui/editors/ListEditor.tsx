/**
 * ListEditor コンポーネント
 *
 * リストプロパティを編集するためのエディタ（複数選択可能）
 */

import React, { useRef, useEffect, useState } from "react";
import { getColumnColorForTheme } from "../../utils/colorUtils";

interface ListEditorProps {
  /** 現在選択されている値の配列 */
  selectedValues: string[];

  /** 利用可能な選択肢の配列 */
  availableOptions: string[];

  /** 値変更時のコールバック */
  onChange: (values: string[]) => void;

  /** エディタを閉じるコールバック */
  onClose: () => void;

  /** プロパティ名（ラベル表示用） */
  propertyName: string;
}

/**
 * ListEditor コンポーネント
 */
export const ListEditor: React.FC<ListEditorProps> = ({
  selectedValues,
  availableOptions,
  onChange,
  onClose,
  propertyName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [newValue, setNewValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Escape キーで閉じる
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // 値をトグル（選択/解除）
  const handleToggleValue = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newSelectedValues);
  };

  // 新しい値を追加
  const handleAddNewValue = () => {
    const trimmedValue = newValue.trim();
    if (trimmedValue && !selectedValues.includes(trimmedValue)) {
      onChange([...selectedValues, trimmedValue]);
      setNewValue("");
    }
  };

  // Enter キーで新しい値を追加
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddNewValue();
    }
  };

  // 選択済みの値を削除
  const handleRemoveValue = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== value));
  };

  return (
    <div
      ref={containerRef}
      className="kanban-list-editor"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.stopPropagation();
        }
      }}
      role="dialog"
      aria-label={`Edit ${propertyName}`}
      tabIndex={0}
    >
      {/* ヘッダー */}
      <div className="kanban-list-editor__header">
        <span className="kanban-list-editor__title">Edit {propertyName}</span>
      </div>

      {/* 選択済みの値 */}
      {selectedValues.length > 0 && (
        <div className="kanban-list-editor__selected">
          {selectedValues.map((value) => {
            const valueColor = getColumnColorForTheme(value);
            return (
              <div
                key={value}
                className="kanban-list-editor__selected-item"
                style={{
                  backgroundColor: valueColor.background,
                  color: valueColor.text,
                }}
              >
                <span
                  className="kanban-list-editor__selected-dot"
                  style={{ backgroundColor: valueColor.dot }}
                />
                {value}
                <button
                  type="button"
                  className="kanban-list-editor__remove-button"
                  onClick={(e) => handleRemoveValue(value, e)}
                  aria-label={`Remove ${value}`}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 利用可能な選択肢 */}
      {availableOptions.length > 0 && (
        <div className="kanban-list-editor__options">
          <div className="kanban-list-editor__options-label">
            Available options:
          </div>
          {availableOptions.map((option) => {
            const isSelected = selectedValues.includes(option);
            const optionColor = getColumnColorForTheme(option);
            return (
              <button
                key={option}
                type="button"
                className={`kanban-list-editor__option ${
                  isSelected ? "kanban-list-editor__option--selected" : ""
                }`}
                onClick={() => handleToggleValue(option)}
              >
                <span
                  className="kanban-list-editor__option-badge"
                  style={{
                    backgroundColor: optionColor.background,
                    color: optionColor.text,
                  }}
                >
                  <span
                    className="kanban-list-editor__option-dot"
                    style={{ backgroundColor: optionColor.dot }}
                  />
                  {option}
                </span>
                {isSelected && (
                  <span className="kanban-list-editor__checkmark">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 新しい値を追加 */}
      <div className="kanban-list-editor__add-new">
        <input
          ref={inputRef}
          type="text"
          className="kanban-list-editor__input"
          placeholder="Add new value..."
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
        />
        <button
          type="button"
          className="kanban-list-editor__add-button"
          onClick={handleAddNewValue}
          disabled={!newValue.trim()}
        >
          Add
        </button>
      </div>
    </div>
  );
};
