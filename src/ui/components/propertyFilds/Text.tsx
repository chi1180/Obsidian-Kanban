"use client";

import React, { useState } from "react";

/**
 * Prop interface
 */
export interface TextProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Text({ value, onChange }: TextProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      const isNewLine = e.shiftKey;
      if (!isNewLine) {
        setIsEditing(false);

        // Save data
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
    <div className="text-property">
      {isEditing ? (
        <textarea
          defaultValue={value}
          onChange={(e) => onChange(e.target.value)}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
          // biome-ignore lint/a11y/noAutofocus: ユーザーが明示的に編集モードに入るため、autoFocusは問題ないと判断
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
