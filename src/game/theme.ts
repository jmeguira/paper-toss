// ---------------------------------------------------------------------------
// Theme system — every visual constant in one swappable object.
// Game code imports from here, never hardcodes colors/fonts/alphas inline.
// To re-skin the game: duplicate this file, change the values, swap the import.
// ---------------------------------------------------------------------------

export interface Theme {
  /** Juice palette — shared tier colors used across feedback, particles, etc. */
  juice: {
    perfect: string;   // gold (CSS)
    good: string;      // teal (CSS)
    bad: string;       // pink (CSS)
    perfectHex: number;
    goodHex: number;
    badHex: number;
  };

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

  /** Impact ring config — shared shape for ball and target rings */
  impactRing: {
    ball: {
      radius: number;
      lineWidth: number;
      scaleBase: number;
      scaleCeiling: number;
      alphaBase: number;
      alphaCeiling: number;
      durationMs: number;
    };
    target: {
      lineWidth: number;      // radius comes from target rim at runtime
      scaleBase: number;
      scaleCeiling: number;
      alphaBase: number;
      alphaCeiling: number;
      durationMs: number;
    };
  };

  /** Camera effects on landing — per-tier ceilings, scaled by juice intensity */
  cameraFx: Record<string, {
    zoomPunch: number;      // 0 = no zoom, >0 = max zoom offset at full juice
    shakeIntensity: number; // 0 = no shake, >0 = max shake at full juice
    shakeDuration: number;
  }>;

  /** Landing feedback text — per-tier visual + timing config */
  feedback: Record<string, {
    color: string;
    punchScale: number;   // 1.0 = no punch, >1.0 = scale punch on appear
    holdMs: number;       // time at full alpha before fade
    fadeMs: number;       // fade-out duration
  }>;

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
  juice: {
    perfect: "#ffcc44",
    good: "#44ddcc",
    bad: "#DD459B",
    perfectHex: 0xffcc44,
    goodHex: 0x44ddcc,
    badHex: 0xDD459B,
  },

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

  impactRing: {
    ball: {
      radius: 8,
      lineWidth: 2,
      scaleBase: 1.3,
      scaleCeiling: 2.0,
      alphaBase: 0.3,
      alphaCeiling: 0.8,
      durationMs: 350,
    },
    target: {
      lineWidth: 2,
      scaleBase: 1.1,
      scaleCeiling: 1.5,
      alphaBase: 0.3,
      alphaCeiling: 0.7,
      durationMs: 400,
    },
  },

  cameraFx: {
    PERFECT:   { zoomPunch: 0.015, shakeIntensity: 0,     shakeDuration: 0 },
    HIT:       { zoomPunch: 0.010, shakeIntensity: 0,     shakeDuration: 0 },
    NEAR_HIT:  { zoomPunch: 0.006, shakeIntensity: 0.004, shakeDuration: 120 },
    NEAR_MISS: { zoomPunch: 0,     shakeIntensity: 0.012, shakeDuration: 120 },
    MISS:      { zoomPunch: 0,     shakeIntensity: 0.008, shakeDuration: 120 },
  },

  feedback: {
    PERFECT:   { color: "#ffcc44", punchScale: 1.5, holdMs: 400, fadeMs: 150 },
    HIT:       { color: "#44ddcc", punchScale: 1.0, holdMs: 400, fadeMs: 150 },
    NEAR_HIT:  { color: "#44ddcc", punchScale: 1.0, holdMs: 400, fadeMs: 150 },
    NEAR_MISS: { color: "#DD459B", punchScale: 1.0, holdMs: 400, fadeMs: 150 },
    MISS:      { color: "#DD459B", punchScale: 1.0, holdMs: 400, fadeMs: 150 },
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

// ---------------------------------------------------------------------------
// Typographic scale — three tiers, clamped for readability across screens.
// Call once per scene with screen height, use the result for all text.
// ---------------------------------------------------------------------------

export interface TypeScale {
  heading: number;  // titles, score feedback, play button
  body: number;     // HUD text, settings items, labels
  caption: number;  // wind value, dev buttons, nav icons, fine print
}

export function typeScale(screenHeight: number): TypeScale {
  const clamp = (min: number, val: number, max: number) =>
    Math.round(Math.max(min, Math.min(max, val)));
  return {
    heading: clamp(20, screenHeight * 0.032, 32),
    body: clamp(12, screenHeight * 0.020, 20),
    caption: clamp(10, screenHeight * 0.014, 16),
  };
}
