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
    rimWidth: number;
    squash: number;         // Y scale multiplier — <1 = ellipse wider than tall
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

  /** Wall-mounted info panel */
  wallPanel: {
    bg: number;
    bgAlpha: number;
    border: number;
    borderAlpha: number;
    borderWidth: number;
    text: {
      color: string;
      stroke: string;
      strokeThickness: number;
    };
    label: {
      color: string;          // "streak:", "best:" prefix color
    };
    feedbackZone: {
      border: number;
      borderAlpha: number;
    };
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
// Default theme — bioluminescent deep-ocean palette.
// Teal/cyan world, warm orange player elements. Soft glow, not neon.
// ---------------------------------------------------------------------------

export const defaultTheme: Theme = {
  canvas: "#0a0a1e",

  sky: {
    top: 0x0a0a1e,           // near-black with blue undertone
    bottom: 0x0f1a2a,        // deep ocean blue-black
  },

  horizon: {
    color: 0x2a8888,         // soft teal glow
    alpha: 0.2,
    heightPct: 0.06,
  },

  ground: {
    lineColor: 0x2a8888,     // teal grid — bioluminescent skeleton
    alphaFar: 0.06,
    alphaNear: 0.3,
  },

  ball: {
    base: 0xe8884a,          // warm amber-orange
    highlight: 0xffbb77,     // bright highlight (sphere step)
    shadow: 0x994422,        // deep warm shadow (sphere step)
    glow: 0xe8884a,          // orange glow (sphere step)
    glowAlpha: 0.12,
  },

  target: {
    primary: 0x44ddcc,       // cyan-teal — "destination"
    fillAlpha: 0.25,
    rimWidth: 30,
    squash: 0.4,
  },

  trail: {
    color: 0xe8884a,         // matches ball
    alpha: 0.25,
    count: 12,
  },

  angleBounds: {
    color: 0x44ddcc,         // teal, part of the world
    alpha: 0.06,
  },

  throwAngle: {
    color: 0xe8884a,         // orange — "your" color
    alpha: 0.5,
    width: 2,
  },

  angleIndicator: {
    arcColor: 0x44ddcc,      // teal arc
    arcAlpha: 0.12,
    needleColor: 0xe8884a,   // orange needle — player's indicator
    needleAlpha: 0.8,
  },

  wind: {
    arrowColor: 0xcccccc,    // neutral — not teal or orange
    arrowWidth: 3,
    label: {
      color: "#cccccc",
      stroke: "#000000",
      strokeThickness: 3,
    },
  },

  zones: {
    perfect:  { fill: 0xffcc44, alpha: 0.4 },
    hit:      { fill: 0x44ddcc, alpha: 0.25, edge: 0x44ddcc, edgeAlpha: 0.4 },
    nearHit:  { fill: 0x44ddcc, alpha: 0.12, edge: 0x44ddcc, edgeAlpha: 0.2 },
    nearMiss: { fill: 0xe8884a, alpha: 0.15, edge: 0xe8884a, edgeAlpha: 0.3 },
    miss:     { fill: 0xff4444, alpha: 0.06 },
    buffer:   { fill: 0x4488aa, alpha: 0.12 },
  },

  wallPanel: {
    bg: 0x0d1520,              // slightly lighter than canvas
    bgAlpha: 1,
    border: 0x2a8888,          // teal, matches grid
    borderAlpha: 0.4,
    borderWidth: 1,
    text: {
      color: "#e0e0e0",        // uniform — same as ui.text.primary
      stroke: "#000000",
      strokeThickness: 2,
    },
    label: {
      color: "#778888",        // muted prefix labels
    },
    feedbackZone: {
      border: 0x2a8888,
      borderAlpha: 0.15,
    },
  },

  ui: {
    fontFamily: "monospace",
    text: {
      primary: "#e0e0e0",    // soft white — not harsh pure white
      secondary: "#778888",  // muted teal-gray
      dim: "#556666",        // subtle
      accent: "#44ddcc",     // teal accent
    },
    score: {
      fontSize: "48px",
      stroke: "#000000",
      strokeThickness: 4,
    },
    button: {
      bg: "#1a4444",         // dark teal
      bgHover: "#1a444488",
      bgMuted: "#00000066",
      bgToggle: "#1a3a3a88",
    },
    panel: {
      bg: 0x0f1a2a,          // matches sky bottom
      bgAlpha: 0.95,
    },
    overlay: {
      backdropColor: 0x000000,
      backdropAlpha: 0.6,
    },
    goButton: {
      color: 0xe8884a,       // orange — player action
    },
    devButton: {
      color: "#44ddcc",
      bg: "#00000066",
    },
  },
};

// Active theme — the single import point for all game code.
// Future: this could be swapped at runtime or driven by a selector.
export const theme = defaultTheme;
