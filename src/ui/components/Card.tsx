import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import matter from "gray-matter";
import { TFile, type Vault } from "obsidian";
import React, { useEffect, useState } from "react";
import type { Card, Column, Property } from "src/types/kanban";
import ListComponent from "./List";

export default function CardComponent({
  card,
  id,
  disabled,
  className,
  vault,
}: {
  card: Card;
  id: string;
  disabled?: boolean;
  className?: string;
  vault?: Vault;
  columns?: Column[];
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

  const [frontMatter, setFrontMatter] = useState<Record<
    string,
    Property["val"]
  > | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Disabled to avoid infinite loop as first time to set frontMatter
  useEffect(() => {
    const newFrontMatter: Record<string, Property["val"]> = {};
    for (const property of card.properties) {
      newFrontMatter[property.name] = property.val;
    }
    setFrontMatter(newFrontMatter);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only for the change of frontMatter. Change of vault isn't necessary to trigger this effect.
  useEffect(() => {
    if (!vault || !frontMatter) return;

    try {
      const file = vault.getAbstractFileByPath(card.file.path);
      if (file instanceof TFile) {
        file.vault.read(file).then((fileContent) => {
          const { content } = matter(fileContent);
          file.vault.modify(file, matter.stringify(content, frontMatter));
        });
      }
    } catch (error) {
      console.error(
        `No way ! Something went wrong !! :P\n${JSON.stringify(error)}`,
      );
    }
  }, []);
  // }, [frontMatter]);

  function propertyToElement(property: Property) {
    switch (property.type) {
      case "checkbox":
        return (
          <div className="property-with-name">
            <span>{property.name}</span>
            <input
              className="checkbox"
              type="checkbox"
              checked={property.val as boolean}
              onChange={(event) => {
                setFrontMatter((prev) => {
                  return {
                    ...prev,
                    [property.name]: event.target.checked,
                  };
                });
              }}
            />
          </div>
        );
      case "date":
        return (
          <div className="property-with-name">
            <span>{property.name}</span>
            <input
              className="date"
              type="date"
              value={property.val.toString()}
            />
          </div>
        );
      case "dateAndTime":
        return (
          <div className="property-with-name">
            <span>{property.name}</span>
            <input
              className="date-and-time"
              type="datetime-local"
              value={property.val.toString()}
            />
          </div>
        );
      case "list":
        return <ListComponent property={property} />;
      case "number":
        return (
          <div className="property-with-name">
            <span>{property.name}</span>
            <input
              className="number"
              type="number"
              value={property.val.toString()}
            />
          </div>
        );
      default:
        return (
          <textarea
            className="text-property"
            value={property.val.toString()}
            readOnly
          />
        );
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`kanban-view-card ${isDragging ? "dragging" : ""} ${className}`}
    >
      <div className="title">{card.title}</div>

      {/*Properties*/}
      <div className="properties-container">
        {card.properties
          .filter((property) => property.type !== "tags")
          .map((property, idx) => (
            <div key={idx.toString()} className="property-container">
              {propertyToElement(property)}
            </div>
          ))}
      </div>
    </div>
  );
}
