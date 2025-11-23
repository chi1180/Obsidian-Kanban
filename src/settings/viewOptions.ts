import type { ViewOption } from "obsidian";
import { SETTING_KEYS } from "src/config";
import type { ViewOptions } from "src/types/setting";

export const KANBAN_VIEW_CONFIG: ViewOption[] = [
  {
    type: "dropdown",
    displayName: "Card size",
    key: SETTING_KEYS.CARD_SIZE,
    default: "medium" as ViewOptions["cardSize"],
    options: {
      small: "Small",
      medium: "Medium",
      large: "Large",
    },
  },
  {
    type: "toggle",
    displayName: "Show column colors",
    key: SETTING_KEYS.SHOW_COLUMN_COLOR,
    default: true as ViewOptions["showColumnColor"],
  },
];
