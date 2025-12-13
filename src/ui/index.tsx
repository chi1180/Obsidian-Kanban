import React from "react";
import {
  closestCenter,
  type CollisionDetection,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  getFirstCollision,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useCallback, useRef, useState } from "react";
import type { Board } from "src/types/kanban";
import ColumnComponent from "./components/Column";
import CardComponent from "./components/Card";
import matter from "gray-matter";
import { TFile, type Vault } from "obsidian";
import { BoardViewData } from "src/utils/localStorage";

export default function KanbanBoard({
  boardData,
  vault,
}: {
  boardData: Board;
  vault: Vault;
}) {
  // localStorage data management class
  const _boardViewData = new BoardViewData(boardData.id);

  // update column order
  const existingColumnOrder = _boardViewData.get("columnOrder") as string[];
  if (existingColumnOrder) {
    boardData.columns.sort((a, b) => {
      return (
        existingColumnOrder.indexOf(a.key) - existingColumnOrder.indexOf(b.key)
      );
    });
  }

  const [columns, setColumns] = useState(boardData.columns);

  const [movingCardInfo, setMovingCardInfo] = useState({
    path: null,
    oldKey: null,
    newKey: null,
  } as {
    path: string | null;
    oldKey: string | null;
    newKey: string | null;
  });

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);

  // get ids of columns
  const columnIds = columns.map((col) => col.key);

  // setting & properties
  // const availableProperties = boardData.available_properties;
  const settings = boardData.settings;

  // if the column is active
  const isSortingContainer = activeId
    ? columnIds.includes(activeId as string)
    : false;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // start drag after element moved more than 8px
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // search the parent column of card
  function findContainer(id: UniqueIdentifier) {
    // When the id is column id
    if (columnIds.includes(id as string)) {
      return id as string;
    }

    // search inside cards
    return columns.find((col) =>
      col.cards.some((card) => card.file.path === id),
    )?.key;
  }

  // customized attaching detection algorithm
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      // When dragging column, only search for columns
      if (activeId && columnIds.includes(activeId as string)) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter((container) =>
            columnIds.includes(container.id as string),
          ),
        });
      }

      // search droppable area crossed with pointer
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (overId !== null) {
        // when overId is column ID
        if (columnIds.includes(overId as string)) {
          const column = columns.find((col) => col.key === overId);
          const containerCards = column?.cards || [];

          // if column has cards, search nearest card
          if (containerCards.length > 0) {
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerCards.some(
                    (card) => card.file.path === container.id,
                  ),
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;
        return [{ id: overId }];
      }

      // if recently moved to new container
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // if nothing found, return latest overId
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, columns, columnIds],
  );

  /* Handlers */
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || columnIds.includes(activeId as string)) return;

    const overContainer = findContainer(overId);
    const activeContainer = findContainer(activeId);

    if (!overContainer || !activeContainer || activeContainer === overContainer)
      return;

    // move a card between columns
    setColumns((prevColumns) => {
      const activeColumn = prevColumns.find(
        (col) => col.key === activeContainer,
      );
      const overColumn = prevColumns.find((col) => col.key === overContainer);

      if (!activeColumn || !overColumn) return prevColumns;

      const activeCards = activeColumn.cards;
      const overCards = overColumn.cards;

      const activeIndex = activeCards.findIndex(
        (card) => card.file.path === active.id,
      );
      const overIndex = overCards.findIndex(
        (card) => card.file.path === overId,
      );

      let newIndex: number;
      if (columnIds.includes(overId as string)) {
        // move to empty column
        newIndex = overCards.length;
      } else {
        // move to the top of cards
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overCards.length;
      }

      recentlyMovedToNewContainer.current = true;

      return prevColumns.map((col) => {
        if (col.key === activeContainer) {
          return {
            ...col,
            cards: col.cards.filter((card) => card.file.path !== active.id),
          };
        }
        if (col.key === overContainer) {
          const newCards = [...col.cards];

          // Update moving card infodmation
          setMovingCardInfo({
            path: activeCards[activeIndex].file.path,
            oldKey: activeContainer,
            newKey: col.key,
          });

          newCards.splice(newIndex, 0, activeCards[activeIndex]);
          return {
            ...col,
            cards: newCards,
          };
        }
        return col;
      });
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    if (
      movingCardInfo.path !== null &&
      movingCardInfo.newKey !== movingCardInfo.oldKey // ignore moving in the same column
    ) {
      // modify card file's property
      setTimeout(() => {
        try {
          const file = vault.getAbstractFileByPath(movingCardInfo.path);
          if (file instanceof TFile) {
            const newKey = (
              Array.isArray(JSON.stringify(movingCardInfo.newKey))
                ? (JSON.parse(movingCardInfo.newKey) as string[])
                : ([movingCardInfo.newKey] as string[])
            ).map((key) => key.replace("#", ""));

            file.vault.read(file).then((fileContent) => {
              const { data, content } = matter(fileContent);
              if (data["tags"]) {
                data["tags"] = newKey.length === 1 ? newKey[0] : newKey;
                file.vault.modify(file, matter.stringify(content, data));
              }
            });
          }
        } catch (error) {
          console.error(
            `No way ! Something went wrong !!\n${JSON.stringify(error)}`,
          );
        } finally {
          setMovingCardInfo({
            path: null,
            oldKey: null,
            newKey: null,
          });
        }
      }, 300);
    } else if (columnIds.includes(active.id as string) && over.id) {
      // reorder columns
      const activeIndex = columnIds.indexOf(active.id as string);
      const overIndex = columnIds.indexOf(over.id as string);

      if (activeIndex !== overIndex) {
        const newColumns = arrayMove(columns, activeIndex, overIndex);

        // Update column order in view config
        _boardViewData.update(
          "columnOrder",
          newColumns.map((col) => col.key),
        );

        setColumns(newColumns);
      }
    }

    setActiveId(null);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  // get active card or column
  const activeColumn = columns.find((col) => col.key === activeId);
  const activeCard = columns
    .flatMap((col) => col.cards)
    .find((card) => card.file.path === activeId);

  return (
    <div className="kanban-board">
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={columnIds}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column) => (
            <ColumnComponent
              column={column}
              key={column.key}
              disabled={isSortingContainer}
              className={settings.cardSize}
              baseColor={column.color ? column.color : undefined}
              vault={vault}
            />
          ))}
        </SortableContext>

        <DragOverlay>
          {activeId && activeColumn ? (
            <div style={{ opacity: 0.5 }}>
              <ColumnComponent
                column={activeColumn}
                disabled={false}
                className={settings.cardSize}
                baseColor={activeColumn.color ? activeColumn.color : undefined}
              />
            </div>
          ) : null}
          {activeId && activeCard ? (
            <CardComponent
              card={activeCard}
              id={activeCard.file.path}
              className="dragging"
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
