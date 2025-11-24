import chroma from "chroma-js";

export function generateColors(count: number): string[] {
  return chroma
    .scale(["#3b82f6", "#10b981"])
    .mode("lch")
    .correctLightness()
    .colors(count);
}
