"use client";

import React from "react";

/**
 * Props interface
 */
export interface CheckBoxProps {
  propertyLabel: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function CheckBox({
  propertyLabel,
  value,
  onChange,
}: CheckBoxProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.currentTarget.checked);
  }

  return (
    <div className="checkbox-property" data-tooltip={propertyLabel}>
      <input
        className="checkbox"
        type="checkbox"
        checked={value}
        onChange={handleChange}
      />
      <span>{propertyLabel}</span>
    </div>
  );
}
