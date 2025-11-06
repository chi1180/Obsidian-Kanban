import type {
  DraggableProvided,
  DraggableStateSnapshot,
  DropResult,
  DroppableProvided,
  DroppableStateSnapshot,
} from "@hello-pangea/dnd";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import type { BasesEntry, BasesViewConfig } from "obsidian";
import React from "react";
import type { KanbanPluginSettings } from "../types/settings";
import { SettingsPanel } from "./settingsPanel";

export interface Card {
  id: string;
  content: string;
  entry?: BasesEntry;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface BoardData {
  columns: Column[];
}

interface BoardViewProps {
  data: BoardData;
  config: BasesViewConfig;
  pluginSettings: KanbanPluginSettings;
  onDataChange?: (newData: BoardData) => void;
}

const reorder = (
  list: Card[],
  startIndex: number,
  endIndex: number,
): Card[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const move = (
  source: Card[],
  destination: Card[],
  droppableSource: { index: number; droppableId: string },
  droppableDestination: { index: number; droppableId: string },
): { [key: string]: Card[] } => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result: { [key: string]: Card[] } = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

export default function BoardView({
  data,
  config,
  pluginSettings,
  onDataChange,
}: BoardViewProps): JSX.Element {
  const [boardData, setBoardData] = React.useState<BoardData>(data);

  React.useEffect(() => {
    setBoardData(data);
  }, [data]);

  const handleSettingsChange = () => {
    // 設定が変更されたら、親コンポーネントに通知して再レンダリング
    // 現在の実装では、設定はSettingsPanelがconfig経由で直接保存するため、
    // ここでは特に何もしなくても良い
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    const sourceColumnIndex = boardData.columns.findIndex(
      (col) => col.id === source.droppableId,
    );
    const destColumnIndex = boardData.columns.findIndex(
      (col) => col.id === destination.droppableId,
    );

    if (sourceColumnIndex === -1 || destColumnIndex === -1) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same column
      const column = boardData.columns[sourceColumnIndex];
      const reorderedCards = reorder(
        column.cards,
        source.index,
        destination.index,
      );

      const newColumns = [...boardData.columns];
      newColumns[sourceColumnIndex] = {
        ...column,
        cards: reorderedCards,
      };

      const newData = { columns: newColumns };
      setBoardData(newData);
      onDataChange?.(newData);
    } else {
      // Moving between columns
      const sourceColumn = boardData.columns[sourceColumnIndex];
      const destColumn = boardData.columns[destColumnIndex];

      const result = move(
        sourceColumn.cards,
        destColumn.cards,
        source,
        destination,
      );

      const newColumns = [...boardData.columns];
      newColumns[sourceColumnIndex] = {
        ...sourceColumn,
        cards: result[source.droppableId],
      };
      newColumns[destColumnIndex] = {
        ...destColumn,
        cards: result[destination.droppableId],
      };

      const newData = { columns: newColumns };
      setBoardData(newData);
      onDataChange?.(newData);
    }
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <SettingsPanel
        config={config}
        pluginSettings={pluginSettings}
        onSettingsChange={handleSettingsChange}
      />
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          style={{
            display: "flex",
            gap: "16px",
            padding: "16px",
            paddingTop: "48px",
            height: "100%",
            overflow: "auto",
            boxSizing: "border-box",
          }}
        >
          {boardData.columns.map((column) => (
            <div
              key={column.id}
              style={{
                minWidth: "250px",
                backgroundColor: "#f4f5f7",
                borderRadius: "8px",
                padding: "8px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  padding: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {column.title}
              </h3>
              <Droppable droppableId={column.id}>
                {(
                  provided: DroppableProvided,
                  snapshot: DroppableStateSnapshot,
                ) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      minHeight: "100px",
                      backgroundColor: snapshot.isDraggingOver
                        ? "#e0e0e0"
                        : "transparent",
                      borderRadius: "4px",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    {column.cards.map((card, index) => (
                      <Draggable
                        key={card.id}
                        draggableId={card.id}
                        index={index}
                      >
                        {(
                          provided: DraggableProvided,
                          snapshot: DraggableStateSnapshot,
                        ) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              userSelect: "none",
                              padding: "12px",
                              margin: "0 0 8px 0",
                              backgroundColor: snapshot.isDragging
                                ? "#a3c9f1"
                                : "#ffffff",
                              borderRadius: "4px",
                              border: "1px solid #ddd",
                              boxShadow: snapshot.isDragging
                                ? "0 4px 8px rgba(0,0,0,0.2)"
                                : "none",
                              ...provided.draggableProps.style,
                            }}
                          >
                            {card.content}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
