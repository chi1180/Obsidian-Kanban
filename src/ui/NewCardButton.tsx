/**
 * NewCardButton コンポーネント
 *
 * カラムに新しいカードを追加するボタンを表示します。
 * Notion風に、クリックで即座に「Untitled」カードを作成します。
 */

import React from "react";
import { Plus } from "lucide-react";

interface NewCardButtonProps {
  /** カラムの ID */
  columnId: string;

  /** カラムのタイトル */
  columnTitle: string;

  /** 新規カード作成時のコールバック */
  onCreateCard: (columnId: string, title: string) => void;

  /** キャンセル時のコールバック（外部制御時のみ） */
  onCancel?: () => void;

  /** コンパクトモード */
  compact?: boolean;

  /** 作成モードかどうか（外部制御時のみ） */
  isCreating?: boolean;
}

/**
 * NewCardButton コンポーネント
 */
export const NewCardButton: React.FC<NewCardButtonProps> = ({
  columnId,
  columnTitle: _columnTitle,
  onCreateCard,
  onCancel: _onCancel,
  compact = false,
  isCreating: _isCreating,
}) => {
  // Notion風に即座に「Untitled」カードを作成
  const handleCreateUntitled = () => {
    onCreateCard(columnId, "Untitled");
  };

  // デフォルトバリアント（フルサイズボタン）
  return (
    <button
      type="button"
      className={`kanban-new-card-trigger ${
        compact ? "kanban-new-card-trigger--compact" : ""
      }`}
      onClick={handleCreateUntitled}
    >
      <Plus size={16} />
      <span>New Card</span>
    </button>
  );
};
