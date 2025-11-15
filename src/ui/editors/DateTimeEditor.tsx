/**
 * DateTimeEditor コンポーネント
 *
 * 日時プロパティを編集するためのエディタ
 */

import React, { useRef, useEffect, useState } from "react";

interface DateTimeEditorProps {
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
 * DateTimeEditor コンポーネント
 */
export const DateTimeEditor: React.FC<DateTimeEditorProps> = ({
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

  // ISO 8601 形式を datetime-local 形式に変換（YYYY-MM-DDTHH:mm）
  const formatValueForInput = (val: string): string => {
    if (!val) return "";

    // 既に datetime-local 形式の場合はそのまま
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val)) {
      return val;
    }

    // ISO 8601 形式（YYYY-MM-DDTHH:mm:ss.sssZ など）を datetime-local 形式に変換
    try {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        // ローカルタイムゾーンで YYYY-MM-DDTHH:mm 形式に変換
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      }
    } catch {
      // パースエラーの場合はそのまま返す
    }

    return val;
  };

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
    <div className="kanban-property-editor kanban-datetime-editor">
      <input
        ref={inputRef}
        type="datetime-local"
        className="kanban-datetime-editor__input"
        value={formatValueForInput(editValue)}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        aria-label={propertyName}
      />
    </div>
  );
};
