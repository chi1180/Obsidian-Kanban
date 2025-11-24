import { Plugin } from "obsidian";
import { DEFAULT_PLUGIN_SETTINGS, PLUGIN_CONFIG } from "./config";
import { KANBAN_VIEW_OPTIONS } from "./settings/viewOptions";
import type { PluginSettings } from "./types/setting";
import { KanbanView } from "./view";
import { PluginSettingTag } from "./settings/pluginSettings";
import "./ui/styles/index.scss";

export default class KanbanViewPlugin extends Plugin {
  settings: PluginSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new PluginSettingTag(this.app, this));

    this.registerBasesView(PLUGIN_CONFIG.bases_view_type, {
      name: PLUGIN_CONFIG.bases_view_name,
      icon: PLUGIN_CONFIG.bases_view_icon,
      factory: (controller, containerEl) =>
        new KanbanView(controller, containerEl, this.settings),
      options: () => KANBAN_VIEW_OPTIONS(this.settings),
    });
  }

  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_PLUGIN_SETTINGS,
      await this.loadData(),
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
