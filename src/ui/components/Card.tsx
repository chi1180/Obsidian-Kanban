import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import matter from "gray-matter";
import { TFile, type Vault } from "obsidian";
import React, { useCallback } from "react";
import type { Card, Column, Property } from "src/types/kanban";
import ListComponent from "./List";
import CheckBox from "./propertyFilds/CheckBox";
import TextInput from "./propertyFilds/TextInput";
import NumberInput from "./propertyFilds/NumberInput";
import { EXPANDED_PROPERTY_TYPES } from "src/config";

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

  const handlePropertyChange = useCallback(
    (propertyName: string, value: Property["val"]) => {
      if (!vault) return;

      try {
        const file = vault.getAbstractFileByPath(card.file.path);
        if (file instanceof TFile) {
          file.vault.read(file).then((fileContent) => {
            const { content } = matter(fileContent);
            const updatedData = {
              ...matter(fileContent).data,
              [propertyName]: value,
            };
            file.vault.modify(file, matter.stringify(content, updatedData));
          });
        }
      } catch (error) {
        console.error(
          `No way ! Something went wrong !! :P\n${JSON.stringify(error)}`,
        );
      }
    },
    [vault, card.file.path],
  );

  function propertyToElement(property: Property) {
    switch (property.type) {
      case "checkbox":
        return (
          <CheckBox
            propertyLabel={property.name}
            value={property.val as boolean}
            onChange={(value) => handlePropertyChange(property.name, value)}
          />
        );
      case "date":
        return (
          <div className="property-with-name">
            <span>{property.name}</span>
            <input
              className="date"
              type="date"
              value={property.val.toString()}
              onChange={(event) => {
                handlePropertyChange(property.name, event.target.value);
              }}
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
              onChange={(event) => {
                handlePropertyChange(property.name, event.target.value);
              }}
            />
          </div>
        );
      case "list":
        return <ListComponent property={property} />;
      case "number":
        return (
          <NumberInput
            propertyLabel={property.name}
            value={property.val.toString()}
            onChange={(value) => {
              handlePropertyChange(property.name, value);
            }}
          />
        );
      default:
        return (
          <TextInput
            propertyLabel={property.name}
            value={property.val.toString()}
            onChange={(value) => {
              handlePropertyChange(property.name, value);
            }}
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
            <div
              key={idx.toString()}
              className={`property-container ${EXPANDED_PROPERTY_TYPES.includes(property.type) ? "expanded-width" : ""}`}
            >
              {propertyToElement(property)}
            </div>
          ))}
      </div>
    </div>
  );
}
