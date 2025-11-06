/**
 * NewCardButton コンポーネント
 *
 * カラムに新しいカードを追加するボタンを表示します。
 */

import React, { useState } from "react";
import { Plus, X } from "lucide-react";

interface NewCardButtonProps {
  /** カラムの ID */
  columnId: string;

  /** カラムのタイトル */
  columnTitle: string;

  /** 新規カード作成時のコールバック */
  onCreateCard: (columnId: string, title: string) => void;

  /** コンパクトモード */
  compact?: boolean;
}

/**
 * NewCardButton コンポーネント
 */
export const NewCardButton: React.FC<NewCardButtonProps> = ({
  columnId,
  columnTitle,
  onCreateCard,
  compact = false,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [cardTitle, setCardTitle] = useState("");

  // 作成モードを開始
  const handleStartCreate = () => {
    setIsCreating(true);
    setCardTitle("");
  };

  // 作成をキャンセル
  const handleCancel = () => {
    setIsCreating(false);
    setCardTitle("");
  };

  // カードを作成
  const handleCreate = () => {
    const trimmedTitle = cardTitle.trim();
    if (trimmedTitle) {
      onCreateCard(columnId, trimmedTitle);
      setIsCreating(false);
      setCardTitle("");
    }
  };

  // Enter キーで作成、Escape キーでキャンセル
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isCreating) {
    return (
      <div className="kanban-new-card-form">
        <input
          type="text"
          className="kanban-new-card-input"
          placeholder="Card title..."
          value={cardTitle}
          onChange={(e) => setCardTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <div className="kanban-new-card-actions">
          <button
            className="kanban-new-card-button kanban-new-card-button--create"
            onClick={handleCreate}
            disabled={!cardTitle.trim()}
          >
            Add Card
          </button>
          <button
            className="kanban-new-card-button kanban-new-card-button--cancel"
            onClick={handleCancel}
            aria-label="Cancel"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      className={`kanban-new-card-trigger ${
        compact ? "kanban-new-card-trigger--compact" : ""
      }`}
      onClick={handleStartCreate}
    >
      <Plus size={16} />
      <span>New Card</span>
    </button>
  );
};
