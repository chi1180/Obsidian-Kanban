/**
 * Obsidian better Kanban Plugin
 * Bases View として Kanban ボードを提供
 */

import { Plugin } from "obsidian";
import type { BasesViewRegistration } from "obsidian";
import { KanbanBasesView } from "./views/kanbanBasesView";
import { KanbanSettingTab } from "./settings/settingsTab";
import { DEFAULT_SETTINGS } from "./settings/defaultSettings";
import type { KanbanPluginSettings } from "./types/settings";

// Kanban View の識別子
const KANBAN_VIEW_TYPE = "kanban-board-view";

/**
 * Obsidian better Kanban Plugin
 * Bases View として Kanban ボードビューを登録
 */
export default class ObsidianBetterKanbanPlugin extends Plugin {
  settings: KanbanPluginSettings;

  async onload(): Promise<void> {
    console.log("Loading Obsidian better Kanban Plugin");
    console.log("Plugin instance:", this);
    console.log("App instance:", this.app);

    // 設定を読み込む
    await this.loadSettings();

    // 設定タブを追加
    this.addSettingTab(new KanbanSettingTab(this.app, this));

    // Bases View として Kanban ボードを登録
    this.registerKanbanBasesView();

    console.log("Obsidian better Kanban Plugin loaded");
  }

  async onunload(): Promise<void> {
    console.log("Unloading Obsidian better Kanban Plugin");
  }

  /**
   * 設定を読み込む
   */
  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  /**
   * 設定を保存する
   */
  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  /**
   * Kanban Bases View を登録
   */
  private registerKanbanBasesView(): void {
    console.log("Attempting to register Kanban Bases View");
    console.log("registerBasesView available:", typeof this.registerBasesView);

    // registerBasesView が存在するかチェック
    if (typeof this.registerBasesView !== "function") {
      console.error(
        "registerBasesView is not available. Make sure Bases plugin is installed and enabled.",
      );
      return;
    }

    const registration: BasesViewRegistration = {
      name: "Kanban Board",
      icon: "kanban",

      // View のファクトリ関数
      factory: (controller, containerEl) => {
        return new KanbanBasesView(controller, containerEl, this);
      },
    };

    try {
      console.log("Calling registerBasesView with:", {
        viewType: KANBAN_VIEW_TYPE,
        registration,
      });
      const result = this.registerBasesView(KANBAN_VIEW_TYPE, registration);
      console.log("Kanban Bases View registered successfully, result:", result);
    } catch (error) {
      console.error("Failed to register Kanban Bases View:", error);
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "N/A",
      );
    }
  }
}
