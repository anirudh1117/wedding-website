export type PetalCelebrationType =
  | "language-select"
  | "party-select"
  | "add-guest"
  | "upload-success"
  | "registration-success";

export type PetalAnimationSpec = {
  id: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotation: number;
  opacity: number;
  color: string;
  scale: number;
};

const PETAL_VARIANTS = {
  "language-select": {
    count: 6,
    duration: [1, 1.2],
    size: [14, 24],
    drift: [-65, 70],
    colors: ["#d58f83", "#be6e78", "#a95863", "#8a535a", "#9a7652"],
  },
  "party-select": {
    count: 5,
    duration: [0.9, 1.1],
    size: [12, 20],
    drift: [-45, 56],
    colors: ["#cb8b8f", "#b86d77", "#9e5b66", "#8a535a"],
  },
  "add-guest": {
    count: 10,
    duration: [1.2, 1.5],
    size: [14, 22],
    drift: [-85, 85],
    colors: ["#e2a197", "#cf8188", "#b96871", "#9e5b64", "#8a535a"],
  },
  "upload-success": {
    count: 10,
    duration: [1.2, 1.5],
    size: [14, 22],
    drift: [-60, 70],
    colors: ["#dea59e", "#ca8788", "#b96f78", "#9c5e67", "#8a535a"],
  },
  "registration-success": {
    count: 24,
    duration: [2.1, 2.6],
    size: [14, 28],
    drift: [-110, 110],
    colors: ["#dd9f95", "#cb8384", "#b66c74", "#9f5f68", "#8a535a"],
  },
} as const;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const randomBetween = (min: number, max: number) => {
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);
  return safeMin + Math.random() * (safeMax - safeMin);
};

export function createPetalSpecs(type: PetalCelebrationType): PetalAnimationSpec[] {
  const preset = PETAL_VARIANTS[type];

  return Array.from({ length: preset.count }, (_, index) => {
    const color = preset.colors[index % preset.colors.length];
    const size = randomBetween(preset.size[0], preset.size[1]);

    return {
      id: `${type}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      left: clamp(randomBetween(6, 94), 2, 98),
      size,
      duration: randomBetween(preset.duration[0], preset.duration[1]),
      delay: randomBetween(0, 0.36),
      drift: randomBetween(preset.drift[0], preset.drift[1]),
      rotation: randomBetween(-260, 260),
      opacity: randomBetween(0.86, 1),
      color,
      scale: randomBetween(0.78, 1.12),
    };
  });
}
