// Shared cover preset data, used both by the loader (validation) and the
// cover component (rendering) so the two can never drift apart.
export const COVER_BGS = ["cream", "blue", "sage", "red"] as const;
export type CoverBg = (typeof COVER_BGS)[number];

export const COVER_SHAPES = {
  "blue-large": { color: "var(--blue)", r: 46, cx: 78, cy: 22 },
  "blue-small": { color: "var(--blue)", r: 14, cx: 24, cy: 70 },
  "sage-large": { color: "var(--sage)", r: 40, cx: 20, cy: 80 },
  "red-small": { color: "var(--red)", r: 16, cx: 82, cy: 84 },
  "ink-small": { color: "var(--ink)", r: 10, cx: 50, cy: 50 },
} as const;

export type CoverShape = keyof typeof COVER_SHAPES;
export const COVER_SHAPE_NAMES = Object.keys(COVER_SHAPES) as CoverShape[];
