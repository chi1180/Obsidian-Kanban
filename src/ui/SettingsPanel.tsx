/**
 * Settings Panel
 *
 * ビュー固有の設定を行うモーダルダイアログ
 */

import { App, Modal, Setting } from "obsidian";
import type { BasesViewConfig } from "obsidian";
import { CARD_SIZES, SORT_ORDERS } from "../types/settings";
import type { CardSize, SortOrder } from "../types/settings";

/**
 * 設定パネルのモーダル
 */
export class SettingsPanel extends Modal {
  private config: BasesViewConfig;
  private onSave: () => void;

  // 設定値（一時的に保持）
  private columnProperty: string;
  private cardSize: CardSize;
  private sortOrder: SortOrder;
  private enableDragAndDrop: boolean;
  private showCardCount: boolean;
  private compactMode: boolean;
  private showColumnColors: boolean;
  private columnOrder: string[];

  constructor(app: App, config: BasesViewConfig, onSave: () => void) {
    super(app);
    this.config = config;
    this.onSave = onSave;

    // 現在の設定値を読み込む
    this.columnProperty = String(config.get("columnProperty") || "status");
    this.cardSize = (config.get("cardSize") as CardSize) || "medium";
    this.sortOrder = (config.get("sortOrder") as SortOrder) || "created";
    this.enableDragAndDrop = config.get("enableDragAndDrop") !== false;
    this.showCardCount = config.get("showCardCount") !== false;
    this.compactMode = config.get("compactMode") === true;
    this.showColumnColors = config.get("showColumnColors") !== false;
    this.columnOrder = (config.get("columnOrder") as string[]) || [];
  }

  /**
   * リアルタイムで設定を保存
   */
  private saveRealtime(): void {
    this.config.set("columnProperty", this.columnProperty);
    this.config.set("cardSize", this.cardSize);
    this.config.set("sortOrder", this.sortOrder);
    this.config.set("enableDragAndDrop", this.enableDragAndDrop);
    this.config.set("showCardCount", this.showCardCount);
    this.config.set("compactMode", this.compactMode);
    this.config.set("showColumnColors", this.showColumnColors);

    // 保存後にビューを再レンダリング
    this.onSave();
  }

  onOpen(): void {
    const { contentEl, modalEl } = this;

    console.log("SettingsPanel: onOpen called");
    console.log("SettingsPanel: config values", {
      columnProperty: this.columnProperty,
      cardSize: this.cardSize,
      sortOrder: this.sortOrder,
      enableDragAndDrop: this.enableDragAndDrop,
      showCardCount: this.showCardCount,
      compactMode: this.compactMode,
    });

    // Modal のスタイルを設定
    modalEl.addClass("kanban-settings-modal");

    contentEl.empty();

    // タイトル
    contentEl.createEl("h2", { text: "Kanban view settings" });

    // 説明（リアルタイム保存の案内）
    const infoEl = contentEl.createDiv({ cls: "callout" });
    infoEl.setAttribute("data-callout", "info");
    const infoContent = infoEl.createDiv({ cls: "callout-content" });
    infoContent.createEl("p", {
      text: "Settings are automatically saved when you make changes.",
      cls: "callout-text",
    });

    // Column Property
    new Setting(contentEl)
      .setName("Column property")
      .setDesc("Property to use for columns (grouping)")
      .addText((text) =>
        text
          // eslint-disable-next-line obsidianmd/ui/sentence-case
          .setPlaceholder("status")
          .setValue(this.columnProperty)
          .onChange((value) => {
            this.columnProperty = value || "status";
            this.saveRealtime();
          }),
      );

    // Card Size
    new Setting(contentEl)
      .setName("Card size")
      .setDesc("Size of cards in the board")
      .addDropdown((dropdown) => {
        CARD_SIZES.forEach((size) => {
          dropdown.addOption(size, size);
        });
        dropdown.setValue(this.cardSize).onChange((value) => {
          this.cardSize = value as CardSize;
          this.saveRealtime();
        });
      });

    // Sort Order
    new Setting(contentEl)
      .setName("Sort order")
      .setDesc("Order to sort cards within columns")
      .addDropdown((dropdown) => {
        SORT_ORDERS.forEach((order) => {
          dropdown.addOption(order, order);
        });
        dropdown.setValue(this.sortOrder).onChange((value) => {
          this.sortOrder = value as SortOrder;
          this.saveRealtime();
        });
      });

    // Enable Drag and Drop
    new Setting(contentEl)
      .setName("Enable drag and drop")
      .setDesc("Allow dragging cards between columns")
      .addToggle((toggle) =>
        toggle.setValue(this.enableDragAndDrop).onChange((value) => {
          this.enableDragAndDrop = value;
          this.saveRealtime();
        }),
      );

    // Show Card Count
    new Setting(contentEl)
      .setName("Show card count")
      .setDesc("Display number of cards in each column")
      .addToggle((toggle) =>
        toggle.setValue(this.showCardCount).onChange((value) => {
          this.showCardCount = value;
          this.saveRealtime();
        }),
      );

    // Compact Mode
    new Setting(contentEl)
      .setName("Compact mode")
      .setDesc("Use compact card layout")
      .addToggle((toggle) =>
        toggle.setValue(this.compactMode).onChange((value) => {
          this.compactMode = value;
          this.saveRealtime();
        }),
      );

    // Show Column Colors
    new Setting(contentEl)
      .setName("Show column colors")
      .setDesc("Display colors for each column (Notion-style)")
      .addToggle((toggle) =>
        toggle.setValue(this.showColumnColors).onChange((value) => {
          this.showColumnColors = value;
          this.saveRealtime();
        }),
      );

    // Column Order (ドラッグ&ドロップで並び替え可能)
    const columnOrderSetting = new Setting(contentEl)
      .setName("Column order")
      .setDesc(
        "Drag and drop to reorder columns. Changes are saved automatically.",
      );

    if (this.columnOrder.length > 0) {
      const orderContainer = columnOrderSetting.descEl.createDiv({
        cls: "kanban-settings-panel__column-order-list",
      });

      this.renderColumnOrderList(orderContainer);
    } else {
      const orderContainer = columnOrderSetting.descEl.createDiv({
        cls: "kanban-settings-panel__column-order",
      });
      orderContainer.createEl("p", {
        text: "No custom order set. Columns are sorted alphabetically.",
        cls: "kanban-settings-panel__column-order-text",
      });
    }

    // Reset Column Order ボタン
    if (this.columnOrder.length > 0) {
      new Setting(contentEl)
        .setName("Reset column order")
        .setDesc("Reset to default alphabetical order")
        .addButton((button) =>
          button
            .setButtonText("Reset")
            .setWarning()
            .onClick(() => {
              this.config.set("columnOrder", []);
              this.columnOrder = [];
              this.onSave();
              this.close();
            }),
        );
    }

    console.log("SettingsPanel: UI rendered");
  }

