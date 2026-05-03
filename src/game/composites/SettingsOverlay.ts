import Phaser from "phaser";
import { InputModeType, SwipeModeType } from "../types";
import { Depth, DEV_MODE } from "../constants";
import { theme, typeScale } from "../theme";
import { juiceFlags, juiceFlagLabels, juiceOverride } from "../systems/juiceFlags";

// Sub-layers within the OVERLAY tier
const BG = Depth.OVERLAY;
const PANEL_BG = Depth.OVERLAY + 1;
const SCROLL_ZONE = Depth.OVERLAY + 2;   // catches scroll drags that miss buttons
const CONTENT = Depth.OVERLAY + 3;        // buttons + headers live here
const CHROME = Depth.OVERLAY + 4;         // tab bar, close btn (always on top)


type Tab = "settings" | "dev";

/** A positioned row inside a scroll container — text, button, or slider. */
interface Row {
  obj: Phaser.GameObjects.Text | Phaser.GameObjects.Container;
  height: number;   // slot height for this row
}

export class SettingsOverlay {
  private scene: Phaser.Scene;
  private backdrop!: Phaser.GameObjects.Rectangle;
  private panel!: Phaser.GameObjects.Rectangle;
  private closeBtn!: Phaser.GameObjects.Text;
  private settingsTabBtn!: Phaser.GameObjects.Text;
  private devTabBtn: Phaser.GameObjects.Text | null = null;
  private activeTab: Tab = "settings";

  // Per-tab scroll containers + rows
  private settingsContainer!: Phaser.GameObjects.Container;
  private devContainer!: Phaser.GameObjects.Container;
  private settingsRows: Row[] = [];
  private devRows: Row[] = [];
  private scrollZone!: Phaser.GameObjects.Rectangle;

  // Scroll state
  private scrollY = 0;
  private maxScroll = 0;
  private visibleH = 0;

  // Interactive state
  private currentMode: InputModeType;
  private currentSwipeMode: SwipeModeType = "instant";
  private devEnabled = true;
  private flagBtns: { key: keyof typeof juiceFlags; btn: Phaser.GameObjects.Text }[] = [];
  private jiSliderLabel!: Phaser.GameObjects.Text;
  private jiSliderHandle!: Phaser.GameObjects.Graphics;
  private jiSliderTrackX = 0;
  private jiSliderTrackW = 0;
  private jiSliderContainer!: Phaser.GameObjects.Container;

  // Layout cache
  private cx: number;
  private panelW: number;
  private panelH: number;
  private panelTop: number;
  private contentTop: number;
  private btnW: number;
  private ts: ReturnType<typeof typeScale>;
  private slotH: number;
  private headerSlotH: number;

  // Mask for content clipping
  private maskGfx!: Phaser.GameObjects.Graphics;
  private _mask?: Phaser.Display.Masks.GeometryMask;

  onModeChange: ((mode: InputModeType) => void) | null = null;
  onSwipeModeChange: ((mode: SwipeModeType) => void) | null = null;
  onDevToggle: ((enabled: boolean) => void) | null = null;
  onBackToMenu: (() => void) | null = null;

  constructor(scene: Phaser.Scene, initialMode: InputModeType) {
    this.scene = scene;
    this.currentMode = initialMode;
    const { width, height } = scene.scale;
    const sp = theme.ui.settingsPanel;
    this.ts = typeScale(height);
    const cap = this.ts.caption;
    this.cx = width / 2;
    this.panelW = Math.round(width * sp.widthPct);
    this.panelH = Math.round(height * sp.heightPct);
    this.panelTop = Math.round((height - this.panelH) / 2);
    this.btnW = Math.round(this.panelW * sp.buttonWidthPct);
    this.slotH = Math.round(cap + cap * sp.slotPadMult);
    this.headerSlotH = Math.round(this.slotH + cap * sp.headerPadMult);

    const tabBarH = Math.round(cap + cap * sp.tabBarPadMult);
    const padY = Math.round(cap * sp.innerPadMult);
    this.contentTop = this.panelTop + padY + tabBarH;
    this.visibleH = this.panelH - padY - tabBarH - padY;

    this.buildChrome(width, height, tabBarH, padY);
    this.buildMask();
    this.buildScrollZone();

    this.settingsContainer = scene.add.container(0, 0).setDepth(CONTENT);
    this.devContainer = scene.add.container(0, 0).setDepth(CONTENT);

    this.buildSettingsTab();
    if (DEV_MODE) this.buildDevTab();

    this.hide();
  }

