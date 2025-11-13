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

    console.log("SettingsPanel: UI rendered");
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
