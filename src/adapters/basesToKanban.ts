/**
 * Bases データを Kanban データに変換するアダプター
 *
 * Bases Plugin から取得したデータを Kanban ボードで使用できる形式に変換します。
 */

import type { TFile } from "obsidian";
import type {
  KanbanBoardData,
  KanbanCard,
  KanbanColumn,
} from "../types/kanban";

interface BasesEntry {
  file: TFile;
  frontmatter?: Record<string, unknown>;
}

/**
 * Bases エントリーを Kanban ボードデータに変換
 *
 * @param entries - Bases エントリーの配列
 * @param columnProperty - カラムプロパティ名（グループ化に使用）
 * @returns Kanban ボードデータ
 */
export function basesToKanbanData(
  entries: unknown[],
  columnProperty: string,
): KanbanBoardData {
  // エントリーをカードに変換
  const cards = entries.map((entry) => entryToCard(entry, columnProperty));

  // カラムごとにカードをグループ化
  const columnsMap = new Map<string, KanbanCard[]>();

  cards.forEach((card) => {
    const columnId = card.columnId;
    if (!columnsMap.has(columnId)) {
      columnsMap.set(columnId, []);
    }
    const columnCards = columnsMap.get(columnId);
    if (columnCards) {
      columnCards.push(card);
    }
  });

  // カラムオブジェクトを作成
  const columns: KanbanColumn[] = Array.from(columnsMap.entries()).map(
    ([columnId, columnCards], index) => ({
      id: columnId,
      title: columnId,
      cards: columnCards,
      count: columnCards.length,
      order: index,
    }),
  );

  // カラムをソート（未分類を最後に）
  columns.sort((a, b) => {
    if (a.id === "未分類") return 1;
    if (b.id === "未分類") return -1;
    return a.id.localeCompare(b.id);
  });

  // order を再設定
  columns.forEach((column, index) => {
    column.order = index;
  });

  return {
    columns,
    columnProperty,
  };
}

/**
 * Bases エントリーを Kanban カードに変換
 *
 * @param entry - Bases エントリー
 * @param columnProperty - カラムプロパティ名
 * @returns Kanban カード
 */
export function entryToCard(
  entry: unknown,
  columnProperty: string,
): KanbanCard {
  const basesEntry = entry as BasesEntry;

  // frontmatter が存在しない場合は空オブジェクトを使用
  const properties = basesEntry?.frontmatter || {};
  const columnValue = properties[columnProperty];

  // カラム値が存在しない場合は「未分類」とする
  const columnId =
    columnValue !== undefined && columnValue !== null
      ? String(columnValue)
      : "未分類";

  return {
    id: basesEntry?.file?.path || "unknown",
    title: basesEntry?.file?.basename || "Untitled",
    file: basesEntry?.file,
    properties: properties,
    columnId,
    order: 0,
  };
}

/**
 * カラムプロパティの値一覧を取得
 * （将来的に、カラムの選択肢を提供する際に使用）
 *
 * @param entries - Bases エントリーの配列
 * @param columnProperty - カラムプロパティ名
 * @returns プロパティ値の配列（重複なし）
 */
export function getColumnValues(
  entries: unknown[],
  columnProperty: string,
): string[] {
  const valuesSet = new Set<string>();

  entries.forEach((entry) => {
    const basesEntry = entry as BasesEntry;
    const value = basesEntry.frontmatter?.[columnProperty];
    if (value !== undefined && value !== null) {
      valuesSet.add(String(value));
    }
  });

  return Array.from(valuesSet).sort();
}

/**
 * カードを別のカラムに移動（カラムデータを更新）
 *
 * @param boardData - 現在のボードデータ
 * @param cardId - 移動するカードの ID
 * @param newColumnId - 移動先のカラム ID
 * @returns 更新されたボードデータ
 */
export function moveCardInBoardData(
  boardData: KanbanBoardData,
  cardId: string,
  newColumnId: string,
): KanbanBoardData {
  const columns = boardData.columns.map((column) => {
    // 移動元のカラムからカードを削除
    const cards = column.cards.filter((card) => card.id !== cardId);

    return {
      ...column,
      cards,
      count: cards.length,
    };
  });

  // 移動先のカラムにカードを追加
  const targetColumn = columns.find((col) => col.id === newColumnId);
  const movedCard = boardData.columns
    .flatMap((col) => col.cards)
    .find((card) => card.id === cardId);

  if (targetColumn && movedCard) {
    targetColumn.cards.push({
      ...movedCard,
      columnId: newColumnId,
    });
    targetColumn.count = targetColumn.cards.length;
  }

  return {
    ...boardData,
    columns,
  };
}
