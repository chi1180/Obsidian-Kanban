import React, { type ReactNode } from "react";
import type { Board, Card, Column } from "src/types/kanban";

interface KanbanBoardProps {
  boardData: Board;
}

export default function KanbanBoard({
  boardData,
}: KanbanBoardProps): ReactNode {
  return (
    <div className="kanban-board">
      {boardData.columns.map((column: Column) => (
        <div key={column.key} className="kanban-column">
          <h2>{column.key}</h2>
          {column.cards.map((card: Card) => (
            <div key={card.title} className="kanban-card">
              {card.title}
              <p>{JSON.stringify(card.properties)}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
