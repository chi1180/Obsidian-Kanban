import { BASE_COLORS } from "src/config";

const colorPalette = Object.keys(BASE_COLORS);

export function assignColors(columnCount: number): string[] {
  const step = Math.max(
    1,
    Math.floor(
      colorPalette.length / Math.min(columnCount, colorPalette.length),
    ),
  );

  return Array.from(
    { length: columnCount },
    (_, i) => colorPalette[(i * step) % colorPalette.length],
  );
}
