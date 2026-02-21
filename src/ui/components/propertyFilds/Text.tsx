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

  function enterKeyHandler(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      setIsEditing(false);
    }
  }

  return (
    <div className="text-property">
      {isEditing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyUp={(e) => enterKeyHandler(e)}
        ></textarea>
      ) : (
        <button type="button" onClick={() => setIsEditing(!isEditing)}>
          <div>{value}</div>
        </button>
      )}
    </div>
  );
}
