import { BasesView, type QueryController } from "obsidian";
import { PLUGIN_CONFIG } from "./config";

export class KanbanView extends BasesView {
  readonly type = PLUGIN_CONFIG.bases_view_type;
  private containerEl: HTMLElement;

  constructor(controller: QueryController, parentEl: HTMLElement) {
    super(controller);
    this.containerEl = parentEl;
  }

  public onDataUpdated(): void {
    this.containerEl.empty();
    this.containerEl.createDiv({ text: "Hello World" });
  }
}
