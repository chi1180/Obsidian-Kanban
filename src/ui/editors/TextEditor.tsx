/**
 * TextEditor コンポーネント
 *
 * テキストプロパティを編集するためのエディタ（textarea で複数行対応）
 */

import React, { useRef, useEffect, useCallback, useState } from "react";

interface TextEditorProps {
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
 * TextEditor コンポーネント
 */
export const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  onBlur,
  propertyName,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editValue, setEditValue] = useState(value);

  // テキストエリアの高さを自動調整
  const autoResize = useCallback(() => {
    if (textareaRef.current) {
      // 一時的に高さをリセットしてから scrollHeight に合わせる
      const textarea = textareaRef.current;
      const currentHeight = textarea.scrollHeight;
      textarea.setAttribute("style", `height: ${currentHeight}px`);
    }
  }, []);

  // マウント時にフォーカスし、自動リサイズ
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      autoResize();
    }
  }, [autoResize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditValue(e.target.value);
    autoResize();
  };

  const handleBlur = () => {
    onChange(editValue);
    onBlur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
    <div className="kanban-property-editor kanban-text-editor">
      <textarea
        ref={textareaRef}
        className="kanban-text-editor__input"
        value={editValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        aria-label={propertyName}
        rows={1}
      />
    </div>
  );
};
