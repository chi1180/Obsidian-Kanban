/**
 * CheckboxEditor コンポーネント
 *
 * チェックボックスプロパティを編集するためのエディタ
 */

import React from "react";

interface CheckboxEditorProps {
  /** 現在の値 */
  value: boolean;

  /** 値変更時のコールバック */
  onChange: (value: boolean) => void;

  /** プロパティ名（ラベル表示用） */
  propertyName: string;

  /** クリック時の伝播を停止 */
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * CheckboxEditor コンポーネント
 */
export const CheckboxEditor: React.FC<CheckboxEditorProps> = ({
  value,
  onChange,
  propertyName,
  onClick,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onChange(e.target.checked);
  };

  return (
    <div className="kanban-property-editor kanban-checkbox-editor">
      <label className="kanban-checkbox-editor__label">
        <input
          type="checkbox"
          className="kanban-checkbox-editor__input"
          checked={value}
          onChange={handleChange}
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) {
              onClick(e);
            }
          }}
          aria-label={propertyName}
        />
      </label>
    </div>
  );
};
