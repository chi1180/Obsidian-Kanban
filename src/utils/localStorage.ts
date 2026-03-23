import { LOCAL_STORAGE_KEYS } from "src/config";
import type { LocalStorageBoardViewData } from "src/types/localStorage";
import type { App } from "obsidian";

// Board view data
export class BoardViewData {
  readonly boardViewId: string;
  readonly app: App;
  storageKey: string; // key of localStorage value

  constructor(boardViewId: string, app: App) {
    this.boardViewId = boardViewId;
    this.app = app;
    this.storageKey = LOCAL_STORAGE_KEYS.board_data_key(this.boardViewId);

    // methods
  }

  get(key: string) {
    try {
      const data = this.app.loadLocalStorage(this.storageKey);
      if (data) {
        const parsedData: LocalStorageBoardViewData = JSON.parse(data);
        return parsedData[key as keyof LocalStorageBoardViewData];
      }
    } catch (error) {
      console.debug(
        `[--ERROR--] Something went wrong to try get boardViewData :::\n${JSON.stringify(error)}`,
      );
    }
    return null;
  }

  save(data: LocalStorageBoardViewData) {
    try {
      this.app.saveLocalStorage(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.debug(
        `[--ERROR--] Something went wrong to try save boardViewData :::\n${JSON.stringify(error)}`,
      );
    }
  }

  update(
    key: "columnOrder" | "columns",
    val:
      | LocalStorageBoardViewData["columnOrder"]
      | LocalStorageBoardViewData["columns"],
  ) {
    try {
      const data = this.app.loadLocalStorage(this.storageKey);
      if (data) {
        this.app.saveLocalStorage(
          this.storageKey,
          JSON.stringify({
            ...JSON.parse(data),
            [key]: val,
          }),
        );
      }
    } catch (error) {
      console.debug(
        `[--ERROR--] Something went wrong to try update boardViewData :::\n${JSON.stringify(error)}`,
      );
    }
  }

  delete() {
    try {
      // Obsidian APIで削除する場合は、null/空文字列を保存する方法で対応
      this.app.saveLocalStorage(this.storageKey, "");
    } catch (error) {
      console.debug(
        `[--ERROR--] Something went wrong to try delete boardViewData :::\n${JSON.stringify(error)}`,
      );
    }
  }
}
