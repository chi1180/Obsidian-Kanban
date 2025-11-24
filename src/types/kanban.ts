import type { BasesEntry, TFile } from "obsidian";
import type { PluginSettings } from "./setting";

export interface Board {
  available_properties: string[]; // List of available properties for cards
  settings: PluginSettings;
  columns: Column[];
}

export interface Column {
  key: string; // Unique identifier for the column
  color?: string; // Optional color for the column
  cards: Card[];
}

export interface Card {
  title: string; // Title of the file
  file: TFile; // Reference to the Obsidian file
  properties: Record<string, Property>;
}

/* === Below are property === */

export interface Property {
  name: string;
  type:
    | "checkbox"
    | "date"
    | "dateAndTime"
    | "list"
    | "number"
    | "tags"
    | "text";
  val: string | string[] | boolean;
  onChanged?: (value: string | boolean) => void;
}

export interface ExpandedBaseEntry extends BasesEntry {
  frontmatter: Record<string, Property["val"]>;
}
