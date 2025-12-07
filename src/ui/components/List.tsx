import React from "react";
import type { Property } from "src/types/kanban";

export default function ListComponent({
  property,
  availableValues,
}: {
  property: Property;
  availableValues: Array<Property["val"]>;
}) {
  console.log(`[--DEBUG--] ${property} ${availableValues}`);

  // phase 1: How to get all of available properties?
  //
  // phase 2: How to manage properties ? using state or context?
  //

  return (
    <div className="kanban-list-container">
      {/* here will be value of element from state */}
      <input type="text" className="input" />
    </div>
  );
}
