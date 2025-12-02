import React from "react";
import { createRoot, type Root } from "react-dom/client";
import KanbanBoard from "./ui";
import { BasesView, type QueryController } from "obsidian";
import { PLUGIN_CONFIG, SETTING_KEYS } from "./config";
import type { Board } from "./types/kanban";
import type { PluginSettings } from "./types/setting";
import { convertToKanbanBoardData } from "./utils/kanbanBoardData";
import { ColumnOrder } from "./utils/localStorage";

export class KanbanView extends BasesView {
  readonly type = PLUGIN_CONFIG.bases_view_type;
  private containerEl: HTMLElement;
  private pluginSettings: PluginSettings;
  settings: PluginSettings;
  root: Root;

  constructor(
    controller: QueryController,
    parentEl: HTMLElement,
    pluginSettings: PluginSettings,
  ) {
    super(controller);
    this.containerEl = parentEl;
    this.pluginSettings = pluginSettings;
  }

  public onDataUpdated(): void {
    // get columns
    const columns = convertToKanbanBoardData(this.data.groupedData);

    this.loadSettings(columns.map((col) => col.key));

    // Make Kanban board data
    const boardData: Board = {
      available_properties: this.data.properties,
      settings: this.settings,
      columns: columns,
    };

    // DEBUG //
    console.dir(boardData, { depth: null });
    console.dir(this.data.groupedData, { depth: null });

    this.containerEl.empty();
    this.containerEl.createDiv().setAttr("id", "app");
    const container = document.getElementById("app") as HTMLElement;
    this.root = createRoot(container);

    // Mount Kanban board element
    this.root.render(
      React.createElement(KanbanBoard, {
        boardData: boardData,
      }),
    );
  }

  /**
   * Load settings from view options or fallback to plugin settings
   * Confirm card deletion is not a view option, so always use plugin setting
   */
  loadSettings(columnKeys: string[]) {
    console.log(columnKeys);
    // if column order is not set, it is the first time
    const _ColumnOrder = new ColumnOrder(PLUGIN_CONFIG.column_order_key);
    const isFirstTime = _ColumnOrder.get() === null;
    if (isFirstTime) {
      _ColumnOrder.set(columnKeys);
    } else {
      // Update column order
      const existingColumnKeys = _ColumnOrder.get();

      // if there are some differences
      const areDifferent =
        JSON.stringify(existingColumnKeys) !== JSON.stringify(columnKeys);
      if (areDifferent) {
        // filter out removed keys
        const updatedColumnKeys = existingColumnKeys.filter((key) =>
          columnKeys.includes(key),
        );
        // check new keys
        for (const key of columnKeys)
          if (!updatedColumnKeys.includes(key)) updatedColumnKeys.push(key);
        _ColumnOrder.set(updatedColumnKeys);
      }
    }

    this.settings = {
      cardSize:
        (this.config.get(
          SETTING_KEYS.CARD_SIZE,
        ) as PluginSettings["cardSize"]) ?? this.pluginSettings.cardSize,
      showColumnColor:
        (this.config.get(
          SETTING_KEYS.SHOW_COLUMN_COLOR,
        ) as PluginSettings["showColumnColor"]) ??
        this.pluginSettings.showColumnColor,
      confirmCardDeletion: this.pluginSettings.confirmCardDeletion,
    };
  }

  /**
   * Unmount React component when view is closed
   */
  public onunload(): void {
    this.root.unmount();
  }
}
