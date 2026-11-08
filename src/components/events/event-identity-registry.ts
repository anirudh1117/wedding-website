import type { CSSProperties } from "react";
import type { EventMotif, EventTheme } from "@/content/wedding-content";

export type SparklePoint = {
  x: string;
  y: string;
  /** px size — must be 12–24 for visibility */
  size: number;
  delayMs: number;
  durationMs: number;
};

export type EventThemeTokens = {
  accent: string;
  accentSoft: string;
  border: string;
  surface: string;
  artworkBg: string;
  artworkTint: string;
  sparkle: string[];
};

export type EventIdentity = {
  artworkStyle: "botanical" | "ritual" | "music" | "rings" | "ceremony" | "evening" | "generic";
  sparkle: SparklePoint[];
};

export const EVENT_THEME_REGISTRY: Record<EventTheme, EventThemeTokens> = {
  "marigold-yellow": {
    accent: "#9D6522",
    accentSoft: "rgba(157, 101, 34, 0.22)",
    border: "rgba(157, 101, 34, 0.22)",
    surface: "linear-gradient(170deg, rgba(255,252,245,0.97), rgba(255,245,218,0.94))",
    artworkBg: "linear-gradient(155deg, #fffbf0, #fdf0d0)",
    artworkTint: "#9D6522",
    sparkle: ["#C8961A", "#F5D97A", "#FFFCF7"],
  },
  "botanical-green": {
    accent: "#4E6B53",
    accentSoft: "rgba(78, 107, 83, 0.2)",
    border: "rgba(78, 107, 83, 0.22)",
    surface: "linear-gradient(170deg, rgba(255,252,247,0.97), rgba(237,247,236,0.95))",
    artworkBg: "linear-gradient(155deg, #f8fff6, #e8f5e4)",
    artworkTint: "#4E6B53",
    sparkle: ["#A58A61", "#C8D9B0", "#FFFCF7"],
  },
  "emerald-midnight": {
    accent: "#2D5D53",
    accentSoft: "rgba(45, 93, 83, 0.21)",
    border: "rgba(45, 93, 83, 0.24)",
    surface: "linear-gradient(170deg, rgba(252,250,246,0.97), rgba(234,246,242,0.95))",
    artworkBg: "linear-gradient(155deg, #f0faf7, #d8efea)",
    artworkTint: "#2D5D53",
    sparkle: ["#A58A61", "#A8D5CA", "#FFFCF7"],
  },
  "champagne-blush": {
    accent: "#9A6D61",
    accentSoft: "rgba(154, 109, 97, 0.2)",
    border: "rgba(154, 109, 97, 0.22)",
    surface: "linear-gradient(170deg, rgba(255,252,247,0.97), rgba(251,238,230,0.94))",
    artworkBg: "linear-gradient(155deg, #fff8f5, #f5e4da)",
    artworkTint: "#9A6D61",
    sparkle: ["#C8961A", "#F3DED0", "#FFFCF7"],
  },
  "ivory-sindoor": {
    accent: "#8A3E45",
    accentSoft: "rgba(138, 62, 69, 0.2)",
    border: "rgba(138, 62, 69, 0.24)",
    surface: "linear-gradient(170deg, rgba(255,252,247,0.98), rgba(252,240,234,0.95))",
    artworkBg: "linear-gradient(155deg, #fffbf7, #fce8dc)",
    artworkTint: "#8A3E45",
    sparkle: ["#C8961A", "#F2DCCB", "#FFFCF7"],
  },
  "champagne-plum": {
    accent: "#6F4D63",
    accentSoft: "rgba(111, 77, 99, 0.2)",
    border: "rgba(111, 77, 99, 0.22)",
    surface: "linear-gradient(170deg, rgba(255,252,247,0.97), rgba(244,236,243,0.95))",
    artworkBg: "linear-gradient(155deg, #fdf8fc, #f0e0ec)",
    artworkTint: "#6F4D63",
    sparkle: ["#C8961A", "#EEDFE8", "#FFFCF7"],
  },
};

export function getChapterAccentStyle(theme: EventTheme): CSSProperties {
  const t = EVENT_THEME_REGISTRY[theme];
  return { color: t.accent };
}

export function getChapterBorderStyle(theme: EventTheme): CSSProperties {
  const t = EVENT_THEME_REGISTRY[theme];
  return { borderColor: t.border };
}

