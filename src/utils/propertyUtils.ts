/**
 * プロパティタイプ推測ユーティリティ
 *
 * プロパティの値からタイプを推測する関数を提供します。
 */

import { PropertyType } from "../types/kanban";

/**
 * プロパティ値からプロパティタイプを推測
 *
 * @param value - プロパティ値
 * @param propertyName - プロパティ名（ヒントとして使用）
 * @returns 推測されたプロパティタイプ
 */
export function inferPropertyType(
  value: unknown,
  propertyName?: string,
): PropertyType {
  // 値が undefined または null の場合、プロパティ名から推測
  if (value === undefined || value === null) {
    if (propertyName) {
      const lowerName = propertyName.toLowerCase();
      if (lowerName.includes("date") || lowerName.includes("due")) {
        return PropertyType.Date;
      }
      if (lowerName.includes("time")) {
        return PropertyType.DateTime;
      }
      if (lowerName.includes("tag")) {
        return PropertyType.Tags;
      }
      if (
        lowerName.includes("done") ||
        lowerName.includes("completed") ||
        lowerName.includes("checked")
      ) {
        return PropertyType.Checkbox;
      }
    }
    return PropertyType.Text;
  }

  // boolean 型
  if (typeof value === "boolean") {
    return PropertyType.Checkbox;
  }

  // number 型
  if (typeof value === "number") {
    return PropertyType.Number;
  }

  // 配列型
  if (Array.isArray(value)) {
    // プロパティ名に "tag" が含まれる場合は Tags
    if (propertyName?.toLowerCase().includes("tag")) {
      return PropertyType.Tags;
    }
    // それ以外は List
    return PropertyType.List;
  }

  // 文字列型
  if (typeof value === "string") {
    // 日付形式の文字列（YYYY-MM-DD）
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(value)) {
      return PropertyType.Date;
    }

    // 日時形式の文字列（YYYY-MM-DDTHH:mm:ss または YYYY-MM-DD HH:mm:ss）
    const dateTimeRegex =
      /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?(\.\d{3})?([+-]\d{2}:\d{2}|Z)?$/;
    if (dateTimeRegex.test(value)) {
      return PropertyType.DateTime;
    }

    // 数値文字列
    if (/^\d+(\.\d+)?$/.test(value) && !Number.isNaN(Number(value))) {
      return PropertyType.Number;
    }

    // boolean 文字列
    if (value === "true" || value === "false") {
      return PropertyType.Checkbox;
    }

    // プロパティ名から推測
    if (propertyName) {
      const lowerName = propertyName.toLowerCase();
      if (
        lowerName.includes("date") ||
        lowerName.includes("due") ||
        lowerName.includes("deadline")
      ) {
        return PropertyType.Date;
      }
      if (lowerName.includes("time") || lowerName.includes("datetime")) {
        return PropertyType.DateTime;
      }
      if (lowerName.includes("tag")) {
        return PropertyType.Tags;
      }
    }

    // デフォルトは Text
    return PropertyType.Text;
  }

  // その他の型はすべて Text として扱う
  return PropertyType.Text;
}

/**
 * プロパティ値を表示用に整形
 *
 * @param value - プロパティ値
 * @param type - プロパティタイプ
 * @returns 整形された文字列
 */
export function formatPropertyValue(
  value: unknown,
  type: PropertyType,
): string {
  if (value === undefined || value === null) {
    return "";
  }

  switch (type) {
    case PropertyType.Checkbox:
      if (typeof value === "boolean") {
        return value ? "✓" : "";
      }
      return String(value) === "true" ? "✓" : "";

    case PropertyType.Date:
    case PropertyType.DateTime:
      if (value instanceof Date) {
        return value.toISOString().split("T")[0];
      }
      return String(value);

    case PropertyType.Tags:
    case PropertyType.List:
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      return String(value);

    case PropertyType.Number:
      if (typeof value === "number") {
        return value.toString();
      }
      return String(value);

    case PropertyType.Text:
    default:
      if (typeof value === "object") {
        return JSON.stringify(value);
      }
      return String(value);
  }
}

/**
 * 編集用の値を実際のプロパティ値に変換
 *
 * @param editedValue - 編集された値
 * @param type - プロパティタイプ
 * @param originalValue - 元の値（型のヒント）
 * @returns 変換された値
 */
export function parsePropertyValue(
  editedValue: string,
  type: PropertyType,
  originalValue?: unknown,
): unknown {
  if (!editedValue || editedValue.trim() === "") {
    // 元の値が配列の場合は空配列を返す
    if (Array.isArray(originalValue)) {
      return [];
    }
    return null;
  }

  switch (type) {
    case PropertyType.Checkbox:
      return (
        editedValue === "true" ||
        editedValue === "✓" ||
        editedValue === "checked"
      );

    case PropertyType.Number: {
      const num = Number(editedValue);
      return Number.isNaN(num) ? null : num;
    }

    case PropertyType.Date:
    case PropertyType.DateTime:
      // 日付文字列をそのまま返す
      return editedValue;

    case PropertyType.Tags:
    case PropertyType.List:
      // カンマ区切りで分割
      return editedValue
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

    case PropertyType.Text:
    default:
      return editedValue;
  }
}
