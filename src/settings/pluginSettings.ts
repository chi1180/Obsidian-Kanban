import { type App, PluginSettingTab, Setting } from "obsidian";
import type KanbanViewPlugin from "src";
import {
  PLUGIN_CONFIG,
  PLUGIN_SETTING_OPTIONS,
  SETTING_KEYS,
} from "src/config";

import type { PluginSettings } from "src/types/setting";
export class PluginSettingTag extends PluginSettingTab {
  plugin: KanbanViewPlugin;

  constructor(app: App, plugin: KanbanViewPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    // Plugin name
    new Setting(containerEl).setName(PLUGIN_CONFIG.plugin_name).setHeading();
    // Description about setting tab
    new Setting(containerEl).setDesc(
      "Setting can be saved automatically when you edit them.",
    );

    /* === SETTINGS === */

    // Default card size
    new Setting(containerEl)
      .setName("Default carfd size")
      .setDesc("Set the default size of the cards in the kanban board.")
      .addDropdown((dropdown) => {
        dropdown
          .addOptions(PLUGIN_SETTING_OPTIONS[SETTING_KEYS.CARD_SIZE])
          .setValue(this.plugin.settings.cardSize)
          .onChange((val) =>
            this.onChangedHandler(SETTING_KEYS.CARD_SIZE, val),
          );
      });
    // Show column colors
    new Setting(containerEl)
      .setName("Show column colors")
      .setDesc("Toggle to show or hide the colors of the columns.")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.showColumnColor)
          .onChange((val) =>
            this.onChangedHandler(SETTING_KEYS.SHOW_COLUMN_COLOR, val),
          );
      });
    // Confirm card deletion
    new Setting(containerEl)
      .setName("Confirm card deletion")
      .setDesc("Toggle to enable or disable confirmation on card deletion.")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.confirmCardDeletion)
          .onChange((val) =>
            this.onChangedHandler(SETTING_KEYS.CONFIRM_CARD_DELETION, val),
          );
      });
  }

  /**
   * Handler for changing plugin settings.
   * Saves the new value to the plugin settings and persists it.
   *
   * @param key One of PluginSettings keys
   * @param value New value to set
   */
  async onChangedHandler<T>(key: keyof PluginSettings, value: T) {
    (this.plugin.settings[key] as T) = value;
    await this.plugin.saveSettings();
  }
}
