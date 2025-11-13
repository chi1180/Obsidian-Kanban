/**
 * 設定タブ
 *
 * Obsidian の設定画面にプラグイン設定タブを追加します。
 */

import { PluginSettingTab, Setting } from "obsidian";
import type { App } from "obsidian";
import type ObsidianBetterKanbanPlugin from "../index";

/**
 * Kanban プラグインの設定タブ
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
    new Setting(containerEl).setName("Obsidian better kanban").setHeading();

    new Setting(containerEl).setDesc(
      "These are default settings. Each board can override these settings individually.",
    );

    // デフォルトのカードサイズ
    new Setting(containerEl)
      .setName("Default card size")
      .setDesc("Default size for cards in the board")
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            small: "Small",
            medium: "Medium",
            large: "Large",
          })
          .setValue(this.plugin.settings.defaultCardSize)
          .onChange(async (value) => {
            this.plugin.settings.defaultCardSize = value as
              | "small"
              | "medium"
              | "large";
            await this.plugin.saveSettings();
          }),
      );

    // デフォルトの新規ファイル作成場所
    new Setting(containerEl)
      .setName("Default new file location")
      .setDesc("Folder path where new cards will be created")
      .addText((text) =>
        text
          .setPlaceholder("/")
          .setValue(this.plugin.settings.defaultNewFileLocation)
          .onChange(async (value) => {
            this.plugin.settings.defaultNewFileLocation = value || "/";
            await this.plugin.saveSettings();
          }),
      );

    // デフォルトのソート順
    new Setting(containerEl)
      .setName("Default sort order")
      .setDesc("Default order to sort cards within columns")
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            created: "Created date",
            updated: "Updated date",
            title: "Title (A-Z)",
            custom: "Custom (manual)",
          })
          .setValue(this.plugin.settings.defaultSortOrder)
          .onChange(async (value) => {
            this.plugin.settings.defaultSortOrder = value as
              | "created"
              | "updated"
              | "title"
              | "custom";
            await this.plugin.saveSettings();
          }),
      );

    // ドラッグ&ドロップを有効にするか
    new Setting(containerEl)
      .setName("Enable drag and drop")
      .setDesc("Allow cards to be moved between columns by dragging")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableDragAndDrop)
          .onChange(async (value) => {
            this.plugin.settings.enableDragAndDrop = value;
            await this.plugin.saveSettings();
          }),
      );

    // カード数を表示するか
    new Setting(containerEl)
      .setName("Show card count")
      .setDesc("Display the number of cards in each column header")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showCardCount)
          .onChange(async (value) => {
            this.plugin.settings.showCardCount = value;
            await this.plugin.saveSettings();
          }),
      );

    // コンパクトモードを有効にするか
    new Setting(containerEl)
      .setName("Compact mode")
      .setDesc("Use compact layout for cards")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.compactMode)
          .onChange(async (value) => {
            this.plugin.settings.compactMode = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