  // ---------------------------------------------------------------------------
  // Chrome — backdrop, panel, tabs, close
  // ---------------------------------------------------------------------------

  private buildChrome(w: number, h: number, tabBarH: number, padY: number): void {
    this.backdrop = this.scene.add
      .rectangle(0, 0, w, h, theme.ui.overlay.backdropColor, theme.ui.overlay.backdropAlpha)
      .setOrigin(0).setDepth(BG).setInteractive();
    this.backdrop.on("pointerdown", () => this.hide());

    this.panel = this.scene.add
      .rectangle(this.cx, this.panelTop + this.panelH / 2, this.panelW, this.panelH,
        theme.ui.panel.bg, theme.ui.panel.bgAlpha)
      .setDepth(PANEL_BG).setInteractive(); // absorbs taps

    this.closeBtn = this.scene.add
      .text(this.cx + this.panelW / 2 - 12, this.panelTop + 8, "\u2715", {
        fontFamily: theme.ui.fontFamily,
        fontSize: `${this.ts.body}px`,
        color: theme.ui.text.dim,
      })
      .setOrigin(1, 0).setDepth(CHROME)
      .setInteractive({ useHandCursor: true });
    this.closeBtn.on("pointerdown", () => this.hide());

    const tabY = this.panelTop + padY + tabBarH / 2;
    const tabStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: theme.ui.fontFamily,
      fontSize: `${this.ts.caption}px`,
      color: theme.ui.text.dim,
      padding: { x: 20, y: 8 },
    };

    this.settingsTabBtn = this.scene.add
      .text(0, tabY, "SETTINGS", tabStyle)
      .setOrigin(0.5).setDepth(CHROME)
      .setInteractive({ useHandCursor: true });
    this.settingsTabBtn.on("pointerdown", () => this.switchTab("settings"));

