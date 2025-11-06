/**
 * Bases データを Kanban ボードデータに変換するアダプター
 * Bases View のデータ構造と Kanban Board の UI データ構造を相互変換
 */

import type { BasesEntry, BasesEntryGroup, BasesQueryResult } from "obsidian";
import type { BoardData, Card, Column } from "../ui/board";

/**
 * Bases のグループを Kanban の列に変換
 */
export function basesGroupToColumn(
  group: BasesEntryGroup,
  index: number,
): Column {
  console.log(`basesGroupToColumn: Converting group ${index}`, {
    hasKey: !!group.key,
    key: group.key,
    entriesCount: group.entries?.length ?? 0,
  });

  // グループのキー値を列の ID とタイトルに使用
  const keyValue = group.key?.toString() ?? `group-${index}`;

  console.log(`basesGroupToColumn: Key value determined: ${keyValue}`);

  const cards = group.entries.map((entry, cardIndex) => {
    console.log(
      `basesGroupToColumn: Converting entry ${cardIndex} in group ${index}`,
    );
    return entryToCard(entry);
  });

  console.log(`basesGroupToColumn: Created column with ${cards.length} cards`);

  return {
    id: keyValue,
    title: keyValue,
    cards,
  };
}

/**
 * Bases のエントリを Kanban のカードに変換
 */
export function entryToCard(entry: BasesEntry): Card {
  console.log("entryToCard: Converting entry", {
    filePath: entry.file?.path,
    basename: entry.file?.basename,
  });

  // タイトルはファイル名から取得（拡張子を除く）
  const title = entry.file.basename;

  // content は description プロパティがあればそれを使用、なければタイトル
  let content = title;

  try {
    const description = entry.getValue("note.description");
    console.log("entryToCard: Description value", {
      hasDescription: description !== null,
      descriptionType: description ? typeof description : "null",
      description,
    });

    // description が存在し、文字列に変換可能な場合はそれを使用
    if (description !== null && description !== undefined) {
      // toString() メソッドを使って文字列に変換
      const descString = description.toString();
      console.log("entryToCard: Description string", { descString });
      if (descString && descString.length > 0 && descString !== "null") {
        content = descString;
      }
    }
  } catch (error) {
    // プロパティが存在しない場合はタイトルを使用
    console.warn("entryToCard: Failed to get description property", {
      error,
      title,
    });
  }

  const card = {
    id: entry.file.path, // ファイルパスを一意な ID として使用
    content,
    // 追加のメタデータを保持（将来的な拡張用）
    entry,
  };

  console.log("entryToCard: Card created", {
    id: card.id,
    contentLength: card.content.length,
  });

  return card;
}

/**
 * Bases データを Kanban ボードデータに変換
 */
export function basesDataToBoardData(queryResult: BasesQueryResult): BoardData {
  console.log("basesDataToBoardData: Converting query result", {
    hasQueryResult: !!queryResult,
    queryResultKeys: queryResult ? Object.keys(queryResult) : [],
  });

  // QueryResult から groupedData を取得
  const groups = queryResult.groupedData;

  console.log("basesDataToBoardData: Grouped data info", {
    hasGroups: !!groups,
    groupsLength: groups ? groups.length : 0,
    groups: groups,
  });

  // グループ化されたデータがある場合
  if (groups && groups.length > 0) {
    console.log("basesDataToBoardData: Processing groups");
    const columns = groups.map((group: BasesEntryGroup, index: number) => {
      console.log(`basesDataToBoardData: Processing group ${index}`, {
        groupKey: group.key,
        entriesCount: group.entries ? group.entries.length : 0,
      });
      return basesGroupToColumn(group, index);
    });

    console.log("basesDataToBoardData: Columns created", {
      columnsCount: columns.length,
    });

    return {
      columns,
    };
  }

  // データがない場合は空のボード
  console.warn(
    "basesDataToBoardData: No grouped data found, returning empty board",
  );
  return {
    columns: [],
  };
}

/**
 * カードの移動に伴うプロパティ更新を処理
 * @param card 移動したカード
 * @param sourceColumnId 移動元の列 ID
 * @param destColumnId 移動先の列 ID
 * @param groupByProperty グループ化に使用されているプロパティ名
 */
export async function updateEntryOnCardMove(
  card: Card,
  sourceColumnId: string,
  destColumnId: string,
  groupByProperty?: string,
): Promise<void> {
  // カードが Bases のエントリ情報を持っていない場合は何もしない
  if (!card.entry) {
    console.warn("Card does not have entry information:", card);
    return;
  }

  // グループ化プロパティが指定されていない場合は何もしない
  if (!groupByProperty) {
    console.warn("No groupBy property specified");
    return;
  }

  // 移動先の列 ID を新しいプロパティ値として設定
  // 例: status プロパティでグループ化されている場合、列 ID が新しい status 値になる
  try {
    // TODO: BasesEntry には setValue メソッドがないため、
    // app.fileManager.processFrontMatter を使用してプロパティを更新する必要がある
    console.log(
      `TODO: Update ${groupByProperty} from "${sourceColumnId}" to "${destColumnId}" for entry:`,
      card.entry.file.basename,
    );
  } catch (error) {
    console.error("Failed to update entry property:", error);
    throw error;
  }
}

/**
 * 列内でのカードの並び替えに伴う順序プロパティの更新を処理
 * @param cards 並び替え後のカード配列
 * @param orderProperty 順序を管理するプロパティ名（例: "order"）
 */
export async function updateCardOrder(
  cards: Card[],
  _orderProperty = "order",
): Promise<void> {
  try {
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (card.entry) {
        // TODO: BasesEntry には setValue メソッドがないため、
        // app.fileManager.processFrontMatter を使用してプロパティを更新する必要がある
        console.log(
          `TODO: Update order to ${i} for entry:`,
          card.entry.file.basename,
        );
      }
    }
    console.log("Updated card order");
  } catch (error) {
    console.error("Failed to update card order:", error);
    throw error;
  }
}
