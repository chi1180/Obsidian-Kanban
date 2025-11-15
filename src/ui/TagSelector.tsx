/**
 * TagSelector コンポーネント
 *
 * タグプロパティをドロップダウンで単一選択するコンポーネント
 */

import React, { useRef, useEffect } from "react";
import { getColumnColorForTheme } from "../utils/colorUtils";

interface TagSelectorProps {
  /** 現在選択されているタグの配列 */
  selectedTags: string[];

  /** 利用可能なタグの配列 */
  availableTags: string[];

  /** タグ選択時のコールバック */
  onTagsChange: (tags: string[]) => void;

  /** セレクターを閉じるコールバック */
  onClose: () => void;

  /** プロパティ名（ラベル表示用） */
  propertyName: string;
}

/**
 * TagSelector コンポーネント
 */
export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  availableTags,
  onTagsChange,
  onClose,
  propertyName,
}) => {
  const currentTag = selectedTags.length > 0 ? selectedTags[0] : null;
  const containerRef = useRef<HTMLDivElement>(null);

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

  // タグを選択（即座に確定して閉じる）
  const handleSelectTag = (tag: string) => {
    onTagsChange([tag]);
  };

  return (
    <div
      ref={containerRef}
      className="kanban-tag-selector"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.stopPropagation();
        }
      }}
      role="dialog"
      aria-label={`Change ${propertyName}`}
    >
      {/* ヘッダー */}
      <div className="kanban-tag-selector__header">
        <span className="kanban-tag-selector__title">
          Change {propertyName}
        </span>
      </div>

      {/* タグリスト */}
      <div className="kanban-tag-selector__list">
        {availableTags.length === 0 ? (
          <div className="kanban-tag-selector__empty">
            No tags available. Create tags by typing in other cards.
          </div>
        ) : (
          availableTags.map((tag) => {
            const isSelected = currentTag === tag;
            const tagColor = getColumnColorForTheme(tag);
            return (
              <button
                key={tag}
                type="button"
                className={`kanban-tag-selector__item ${
                  isSelected ? "kanban-tag-selector__item--selected" : ""
                }`}
                onClick={() => handleSelectTag(tag)}
              >
                <span
                  className="kanban-tag-selector__tag-badge"
                  style={{
                    backgroundColor: tagColor.background,
                    color: tagColor.text,
                  }}
                >
                  <span
                    className="kanban-tag-selector__tag-dot"
                    style={{ backgroundColor: tagColor.dot }}
                  />
                  {tag}
                </span>
                {isSelected && (
                  <span className="kanban-tag-selector__checkmark">✓</span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
