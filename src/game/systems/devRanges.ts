import { theme } from "../theme";

export interface DevRange {
  min: number;
  max: number;
  default: number;
  get: () => number;
  set: (v: number) => void;
}

function r(obj: Record<string, number>, key: string, min: number, max: number): DevRange {
  return {
    min,
    max,
    default: obj[key],
    get: () => obj[key],
    set: (v: number) => { obj[key] = v; },
  };
}

export const devRanges: Record<string, Record<string, DevRange>> = {
  trail: {
    sizePct: r(theme.trail, "sizePct", 0.1, 1.5),
    alpha: r(theme.trail, "alpha", 0, 0.5),
    fadeMs: r(theme.trail, "fadeMs", 50, 800),
    squash: r(theme.trail, "squash", 0.1, 1.0),
  },
  speedLines: {
    alpha: r(theme.speedLines, "alpha", 0, 1),
    width: r(theme.speedLines, "width", 0.5, 5),
    lengthMin: r(theme.speedLines, "lengthMin", 2, 40),
    lengthMax: r(theme.speedLines, "lengthMax", 10, 100),
    fadeMs: r(theme.speedLines, "fadeMs", 50, 600),
    spreadRadius: r(theme.speedLines, "spreadRadius", 5, 80),
  },
};

export const devRangeLabels: Record<string, Record<string, string>> = {
  trail: {
    sizePct: "Size",
    alpha: "Alpha",
    fadeMs: "Fade",
    squash: "Squash",
  },
  speedLines: {
    alpha: "Alpha",
    width: "Width",
    lengthMin: "Len Min",
    lengthMax: "Len Max",
    fadeMs: "Fade",
    spreadRadius: "Spread",
  },
};
