/**
 * ファイル操作のコアロジック
 *
 * Vault 内のファイルの作成、リネーム、削除などの操作を提供します。
 */

import { App, TFile, TFolder, normalizePath } from "obsidian";
import { CreateCardParams } from "../types/kanban";

/**
 * ファイル操作クラス
 */
export class FileOperations {
  constructor(private app: App) {}

  /**
   * 新しいファイルを作成
   *
   * @param params - カード作成パラメータ
   * @param folderPath - 作成先フォルダパス（デフォルトは "/"）
   * @returns 作成されたファイル
   */
  async createFile(params: CreateCardParams, folderPath = "/"): Promise<TFile> {
    const { title, columnProperty, columnValue, properties = {} } = params;

    // ファイル名をサニタイズ（不正な文字を除去）
    const sanitizedTitle = this.sanitizeFileName(title);

    // ファイルパスを生成
    const fileName = `${sanitizedTitle}.md`;
    const filePath = normalizePath(`${folderPath}/${fileName}`);

    // フロントマターを構築
    const frontmatter = {
      [columnProperty]: columnValue,
      ...properties,
    };

    // ファイル内容を生成
    const content = this.generateFileContent(frontmatter);

    // ファイルを作成
    try {
      // フォルダが存在しない場合は作成
      await this.ensureFolderExists(folderPath);

      // ファイルを作成
      const file = await this.app.vault.create(filePath, content);
      return file;
    } catch (error) {
      console.error("Failed to create file:", error);
      throw new Error(`Failed to create file: ${error.message}`);
    }
  }

  /**
   * ファイルをリネーム
   *
   * @param file - リネーム対象のファイル
   * @param newTitle - 新しいタイトル
   * @returns リネーム後のファイル
   */
  async renameFile(file: TFile, newTitle: string): Promise<void> {
    const sanitizedTitle = this.sanitizeFileName(newTitle);
    const newFileName = `${sanitizedTitle}.md`;
    const newPath = normalizePath(`${file.parent?.path || ""}/${newFileName}`);

    try {
      await this.app.fileManager.renameFile(file, newPath);
    } catch (error) {
      console.error("Failed to rename file:", error);
      throw new Error(`Failed to rename file: ${error.message}`);
    }
  }

  /**
   * ファイルを削除
   *
   * @param file - 削除対象のファイル
   */
  async deleteFile(file: TFile): Promise<void> {
    try {
      await this.app.vault.delete(file);
    } catch (error) {
      console.error("Failed to delete file:", error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * ファイル名をサニタイズ
   * 不正な文字を除去し、有効なファイル名にする
   *
   * @param fileName - 元のファイル名
   * @returns サニタイズされたファイル名
   */
  private sanitizeFileName(fileName: string): string {
    // 不正な文字を除去（Windows/Linux/macOS で使用できない文字）
    return fileName
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * フォルダが存在することを確認し、存在しない場合は作成
   *
   * @param folderPath - フォルダパス
   */
  private async ensureFolderExists(folderPath: string): Promise<void> {
    const normalizedPath = normalizePath(folderPath);

    // ルートの場合はスキップ
    if (normalizedPath === "/" || normalizedPath === "") {
      return;
    }

    // フォルダが存在するかチェック
    const folder = this.app.vault.getAbstractFileByPath(normalizedPath);

    if (!folder) {
      // フォルダが存在しない場合は作成
      await this.app.vault.createFolder(normalizedPath);
    } else if (!(folder instanceof TFolder)) {
      throw new Error(`Path exists but is not a folder: ${normalizedPath}`);
    }
  }

  /**
   * フロントマターを含むファイル内容を生成
   *
   * @param frontmatter - フロントマターのオブジェクト
   * @returns ファイル内容
   */
  private generateFileContent(frontmatter: Record<string, unknown>): string {
    const yamlLines = ["---"];

    // フロントマターを YAML 形式に変換
    for (const [key, value] of Object.entries(frontmatter)) {
      if (value === undefined || value === null) {
        continue;
      }

      if (Array.isArray(value)) {
        // 配列の場合
        yamlLines.push(`${key}:`);
        value.forEach((item) => {
          yamlLines.push(`  - ${this.escapeYamlValue(item)}`);
        });
      } else if (typeof value === "object") {
        // オブジェクトの場合（簡易的な処理）
        yamlLines.push(`${key}: ${JSON.stringify(value)}`);
      } else {
        // プリミティブな値の場合
        yamlLines.push(`${key}: ${this.escapeYamlValue(value)}`);
      }
    }

    yamlLines.push("---");
    yamlLines.push(""); // 空行

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
      str.startsWith(" ") ||
      str.endsWith(" ")
    ) {
      return `"${str.replace(/"/g, '\\"')}"`;
    }

    return str;
  }
}
