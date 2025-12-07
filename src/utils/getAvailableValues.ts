/**
 * get columns
 * run for loop
 */

import type { Column, Property } from "src/types/kanban";

export function getAvailableValues(columns: Column[], targetProperty: string) {
  const availableValues: Set<Property["val"]> = new Set();

  for (const column of columns) {
    for (const card of column.cards) {
      availableValues.add(
        card.properties.filter(
          (property) => property.name === targetProperty,
        )[0].val,
      );
    }
  }

  return Array.from(availableValues);
}
