/**
 * プロパティ管理のコアロジック
 *
 * ファイルのフロントマター（プロパティ）の読み書きを提供します。
 */

import type { App, TFile } from "obsidian";
import type { UpdateCardParams } from "../types/kanban";

/**
 * プロパティ管理クラス
 */
export class PropertyManager {
  constructor(private app: App) {}

  /**
   * ファイルのプロパティを取得
   *
   * @param file - 対象のファイル
   * @returns プロパティのオブジェクト
   */
  getProperties(file: TFile): Record<string, unknown> {
    try {
      // Obsidian の MetadataCache を使用してプロパティを取得
      const metadata = this.app.metadataCache.getFileCache(file);

      if (!metadata?.frontmatter) {
        return {};
      }

      // frontmatter をそのまま返す
      return metadata.frontmatter;
    } catch {
      return {};
    }
  }

  /**
   * ファイルのプロパティを更新
   *
   * @param params - 更新パラメータ
   */
  async updateProperties(params: UpdateCardParams): Promise<void> {
    const { file, properties } = params;

    try {
      // 既存のプロパティを取得
      const existingProperties = this.getProperties(file);

      // 新しいプロパティをマージ
      const updatedProperties = {
        ...existingProperties,
        ...properties,
      };

      // ファイルの内容を取得
      const content = await this.app.vault.read(file);

      // フロントマターを更新した新しい内容を生成
      const newContent = this.updateFrontmatter(content, updatedProperties);

      // ファイルを更新
      await this.app.vault.modify(file, newContent);
    } catch (error) {
      throw new Error(
        `Failed to update properties: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * 特定のプロパティ値を取得
   *
   * @param file - 対象のファイル
   * @param propertyName - プロパティ名
   * @returns プロパティ値（存在しない場合は undefined）
   */
  async getProperty(file: TFile, propertyName: string): Promise<unknown> {
    const properties = this.getProperties(file);
    return properties[propertyName];
  }

  /**
   * 特定のプロパティ値を更新
   *
   * @param file - 対象のファイル
   * @param propertyName - プロパティ名
   * @param value - 新しい値
   */
  async setProperty(
    file: TFile,
    propertyName: string,
    value: unknown,
  ): Promise<void> {
    try {
      // Obsidian の processFrontMatter を使用してプロパティを更新
      await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
        frontmatter[propertyName] = value;
      });
    } catch (error) {
      throw new Error(
        `Failed to set property: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * ファイル内容のフロントマターを更新
   *
   * @param content - 元のファイル内容
   * @param properties - 新しいプロパティ
   * @returns 更新されたファイル内容
   */
  private updateFrontmatter(
    content: string,
    properties: Record<string, unknown>,
  ): string {
    const lines = content.split("\n");

    // 既存のフロントマターを検出
    const hasFrontmatter = lines.length >= 2 && lines[0].trim() === "---";

    if (hasFrontmatter) {
      // 既存のフロントマターを置き換える
      const endIndex = lines.findIndex(
        (line, i) => i > 0 && line.trim() === "---",
      );

      if (endIndex > 0) {
        // フロントマター以降の内容を保持
        const bodyContent = lines.slice(endIndex + 1).join("\n");

        // 新しいフロントマターを生成
        const newFrontmatter = this.generateFrontmatter(properties);

        return newFrontmatter + "\n" + bodyContent;
      }
    }

    // フロントマターが存在しない場合は追加
    const newFrontmatter = this.generateFrontmatter(properties);
    return newFrontmatter + "\n" + content;
  }

  /**
   * フロントマターを YAML 形式で生成
   *
   * @param properties - プロパティのオブジェクト
   * @returns YAML 形式のフロントマター
   */
  private generateFrontmatter(properties: Record<string, unknown>): string {
    const yamlLines = ["---"];

    for (const [key, value] of Object.entries(properties)) {
      if (value === undefined || value === null) {
        continue;
      }

      if (Array.isArray(value)) {
        // 配列の場合
        if (value.length === 0) {
          yamlLines.push(`${key}: []`);
        } else {
          yamlLines.push(`${key}:`);
          value.forEach((item) => {
            yamlLines.push(`  - ${this.escapeYamlValue(item)}`);
          });
        }
      } else if (typeof value === "object" && value !== null) {
        // オブジェクトの場合（ネストされたオブジェクトは JSON として保存）
        yamlLines.push(`${key}: ${JSON.stringify(value)}`);
      } else if (typeof value === "boolean") {
        // ブール値の場合
        yamlLines.push(`${key}: ${value}`);
      } else if (typeof value === "number") {
        // 数値の場合
        yamlLines.push(`${key}: ${value}`);
      } else {
        // 文字列の場合
        yamlLines.push(`${key}: ${this.escapeYamlValue(value)}`);
      }
    }

    yamlLines.push("---");

    return yamlLines.join("\n");
  }

  /**
   * YAML の値をエスケープ
   *
   * @param value - エスケープする値
   * @returns エスケープされた値
   */
  private escapeYamlValue(value: unknown): string {
    const str = String(value);

    // 特殊文字を含む場合はクォートで囲む
    if (
      str.includes(":") ||
      str.includes("#") ||
      str.includes("[") ||
      str.includes("]") ||
      str.includes("{") ||
      str.includes("}") ||
      str.includes(",") ||
      str.includes("|") ||
      str.includes(">") ||
      str.includes("&") ||
      str.includes("*") ||
      str.includes("!") ||
      str.includes("%") ||
      str.includes("@") ||
      str.startsWith(" ") ||
      str.endsWith(" ") ||
      str.startsWith("-") ||
      str.startsWith("?")
    ) {
      return `"${str.replace(/"/g, '\\"')}"`;
    }

    // 数値や真偽値に見える文字列もクォートで囲む
    if (
      str === "true" ||
      str === "false" ||
      str === "null" ||
      str === "~" ||
      !Number.isNaN(Number(str))
    ) {
      return `"${str}"`;
    }

    return str;
  }
}
