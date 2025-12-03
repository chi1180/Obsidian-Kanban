import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";
import type { Column } from "src/types/kanban";
import CardComponent from "./Card";
import { blurredColor } from "src/utils/colorGenerator";
import { Vault } from "obsidian";

export default function ColumnComponent({
  column,
  disabled,
  className,
  baseColor,
  vault,
}: {
  column: Column;
  disabled: boolean;
  className?: string;
  baseColor?: string;
  vault?: Vault;
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
  };

  return (
    <div
      ref={setNodeRef}
      style={
        baseColor
          ? {
              ...style,
              backgroundColor: blurredColor(baseColor).tick,
            }
          : style
      }
      className={`kanban-column ${className} ${baseColor ? "" : "no-base-color"} ${isDragging ? "dragging" : ""}`}
    >
      {/* Header */}
      <div
        {...attributes}
        {...listeners}
        className={`header ${baseColor ? "" : "no-base-color"}`}
        style={
          baseColor
            ? {
                backgroundColor: baseColor,
              }
            : null
        }
      >
        <span
          className="key"
          style={baseColor ? { backgroundColor: baseColor } : null}
        >
          {column.key.replace("#", "")}
        </span>
        <div>{column.cards.length}</div>
      </div>

      {/* Card container */}
      <div className={`cards-container ${baseColor ? "" : "no-base-color"}`}>
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
              vault={vault}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
