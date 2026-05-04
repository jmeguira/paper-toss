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
    neutral: string;   // off-white (CSS) — resting state for target, scores, HUD text
    perfectHex: number;
    goodHex: number;
    badHex: number;
    neutralHex: number;
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
    base: number;           // flat fill color
  };

  /** Flight visual effects — weight scaling and fade */
  flightWeight: {
    launchBump: number;       // brief scale grow on launch (1.0 = none)
    accreteBase: number;      // min landing weight at streak 0
    accreteCeiling: number;   // max landing weight at full juice
    fadeStart: number;        // linear progress (0–1) where ball starts fading
  };

  /** Target rings */
  target: {
    primary: number;        // ring stroke + fill
    fillAlpha: number;      // inner fill opacity
    rimWidth: number;
    squash: number;         // Y scale multiplier — <1 = ellipse wider than tall
    channel: {
      length: number;       // how far the guide lines extend (in target-radius units)
      spread: number;       // end width as fraction of rim width (<1 = narrows)
      bgColor: number;      // opaque backdrop to obscure grid/wall
      bgAlpha: number;
      strokeScale: number;  // line/rim width as fraction of target rimWidth
      alphaScale: number;   // stroke alpha as fraction of target rim alpha (1.0)
      vortexRings: number;  // number of depth rings inside the channel
      vortexAlpha: number;  // starting alpha for topmost vortex ring (fades deeper)
      vortexWidth: number;  // stroke width for vortex rings
    };
  };

  /** Speed lines — velocity-oriented streaks behind ball during flight */
  speedLines: {
    color: number;
    alpha: number;          // base alpha at full speed + full juice
    width: number;          // stroke width
    minSpeed: number;       // screen-px/frame below which no lines spawn
    maxSpeed: number;       // speed at which intensity saturates
    countMin: number;       // lines per frame at minimum
    countMax: number;       // lines per frame at max speed + juice
    lengthMin: number;      // line length at low speed (px, before scale)
    lengthMax: number;      // line length at max speed
    spreadRadius: number;   // max perpendicular offset from center (px, before scale)
    spawnBehind: number;    // how far behind the ball lines originate (px, before scale)
    fadeMs: number;         // per-line fade duration
    maxActive: number;      // hard cap on live line objects
  };

  /** Wind particles — visible dots during flight showing wind direction */
  windParticles: {
    color: number;
    speedMin: number;         // screen px/s drift at minimum wind
    speedMax: number;         // screen px/s drift at maximum wind
    speedSpread: number;      // ±fraction variation around base speed
    countMin: number;
    countMax: number;
    radiusMin: number;
    radiusMax: number;
    alphaMin: number;
    alphaMax: number;
    largeChance: number;      // fraction that are chunky variants
    largeRadiusMult: number;
    largeAlphaMult: number;
    spawnMargin: number;      // px past screen edge for spawn/despawn
    fadeOutSpeed: number;     // 1/s fade rate after flight ends
    crossFade: number;        // alpha drop across screen (0 = none, 1 = full)
  };

  /** Flight trail — afterimage ghosts during flight */
  trail: {
    color: number;
    alpha: number;          // ghost fill alpha
    count: number;          // ring buffer size
    sizePct: number;        // ghost radius as fraction of BALL_RADIUS
    squash: number;         // Y scale multiplier (<1 = ellipse)
    fadeMs: number;         // per-ghost fade duration
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

  /** Glitch effect on miss — chromatic aberration + scan-line fracture */
  glitch: {
    durationBase: number;       // total window at low juice (ms)
    durationCeiling: number;    // total window at full juice (ms)
    staggerPct: number;         // max slice delay as fraction of duration
    chromatic: {
      offsetCeiling: number;    // max horizontal px shift per RGB channel
      alphaCeiling: number;
    };
    slices: {
      count: number;
      hMinPct: number;          // min slice height (fraction of screen)
      hMaxPct: number;          // max slice height
      offsetCeiling: number;    // max horizontal px shift
      alphaCeiling: number;
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
    settingsPanel: {
      widthPct: number;       // fraction of screen width
      heightPct: number;      // fraction of screen height
      buttonWidthPct: number; // fraction of panel width
      // Spacing as multipliers of caption font size
      slotPadMult: number;    // padding added to caption for row slot height
      tabBarPadMult: number;  // padding added to caption for tab bar height
      innerPadMult: number;   // panel inner vertical padding
      headerPadMult: number;  // extra space above category headers
      tabGapMult: number;     // distance between tab button centers
      slider: {
        labelPct: number;     // label width as fraction of button width
        gapMult: number;      // gap between label and track
        trackHMult: number;   // track height
        handleRMult: number;  // handle radius
      };
    };
  };
}

// ---------------------------------------------------------------------------
// Default theme — bioluminescent deep-ocean palette.
// Teal/cyan world, warm orange player elements. Soft glow, not neon.
// ---------------------------------------------------------------------------

// Hex-to-CSS converter — define each color once as a number, derive strings.
const css = (hex: number) => `#${hex.toString(16).padStart(6, "0")}`;

// Raw palette — single source of truth for every color in the theme.
const GOLD    = 0xffcc44;  // perfect / reward
const TEAL    = 0x44ddcc;  // good / environment
const PINK    = 0xdd459b;  // bad / error
const NEUTRAL = 0xddd8cc;  // resting state — target, scores, HUD text
const ORANGE  = 0xe8884a;  // player — ball, throw arrow, GO button
const GRID    = 0x2a8888;  // muted teal — grid lines, borders
const VOID    = 0x0a0a1e;  // near-black canvas / sky top
const DEEP    = 0x0f1a2a;  // deep ocean — sky bottom / panels
const WIND_C  = 0xcccccc;  // wind arrow — neutral gray
const BLACK   = 0x000000;
const PANEL   = 0x0d1520;  // wall panel bg — slightly lighter than canvas
const DIM_TEAL_1 = "#778888"; // muted teal-gray (secondary text)
const DIM_TEAL_2 = "#556666"; // subtle (dim text)
const BTN_BG     = "#1a4444"; // dark teal button
const BTN_HOVER  = "#1a444488";
const BTN_MUTED  = "#00000066";
const BTN_TOGGLE = "#1a3a3a88";

export const defaultTheme: Theme = {
  juice: {
    perfect: css(GOLD),
    good: css(TEAL),
    bad: css(PINK),
    neutral: css(NEUTRAL),
    perfectHex: GOLD,
    goodHex: TEAL,
    badHex: PINK,
    neutralHex: NEUTRAL,
  },

  canvas: css(VOID),

  sky: {
    top: VOID,
    bottom: DEEP,
  },

  horizon: {
    color: GRID,
    alpha: 0.2,
    heightPct: 0.06,
  },

  ground: {
    lineColor: GRID,
    alphaFar: 0.06,
    alphaNear: 0.3,
  },

  ball: {
    base: ORANGE,
  },

  flightWeight: {
    launchBump: 1.12,
    accreteBase: 1.1,
    accreteCeiling: 1.8,
    fadeStart: 0.92,
  },

  target: {
    primary: NEUTRAL,
    fillAlpha: 0.25,
    rimWidth: 30,
    squash: 0.4,
    channel: {
      length: 1.2,
      spread: 0.6,
      bgColor: VOID,
      bgAlpha: 1.0,
      strokeScale: 0.5,
      alphaScale: 0.4,
      vortexRings: 5,
      vortexAlpha: 0.5,
      vortexWidth: 2,
    },
  },

  speedLines: {
    color: ORANGE,
    alpha: 0.7,
    width: 2,
    minSpeed: 2,          // lower threshold — lines appear sooner
    maxSpeed: 20,         // saturates earlier for more intensity
    countMin: 2,
    countMax: 8,
    lengthMin: 12,
    lengthMax: 55,
    spreadRadius: 35,
    spawnBehind: 12,
    fadeMs: 220,
    maxActive: 120,
  },

  windParticles: {
    color: GRID,
    speedMin: 60,
    speedMax: 280,
    speedSpread: 0.35,
    countMin: 60,
    countMax: 180,
    radiusMin: 1,
    radiusMax: 2.5,
    alphaMin: 0.3,
    alphaMax: 0.65,
    largeChance: 0.12,
    largeRadiusMult: 1.8,
    largeAlphaMult: 1.3,
    spawnMargin: 50,
    fadeOutSpeed: 2.5,
    crossFade: 0.75,
  },

  trail: {
    color: ORANGE,
    alpha: 0.1,
    count: 60,
    sizePct: 0.8,
    squash: 0.4,
    fadeMs: 250,
  },

  angleBounds: {
    color: TEAL,
    alpha: 0.06,
  },

  throwAngle: {
    color: ORANGE,
    alpha: 0.5,
    width: 2,
  },

  angleIndicator: {
    arcColor: TEAL,
    arcAlpha: 0.12,
    needleColor: ORANGE,
    needleAlpha: 0.8,
  },

  wind: {
    arrowColor: WIND_C,
    arrowWidth: 3,
    label: {
      color: css(WIND_C),
      stroke: css(BLACK),
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

  glitch: {
    durationBase: 140,
    durationCeiling: 260,
    staggerPct: 0.5,
    chromatic: {
      offsetCeiling: 14,
      alphaCeiling: 0.3,
    },
    slices: {
      count: 12,
      hMinPct: 0.005,
      hMaxPct: 0.08,
      offsetCeiling: 12,
      alphaCeiling: 0.2,
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
    PERFECT:   { color: css(GOLD), punchScale: 1.5, holdMs: 400, fadeMs: 150 },
    HIT:       { color: css(TEAL), punchScale: 1.0, holdMs: 400, fadeMs: 150 },
    NEAR_HIT:  { color: css(TEAL), punchScale: 1.0, holdMs: 400, fadeMs: 150 },
    NEAR_MISS: { color: css(PINK), punchScale: 1.0, holdMs: 400, fadeMs: 150 },
    MISS:      { color: css(PINK), punchScale: 1.0, holdMs: 400, fadeMs: 150 },
  },

  zones: {
    perfect:  { fill: GOLD, alpha: 0.4 },
    hit:      { fill: TEAL, alpha: 0.25, edge: TEAL, edgeAlpha: 0.4 },
    nearHit:  { fill: TEAL, alpha: 0.12, edge: TEAL, edgeAlpha: 0.2 },
    nearMiss: { fill: ORANGE, alpha: 0.15, edge: ORANGE, edgeAlpha: 0.3 },
    miss:     { fill: 0xff4444, alpha: 0.06 },
    buffer:   { fill: 0x4488aa, alpha: 0.12 },
  },

  wallPanel: {
    bg: PANEL,
    bgAlpha: 1,
    border: GRID,
    borderAlpha: 0.4,
    borderWidth: 1,
    text: {
      color: css(NEUTRAL),
      stroke: css(BLACK),
      strokeThickness: 2,
    },
    feedbackZone: {
      border: GRID,
      borderAlpha: 0.15,
    },
  },

  ui: {
    fontFamily: "monospace",
    text: {
      primary: css(NEUTRAL),
      secondary: DIM_TEAL_1,
      dim: DIM_TEAL_2,
      accent: css(TEAL),
    },
    score: {
      fontSize: "48px",
      stroke: css(BLACK),
      strokeThickness: 4,
    },
    button: {
      bg: BTN_BG,
      bgHover: BTN_HOVER,
      bgMuted: BTN_MUTED,
      bgToggle: BTN_TOGGLE,
    },
    panel: {
      bg: DEEP,
      bgAlpha: 0.95,
    },
    overlay: {
      backdropColor: BLACK,
      backdropAlpha: 0.6,
    },
    goButton: {
      color: ORANGE,
    },
    devButton: {
      color: css(TEAL),
      bg: BTN_MUTED,
    },
    settingsPanel: {
      widthPct: 0.8,
      heightPct: 0.70,
      buttonWidthPct: 0.85,
      slotPadMult: 2.0,
      tabBarPadMult: 2.55,
      innerPadMult: 1.45,
      headerPadMult: 0.9,
      tabGapMult: 5.45,
      slider: {
        labelPct: 0.25,
        gapMult: 1.1,
        trackHMult: 0.36,
        handleRMult: 0.9,
      },
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
