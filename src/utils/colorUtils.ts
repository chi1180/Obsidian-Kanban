/**
 * 色生成ユーティリティ
 *
 * カラムIDや値から一貫した色を生成します。
 */

export interface ColumnColor {
  /** 背景色 (HSL形式) */
  background: string;
  /** 文字色 (HSL形式) */
  text: string;
  /** ドット用の色 (HSL形式) */
  dot: string;
}

/**
 * 文字列を数値ハッシュに変換
 *
 * @param str ハッシュ化する文字列
 * @returns ハッシュ値
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 32ビット整数に変換
  }
  return Math.abs(hash);
}

/**
 * カラムIDから一貫した色を生成
 *
 * 同じIDに対して常に同じ色を返します。
 * Notion風の柔らかいパステルカラーを生成します。
 *
 * @param columnId カラムID（またはカラム値）
 * @returns 背景色、文字色、ドット色のセット
 */
export function getColumnColor(columnId: string): ColumnColor {
  // 空文字列の場合はデフォルトグレー
  if (!columnId || columnId.trim() === "") {
    return {
      background: "hsl(0, 0%, 90%)",
      text: "hsl(0, 0%, 30%)",
      dot: "hsl(0, 0%, 50%)",
    };
  }

  // 文字列をハッシュ化してHue(色相)を決定 (0-360)
  const hash = hashString(columnId);
  const hue = hash % 360;

  // Notion風の柔らかいパステルカラー
  // 彩度: 60-70% (鮮やかすぎず、くすみすぎず)
  // 明度: 背景は明るく(85-90%)、文字は暗く(25-35%)
  const saturation = 60 + (hash % 15); // 60-75%
  const backgroundLightness = 85 + (hash % 8); // 85-92%
  const textLightness = 25 + (hash % 15); // 25-40%
  const dotLightness = 45 + (hash % 15); // 45-60%

  return {
    background: `hsl(${hue}, ${saturation}%, ${backgroundLightness}%)`,
    text: `hsl(${hue}, ${saturation + 10}%, ${textLightness}%)`,
    dot: `hsl(${hue}, ${saturation + 15}%, ${dotLightness}%)`,
  };
}

/**
 * ダークモード用の色を生成
 *
 * ダークモードでは背景を暗く、文字を明るくします。
 *
 * @param columnId カラムID（またはカラム値）
 * @returns 背景色、文字色、ドット色のセット
 */
export function getColumnColorDark(columnId: string): ColumnColor {
  // 空文字列の場合はデフォルトグレー
  if (!columnId || columnId.trim() === "") {
    return {
      background: "hsl(0, 0%, 20%)",
      text: "hsl(0, 0%, 80%)",
      dot: "hsl(0, 0%, 60%)",
    };
  }

  const hash = hashString(columnId);
  const hue = hash % 360;

  // ダークモード用の調整
  // 彩度: やや控えめ (40-55%)
  // 明度: 背景は暗く(20-30%)、文字は明るく(70-85%)
  const saturation = 40 + (hash % 15); // 40-55%
  const backgroundLightness = 20 + (hash % 10); // 20-30%
  const textLightness = 70 + (hash % 15); // 70-85%
  const dotLightness = 55 + (hash % 15); // 55-70%

  return {
    background: `hsl(${hue}, ${saturation}%, ${backgroundLightness}%)`,
    text: `hsl(${hue}, ${saturation + 10}%, ${textLightness}%)`,
    dot: `hsl(${hue}, ${saturation + 15}%, ${dotLightness}%)`,
  };
}

/**
 * 現在のテーマ（ライト/ダーク）に応じた色を取得
 *
 * @param columnId カラムID（またはカラム値）
 * @returns 背景色、文字色、ドット色のセット
 */
export function getColumnColorForTheme(columnId: string): ColumnColor {
  // Obsidian のテーマを判定
  // body.theme-dark または .theme-light クラスで判定
  const isDark = document.body.classList.contains("theme-dark");

  return isDark ? getColumnColorDark(columnId) : getColumnColor(columnId);
}