    if (DEV_MODE) {
      this.devTabBtn = this.scene.add
        .text(0, tabY, "DEV", tabStyle)
        .setOrigin(0.5).setDepth(CHROME)
        .setInteractive({ useHandCursor: true });
      this.devTabBtn.on("pointerdown", () => this.switchTab("dev"));

      const tabGap = Math.round(this.ts.caption * theme.ui.settingsPanel.tabGapMult);
      this.settingsTabBtn.setX(this.cx - tabGap);
      this.devTabBtn.setX(this.cx + tabGap);
    } else {
      this.settingsTabBtn.setX(this.cx);
    }
  }

  // ---------------------------------------------------------------------------
  // Mask — clips content to the visible panel area
  // ---------------------------------------------------------------------------

  private buildMask(): void {
    this.maskGfx = this.scene.add.graphics();
    this.maskGfx.fillStyle(0xffffff);
    this.maskGfx.fillRect(
      this.cx - this.panelW / 2, this.contentTop,
      this.panelW, this.visibleH,
    );
    const mask = this.maskGfx.createGeometryMask();
    // Applied to containers in buildSettingsTab / buildDevTab
    this.settingsContainer?.setMask(mask);
    this.devContainer?.setMask(mask);
    // Store for later application
    this._mask = mask;
  }

  // ---------------------------------------------------------------------------
  // Scroll zone — transparent rect between panel and content depths
  // ---------------------------------------------------------------------------

  private buildScrollZone(): void {
    this.scrollZone = this.scene.add
      .rectangle(
        this.cx, this.contentTop + this.visibleH / 2,
        this.panelW, this.visibleH, 0x000000, 0,
      )
      .setDepth(SCROLL_ZONE)
      .setInteractive({ draggable: true });

    this.scene.input.setDraggable(this.scrollZone);

    let dragStartY = 0;
    let scrollAtStart = 0;

    this.scrollZone.on("dragstart", (_p: Phaser.Input.Pointer, _dx: number, _dy: number) => {
      dragStartY = _p.y;
      scrollAtStart = this.scrollY;
    });

    this.scrollZone.on("drag", (_p: Phaser.Input.Pointer) => {
      const deltaY = _p.y - dragStartY;
      this.setScroll(scrollAtStart - deltaY);
    });

    // Wheel scroll (desktop)
    this.scene.input.on("wheel", (_p: Phaser.Input.Pointer, _gos: unknown, _dx: number, dy: number) => {
      if (!this.backdrop.visible) return;
      this.setScroll(this.scrollY + dy * 0.5);
    });
  }

  private setScroll(y: number): void {
    this.scrollY = Phaser.Math.Clamp(y, 0, this.maxScroll);
    const container = this.activeTab === "settings" ? this.settingsContainer : this.devContainer;
    container.setY(-this.scrollY);
    this.updateInteractivity();
  }

  /** Disable input on rows scrolled out of the visible area. */
  private updateInteractivity(): void {
    const rows = this.activeTab === "settings" ? this.settingsRows : this.devRows;
    for (const row of rows) {
      const worldY = row.obj.y - this.scrollY;
      const visible = worldY > -row.height && worldY < this.visibleH + row.height;
      if (row.obj instanceof Phaser.GameObjects.Text) {
        row.obj.setActive(visible);
      } else if (row.obj instanceof Phaser.GameObjects.Container) {
        row.obj.setActive(visible);
        // Also toggle children interactivity
        row.obj.iterate((child: Phaser.GameObjects.GameObject) => {
          child.setActive(visible);
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Settings tab
  // ---------------------------------------------------------------------------

  private buildSettingsTab(): void {
    const c = this.settingsContainer;
    if (this._mask) c.setMask(this._mask);

    this.addHeader(c, this.settingsRows, "Input");
    const modeBtn = this.addToggle(c, this.settingsRows, this.modeLabel());
    modeBtn.on("pointerdown", () => {
      this.currentMode = this.currentMode === "swipe" ? "mechanical" : "swipe";
      modeBtn.setText(this.modeLabel());
      this.onModeChange?.(this.currentMode);
    });

    const swipeBtn = this.addToggle(c, this.settingsRows, this.swipeModeLabel());
    swipeBtn.on("pointerdown", () => {
      this.currentSwipeMode = this.currentSwipeMode === "instant" ? "aim" : "instant";
      swipeBtn.setText(this.swipeModeLabel());
      this.onSwipeModeChange?.(this.currentSwipeMode);
    });

    this.addHeader(c, this.settingsRows, "");  // spacer

    const menuBtn = this.scene.add
      .text(this.cx, 0, "Back to Menu", {
        fontFamily: theme.ui.fontFamily,
        fontSize: `${this.ts.caption}px`,
        color: theme.ui.text.primary,
        backgroundColor: theme.ui.button.bg,
        padding: { x: 14, y: 8 },
        fixedWidth: this.btnW,
        align: "center",
      })
      .setOrigin(0.5).setDepth(CONTENT)
      .setInteractive({ useHandCursor: true });
    menuBtn.on("pointerdown", () => this.onBackToMenu?.());
    c.add(menuBtn);
    this.settingsRows.push({ obj: menuBtn, height: this.slotH });

    this.layoutRows(this.settingsRows);
  }

  // ---------------------------------------------------------------------------
  // Dev tab
  // ---------------------------------------------------------------------------

  private buildDevTab(): void {
    const c = this.devContainer;
    if (this._mask) c.setMask(this._mask);

    // --- General ---
    this.addHeader(c, this.devRows, "General");

    const devBtn = this.addToggle(c, this.devRows, this.devLabel());
    devBtn.on("pointerdown", () => {
      this.devEnabled = !this.devEnabled;
      devBtn.setText(this.devLabel());
      this.onDevToggle?.(this.devEnabled);
    });

    const jiBtn = this.addToggle(c, this.devRows, this.jiOverrideLabel());
    jiBtn.on("pointerdown", () => {
      juiceOverride.enabled = !juiceOverride.enabled;
      jiBtn.setText(this.jiOverrideLabel());
      this.updateSliderVisuals();
    });

    this.jiSliderContainer = this.buildJiSlider();
    c.add(this.jiSliderContainer);
    this.devRows.push({ obj: this.jiSliderContainer, height: this.slotH });

    // --- Particles & Trail ---
    this.addHeader(c, this.devRows, "Particles & Trail");
    this.addFlagToggle(c, "windParticles");
    this.addFlagToggle(c, "speedLines");
    this.addFlagToggle(c, "flightTrail");
    this.addFlagToggle(c, "impactRings");

    // --- Camera & Screen ---
    this.addHeader(c, this.devRows, "Camera & Screen");
    this.addFlagToggle(c, "cameraFx");
    this.addFlagToggle(c, "glitch");
    this.addFlagToggle(c, "flightWeight");
    this.addFlagToggle(c, "ballFade");

    // --- HUD & Feedback ---
    this.addHeader(c, this.devRows, "HUD & Feedback");
    this.addFlagToggle(c, "scorePop");
    this.addFlagToggle(c, "feedbackText");
    this.addFlagToggle(c, "targetReaction");

    this.layoutRows(this.devRows);
  }

  // ---------------------------------------------------------------------------
  // Row builders
  // ---------------------------------------------------------------------------

  private addHeader(
    container: Phaser.GameObjects.Container,
    rows: Row[],
    label: string,
  ): void {
    const leftX = this.cx - this.btnW / 2;
    const text = this.scene.add
      .text(leftX, 0, label, {
        fontFamily: theme.ui.fontFamily,
        fontSize: `${this.ts.caption}px`,
        color: theme.ui.text.dim,
      })
      .setOrigin(0, 0.5).setDepth(CONTENT);
    container.add(text);
    rows.push({ obj: text, height: this.headerSlotH });
  }

  private addToggle(
    container: Phaser.GameObjects.Container,
    rows: Row[],
    label: string,
  ): Phaser.GameObjects.Text {
    const btn = this.scene.add
      .text(this.cx, 0, label, {
        fontFamily: theme.ui.fontFamily,
        fontSize: `${this.ts.caption}px`,
        color: theme.ui.text.primary,
        backgroundColor: theme.ui.button.bgToggle,
        padding: { x: 14, y: 8 },
        fixedWidth: this.btnW,
        align: "center",
      })
      .setOrigin(0.5).setDepth(CONTENT)
      .setInteractive({ useHandCursor: true });
    container.add(btn);
    rows.push({ obj: btn, height: this.slotH });
    return btn;
  }

  private addFlagToggle(
    container: Phaser.GameObjects.Container,
    key: keyof typeof juiceFlags,
  ): void {
    const btn = this.addToggle(container, this.devRows, this.flagLabel(key));
    btn.on("pointerdown", () => {
      juiceFlags[key] = !juiceFlags[key];
      btn.setText(this.flagLabel(key));
    });
    this.flagBtns.push({ key, btn });
  }

  /** Position all rows sequentially within their container. */
  private layoutRows(rows: Row[]): void {
    let y = 0;
    for (const row of rows) {
      y += row.height / 2;
      row.obj.setY(this.contentTop + y);
      y += row.height / 2;
    }
  }

  // ---------------------------------------------------------------------------
  // JI slider
  // ---------------------------------------------------------------------------

  private buildJiSlider(): Phaser.GameObjects.Container {
    const sl = theme.ui.settingsPanel.slider;
    const cap = this.ts.caption;
    const innerW = this.btnW;
    const labelW = Math.round(innerW * sl.labelPct);
    const gap = Math.round(cap * sl.gapMult);
    const trackW = innerW - labelW - gap;
    const trackH = Math.round(cap * sl.trackHMult);
    const handleR = Math.round(cap * sl.handleRMult);
    const leftX = -innerW / 2;

    const container = this.scene.add.container(this.cx, 0);
    container.setDepth(CONTENT);

    // Value label (left portion)
    this.jiSliderLabel = this.scene.add
      .text(leftX, 0, this.jiValueLabel(), {
        fontFamily: theme.ui.fontFamily,
        fontSize: `${this.ts.caption}px`,
        color: theme.ui.text.primary,
      })
      .setOrigin(0, 0.5);
    container.add(this.jiSliderLabel);

    // Track (right portion)
    const trackX = leftX + labelW + gap;
    this.jiSliderTrackX = trackX;
    this.jiSliderTrackW = trackW;

    const track = this.scene.add.graphics();
    track.fillStyle(theme.ui.panel.bg, 1);
    track.lineStyle(1, theme.juice.neutralHex, 0.3);
    track.fillRoundedRect(trackX, -trackH / 2, trackW, trackH, 2);
    track.strokeRoundedRect(trackX, -trackH / 2, trackW, trackH, 2);
    container.add(track);

    // Handle
    const handleX = trackX + juiceOverride.value * trackW;
    this.jiSliderHandle = this.scene.add.graphics();
    this.jiSliderHandle.fillStyle(theme.juice.goodHex, 1);
    this.jiSliderHandle.fillCircle(0, 0, handleR);
    this.jiSliderHandle.setPosition(handleX, 0);
    container.add(this.jiSliderHandle);

    // Hit zone for drag + tap
    const hitZone = this.scene.add
      .rectangle(trackX + trackW / 2, 0, trackW + handleR * 2, handleR * 4, 0x000000, 0)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true, draggable: true });
    container.add(hitZone);
    this.scene.input.setDraggable(hitZone);

    hitZone.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number) => {
      this.setJiFromX(Phaser.Math.Clamp(dragX, trackX, trackX + trackW));
    });

    hitZone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const localX = pointer.x - this.cx;
      this.setJiFromX(Phaser.Math.Clamp(localX, trackX, trackX + trackW));
    });

    return container;
  }

  private setJiFromX(x: number): void {
    this.jiSliderHandle.setX(x);
    juiceOverride.value = (x - this.jiSliderTrackX) / this.jiSliderTrackW;
    this.jiSliderLabel.setText(this.jiValueLabel());
  }

  private updateSliderVisuals(): void {
    this.jiSliderContainer.setAlpha(juiceOverride.enabled ? 1 : 0.35);
  }

  // ---------------------------------------------------------------------------
  // Show / hide / tab switching
  // ---------------------------------------------------------------------------

  show(): void {
    this.setChromeVisible(true);
    this.switchTab(this.activeTab);
  }

  hide(): void {
    this.setChromeVisible(false);
    this.settingsContainer.setVisible(false).setActive(false);
    this.devContainer.setVisible(false).setActive(false);
    this.scrollZone.setVisible(false).setActive(false);
  }

  private switchTab(tab: Tab): void {
    this.activeTab = tab;
    const isSettings = tab === "settings";

    // Container visibility
    this.settingsContainer.setVisible(isSettings).setActive(isSettings);
    this.devContainer.setVisible(!isSettings).setActive(!isSettings);

    // Tab styling
    this.settingsTabBtn.setColor(isSettings ? theme.ui.text.primary : theme.ui.text.dim);
    this.devTabBtn?.setColor(!isSettings ? theme.ui.text.primary : theme.ui.text.dim);

    // Update labels
    for (const { key, btn } of this.flagBtns) btn.setText(this.flagLabel(key));
    if (!isSettings) this.updateSliderVisuals();

    // Reset scroll
    const rows = isSettings ? this.settingsRows : this.devRows;
    const contentH = rows.reduce((sum, r) => sum + r.height, 0);
    this.maxScroll = Math.max(0, contentH - this.visibleH);
    this.setScroll(0);

    this.scrollZone.setVisible(true).setActive(true);
  }

  private setChromeVisible(v: boolean): void {
    this.backdrop.setVisible(v).setActive(v);
    this.panel.setVisible(v).setActive(v);
    this.closeBtn.setVisible(v).setActive(v);
    this.settingsTabBtn.setVisible(v).setActive(v);
    this.devTabBtn?.setVisible(v).setActive(v);
    this.maskGfx.setVisible(v);
  }

  // ---------------------------------------------------------------------------
  // Label helpers
  // ---------------------------------------------------------------------------

  private modeLabel(): string {
    return `Mode: ${this.currentMode === "swipe" ? "Swipe" : "Mechanical"}`;
  }

  private swipeModeLabel(): string {
    return `Throw: ${this.currentSwipeMode === "instant" ? "Instant" : "Aim & Fire"}`;
  }

  private devLabel(): string {
    return `Dev Overlay: ${this.devEnabled ? "On" : "Off"}`;
  }

  private jiOverrideLabel(): string {
    return `JI Override: ${juiceOverride.enabled ? "On" : "Off"}`;
  }

  private jiValueLabel(): string {
    return `JI ${juiceOverride.value.toFixed(2)}`;
  }

  private flagLabel(key: keyof typeof juiceFlags): string {
    return `${juiceFlagLabels[key]}: ${juiceFlags[key] ? "On" : "Off"}`;
  }
}
