/**
 * UndoToast コンポーネント
 *
 * カード削除時に Undo ボタンを表示するトーストコンポーネント
 */

import React, { useEffect, useState } from "react";
import { Undo2 } from "lucide-react";

interface UndoToastProps {
  /** トーストのメッセージ */
  message: string;

  /** Undo ボタンクリック時のコールバック */
  onUndo: () => void;

  /** トーストが閉じられたときのコールバック */
  onClose: () => void;

  /** 自動的に閉じるまでの時間（ミリ秒）デフォルト: 5000 */
  duration?: number;
}

/**
 * UndoToast コンポーネント
 */
export const UndoToast: React.FC<UndoToastProps> = ({
  message,
  onUndo,
  onClose,
  duration = 5000,
}) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // マウント時にアニメーション開始
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // プログレスバーのアニメーション
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 16); // 約60fps

    // タイマーで自動的に閉じる
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 300); // フェードアウトアニメーションの時間
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  // Undo ボタンクリック
  const handleUndo = () => {
    setIsVisible(false);
    setTimeout(() => {
      onUndo();
    }, 300); // フェードアウトアニメーションの時間
  };

  return (
    <div
      className={`kanban-undo-toast ${isVisible ? "kanban-undo-toast--visible" : ""}`}
    >
      <div className="kanban-undo-toast__content">
        <span className="kanban-undo-toast__message">{message}</span>
        <button
          type="button"
          className="kanban-undo-toast__button"
          onClick={handleUndo}
        >
          <Undo2 size={16} />
          <span>Undo</span>
        </button>
      </div>
      <div
        className="kanban-undo-toast__progress"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
