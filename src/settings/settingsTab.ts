/**
 * Settings Tab
 * Obsidianの設定タブでプラグイン設定を管理
 */

import { App, PluginSettingTab, Setting } from "obsidian";
import type ObsidianBetterKanbanPlugin from "../index";
import { CARD_SIZES } from "../types/settings";

/**
 * Kanban プラグインの設定タブ
 * Settings > Community plugins > Obsidian better Kanban から設定にアクセス可能
 */
export class KanbanSettingTab extends PluginSettingTab {
  plugin: ObsidianBetterKanbanPlugin;

  constructor(app: App, plugin: ObsidianBetterKanbanPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    // ヘッダー
    containerEl.createEl("h2", { text: "Kanban Board Settings" });

    containerEl.createEl("p", {
      text: "These settings are used as default values for newly created Kanban boards. Each board can be customized individually.",
      cls: "setting-item-description",
    });

    // カードサイズ設定
    new Setting(containerEl)
      .setName("Default card size")
      .setDesc("Default card size for new boards")
      .addDropdown((dropdown) =>
        dropdown
          .addOption(CARD_SIZES.SMALL, "Small")
          .addOption(CARD_SIZES.MEDIUM, "Medium")
          .addOption(CARD_SIZES.LARGE, "Large")
          .setValue(this.plugin.settings.cardSize)
          .onChange(async (value) => {
            this.plugin.settings.cardSize =
              value as (typeof CARD_SIZES)[keyof typeof CARD_SIZES];
            await this.plugin.saveSettings();
          }),
      );

    // Max cards per column setting
    new Setting(containerEl)
      .setName("Max cards per column")
      .setDesc(
        "Maximum number of cards to display per column (0 for unlimited)",
      )
      .addText((text) =>
        text
          .setValue(this.plugin.settings.maxCardsPerColumn.toString())
          .onChange(async (value) => {
            const parsed = parseInt(value, 10);
            this.plugin.settings.maxCardsPerColumn = isNaN(parsed) ? 0 : parsed;
            await this.plugin.saveSettings();
          }),
      );

    // ドラッグ&ドロップ設定
    new Setting(containerEl)
      .setName("Enable drag and drop")
      .setDesc("Enable drag and drop for new boards")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.draggable)
          .onChange(async (value) => {
            this.plugin.settings.draggable = value;
            await this.plugin.saveSettings();
          }),
      );

    // カード数表示設定
    new Setting(containerEl)
      .setName("Show card count")
      .setDesc("Display the number of cards in each column")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showCardCount)
          .onChange(async (value) => {
            this.plugin.settings.showCardCount = value;
            await this.plugin.saveSettings();
          }),
      );

    // コンパクトモード設定
    new Setting(containerEl)
      .setName("Compact mode")
      .setDesc("Reduce spacing and padding for a more compact view")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.compactMode)
          .onChange(async (value) => {
            this.plugin.settings.compactMode = value;
            await this.plugin.saveSettings();
          }),
      );

    // Additional information
    containerEl.createEl("h3", {
      text: "About Board-Specific Settings",
      cls: "setting-item-heading",
    });

    containerEl.createEl("p", {
      text: "Each Kanban board can have individual settings applied through the settings panel within the board. Board-specific settings will override the default values configured here.",
      cls: "setting-item-description",
    });
  }
}