export const EVENT_MOTIF_IDENTITY_REGISTRY: Record<EventMotif, EventIdentity> = {
  henna: {
    artworkStyle: "botanical",
    sparkle: [
      { x: "12%", y: "14%", size: 16, delayMs: 280,  durationMs: 3400 },
      { x: "24%", y: "32%", size: 14, delayMs: 1180, durationMs: 3800 },
      { x: "38%", y: "18%", size: 18, delayMs: 1860, durationMs: 4200 },
      { x: "50%", y: "62%", size: 14, delayMs: 2340, durationMs: 4600 },
      { x: "62%", y: "35%", size: 16, delayMs:  760, durationMs: 3600 },
      { x: "74%", y: "56%", size: 14, delayMs: 1660, durationMs: 4000 },
      { x: "83%", y: "22%", size: 20, delayMs: 2820, durationMs: 4800 },
      { x: "67%", y: "76%", size: 14, delayMs: 3280, durationMs: 5200 },
      { x: "29%", y: "72%", size: 16, delayMs: 3680, durationMs: 5600 },
    ],
  },
  marigold: {
    artworkStyle: "ritual",
    sparkle: [
      { x: "14%", y: "22%", size: 18, delayMs:  350, durationMs: 3300 },
      { x: "24%", y: "52%", size: 14, delayMs:  980, durationMs: 3700 },
      { x: "36%", y: "26%", size: 16, delayMs: 1680, durationMs: 4000 },
      { x: "48%", y: "62%", size: 20, delayMs: 2280, durationMs: 4500 },
      { x: "58%", y: "30%", size: 14, delayMs:  980, durationMs: 3500 },
      { x: "68%", y: "52%", size: 16, delayMs: 1980, durationMs: 4200 },
      { x: "78%", y: "24%", size: 14, delayMs: 2760, durationMs: 5000 },
      { x: "86%", y: "68%", size: 18, delayMs: 3370, durationMs: 5400 },
      { x: "42%", y: "76%", size: 14, delayMs: 3890, durationMs: 6000 },
      { x: "54%", y: "12%", size: 16, delayMs:  900, durationMs: 3400 },
    ],
  },
  music: {
    artworkStyle: "music",
    sparkle: [
      { x: "10%", y: "28%", size: 16, delayMs:  360, durationMs: 3000 },
      { x: "20%", y: "62%", size: 14, delayMs:  970, durationMs: 3600 },
      { x: "34%", y: "16%", size: 18, delayMs: 1580, durationMs: 4000 },
      { x: "48%", y: "42%", size: 22, delayMs: 2270, durationMs: 4600 },
      { x: "60%", y: "24%", size: 14, delayMs:  890, durationMs: 3400 },
      { x: "72%", y: "60%", size: 16, delayMs: 1920, durationMs: 4200 },
      { x: "82%", y: "22%", size: 14, delayMs: 2710, durationMs: 5000 },
      { x: "88%", y: "54%", size: 18, delayMs: 3340, durationMs: 5600 },
      { x: "52%", y: "76%", size: 14, delayMs: 3830, durationMs: 6000 },
    ],
  },
  rings: {
    artworkStyle: "rings",
    sparkle: [
      { x: "14%", y: "18%", size: 16, delayMs:  260, durationMs: 3200 },
      { x: "26%", y: "44%", size: 20, delayMs:  840, durationMs: 3800 },
      { x: "38%", y: "22%", size: 14, delayMs: 1390, durationMs: 4200 },
      { x: "50%", y: "62%", size: 18, delayMs: 2140, durationMs: 4600 },
      { x: "58%", y: "32%", size: 14, delayMs:  740, durationMs: 3400 },
      { x: "70%", y: "56%", size: 16, delayMs: 1770, durationMs: 4200 },
      { x: "78%", y: "26%", size: 14, delayMs: 2560, durationMs: 5000 },
      { x: "86%", y: "62%", size: 18, delayMs: 3160, durationMs: 5600 },
      { x: "62%", y: "76%", size: 14, delayMs: 3830, durationMs: 6000 },
    ],
  },
  "varmala-mandap": {
    artworkStyle: "ceremony",
    sparkle: [
      { x: "10%", y: "14%", size: 16, delayMs:  240, durationMs: 3000 },
      { x: "22%", y: "40%", size: 20, delayMs:  920, durationMs: 3600 },
      { x: "34%", y: "18%", size: 14, delayMs: 1430, durationMs: 4000 },
      { x: "46%", y: "56%", size: 24, delayMs: 2200, durationMs: 4500 },
      { x: "56%", y: "22%", size: 16, delayMs:  860, durationMs: 3400 },
      { x: "68%", y: "48%", size: 20, delayMs: 1810, durationMs: 4200 },
      { x: "78%", y: "16%", size: 14, delayMs: 2620, durationMs: 5000 },
      { x: "86%", y: "44%", size: 18, delayMs: 3320, durationMs: 5600 },
      { x: "48%", y: "76%", size: 16, delayMs: 3810, durationMs: 6000 },
      { x: "74%", y: "72%", size: 14, delayMs: 2910, durationMs: 5200 },
    ],
  },
  "evening-lights": {
    artworkStyle: "evening",
    sparkle: [
      { x: "12%", y: "16%", size: 16, delayMs:  300, durationMs: 3200 },
      { x: "24%", y: "42%", size: 20, delayMs:  910, durationMs: 3700 },
      { x: "36%", y: "18%", size: 14, delayMs: 1500, durationMs: 4200 },
      { x: "48%", y: "60%", size: 18, delayMs: 2190, durationMs: 4600 },
      { x: "58%", y: "28%", size: 14, delayMs:  790, durationMs: 3500 },
      { x: "68%", y: "54%", size: 16, delayMs: 1880, durationMs: 4200 },
      { x: "78%", y: "22%", size: 14, delayMs: 2680, durationMs: 5000 },
      { x: "86%", y: "58%", size: 20, delayMs: 3340, durationMs: 5600 },
      { x: "58%", y: "76%", size: 14, delayMs: 3960, durationMs: 6000 },
    ],
  },
};
