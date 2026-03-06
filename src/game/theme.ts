// ---------------------------------------------------------------------------
// Theme system — every visual constant in one swappable object.
// Game code imports from here, never hardcodes colors/fonts/alphas inline.
// To re-skin the game: duplicate this file, change the values, swap the import.
// ---------------------------------------------------------------------------

export interface Theme {
  /** Canvas fallback color (Phaser backgroundColor) */
  canvas: string;

  /** Sky gradient (top → bottom) — used by GameScene background */
  sky: { top: number; bottom: number };

  /** Faint glow band at the horizon */
  horizon: {
    color: number;
    alpha: number;
    heightPct: number;       // fraction of screen height
  };

  /** Perspective ground plane */
  ground: {
    lineColor: number;
    alphaFar: number;        // alpha at vanishing point (faintest)
    alphaNear: number;       // alpha at bottom of screen (most visible)
  };

  /** Projectile (the ball) */
  ball: {
    base: number;           // flat fill (current), becomes body color in sphere step
    highlight: number;      // upper-left highlight (sphere step)
    shadow: number;         // lower-right shadow (sphere step)
    glow: number;           // soft outer glow
    glowAlpha: number;
  };

  /** Target rings */
  target: {
    primary: number;        // ring stroke + fill
    fillAlpha: number;      // inner fill opacity
    ringWidth: number;
  };

  /** Flight trail (step 4) */
  trail: {
    color: number;
    alpha: number;
    count: number;          // ring buffer size
  };

  /** Angle bounds cone lines */
  angleBounds: {
    color: number;
    alpha: number;
  };

  /** Post-throw angle arrow */
  throwAngle: {
    color: number;
    alpha: number;
    width: number;
  };

  /** Mechanical mode angle indicator */
  angleIndicator: {
    arcColor: number;
    arcAlpha: number;
    needleColor: number;
    needleAlpha: number;
  };

  /** Wind indicator (arrow + label) */
  wind: {
    arrowColor: number;
    arrowWidth: number;
    label: {
      color: string;
      stroke: string;
      strokeThickness: number;
    };
  };

  /** Dev zone overlay colors */
  zones: {
    perfect:  { fill: number; alpha: number };
    hit:      { fill: number; alpha: number; edge: number; edgeAlpha: number };
    nearHit:  { fill: number; alpha: number; edge: number; edgeAlpha: number };
    nearMiss: { fill: number; alpha: number; edge: number; edgeAlpha: number };
    miss:     { fill: number; alpha: number };
    buffer:   { fill: number; alpha: number };
  };

  /** UI styling — fonts, text, buttons, panels */
  ui: {
    fontFamily: string;
    text: {
      primary: string;      // main text (white)
      secondary: string;    // subtitles, scores label
      dim: string;          // muted elements (hamburger, close btn)
      accent: string;       // colored text (difficulty label, dev btn)
    };
    score: {
      fontSize: string;
      stroke: string;
      strokeThickness: number;
    };
    button: {
      bg: string;           // primary button background
      bgHover: string;      // selected/active state
      bgMuted: string;      // dark transparent background
      bgToggle: string;     // toggle button background
    };
    panel: {
      bg: number;           // overlay panel fill
      bgAlpha: number;
    };
    overlay: {
      backdropColor: number;
      backdropAlpha: number;
    };
    goButton: {
      color: number;        // mechanical GO button fill
    };
    devButton: {
      color: string;        // perfect throw button text
      bg: string;
    };
  };
}

// ---------------------------------------------------------------------------
// Default theme — warm dusk palette.
// ---------------------------------------------------------------------------

export const defaultTheme: Theme = {
  canvas: "#0d0d2b",

  sky: {
    top: 0x0d0d2b,          // deep indigo
    bottom: 0x2a1a3e,       // dusty warm purple
  },

  horizon: {
    color: 0x6b4c8a,        // soft lavender glow
    alpha: 0.25,
    heightPct: 0.06,
  },

  ground: {
    lineColor: 0x5a4a7a,    // warm purple-gray
    alphaFar: 0.08,
    alphaNear: 0.35,
  },

  ball: {
    base: 0xf5f5f5,
    highlight: 0xffffff,     // unused until sphere step
    shadow: 0xaaaaaa,        // unused until sphere step
    glow: 0xf5f5f5,          // unused until sphere step
    glowAlpha: 0.15,         // unused until sphere step
  },

  target: {
    primary: 0xff4444,
    fillAlpha: 0.4,
    ringWidth: 4,
  },

  trail: {
    color: 0xf5f5f5,
    alpha: 0.3,
    count: 12,
  },

  angleBounds: {
    color: 0xffffff,
    alpha: 0.08,
  },

  throwAngle: {
    color: 0xffffff,
    alpha: 0.45,
    width: 2,
  },

  angleIndicator: {
    arcColor: 0xffffff,
    arcAlpha: 0.15,
    needleColor: 0x44ff44,
    needleAlpha: 0.8,
  },

  wind: {
    arrowColor: 0xffffff,
    arrowWidth: 3,
    label: {
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
    },
  },

  zones: {
    perfect:  { fill: 0xffdd44, alpha: 0.4 },
    hit:      { fill: 0x00ff88, alpha: 0.25, edge: 0x00ff88, edgeAlpha: 0.4 },
    nearHit:  { fill: 0x00ff88, alpha: 0.14, edge: 0x00ff88, edgeAlpha: 0.25 },
    nearMiss: { fill: 0xff6644, alpha: 0.18, edge: 0xff6644, edgeAlpha: 0.35 },
    miss:     { fill: 0xff4444, alpha: 0.08 },
    buffer:   { fill: 0x4488ff, alpha: 0.15 },
  },

  ui: {
    fontFamily: "monospace",
    text: {
      primary: "#ffffff",
      secondary: "#888888",
      dim: "#888888",
      accent: "#aaaaff",
    },
    score: {
      fontSize: "48px",
      stroke: "#000000",
      strokeThickness: 4,
    },
    button: {
      bg: "#4444aa",
      bgHover: "#4444aa88",
      bgMuted: "#00000066",
      bgToggle: "#66666688",
    },
    panel: {
      bg: 0x2a2a4e,
      bgAlpha: 1,
    },
    overlay: {
      backdropColor: 0x000000,
      backdropAlpha: 0.5,
    },
    goButton: {
      color: 0x44aa44,
    },
    devButton: {
      color: "#00ff88",
      bg: "#00000066",
    },
  },
};

// Active theme — the single import point for all game code.
// Future: this could be swapped at runtime or driven by a selector.
export const theme = defaultTheme;
