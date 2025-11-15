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
import { getColumnColorForTheme } from "../utils/colorUtils";

interface BasesEntry {
  file: TFile;
  frontmatter?: Record<string, unknown>;
}

/**
 * Bases エントリーを Kanban ボードデータに変換
 *
 * @param entries - Bases エントリーの配列
 * @param columnProperty - カラムプロパティ名（グループ化に使用）
 * @param savedColumnOrder - 保存されたカラム順序（オプション）
 * @param showColumnColors - カラムに色を付けるか（オプション）
 * @param newlyCreatedCardPath - 新規作成されたカードのパス（編集モードを自動で開くため）
 * @param newlyCreatedCardPosition - 新規作成されたカードの挿入位置（'top' | 'bottom'）
 * @returns Kanban ボードデータ
 */
export function basesToKanbanData(
  entries: unknown[],
  columnProperty: string,
  savedColumnOrder?: string[],
  showColumnColors?: boolean,
  newlyCreatedCardPath?: string | null,
  newlyCreatedCardPosition?: "top" | "bottom" | null,
): KanbanBoardData {
  // エントリーをカードに変換
  const cards = entries.map((entry) => {
    const card = entryToCard(entry, columnProperty);
    // 新規作成されたカードには isNew フラグと挿入位置を設定
    if (newlyCreatedCardPath && card.id === newlyCreatedCardPath) {
      card.isNew = true;
      card.insertPosition = newlyCreatedCardPosition || "top";
    }
    return card;
  });

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
    ([columnId, columnCards], index) => {
      const column: KanbanColumn = {
        id: columnId,
        title: columnId,
        cards: columnCards,
        count: columnCards.length,
        order: index,
      };

      // カラムの色を追加（有効な場合）
      if (showColumnColors) {
        column.color = getColumnColorForTheme(columnId);
      }

      return column;
    },
  );

  // カラムをソート
  // 保存された順序がある場合はそれを使用、なければデフォルト（未分類を最後に）
  if (savedColumnOrder && savedColumnOrder.length > 0) {
    // 保存された順序に基づいてソート
    columns.sort((a, b) => {
      const indexA = savedColumnOrder.indexOf(a.id);
      const indexB = savedColumnOrder.indexOf(b.id);

      // 両方が保存された順序に存在する場合
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // a のみ存在する場合、a を先に
      if (indexA !== -1) return -1;

      // b のみ存在する場合、b を先に
      if (indexB !== -1) return 1;

      // どちらも存在しない場合は、アルファベット順（新しいカラム用）
      return a.id.localeCompare(b.id);
    });
  } else {
    // デフォルトのソート（未分類を最後に）
    columns.sort((a, b) => {
      if (a.id === "未分類") return 1;
      if (b.id === "未分類") return -1;
      return a.id.localeCompare(b.id);
    });
  }

  // order を再設定
  columns.forEach((column, index) => {
    column.order = index;
  });

  // カラム順序を抽出
  const columnOrder = columns.map((col) => col.id);

  // プロパティごとの利用可能なタグ値を収集
  const availableTags = collectAvailableTags(entries, columnProperty);

  return {
    columns,
    columnProperty,
    columnOrder,
    availableTags,
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

/**
 * 全エントリーからプロパティごとの利用可能なタグ値を収集
 *
 * @param entries - Bases エントリーの配列
 * @param columnProperty - カラムプロパティ名（ステータスなど）
 * @returns プロパティ名 → タグ値の配列のマップ
 */
function collectAvailableTags(
  entries: unknown[],
  columnProperty: string,
): Record<string, string[]> {
  const tagsMap = new Map<string, Set<string>>();

  entries.forEach((entry) => {
    const basesEntry = entry as BasesEntry;
    const properties = basesEntry?.frontmatter || {};

    // すべてのプロパティをチェック
    Object.keys(properties).forEach((propName) => {
      const value = properties[propName];

      // 配列値の場合（タグプロパティ）
      if (Array.isArray(value)) {
        if (!tagsMap.has(propName)) {
          tagsMap.set(propName, new Set());
        }
        const tagSet = tagsMap.get(propName);
        if (tagSet) {
          value.forEach((item) => {
            if (item !== undefined && item !== null && item !== "") {
              tagSet.add(String(item));
            }
          });
        }
      }
      // カラムプロパティ（ステータス）の場合も収集
      else if (
        propName === columnProperty &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        if (!tagsMap.has(propName)) {
          tagsMap.set(propName, new Set());
        }
        const tagSet = tagsMap.get(propName);
        if (tagSet) {
          tagSet.add(String(value));
        }
      }
    });
  });

  // Set を配列に変換し、アルファベット順にソート
  const result: Record<string, string[]> = {};
  tagsMap.forEach((tagSet, propName) => {
    result[propName] = Array.from(tagSet).sort();
  });

  return result;
}
