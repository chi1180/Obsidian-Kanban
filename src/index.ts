/**
 * Obsidian better Kanban Plugin
 * Bases View として Kanban ボードを提供
 */

import { Plugin } from "obsidian";
import type { BasesViewRegistration } from "obsidian";
import { KanbanBasesView } from "./views/kanbanBasesView";
import { KanbanSettingTab } from "./settings/settingsTab";
import { DEFAULT_PLUGIN_SETTINGS } from "./settings/defaultSettings";
import type { KanbanPluginSettings } from "./types/settings";

// Kanban View の識別子
const KANBAN_VIEW_TYPE = "kanban-board-view";

/**
 * Obsidian better Kanban Plugin
 * Bases View として Kanban ボードビューを登録
 */
export default class ObsidianBetterKanbanPlugin extends Plugin {
  settings: KanbanPluginSettings;

  async onload() {
    // 設定を読み込む
    await this.loadSettings();

    // 設定タブを追加
    this.addSettingTab(new KanbanSettingTab(this.app, this));

    // Bases View として Kanban ボードを登録
    this.registerKanbanBasesView();
  }

  onunload() {
    // Cleanup if needed
  }

  /**
   * 設定を読み込む
   */
  async loadSettings(): Promise<void> {
    this.settings = Object.assign(
      {},
      DEFAULT_PLUGIN_SETTINGS,
      await this.loadData(),
    );
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
    // registerBasesView が存在するかチェック
    if (typeof this.registerBasesView !== "function") {
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

    this.registerBasesView(KANBAN_VIEW_TYPE, registration);
  }
}
