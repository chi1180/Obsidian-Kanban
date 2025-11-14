/**
 * DeleteConfirmModal コンポーネント
 *
 * カード削除時の確認モーダル（Notion風のデザイン）
 */

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface DeleteConfirmModalProps {
  /** カードのタイトル */
  cardTitle: string;

  /** 確認時のコールバック */
  onConfirm: () => void;

  /** キャンセル時のコールバック */
  onCancel: () => void;
}

/**
 * DeleteConfirmModal コンポーネント
 */
export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  cardTitle,
  onConfirm,
  onCancel,
}) => {
  // Escape キーでキャンセル
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  // オーバーレイクリックでキャンセル
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="delete-modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleOverlayClick(e as unknown as React.MouseEvent);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="delete-modal">
        <div className="delete-modal__header">
          <h3 className="delete-modal__title">Delete card</h3>
          <button
            type="button"
            className="delete-modal__close-button"
            onClick={onCancel}
            aria-label="閉じる"
          >
            <X size={16} />
          </button>
        </div>

        <div className="delete-modal__content">
          <p className="delete-modal__message">
            Are you sure you want to delete{" "}
            <span className="delete-modal__card-name">"{cardTitle}"</span>?
          </p>
          <p className="delete-modal__submessage">
            This will move the file to the trash.
          </p>
        </div>

        <div className="delete-modal__actions">
          <button
            type="button"
            className="delete-modal__button delete-modal__button--cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="delete-modal__button delete-modal__button--delete"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
