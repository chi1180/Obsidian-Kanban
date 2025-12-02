import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";
import type { Column } from "src/types/kanban";
import CardComponent from "./Card";

export default function ColumnComponent({
  column,
  disabled,
}: {
  column: Column;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.key,
    data: {
      type: "container",
      Children: column.cards.map((card) => card.file.path),
    },
  });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="kanban-column">
      <div
        {...attributes}
        {...listeners}
        className="kanban-column-header"
        style={{
          backgroundColor: column.color,
          padding: "10px",
          borderRadius: "5px 5px 0 0",
          cursor: "grab",
          userSelect: "none",
        }}
      >
        {column.key}
      </div>

      <div
        className="kanban-column-content"
        style={{
          minWidth: "200px",
          minHeight: "100px",
          padding: "10px",
          backgroundColor: "var(--background-secondary)",
          borderRadius: "0 0 5px 5px",
        }}
      >
        <SortableContext
          items={column.cards.map((card) => card.file.path)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((card) => (
            <CardComponent
              card={card}
              key={card.file.path}
              id={card.file.path}
              disabled={disabled}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
