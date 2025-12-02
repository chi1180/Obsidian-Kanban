import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";
import type { Card } from "src/types/kanban";

export default function CardComponent({
  card,
  id,
  disabled,
}: {
  card: Card;
  id: string;
  disabled?: boolean;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // try {
  //   card.file.vault.read(card.file).then((content) => {
  //     card.file.vault.modify(card.file, content);
  //   });
  // } catch (error) {
  //   console.log("Error reading or modifying file:", error);
  // }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`kanban-view-card ${isDragging ? "dragging" : ""}`}
    >
      {card.title}&nbsp;{JSON.stringify(card.properties)}
    </div>
  );
}
