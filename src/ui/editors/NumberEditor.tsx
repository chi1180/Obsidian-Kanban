/**
 * NumberEditor コンポーネント
 *
 * 数値プロパティを編集するためのエディタ
 */

import React, { useRef, useEffect, useState } from "react";

interface NumberEditorProps {
  /** 現在の値 */
  value: number | string;

  /** 値変更時のコールバック */
  onChange: (value: string) => void;

  /** 編集完了時のコールバック */
  onBlur: () => void;

  /** プロパティ名（ラベル表示用） */
  propertyName: string;
}

/**
 * NumberEditor コンポーネント
 */
export const NumberEditor: React.FC<NumberEditorProps> = ({
  value,
  onChange,
  onBlur,
  propertyName,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editValue, setEditValue] = useState(String(value));

  // マウント時にフォーカス
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleBlur = () => {
    onChange(editValue);
    onBlur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // イベント伝播を停止（Obsidian のホットキーを防ぐ）
    e.stopPropagation();

    // Shift + Enter で改行、Enter のみで確定
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onChange(editValue);
      onBlur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onBlur();
    }
  };

  return (
    <div className="kanban-property-editor kanban-number-editor">
      <input
        ref={inputRef}
        type="number"
        className="kanban-number-editor__input"
        value={editValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        aria-label={propertyName}
      />
    </div>
  );
};