  /**
   * カラム順序リストをレンダリング（ドラッグ&ドロップ対応）
   */
  private renderColumnOrderList(container: HTMLElement): void {
    container.empty();

    this.columnOrder.forEach((columnId, index) => {
      const itemEl = container.createDiv({
        cls: "kanban-settings-panel__column-order-item",
      });
      itemEl.setAttribute("draggable", "true");
      itemEl.setAttribute("data-index", index.toString());

      // ドラッグハンドル
      const handleEl = itemEl.createDiv({
        cls: "kanban-settings-panel__column-order-handle",
      });
      handleEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>`;

      // カラム名
      itemEl.createDiv({
        cls: "kanban-settings-panel__column-order-name",
        text: columnId,
      });

      // 削除ボタン
      const deleteBtn = itemEl.createDiv({
        cls: "kanban-settings-panel__column-order-delete",
      });
      deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
      deleteBtn.setAttribute("aria-label", `Remove ${columnId} from order`);
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.columnOrder.splice(index, 1);
        this.config.set("columnOrder", this.columnOrder);
        this.onSave();
        this.renderColumnOrderList(container);
      });

      // ドラッグイベント
      itemEl.addEventListener("dragstart", (e) => {
        itemEl.addClass("kanban-settings-panel__column-order-item--dragging");
        e.dataTransfer?.setData("text/plain", index.toString());
      });

      itemEl.addEventListener("dragend", () => {
        itemEl.removeClass(
          "kanban-settings-panel__column-order-item--dragging",
        );
      });

      itemEl.addEventListener("dragover", (e) => {
        e.preventDefault();
        itemEl.addClass("kanban-settings-panel__column-order-item--dragover");
      });

      itemEl.addEventListener("dragleave", () => {
        itemEl.removeClass(
          "kanban-settings-panel__column-order-item--dragover",
        );
      });

      itemEl.addEventListener("drop", (e) => {
        e.preventDefault();
        itemEl.removeClass(
          "kanban-settings-panel__column-order-item--dragover",
        );

        const fromIndex = parseInt(
          e.dataTransfer?.getData("text/plain") || "0",
        );
        const toIndex = index;

        if (fromIndex !== toIndex) {
          // 配列を並び替え
          const [movedItem] = this.columnOrder.splice(fromIndex, 1);
          this.columnOrder.splice(toIndex, 0, movedItem);

          // 保存して再レンダリング
          this.config.set("columnOrder", this.columnOrder);
          this.onSave();
          this.renderColumnOrderList(container);
        }
      });
    });
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
