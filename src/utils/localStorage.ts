import { LOCAL_STORAGE_KEYS } from "src/config";
import type { LocalStorageBoardViewData } from "src/types/localStorage";

// Board view data
export class BoardViewData {
  readonly boardViewId: string;
  storageKey: string; // key of localStorage value

  constructor(boardViewId: string) {
    this.boardViewId = boardViewId;
    this.storageKey = LOCAL_STORAGE_KEYS.board_data_key(this.boardViewId);
  }

  get(key: string) {
    if (typeof window !== "undefined") {
      try {
        const data = localStorage.getItem(this.storageKey);
        if (data) {
          const parsedData: LocalStorageBoardViewData = JSON.parse(data);
          return parsedData[key as keyof LocalStorageBoardViewData];
        }
      } catch (error) {
        console.log(
          `[--ERROR--] Something went wrong to try get boardViewData :::\n${JSON.stringify(error)}`,
        );
      }
    }
    return null;
  }

  save(data: LocalStorageBoardViewData) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      } catch (error) {
        console.log(
          `[--ERROR--] Something went wrong to try save boardViewData :::\n${JSON.stringify(error)}`,
        );
      }
    }
  }

  delete() {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(this.storageKey);
      } catch (error) {
        console.log(
          `[--ERROR--] Something went wrong to try delete boardViewData :::\n${JSON.stringify(error)}`,
        );
      }
    }
  }
}
