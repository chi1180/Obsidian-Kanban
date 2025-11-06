/**
 * Settings Panel Component
 * UI component for managing Kanban board settings
 */

import React, { useState } from "react";
import type { BasesViewConfig } from "obsidian";
import type {
  KanbanPluginSettings,
  CardSize,
  EffectiveSetting,
} from "../types/settings";
import { SETTINGS_KEYS, CARD_SIZES } from "../types/settings";
import { Settings, X } from "lucide-react";

interface SettingsPanelProps {
  config: BasesViewConfig;
  pluginSettings: KanbanPluginSettings;
  onSettingsChange: () => void;
}

/**
 * 有効な設定値を取得するヘルパー関数
 */
function getEffectiveSetting<T>(
  config: BasesViewConfig,
  key: string,
  pluginDefault: T,
): EffectiveSetting<T> {
  const viewValue = config.get(key);
  return {
    value: viewValue !== undefined ? (viewValue as T) : pluginDefault,
    isOverridden: viewValue !== undefined,
  };
}

/**
 * 設定パネルコンポーネント
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  config,
  pluginSettings,
  onSettingsChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // 各設定の有効値と上書き状態を取得
  const cardSizeSetting = getEffectiveSetting<CardSize>(
    config,
    SETTINGS_KEYS.CARD_SIZE,
    pluginSettings.cardSize,
  );
  const maxCardsPerColumnSetting = getEffectiveSetting<number>(
    config,
    SETTINGS_KEYS.MAX_CARDS_PER_COLUMN,
    pluginSettings.maxCardsPerColumn,
  );
  const draggableSetting = getEffectiveSetting<boolean>(
    config,
    SETTINGS_KEYS.DRAGGABLE,
    pluginSettings.draggable,
  );
  const showCardCountSetting = getEffectiveSetting<boolean>(
    config,
    SETTINGS_KEYS.SHOW_CARD_COUNT,
    pluginSettings.showCardCount,
  );
  const compactModeSetting = getEffectiveSetting<boolean>(
    config,
    SETTINGS_KEYS.COMPACT_MODE,
    pluginSettings.compactMode,
  );

  // 設定を更新
  const updateSetting = (key: string, value: unknown) => {
    config.set(key, value);
    onSettingsChange();
  };

  // 設定をリセット（プラグインのデフォルトに戻す）
  const resetSetting = (key: string) => {
    config.set(key, undefined);
    onSettingsChange();
  };

  return (
    <>
      {/* 設定アイコンボタン */}
      <button
        type="button"
        className="clickable-icon"
        onClick={() => setIsOpen(true)}
        aria-label="Board settings"
        style={{
          position: "absolute",
          left: "8px",
          top: "8px",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <Settings size={18} />
      </button>

      {/* モーダルダイアログ */}
      {isOpen && (
        <div
          className="modal-container mod-dim"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="modal"
            style={{
              backgroundColor: "var(--background-primary)",
              borderRadius: "8px",
              padding: "0",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div
              className="modal-header"
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--background-modifier-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
                Board Settings
              </h3>
              <button
                type="button"
                className="clickable-icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                style={{
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* コンテンツ */}
            <div
              className="modal-content"
              style={{
                padding: "20px",
                overflowY: "auto",
                flex: 1,
              }}
            >
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px",
                  backgroundColor: "var(--background-secondary)",
                  borderRadius: "4px",
                  fontSize: "13px",
                  color: "var(--text-muted)",
                }}
              >
                Board-specific settings. Unconfigured items will use plugin
                default values.
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {/* Card size */}
                <div className="setting-item">
                  <div className="setting-item-info">
                    <div className="setting-item-name">
                      Card size{" "}
                      {!cardSizeSetting.isOverridden && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                            fontWeight: "normal",
                          }}
                        >
                          (using default)
                        </span>
                      )}
                    </div>
                    <div className="setting-item-description">
                      Select the display size of cards
                    </div>
                  </div>
                  <div className="setting-item-control">
                    <select
                      className="dropdown"
                      value={cardSizeSetting.value}
                      onChange={(e) =>
                        updateSetting(
                          SETTINGS_KEYS.CARD_SIZE,
                          e.target.value as CardSize,
                        )
                      }
                      style={{
                        backgroundColor: cardSizeSetting.isOverridden
                          ? "var(--background-primary)"
                          : "var(--background-secondary)",
                      }}
                    >
                      <option value={CARD_SIZES.SMALL}>Small</option>
                      <option value={CARD_SIZES.MEDIUM}>Medium</option>
                      <option value={CARD_SIZES.LARGE}>Large</option>
                    </select>
                    {cardSizeSetting.isOverridden && (
                      <button
                        type="button"
                        className="clickable-icon"
                        onClick={() => resetSetting(SETTINGS_KEYS.CARD_SIZE)}
                        aria-label="Reset to default"
                        style={{ marginLeft: "8px" }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Max cards per column */}
                <div className="setting-item">
                  <div className="setting-item-info">
                    <div className="setting-item-name">
                      Max cards per column{" "}
                      {!maxCardsPerColumnSetting.isOverridden && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                            fontWeight: "normal",
                          }}
                        >
                          (using default)
                        </span>
                      )}
                    </div>
                    <div className="setting-item-description">
                      Maximum cards per column (0 for unlimited)
                    </div>
                  </div>
                  <div className="setting-item-control">
                    <input
                      type="number"
                      min="0"
                      value={maxCardsPerColumnSetting.value}
                      onChange={(e) =>
                        updateSetting(
                          SETTINGS_KEYS.MAX_CARDS_PER_COLUMN,
                          Number.parseInt(e.target.value, 10),
                        )
                      }
                      style={{
                        width: "80px",
                        backgroundColor: maxCardsPerColumnSetting.isOverridden
                          ? "var(--background-primary)"
                          : "var(--background-secondary)",
                      }}
                    />
                    {maxCardsPerColumnSetting.isOverridden && (
                      <button
                        type="button"
                        className="clickable-icon"
                        onClick={() =>
                          resetSetting(SETTINGS_KEYS.MAX_CARDS_PER_COLUMN)
                        }
                        aria-label="Reset to default"
                        style={{ marginLeft: "8px" }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Draggable */}
                <div className="setting-item">
                  <div className="setting-item-info">
                    <div className="setting-item-name">
                      Draggable{" "}
                      {!draggableSetting.isOverridden && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                            fontWeight: "normal",
                          }}
                        >
                          (using default)
                        </span>
                      )}
                    </div>
                    <div className="setting-item-description">
                      Move cards with drag and drop
                    </div>
                  </div>
                  <div className="setting-item-control">
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor: draggableSetting.isOverridden
                          ? "transparent"
                          : "var(--background-secondary-alt)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={draggableSetting.value}
                        onChange={(e) =>
                          updateSetting(
                            SETTINGS_KEYS.DRAGGABLE,
                            e.target.checked,
                          )
                        }
                      />
                    </label>
                    {draggableSetting.isOverridden && (
                      <button
                        type="button"
                        className="clickable-icon"
                        onClick={() => resetSetting(SETTINGS_KEYS.DRAGGABLE)}
                        aria-label="Reset to default"
                        style={{ marginLeft: "8px" }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Show card count */}
                <div className="setting-item">
                  <div className="setting-item-info">
                    <div className="setting-item-name">
                      Show card count{" "}
                      {!showCardCountSetting.isOverridden && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                            fontWeight: "normal",
                          }}
                        >
                          (using default)
                        </span>
                      )}
                    </div>
                    <div className="setting-item-description">
                      Display card count in each column
                    </div>
                  </div>
                  <div className="setting-item-control">
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor: showCardCountSetting.isOverridden
                          ? "transparent"
                          : "var(--background-secondary-alt)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={showCardCountSetting.value}
                        onChange={(e) =>
                          updateSetting(
                            SETTINGS_KEYS.SHOW_CARD_COUNT,
                            e.target.checked,
                          )
                        }
                      />
                    </label>
                    {showCardCountSetting.isOverridden && (
                      <button
                        type="button"
                        className="clickable-icon"
                        onClick={() =>
                          resetSetting(SETTINGS_KEYS.SHOW_CARD_COUNT)
                        }
                        aria-label="Reset to default"
                        style={{ marginLeft: "8px" }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Compact mode */}
                <div className="setting-item">
                  <div className="setting-item-info">
                    <div className="setting-item-name">
                      Compact mode{" "}
                      {!compactModeSetting.isOverridden && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                            fontWeight: "normal",
                          }}
                        >
                          (using default)
                        </span>
                      )}
                    </div>
                    <div className="setting-item-description">
                      Reduce spacing for compact display
                    </div>
                  </div>
                  <div className="setting-item-control">
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor: compactModeSetting.isOverridden
                          ? "transparent"
                          : "var(--background-secondary-alt)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={compactModeSetting.value}
                        onChange={(e) =>
                          updateSetting(
                            SETTINGS_KEYS.COMPACT_MODE,
                            e.target.checked,
                          )
                        }
                      />
                    </label>
                    {compactModeSetting.isOverridden && (
                      <button
                        type="button"
                        className="clickable-icon"
                        onClick={() => resetSetting(SETTINGS_KEYS.COMPACT_MODE)}
                        aria-label="Reset to default"
                        style={{ marginLeft: "8px" }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* フッター（オプション） */}
            <div
              className="modal-footer"
              style={{
                padding: "12px 20px",
                borderTop: "1px solid var(--background-modifier-border)",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="mod-cta"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
