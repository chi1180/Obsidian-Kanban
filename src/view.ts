import { BasesView, type QueryController, setTooltip } from "obsidian";
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { v4 as uuidv4 } from "uuid";
import { PLUGIN_CONFIG, SETTING_KEYS, TOOLTIP_NAMES } from "./config";
import type { Board } from "./types/kanban";
import type { PluginSettings } from "./types/setting";
import KanbanBoard from "./ui";
import { convertToKanbanColumnData } from "./utils/kanbanBoardData";
import { BoardViewData } from "./utils/localStorage";
import type { ColumnForBoardViewData } from "./types/localStorage";

export class KanbanView extends BasesView {
  readonly type = PLUGIN_CONFIG.bases_view_type;
  private containerEl: HTMLElement;
  private pluginSettings: PluginSettings;
  settings: PluginSettings;
  root: Root;
  boardViewId: string;

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
    this.loadSettings();

    const columns = convertToKanbanColumnData(
      this.data.groupedData,
      this.settings.showColumnColor,
    ).map((col) => {
      return {
        ...col,
        cards: col.cards.map((card) => {
          return {
            ...card,
            properties: card.properties.filter((property) =>
              this.data.properties
                .map((prop) => prop.split(".").at(-1))
                .includes(property.name),
            ),
          };
        }),
      };
    });

    // Make Kanban board data
    const boardData: Board = {
      id: this.boardViewId,
      available_properties: this.data.properties,
      settings: this.settings,
      columns: columns,
    };

    // DEBUG //
    console.dir(boardData, { depth: null });
    console.dir(this.data.groupedData, { depth: null });

    /* Manage localStorage board view data */
    const _BoardViewData = new BoardViewData(this.boardViewId, this.app);
    // Check existing columnOrder data
    const existingColumnOrder = _BoardViewData.get("columnOrder") as string[];
    const columnsDataForStorage = boardData.columns.map((column) => ({
      ...column,
      cards: column.cards.map(({ title, properties }) => ({
        title,
        properties,
      })),
    })) as ColumnForBoardViewData[];

    if (existingColumnOrder) {
      _BoardViewData.save({
        columnOrder: existingColumnOrder,
        columns: columnsDataForStorage,
      });
    } else {
      _BoardViewData.save({
        columnOrder: boardData.columns.map((column) => column.key),
        columns: columnsDataForStorage,
      });
    }

    this.containerEl.empty();
    this.containerEl
      .createDiv()
      .setAttr("id", `${PLUGIN_CONFIG.plugin_container_id}`);
    const container = document.getElementById(
      PLUGIN_CONFIG.plugin_container_id,
    );
    container.className = PLUGIN_CONFIG.plugin_container_id;
    this.root = createRoot(container);

    // Mount Kanban board element
    this.root.render(
      React.createElement(KanbanBoard, {
        boardData: boardData,
        vault: this.app.vault,
        app: this.app,
      }),
    );

    setTimeout(() => {
      // Set tooltips
      const tooltipElements =
        this.containerEl.querySelectorAll("[data-tooltip]");
      tooltipElements.forEach((el) => {
        const tooltipText = el.getAttribute("data-tooltip");
        const targetElem = el as HTMLElement;

        if (TOOLTIP_NAMES.includes(el.className)) {
          setTooltip(targetElem, tooltipText, {
            placement: "left",
          });
        } else {
          setTooltip(targetElem, tooltipText);
        }
      });
    }, 0);
  }

  /**
   * Load settings from view options or fallback to plugin settings
   * Confirm card deletion is not a view option, so always use plugin setting
   */
  loadSettings() {
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

    // Manage boardViewId
    const existingBoardViewId = this.config.get(SETTING_KEYS.VIEW_ID) as string;
    if (existingBoardViewId) {
      this.boardViewId = existingBoardViewId;
    } else {
      const newBoardViewId = uuidv4();
      this.boardViewId = newBoardViewId;
      this.config.set(SETTING_KEYS.VIEW_ID, newBoardViewId);
    }
  }

  /**
   * Unmount React component when view is closed
   */
  public onunload(): void {
    this.root.unmount();
  }
}
