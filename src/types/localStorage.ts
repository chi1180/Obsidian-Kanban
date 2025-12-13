import type { Card, Column } from "./kanban";

interface CardForBoardViewData extends Card {
  file: never; // Exclude TFile reference for localStorage
}

export interface ColumnForBoardViewData extends Column {
  cards: CardForBoardViewData[];
}

export interface LocalStorageBoardViewData {
  columnOrder: string[]; // Order of column keys
  columns: ColumnForBoardViewData[];
}
