"use client";
import React, { useState } from "react";

/**
 * Prop interface
 */
export interface NumberProps {
  propertyLabel: string;
  value: string;
  onChange: (value: string) => void;
}

export default function NumberInput({
  propertyLabel,
  value,
  onChange,
}: NumberProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  function handleButtonClick() {
    setIsEditing(true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      onChange(e.currentTarget.value);
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }

    // Avoid triggering other events (e.g., card dragging) when pressing keys while editing
    e.stopPropagation();
  }

  return (
    <div className="number-property" data-tooltip={propertyLabel}>
      {isEditing ? (
        <input
          className="number"
          type="number"
          defaultValue={value.toString()}
          onKeyDown={(e) => handleKeyDown(e)}
          // biome-ignore lint/a11y/noAutofocus: Since user enter to edit on demand, autoFocus is not a problem.
          autoFocus
        />
      ) : (
        <button type="button" onClick={() => handleButtonClick()}>
          <div>
            <p>{value}</p>
          </div>
        </button>
      )}
    </div>
  );
}
