/**
 * PropertyEditor コンポーネント
 *
 * プロパティタイプに応じて適切なエディタを振り分ける統合コンポーネント
 */

import React from "react";
import { PropertyType } from "../../types/kanban";
import { inferPropertyType } from "../../utils/propertyUtils";
import { CheckboxEditor } from "./CheckboxEditor";
import { DateEditor } from "./DateEditor";
import { DateTimeEditor } from "./DateTimeEditor";
import { NumberEditor } from "./NumberEditor";
import { TextEditor } from "./TextEditor";
import { ListEditor } from "./ListEditor";
import { TagSelector } from "../TagSelector";

interface PropertyEditorProps {
  /** プロパティ名 */
  propertyName: string;

  /** 現在の値 */
  value: unknown;

  /** 値変更時のコールバック */
  onChange: (value: unknown) => void;

  /** 編集完了時のコールバック */
  onClose: () => void;

  /** 利用可能な選択肢（Tags/List の場合） */
  availableOptions?: string[];

  /** 強制的に指定するプロパティタイプ（オプション） */
  forceType?: PropertyType;
}

/**
 * PropertyEditor コンポーネント
 */
export const PropertyEditor: React.FC<PropertyEditorProps> = ({
  propertyName,
  value,
  onChange,
  onClose,
  availableOptions = [],
  forceType,
}) => {
  // プロパティタイプを決定
  const propertyType = forceType || inferPropertyType(value, propertyName);

  // 現在の値を文字列に変換（編集用）
  const getStringValue = (): string => {
    if (value === undefined || value === null) {
      return "";
    }
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  };

  // 編集完了時の処理
  const handleChange = (newValue: unknown) => {
    onChange(newValue);
  };

  // チェックボックスの変更時（即座に確定）
  const handleCheckboxChange = (checked: boolean) => {
    onChange(checked);
    onClose();
  };

  // タグの変更時（即座に確定）
  const handleTagsChange = (tags: string[]) => {
    onChange(tags);
    onClose();
  };

  // リストの変更時（複数選択）
  const handleListChange = (list: string[]) => {
    onChange(list);
  };

  // プロパティタイプに応じてエディタを返す
  switch (propertyType) {
    case PropertyType.Checkbox:
      return (
        <CheckboxEditor
          value={Boolean(value)}
          onChange={handleCheckboxChange}
          propertyName={propertyName}
        />
      );

    case PropertyType.Date:
      return (
        <DateEditor
          value={getStringValue()}
          onChange={handleChange}
          onBlur={onClose}
          propertyName={propertyName}
        />
      );

    case PropertyType.DateTime:
      return (
        <DateTimeEditor
          value={getStringValue()}
          onChange={handleChange}
          onBlur={onClose}
          propertyName={propertyName}
        />
      );

    case PropertyType.Number:
      return (
        <NumberEditor
          value={value === null || value === undefined ? "" : String(value)}
          onChange={handleChange}
          onBlur={onClose}
          propertyName={propertyName}
        />
      );

    case PropertyType.Tags:
      return (
        <TagSelector
          selectedTags={
            Array.isArray(value) ? value : value ? [String(value)] : []
          }
          availableTags={availableOptions}
          onTagsChange={handleTagsChange}
          onClose={onClose}
          propertyName={propertyName}
        />
      );

    case PropertyType.List:
      return (
        <ListEditor
          selectedValues={
            Array.isArray(value)
              ? value.map(String)
              : value
                ? [String(value)]
                : []
          }
          availableOptions={availableOptions}
          onChange={handleListChange}
          onClose={onClose}
          propertyName={propertyName}
        />
      );

    case PropertyType.Text:
    default:
      return (
        <TextEditor
          value={getStringValue()}
          onChange={handleChange}
          onBlur={onClose}
          propertyName={propertyName}
        />
      );
  }
};
