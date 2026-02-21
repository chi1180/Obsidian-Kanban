"use client";

import React, { useState } from "react";

/**
 * Prop interface
 */
export interface TextProps {
  propertyLabel: string;
  value: string;
  onChange: (value: string) => void;
}

export default function Text({ propertyLabel, value, onChange }: TextProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      const isNewLine = e.shiftKey;
      if (!isNewLine) {
        onChange(e.currentTarget.value);
        setIsEditing(false);
      }
    }
    if (e.key === "Escape") {
      setIsEditing(false);
    }
    // ドラッグイベントを防止
    e.stopPropagation();
  }

  function handlePointerDown(e: React.PointerEvent<HTMLTextAreaElement>) {
    // ドラッグの開始を防止
    e.stopPropagation();
  }

  return (
    <div className="text-property" data-tooltip={propertyLabel}>
      {isEditing ? (
        <textarea
          defaultValue={value}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
          // biome-ignore lint/a11y/noAutofocus: Since user enter to edit mode on demand, autoFocus is not a problem.s
          autoFocus
        ></textarea>
      ) : (
        <button type="button" onClick={() => setIsEditing(!isEditing)}>
          <div>{value}</div>
        </button>
      )}
    </div>
  );
}
