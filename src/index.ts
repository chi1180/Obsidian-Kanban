import { Plugin } from "obsidian";
import { PLUGIN_CONFIG } from "./config";
import { KanbanView } from "./view";

export default class KanbanViewPlugin extends Plugin {
  async onload() {
    // Tell Obsidian about the new view type that this plugin provides.
    this.registerBasesView(PLUGIN_CONFIG.bases_view_type, {
      name: PLUGIN_CONFIG.bases_view_name,
      icon: PLUGIN_CONFIG.bases_view_icon,
      factory: (controller, containerEl) =>
        new KanbanView(controller, containerEl),
    });
  }
}
