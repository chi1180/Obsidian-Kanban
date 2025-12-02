/**
 * Convert the Bases groupedData into a Kanban board data structure.
 */

import type { BasesEntryGroup } from "obsidian";
import type {
  Card,
  Column,
  ExpandedBaseEntry,
  Property,
} from "src/types/kanban";
import { frontmatterTypeAssumption } from "./frontmatterTypeAssumption";
import { assignColors } from "./assignColors";
import { BASE_COLORS } from "src/config";

export function convertToKanbanBoardData(
  groupedData: BasesEntryGroup[],
): Column[] {
  const columns: Column[] = [];

  // assign colors
  const colors = assignColors(groupedData.length);

  // convert groups to columns
  for (const group of groupedData) {
    const column: Column = {
      key: group.key.toString(),
      color: BASE_COLORS[colors[groupedData.indexOf(group)]],
      cards: [],
    };

    // convert entries to cards
    for (const entry of group.entries) {
      // Make property with interfaces
      const customEntry = entry as ExpandedBaseEntry;
      const properties: Card["properties"] = [];
      for (const [key, value] of Object.entries(customEntry.frontmatter)) {
        const { type, val } = frontmatterTypeAssumption(
          key,
          value as Property["val"],
        );
        const property = {
          name: key,
          type: type,
          val: val,
        };
        properties.push(property);
      }

      const card: Card = {
        title: entry.file.basename,
        file: entry.file,
        properties: properties,
      };

      column.cards.push(card);
    }

    columns.push(column);
  }

  return columns;
}
