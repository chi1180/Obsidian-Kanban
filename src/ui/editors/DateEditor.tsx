/**
 * DateEditor コンポーネント
 *
 * 日付プロパティを編集するためのエディタ
 */

import React, { useRef, useEffect, useState } from "react";

interface DateEditorProps {
  /** 現在の値 */
  value: string;

  /** 値変更時のコールバック */
  onChange: (value: string) => void;

  /** 編集完了時のコールバック */
  onBlur: () => void;

  /** プロパティ名（ラベル表示用） */
  propertyName: string;
}

/**
 * DateEditor コンポーネント
 */
export const DateEditor: React.FC<DateEditorProps> = ({
  value,
  onChange,
  onBlur,
  propertyName,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editValue, setEditValue] = useState(value);

  // マウント時にフォーカス
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
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

    if (e.key === "Enter") {
      e.preventDefault();
      onChange(editValue);
      onBlur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onBlur();
    }
  };

  return (
    <div className="kanban-property-editor kanban-date-editor">
      <input
        ref={inputRef}
        type="date"
        className="kanban-date-editor__input"
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
