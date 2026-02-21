"use client";

import React, { useRef, useState } from "react";

/**
 * Prop interface
 */
export interface TextProps {
  propertyLabel: string;
  value: string;
  onChange: (value: string) => void;
}

export default function TextInput({
  propertyLabel,
  value,
  onChange,
}: TextProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleButtonClick() {
    setIsEditing(true);
    setTimeout(() => {
      adjustTextareaHeight(textareaRef.current);
    }, 0);
  }

  function adjustTextareaHeight(element: HTMLTextAreaElement) {
    // Auto-adjust height
    element.setCssProps({ height: `${element.scrollHeight}px` });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      const isNewLine = e.shiftKey;
      if (!isNewLine) {
        onChange(e.currentTarget.value);
        setIsEditing(false);
      }
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
    // Avoid triggering other events (e.g., card dragging) when pressing keys while editing
    e.stopPropagation();
  }

  function handlePointerDown(e: React.PointerEvent<HTMLTextAreaElement>) {
    // Avoid triggering other events (e.g., card dragging) when clicking the textarea
    e.stopPropagation();
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    adjustTextareaHeight(e.currentTarget);
  }

  return (
    <div className="text-property" data-tooltip={propertyLabel}>
      {isEditing ? (
        <textarea
          ref={textareaRef}
          defaultValue={value}
          onChange={handleChange}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
          // biome-ignore lint/a11y/noAutofocus: Since user enter to edit mode on demand, autoFocus is not a problem.
          autoFocus
        ></textarea>
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
