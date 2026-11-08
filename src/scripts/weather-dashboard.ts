/**
 * weather-dashboard.ts — Atmospheric Weather Telemetry Engine (Overlay Modal)
 *
 * Capabilities:
 * - Overlay Modal Controller: Opens via WEATHER HUD footer button, closes via ESC, backdrop, or close button.
 * - Dynamic Liquid Glass Lighting: Real-time cursor tracking and ambient specular sheen on cards.
 * - Hyper-Realistic Animated ASCII Doppler Radar: Live 60 FPS ASCII atmospheric fluid visualizer with
 *   colorful thermal heat waves, precipitation reflectivity radar, and aerodynamic wind streamline vectors.
 * - Drag and Drop Reordering: Re-arrange cards in grid with live swap and persistent order caching.
 * - Pin/Unpin Modules: Keep priority telemetry pinned at top.
 * - Live Atmospheric Telemetry: Open-Meteo API integration with client geolocation.
 * - High-Contrast Neo-Brutalist Layout: Ample font sizes (12px–15px body, 52px hero temp) for effortless readability.
 * - Zero Emoji Policy: Pure SVG vector icons.
 */

export interface HourlyForecastItem {
  time: string;
  temp: number;
  icon: string;
  precipPct: number;
  windSpeed: number;
}

export interface DailyForecastItem {
  day: string;
  icon: string;
  min: number;
  max: number;
  precipPct?: number;
}

export interface WeatherTelemetryState {
  city: string;
  temp: number;
  condition: string;
  high: number;
  low: number;
  feelsLike: number;
  windSpeed: number;
  windDirection: number;
  windDirText: string;
  windGusts: number;
  humidity: number;
  dewPoint: number;
  pressure: number;
  uvIndex: number;
  uvCategory: string;
  aqi: number;
  aqiCategory: string;
  sunrise: string;
  sunset: string;
  moonIllum: number;
  moonPhase: string;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}

const DEFAULT_WEATHER_STATE: WeatherTelemetryState = {
  city: 'Bengaluru',
  temp: 25,
  condition: 'Partly Cloudy',
  high: 29,
  low: 19,
  feelsLike: 25,
  windSpeed: 7,
  windDirection: 207,
  windDirText: '207° SSW',
  windGusts: 14,
  humidity: 48,
  dewPoint: 13,
  pressure: 758,
  uvIndex: 8,
  uvCategory: 'VERY HIGH',
  aqi: 136,
  aqiCategory: 'MODERATE',
  sunrise: '06:12',
  sunset: '17:53',
  moonIllum: 85,
  moonPhase: 'Waning Gibbous',
  hourly: [
    { time: 'Now', temp: 25, icon: 'partly-cloudy', precipPct: 0, windSpeed: 7 },
    { time: '19', temp: 24, icon: 'clear-night', precipPct: 0, windSpeed: 6 },
    { time: '20', temp: 23, icon: 'clear-night', precipPct: 0, windSpeed: 6 },
    { time: '21', temp: 23, icon: 'clear-night', precipPct: 0, windSpeed: 7 },
    { time: '22', temp: 23, icon: 'clear-night', precipPct: 0, windSpeed: 7 },
    { time: '23', temp: 22, icon: 'clear-night', precipPct: 5, windSpeed: 8 },
    { time: '00', temp: 21, icon: 'clear-night', precipPct: 5, windSpeed: 8 },
    { time: '01', temp: 20, icon: 'clear-night', precipPct: 5, windSpeed: 7 },
    { time: '02', temp: 19, icon: 'clear-night', precipPct: 10, windSpeed: 6 },
    { time: '03', temp: 19, icon: 'cloudy', precipPct: 10, windSpeed: 6 },
    { time: '04', temp: 18, icon: 'cloudy', precipPct: 10, windSpeed: 5 },
    { time: '05', temp: 18, icon: 'cloudy', precipPct: 10, windSpeed: 5 },
  ],
  daily: [
    { day: 'Today', icon: 'partly-cloudy', min: 19, max: 29, precipPct: 10 },
    { day: 'Fri', icon: 'cloudy', min: 17, max: 29, precipPct: 15 },
    { day: 'Sat', icon: 'sunny', min: 18, max: 30, precipPct: 0 },
    { day: 'Sun', icon: 'rain', min: 20, max: 29, precipPct: 40 },
    { day: 'Mon', icon: 'rain', min: 19, max: 28, precipPct: 60 },
    { day: 'Tue', icon: 'rain', min: 20, max: 27, precipPct: 65 },
    { day: 'Wed', icon: 'rain', min: 19, max: 27, precipPct: 60 },
  ],
};

interface WindParticle {
  x: number;
  y: number;
  speed: number;
  len: number;
  hue: number;
}

export class WeatherDashboardController {
  private modal: HTMLElement | null = null;
  private modalCard: HTMLElement | null = null;
  private rail: HTMLElement | null = null;
  private state: WeatherTelemetryState = { ...DEFAULT_WEATHER_STATE };
  private isOpen: boolean = false;
  private activeHourlyMode: 'temp' | 'rain' | 'wind' = 'temp';

  // Persistence caches
  private pinnedCards: Set<string> = new Set();
  private cardOrder: string[] = [];

  // Dynamic Liquid Glass Lighting state
  private shineFrameId: number | null = null;
  private lightX = 0;
  private lightY = 0;
  private targetLightX = 0;
  private targetLightY = 0;
  private isPointerInside = false;
  private orbitAngle = 0;

  // Hyper-Realistic Animated ASCII Doppler Radar state
  private asciiCanvas: HTMLCanvasElement | null = null;
  private asciiCtx: CanvasRenderingContext2D | null = null;
  private asciiFrameId: number | null = null;
  private radarSweepAngle: number = 0;
  private readonly radarSweepSpeed: number = 0.024;
  private radarMouseX: number = -100;
  private radarMouseY: number = -100;
  private windStreamlines: WindParticle[] = [];
  private lastFpsTime: number = 0;
  private frameCount: number = 0;
  private currentFps: number = 60;

  constructor() {
    this.loadCachedPreferences();
    this.initDOM();
    this.initDynamicLiquidGlass();
    this.initAsciiRadar();
    this.fetchLiveTelemetry();
  }

  private loadCachedPreferences(): void {
    try {
      const storedPinned = localStorage.getItem('weather_card_pinned');
      if (storedPinned) {
        this.pinnedCards = new Set(JSON.parse(storedPinned));
      }

      const storedOrder = localStorage.getItem('weather_card_order');
      if (storedOrder) {
        this.cardOrder = JSON.parse(storedOrder);
      }
    } catch {
      this.pinnedCards = new Set();
      this.cardOrder = [];
    }
  }

  public onPageLoad(): void {
    this.initDOM();
    this.initAsciiRadar();
    this.applyVisibility();
    this.applyCachedOrder();
    this.renderTelemetry();
  }

  public initDOM(): void {
    this.modal = document.getElementById('weatherDashboardModal');
    this.modalCard = document.getElementById('weatherModalCard');
    this.rail = document.getElementById('weatherCardsRail');
    this.bindDOM();
    this.applyVisibility();
  }

  private bindDOM(): void {
    this.updateMasterSwitchUI();

    // Bottom status bar master toggle
    const toggleSwitch = document.getElementById('weatherHudToggle');
    const handleSwitch = (e: Event) => {
      e.stopPropagation();
      this.toggleModal();
    };

    if (toggleSwitch && toggleSwitch.dataset.weatherBound !== 'true') {
      toggleSwitch.dataset.weatherBound = 'true';
      toggleSwitch.addEventListener('click', handleSwitch);
    }

    // Modal Close Button
    const closeBtn = document.getElementById('weatherModalClose');
    if (closeBtn && closeBtn.dataset.closeBound !== 'true') {
      closeBtn.dataset.closeBound = 'true';
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeModal();
      });
    }

    // Backdrop click to close (when clicking outside the modal card)
    if (this.modal && this.modal.dataset.backdropBound !== 'true') {
      this.modal.dataset.backdropBound = 'true';
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });
    }

    // Keyboard ESC key listener
    if (typeof window !== 'undefined' && !window.__weatherEscBound) {
      window.__weatherEscBound = true;
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeModal();
        }
      });
    }

    // Reset Layout Button
    const resetBtn = document.getElementById('weatherResetLayoutBtn');
    if (resetBtn && resetBtn.dataset.resetBound !== 'true') {
      resetBtn.dataset.resetBound = 'true';
      resetBtn.addEventListener('click', () => this.resetLayout());
    }

    // Hourly tabs
    const condTabs = document.querySelectorAll<HTMLButtonElement>('.weather-cond-tab');
    condTabs.forEach((tab) => {
      if (tab.dataset.tabBound !== 'true') {
        tab.dataset.tabBound = 'true';
        tab.addEventListener('click', () => {
          const mode = tab.getAttribute('data-tab') as 'temp' | 'rain' | 'wind';
          if (mode) this.setHourlyMode(mode);
        });
      }
    });

    // Card Pin buttons
    const pinBtns = document.querySelectorAll<HTMLButtonElement>('.widget-pin-btn');
    pinBtns.forEach((btn) => {
      if (btn.dataset.pinBound !== 'true') {
        btn.dataset.pinBound = 'true';
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const card = btn.closest<HTMLElement>('.weather-card');
          if (card && card.id) {
            this.togglePin(card.id);
          }
        });
      }
    });

    this.bindDragAndDrop();
  }

  // ── Modal Visibility ──────────────────────────────────────────
  public openModal(): void {
    this.isOpen = true;
    this.applyVisibility();
    this.updateMasterSwitchUI();
    this.startAsciiRadar();
  }

  public closeModal(): void {
    this.isOpen = false;
    this.applyVisibility();
    this.updateMasterSwitchUI();
    this.stopAsciiRadar();
  }

  public toggleModal(): void {
    if (this.isOpen) {
      this.closeModal();
    } else {
      this.openModal();
    }
  }

  public updateMasterSwitchUI(): void {
    const toggleSwitch = document.getElementById('weatherHudToggle');
    const status = document.getElementById('weatherHudStatus');

    if (toggleSwitch) {
      toggleSwitch.classList.toggle('is-active', this.isOpen);
      toggleSwitch.setAttribute('aria-checked', this.isOpen ? 'true' : 'false');
    }
    if (status) {
      status.textContent = this.isOpen ? 'OPEN' : 'OFF';
    }
  }

  private applyVisibility(): void {
    if (!this.modal) return;
    this.modal.classList.toggle('is-open', this.isOpen);
    this.modal.setAttribute('aria-hidden', this.isOpen ? 'false' : 'true');

    if (this.isOpen) {
      document.body.classList.add('weather-modal-open');
      this.startAsciiRadar();
    } else {
      document.body.classList.remove('weather-modal-open');
      this.stopAsciiRadar();
    }
  }

  // ── Drag & Drop Customization ──────────────────────────────────
  private bindDragAndDrop(): void {
    const cards = document.querySelectorAll<HTMLElement>('.weather-card');
    cards.forEach((card) => {
      card.addEventListener('dragstart', (e) => {
        card.classList.add('is-dragging');
        if (e.dataTransfer) {
          e.dataTransfer.setData('text/plain', card.id);
          e.dataTransfer.effectAllowed = 'move';
        }
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('is-dragging');
        document.querySelectorAll('.weather-card').forEach((c) => {
          c.classList.remove('drag-over-top', 'drag-over-bottom');
        });
        this.saveCardOrder();
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        const rect = card.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          card.classList.add('drag-over-top');
          card.classList.remove('drag-over-bottom');
        } else {
          card.classList.add('drag-over-bottom');
          card.classList.remove('drag-over-top');
        }
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over-top', 'drag-over-bottom');
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over-top', 'drag-over-bottom');
        const draggedId = e.dataTransfer?.getData('text/plain');
        if (!draggedId || draggedId === card.id) return;

        const draggedEl = document.getElementById(draggedId);
        const parent = card.parentElement;
        if (!draggedEl || !parent) return;

        const rect = card.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          parent.insertBefore(draggedEl, card);
        } else {
          parent.insertBefore(draggedEl, card.nextSibling);
        }

        this.saveCardOrder();
      });
    });
  }

  private saveCardOrder(): void {
    if (!this.rail) return;
    const cards = this.rail.querySelectorAll<HTMLElement>('.weather-card');
    this.cardOrder = Array.from(cards).map((c) => c.id);
    try {
      localStorage.setItem('weather_card_order', JSON.stringify(this.cardOrder));
    } catch {}
  }

  private applyCachedOrder(): void {
    if (!this.rail || this.cardOrder.length === 0) return;
    this.cardOrder.forEach((id) => {
      const card = document.getElementById(id);
      if (card && this.rail) {
        this.rail.appendChild(card);
      }
    });

    this.pinnedCards.forEach((id) => {
      const card = document.getElementById(id);
      if (card) {
        card.classList.add('is-pinned');
        const pinBtn = card.querySelector<HTMLElement>('.widget-pin-btn');
        if (pinBtn) pinBtn.classList.add('active');
      }
    });
  }

  private togglePin(cardId: string): void {
    const card = document.getElementById(cardId);
    if (!card) return;

    const isPinned = this.pinnedCards.has(cardId);
    if (isPinned) {
      this.pinnedCards.delete(cardId);
      card.classList.remove('is-pinned');
    } else {
      this.pinnedCards.add(cardId);
      card.classList.add('is-pinned');
      if (this.rail && this.rail.firstElementChild) {
        this.rail.insertBefore(card, this.rail.firstElementChild);
      }
    }

    const pinBtn = card.querySelector<HTMLElement>('.widget-pin-btn');
    if (pinBtn) pinBtn.classList.toggle('active', !isPinned);

    try {
      localStorage.setItem('weather_card_pinned', JSON.stringify(Array.from(this.pinnedCards)));
    } catch {}

    this.saveCardOrder();
  }

  public resetLayout(): void {
    try {
      localStorage.removeItem('weather_card_order');
      localStorage.removeItem('weather_card_pinned');
    } catch {}

    this.pinnedCards.clear();
    this.cardOrder = [];

    const defaultIds = [
      'card-current',
      'card-hourly',
      'card-forecast',
      'card-atmosphere',
      'card-solar-lunar',
      'card-air-uv',
    ];

    if (this.rail) {
      defaultIds.forEach((id) => {
        const card = document.getElementById(id);
        if (card) {
          card.classList.remove('is-pinned');
          const pinBtn = card.querySelector<HTMLElement>('.widget-pin-btn');
          if (pinBtn) pinBtn.classList.remove('active');
          this.rail?.appendChild(card);
        }
      });
    }
  }

  // ── Dynamic Liquid Glass Lighting Engine ──────────────────────
  private initDynamicLiquidGlass(): void {
    this.targetLightX = window.innerWidth * 0.5;
    this.targetLightY = window.innerHeight * 0.4;
    this.lightX = this.targetLightX;
    this.lightY = this.targetLightY;

    window.addEventListener(
      'pointermove',
      (e) => {
        this.targetLightX = e.clientX;
        this.targetLightY = e.clientY;
        this.isPointerInside = true;
      },
      { passive: true },
    );

    window.addEventListener('pointerleave', () => {
      this.isPointerInside = false;
    });

    const updateLights = () => {
      if (!this.isPointerInside) {
        // Dynamic ambient light source orbit
        this.orbitAngle += 0.016;
        const radius = 220;
        const cx = window.innerWidth * 0.5;
        const cy = window.innerHeight * 0.4;
        this.targetLightX = cx + Math.cos(this.orbitAngle) * radius;
        this.targetLightY = cy + Math.sin(this.orbitAngle * 0.8) * (radius * 0.7);
      }

      // Smooth dampening
      this.lightX += (this.targetLightX - this.lightX) * 0.12;
      this.lightY += (this.targetLightY - this.lightY) * 0.12;

      const cards = document.querySelectorAll<HTMLElement>('.weather-card');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardX = this.lightX - rect.left;
        const cardY = this.lightY - rect.top;

        card.style.setProperty('--light-x', `${cardX.toFixed(1)}px`);
        card.style.setProperty('--light-y', `${cardY.toFixed(1)}px`);
      });

      this.shineFrameId = requestAnimationFrame(updateLights);
    };

    if (this.shineFrameId === null) {
      this.shineFrameId = requestAnimationFrame(updateLights);
    }
  }

  // ── Hyper-Realistic Animated ASCII Doppler Radar Engine ──────
  private initAsciiRadar(): void {
    this.asciiCanvas = document.getElementById('asciiRadarCanvas') as HTMLCanvasElement | null;
    if (!this.asciiCanvas) return;

    this.asciiCtx = this.asciiCanvas.getContext('2d');

    // Generate streamline wind particles
    this.windStreamlines = [];
    for (let i = 0; i < 44; i++) {
      this.windStreamlines.push({
        x: Math.random() * 60,
        y: Math.random() * 14,
        speed: 0.35 + Math.random() * 0.55,
        len: 3 + Math.floor(Math.random() * 5),
        hue: Math.random(),
      });
    }

    const updateCanvasSize = () => {
      if (!this.asciiCanvas) return;
      const rect = this.asciiCanvas.getBoundingClientRect();
      if (rect.width > 40) {
        this.asciiCanvas.width = Math.floor(rect.width);
        this.asciiCanvas.height = Math.floor(rect.height || 135);
      }
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize, { passive: true });

    // Interactive cursor radar wave disturbance
    this.asciiCanvas.addEventListener('mousemove', (e) => {
      const rect = this.asciiCanvas!.getBoundingClientRect();
      this.radarMouseX = e.clientX - rect.left;
      this.radarMouseY = e.clientY - rect.top;
    });
    this.asciiCanvas.addEventListener('mouseleave', () => {
      this.radarMouseX = -100;
      this.radarMouseY = -100;
    });

    if (this.isOpen) {
      this.startAsciiRadar();
    }
  }

  private startAsciiRadar(): void {
    if (this.asciiFrameId !== null) return;
    const animate = (timestamp: number) => {
      this.renderAsciiRadar(timestamp);
      this.asciiFrameId = requestAnimationFrame(animate);
    };
    this.asciiFrameId = requestAnimationFrame(animate);
  }

  private stopAsciiRadar(): void {
    if (this.asciiFrameId !== null) {
      cancelAnimationFrame(this.asciiFrameId);
      this.asciiFrameId = null;
    }
  }

  private renderAsciiRadar(timestamp: number): void {
    if (!this.asciiCanvas || !this.asciiCtx) return;
    const ctx = this.asciiCtx;
    const canvas = this.asciiCanvas;

    // Track FPS
    this.frameCount++;
    if (timestamp - this.lastFpsTime >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsTime));
      this.frameCount = 0;
      this.lastFpsTime = timestamp;
      const fpsEl = document.getElementById('asciiRadarFps');
      if (fpsEl) fpsEl.textContent = `${this.currentFps} FPS`;
    }

    const width = canvas.width;
    const height = canvas.height;

    // Deep dark phosphor terminal background
    ctx.fillStyle = '#06090e';
    ctx.fillRect(0, 0, width, height);

    // Dynamic grid dimensions
    const charW = 8;
    const charH = 11;
    const cols = Math.floor(width / charW);
    const rows = Math.floor(height / charH);

    const centerX = cols / 2;
    const centerY = rows / 2;

    this.radarSweepAngle = (this.radarSweepAngle + this.radarSweepSpeed) % (Math.PI * 2);
    const azimuthDeg = Math.round((this.radarSweepAngle * 180) / Math.PI);
    const azimuthEl = document.getElementById('asciiRadarAzimuth');
    if (azimuthEl) {
      azimuthEl.textContent = `AZ: ${azimuthDeg.toString().padStart(3, '0')}°`;
    }

    ctx.font = '700 9.5px "JetBrains Mono", ui-monospace, Menlo, Monaco, monospace';
    ctx.textBaseline = 'top';

    const time = timestamp * 0.001;
    const GLYPHS = [' ', '·', ':', '+', 'x', '*', '#', '%', '@', '█'];

    if (this.activeHourlyMode === 'temp') {
      // ════════════════════════════════════════════════════════════
      // THERMAL FLUID SPECTRUM (Hyper-Realistic Neon Gradient)
      // ════════════════════════════════════════════════════════════
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const dx = c - centerX;
          const dy = (r - centerY) * 1.5;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const cellAngle = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2);

          // Angle distance to sweep beam
          const angleDiff = (this.radarSweepAngle - cellAngle + Math.PI * 2) % (Math.PI * 2);
          const sweepGlow = Math.exp(-angleDiff * 3.6);

          // Multi-harmonic thermal fluid simulation
          const fluid =
            Math.sin(c * 0.12 + time * 1.8) * 0.32 +
            Math.cos(r * 0.22 - time * 1.3) * 0.26 +
            Math.sin((c + r) * 0.09 + time * 1.5) * 0.24 +
            Math.cos(dist * 0.16 - time * 2.1) * 0.18;

          let val = 0.5 + fluid * 0.5;

          // Interactive cursor heat disturbance
          if (this.radarMouseX >= 0) {
            const mdx = c * charW - this.radarMouseX;
            const mdy = r * charH - this.radarMouseY;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < 75) {
              val += (1 - mdist / 75) * 0.45 * Math.sin(mdist * 0.3 - time * 8);
            }
          }

          val = Math.min(Math.max(val + sweepGlow * 0.32, 0), 1);
          const glyphIdx = Math.floor(val * (GLYPHS.length - 1));
          const char = GLYPHS[glyphIdx];
          if (char === ' ') continue;

          // Hyper-Realistic Vivid Thermal Palette:
          // Cyan (#00f5ff) -> Electric Blue (#3b82f6) -> Bright Gold (#ffb700) -> Plasma Orange (#ff5500) -> Infrared Magenta (#ff007f)
          let col = '#00f5ff';
          if (val > 0.84) col = '#ff007f';
          else if (val > 0.68) col = '#ff4500';
          else if (val > 0.52) col = '#ffb700';
          else if (val > 0.35) col = '#38bdf8';
          else col = '#3b82f6';

          ctx.fillStyle = col;
          ctx.shadowColor = col;
          ctx.shadowBlur = val > 0.7 ? 6 : 0;
          ctx.fillText(char, c * charW, r * charH);
        }
      }
    } else if (this.activeHourlyMode === 'rain') {
      // ════════════════════════════════════════════════════════════
      // DOPPLER PRECIPITATION REFLECTIVITY RADAR
      // ════════════════════════════════════════════════════════════
      const stormCells = [
        {
          x: centerX - 12 + Math.cos(time * 0.6) * 4,
          y: centerY - 2 + Math.sin(time * 0.5) * 3,
          intensity: 0.95,
        },
        {
          x: centerX + 14 + Math.sin(time * 0.4) * 5,
          y: centerY + 2 + Math.cos(time * 0.7) * 2,
          intensity: 0.75,
        },
        {
          x: centerX - 4 + Math.cos(time * 0.3) * 6,
          y: centerY + 4 + Math.sin(time * 0.8) * 3,
          intensity: 0.85,
        },
      ];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const dx = c - centerX;
          const dy = (r - centerY) * 1.5;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const cellAngle = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2);

          const angleDiff = (this.radarSweepAngle - cellAngle + Math.PI * 2) % (Math.PI * 2);
          const sweepGlow = Math.exp(-angleDiff * 4.2);

          let rainVal = 0;
          for (const cell of stormCells) {
            const cdx = c - cell.x;
            const cdy = r - cell.y;
            const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
            if (cdist < 14) {
              const falloff = 1 - cdist / 14;
              rainVal += falloff * falloff * cell.intensity;
            }
          }

          const noise =
            (Math.sin(c * 0.4 + r * 0.3 + time * 3) + Math.cos(c * 0.2 - r * 0.5 - time * 2)) *
            0.14;
          const val = Math.min(Math.max(rainVal + noise + sweepGlow * 0.38, 0), 1);

          // Range rings
          const isRing =
            Math.abs(dist - 10) < 0.6 || Math.abs(dist - 20) < 0.6 || Math.abs(dist - 30) < 0.6;
          if (isRing && val < 0.2) {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.shadowBlur = 0;
            ctx.fillText('·', c * charW, r * charH);
            continue;
          }

          const glyphIdx = Math.floor(val * (GLYPHS.length - 1));
          const char = GLYPHS[glyphIdx];
          if (char === ' ') continue;

          // Doppler Precipitation Scale:
          // Cyan (#06b6d4) -> Emerald (#10b981) -> Yellow (#facc15) -> Crimson (#ef4444) -> Hail Purple (#d946ef)
          let col = '#10b981';
          if (val > 0.85) col = '#d946ef';
          else if (val > 0.68) col = '#ef4444';
          else if (val > 0.48) col = '#facc15';
          else if (val > 0.28) col = '#22c55e';
          else col = '#06b6d4';

          ctx.fillStyle = col;
          ctx.shadowColor = col;
          ctx.shadowBlur = val > 0.6 ? 5 : 0;
          ctx.fillText(char, c * charW, r * charH);
        }
      }
    } else {
      // ════════════════════════════════════════════════════════════
      // AERODYNAMIC VECTOR STREAMLINES (Wind Field)
      // ════════════════════════════════════════════════════════════
      for (const p of this.windStreamlines) {
        p.x += p.speed;
        if (p.x > cols) {
          p.x = 0;
          p.y = Math.random() * rows;
        }

        const waveY = p.y + Math.sin(p.x * 0.15 + time * 2) * 1.5;
        const c = Math.floor(p.x);
        const r = Math.floor(waveY);
        if (c >= 0 && c < cols && r >= 0 && r < rows) {
          for (let l = 0; l < p.len; l++) {
            const tc = c - l;
            if (tc >= 0 && tc < cols) {
              const col = l === 0 ? '#ffffff' : p.hue > 0.5 ? '#38bdf8' : '#4ade80';
              ctx.fillStyle = col;
              ctx.shadowColor = col;
              ctx.shadowBlur = l === 0 ? 8 : 2;
              const ch = l === 0 ? '>' : l === 1 ? '=' : '-';
              ctx.fillText(ch, tc * charW, r * charH);
            }
          }
        }
      }
    }

    ctx.shadowBlur = 0;
  }

  // ── Hourly Mode Switch ─────────────────────────────────────────
  public setHourlyMode(mode: 'temp' | 'rain' | 'wind'): void {
    this.activeHourlyMode = mode;
    const tabs = document.querySelectorAll<HTMLButtonElement>('.weather-cond-tab');
    tabs.forEach((tab) => {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === mode);
    });

    const modeLabel = document.getElementById('asciiRadarModeLabel');
    const metricRange = document.getElementById('asciiMetricRange');
    const metricReflectivity = document.getElementById('asciiMetricReflectivity');
    const metricTurbulence = document.getElementById('asciiMetricTurbulence');
    const metricCells = document.getElementById('asciiMetricCells');

    if (mode === 'temp') {
      if (modeLabel) modeLabel.textContent = 'ASCII RADAR // THERMAL FLUID SPECTRUM';
      if (metricRange) metricRange.textContent = 'RANGE: 160 KM';
      if (metricReflectivity) metricReflectivity.textContent = 'SENSOR: INFRARED [IR]';
      if (metricTurbulence) metricTurbulence.textContent = 'TURBULENCE: NOMINAL';
      if (metricCells) metricCells.textContent = '4 THERMAL CELLS';
    } else if (mode === 'rain') {
      if (modeLabel) modeLabel.textContent = 'DOPPLER RADAR // PRECIPITATION REFLECTIVITY';
      if (metricRange) metricRange.textContent = 'RANGE: 120 KM';
      if (metricReflectivity) metricReflectivity.textContent = 'REFLECTIVITY: 46 dBZ';
      if (metricTurbulence) metricTurbulence.textContent = 'VORTICITY: 0.12 s⁻¹';
      if (metricCells) metricCells.textContent = '6 RAIN CELLS ACTIVE';
    } else if (mode === 'wind') {
      if (modeLabel) modeLabel.textContent = 'AERODYNAMIC RADAR // VECTOR STREAMLINES';
      if (metricRange) metricRange.textContent = 'RANGE: 200 KM';
      if (metricReflectivity) metricReflectivity.textContent = 'VELOCITY: 18 m/s';
      if (metricTurbulence) metricTurbulence.textContent = 'SHEAR: 4.2 kts';
      if (metricCells) metricCells.textContent = 'VORTEX: STABLE';
    }

    this.renderHourlyRail();
  }

  // ── Telemetry Fetch & Parsing ──────────────────────────────────
  private async fetchLiveTelemetry(): Promise<void> {
    try {
      let lat = 12.9716;
      let lon = 77.5946;
      let city = 'Bengaluru';

      const savedLat = parseFloat(localStorage.getItem('client_geo_lat') || '');
      const savedLon = parseFloat(localStorage.getItem('client_geo_lon') || '');
      const savedCity = localStorage.getItem('client_geo_city');

      if (!isNaN(savedLat) && !isNaN(savedLon)) {
        lat = savedLat;
        lon = savedLon;
      }
      if (savedCity) {
        city = savedCity;
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      this.parseOpenMeteoData(city, data);
      this.renderTelemetry();
    } catch {
      // Retain crisp baseline fallback
      this.renderTelemetry();
    }
  }

  private parseOpenMeteoData(city: string, data: any): void {
    const cur = data.current || {};
    const dly = data.daily || {};
    const hly = data.hourly || {};

    const code = cur.weather_code ?? 2;
    const condInfo = this.getWeatherInfoByCode(code);

    const temp = Math.round(cur.temperature_2m ?? 25);
    const feelsLike = Math.round(cur.apparent_temperature ?? temp);
    const high = Math.round(dly.temperature_2m_max?.[0] ?? temp + 4);
    const low = Math.round(dly.temperature_2m_min?.[0] ?? temp - 6);
    const windSpeed = Math.round(cur.wind_speed_10m ?? 7);
    const windDirection = Math.round(cur.wind_direction_10m ?? 207);
    const windGusts = Math.round(cur.wind_gusts_10m ?? 14);
    const humidity = Math.round(cur.relative_humidity_2m ?? 48);
    const pressure = Math.round((cur.surface_pressure ?? 1010) * 0.750062);
    const uv = Math.round(dly.uv_index_max?.[0] ?? 8);

    const dewPoint = Math.round(temp - (100 - humidity) / 5);

    const rawSunrise = dly.sunrise?.[0] ? dly.sunrise[0].split('T')[1]?.slice(0, 5) : '06:12';
    const rawSunset = dly.sunset?.[0] ? dly.sunset[0].split('T')[1]?.slice(0, 5) : '17:53';

    // Parse Hourly
    const hourly: HourlyForecastItem[] = [];
    const nowHour = new Date().getHours();
    const times = hly.time || [];
    const hTemps = hly.temperature_2m || [];
    const hCodes = hly.weather_code || [];
    const hPrecip = hly.precipitation_probability || [];
    const hWinds = hly.wind_speed_10m || [];

    for (let i = 0; i < times.length && hourly.length < 12; i++) {
      const date = new Date(times[i]);
      if (date.getHours() >= nowHour || i >= nowHour) {
        const isNow = hourly.length === 0;
        const timeStr = isNow ? 'Now' : date.getHours().toString().padStart(2, '0');
        const hCode = hCodes[i] ?? 0;
        const info = this.getWeatherInfoByCode(hCode, date.getHours());
        hourly.push({
          time: timeStr,
          temp: Math.round(hTemps[i] ?? temp),
          icon: info.icon,
          precipPct: Math.round(hPrecip[i] ?? 0),
          windSpeed: Math.round(hWinds[i] ?? windSpeed),
        });
      }
    }

    // Parse Daily
    const daily: DailyForecastItem[] = [];
    const dTimes = dly.time || [];
    const dCodes = dly.weather_code || [];
    const dMax = dly.temperature_2m_max || [];
    const dMin = dly.temperature_2m_min || [];
    const dPrecip = dly.precipitation_probability_max || [];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < Math.min(dTimes.length, 7); i++) {
      const date = new Date(dTimes[i]);
      const dayStr = i === 0 ? 'Today' : dayNames[date.getDay()];
      const dCode = dCodes[i] ?? 0;
      const info = this.getWeatherInfoByCode(dCode, 12);
      daily.push({
        day: dayStr,
        icon: info.icon,
        min: Math.round(dMin[i] ?? low),
        max: Math.round(dMax[i] ?? high),
        precipPct: Math.round(dPrecip[i] ?? 0),
      });
    }

    // Moon calculation
    const moon = this.calculateMoonPhase(new Date());

    this.state = {
      city,
      temp,
      condition: condInfo.label,
      high,
      low,
      feelsLike,
      windSpeed,
      windDirection,
      windDirText: `${windDirection}° ${this.getCardinalDirection(windDirection)}`,
      windGusts,
      humidity,
      dewPoint,
      pressure,
      uvIndex: uv,
      uvCategory: uv >= 8 ? 'VERY HIGH' : uv >= 6 ? 'HIGH' : uv >= 3 ? 'MODERATE' : 'LOW',
      aqi: 136,
      aqiCategory: 'MODERATE',
      sunrise: rawSunrise,
      sunset: rawSunset,
      moonIllum: moon.illumination,
      moonPhase: moon.phaseName,
      hourly: hourly.length > 0 ? hourly : DEFAULT_WEATHER_STATE.hourly,
      daily: daily.length > 0 ? daily : DEFAULT_WEATHER_STATE.daily,
    };
  }

  private getWeatherInfoByCode(code: number, hour = 12): { label: string; icon: string } {
    const isNight = hour < 6 || hour >= 18;
    switch (code) {
      case 0:
        return { label: 'Clear Sky', icon: isNight ? 'clear-night' : 'sunny' };
      case 1:
        return { label: 'Mainly Clear', icon: isNight ? 'clear-night' : 'sunny' };
      case 2:
        return { label: 'Partly Cloudy', icon: isNight ? 'partly-cloudy-night' : 'partly-cloudy' };
      case 3:
        return { label: 'Overcast', icon: 'cloudy' };
      case 45:
      case 48:
        return { label: 'Fog', icon: 'fog' };
      case 51:
      case 53:
      case 55:
        return { label: 'Drizzle', icon: 'rain' };
      case 61:
      case 63:
      case 65:
        return { label: 'Rain', icon: 'rain' };
      case 71:
      case 73:
      case 75:
        return { label: 'Snow', icon: 'snow' };
      case 80:
      case 81:
      case 82:
        return { label: 'Rain Showers', icon: 'rain' };
      case 95:
      case 96:
      case 99:
        return { label: 'Thunderstorm', icon: 'storm' };
      default:
        return { label: 'Fair', icon: isNight ? 'clear-night' : 'partly-cloudy' };
    }
  }

  private getCardinalDirection(deg: number): string {
    const val = Math.floor(deg / 22.5 + 0.5);
    const compass = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
    ];
    return compass[val % 16];
  }

  private calculateMoonPhase(date: Date): {
    phaseName: string;
    illumination: number;
    phaseFraction: number;
    nextPhase: string;
    synodicDay: number;
  } {
    const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
    const synodicMonth = 29.53058867;
    const diffDays = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const phaseFraction = (diffDays % synodicMonth) / synodicMonth;
    const normalized = (phaseFraction + 1) % 1;
    const synodicDay = Math.max(1, Math.round(normalized * synodicMonth));

    const illumination = Math.round(0.5 * (1 - Math.cos(2 * Math.PI * normalized)) * 100);

    let phaseName = 'New Moon';
    if (normalized < 0.03 || normalized > 0.97) phaseName = 'New Moon';
    else if (normalized < 0.22) phaseName = 'Waxing Crescent';
    else if (normalized < 0.28) phaseName = 'First Quarter';
    else if (normalized < 0.47) phaseName = 'Waxing Gibbous';
    else if (normalized < 0.53) phaseName = 'Full Moon';
    else if (normalized < 0.72) phaseName = 'Waning Gibbous';
    else if (normalized < 0.78) phaseName = 'Last Quarter';
    else phaseName = 'Waning Crescent';

    // Calculate countdown to next major phase milestone
    const milestones = [
      { name: 'First Quarter', target: 0.25 },
      { name: 'Full Moon', target: 0.5 },
      { name: 'Last Quarter', target: 0.75 },
      { name: 'New Moon', target: 1.0 },
    ];
    let nextMs = milestones.find((m) => m.target > normalized) || milestones[3];
    let daysToNext = Math.round((nextMs.target - normalized) * synodicMonth);
    if (daysToNext <= 0) daysToNext = 1;
    const nextPhase = `${nextMs.name.toUpperCase()} IN ${daysToNext}D`;

    return { phaseName, illumination, phaseFraction: normalized, nextPhase, synodicDay };
  }

  // ── Render High-Fidelity 3D Vector Moon Phase ──────────────────
  private renderMoonPhaseSphere(
    phaseFraction: number,
    illumination: number,
    phaseName: string,
  ): string {
    const cx = 27;
    const cy = 27;
    const R = 23;
    const p = phaseFraction;

    let litPath = '';
    if (illumination <= 2) {
      litPath = ''; // New moon: purely dark with earthshine
    } else if (illumination >= 98) {
      litPath = `M ${cx - R} ${cy} A ${R} ${R} 0 1 0 ${cx + R} ${cy} A ${R} ${R} 0 1 0 ${cx - R} ${cy}`;
    } else {
      const rx = Math.max(0.1, R * Math.abs(Math.cos(2 * Math.PI * p)));
      if (p < 0.25) {
        // Waxing Crescent: right outer arc, terminator curves right
        litPath = `M ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx} ${cy + R} A ${rx.toFixed(2)} ${R} 0 0 0 ${cx} ${cy - R} Z`;
      } else if (p < 0.5) {
        // Waxing Gibbous: right outer arc, terminator bulges left
        litPath = `M ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx} ${cy + R} A ${rx.toFixed(2)} ${R} 0 0 1 ${cx} ${cy - R} Z`;
      } else if (p < 0.75) {
        // Waning Gibbous: left outer arc, terminator bulges right
        litPath = `M ${cx} ${cy - R} A ${R} ${R} 0 0 0 ${cx} ${cy + R} A ${rx.toFixed(2)} ${R} 0 0 0 ${cx} ${cy - R} Z`;
      } else {
        // Waning Crescent: left outer arc, terminator curves left
        litPath = `M ${cx} ${cy - R} A ${R} ${R} 0 0 0 ${cx} ${cy + R} A ${rx.toFixed(2)} ${R} 0 0 1 ${cx} ${cy - R} Z`;
      }
    }

    return `<svg viewBox="0 0 54 54" width="52" height="52" class="moon-sphere-svg" role="img" aria-label="${phaseName}, ${illumination}% illuminated">
      <defs>
        <clipPath id="lunarSphereClip">
          <circle cx="${cx}" cy="${cy}" r="${R}" />
        </clipPath>
        <clipPath id="lunarLitClip">
          <path d="${litPath}" />
        </clipPath>
        <radialGradient id="darkMoonGrad" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="65%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#020617" />
        </radialGradient>
        <radialGradient id="litMoonGrad" cx="${p < 0.5 ? '65%' : '35%'}" cy="32%" r="72%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="40%" stop-color="#f8fafc" />
          <stop offset="75%" stop-color="#e2e8f0" />
          <stop offset="100%" stop-color="#cbd5e1" />
        </radialGradient>
        <radialGradient id="sphereShadow" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stop-color="transparent" />
          <stop offset="100%" stop-color="rgba(0, 0, 0, 0.45)" />
        </radialGradient>
      </defs>

      <!-- Futuristic Orbital HUD Telemetry Rings -->
      <circle cx="${cx}" cy="${cy}" r="${R + 3.5}" fill="none" stroke="var(--accent)" stroke-width="0.75" stroke-dasharray="3 4" opacity="0.45" />
      <circle cx="${cx}" cy="${cy}" r="${R + 1.5}" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.2" />
      <line x1="${cx}" y1="${cy - R - 4}" x2="${cx}" y2="${cy - R - 1}" stroke="var(--accent)" stroke-width="1.2" />
      <line x1="${cx}" y1="${cy + R + 1}" x2="${cx}" y2="${cy + R + 4}" stroke="var(--accent)" stroke-width="1.2" />
      <line x1="${cx - R - 4}" y1="${cy}" x2="${cx - R - 1}" y2="${cy}" stroke="var(--accent)" stroke-width="1.2" />
      <line x1="${cx + R + 1}" y1="${cy}" x2="${cx + R + 4}" y2="${cy}" stroke="var(--accent)" stroke-width="1.2" />

      <!-- Soft Atmospheric Moonlight Glow -->
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />

      <!-- Base Dark Moon Sphere (Earthshine with Topography) -->
      <g clip-path="url(#lunarSphereClip)">
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#darkMoonGrad)" />

        <!-- Earthshine Maria (Basaltic Plains on unlit side) -->
        <ellipse cx="33" cy="23" rx="4.5" ry="3.8" fill="rgba(255, 255, 255, 0.06)" />
        <ellipse cx="31" cy="17" rx="4" ry="3.5" fill="rgba(255, 255, 255, 0.06)" />
        <ellipse cx="22" cy="16" rx="5" ry="4.5" fill="rgba(255, 255, 255, 0.06)" />
        <ellipse cx="39" cy="20" rx="2.5" ry="3" fill="rgba(255, 255, 255, 0.05)" />
        <circle cx="25" cy="37" r="1.2" fill="rgba(255, 255, 255, 0.1)" />

        <!-- Illuminated Sunlit Moon Portion (Clipped to Mathematical Terminator) -->
        ${
          litPath
            ? `
        <g clip-path="url(#lunarLitClip)">
          <!-- Lit lunar surface base -->
          <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#litMoonGrad)" />

          <!-- High-Contrast Lunar Maria on Lit Face -->
          <path d="M 30 22 Q 35 20 37 24 Q 35 28 31 26 Z" fill="#94a3b8" opacity="0.45" />
          <circle cx="32" cy="17" r="3.5" fill="#94a3b8" opacity="0.45" />
          <circle cx="22" cy="15" r="4.8" fill="#94a3b8" opacity="0.45" />
          <path d="M 15 19 Q 19 26 17 35 Q 13 31 14 20 Z" fill="#94a3b8" opacity="0.42" />
          <ellipse cx="41" cy="20" rx="2.2" ry="3.2" fill="#94a3b8" opacity="0.45" />
          <ellipse cx="23" cy="31" rx="3.2" ry="2.8" fill="#94a3b8" opacity="0.4" />

          <!-- Tycho Impact Crater & Ejecta Rays -->
          <circle cx="26" cy="39" r="1.2" fill="#ffffff" />
          <line x1="26" y1="39" x2="32" y2="45" stroke="#ffffff" stroke-width="0.5" opacity="0.5" />
          <line x1="26" y1="39" x2="19" y2="43" stroke="#ffffff" stroke-width="0.5" opacity="0.5" />
          <line x1="26" y1="39" x2="25" y2="32" stroke="#ffffff" stroke-width="0.5" opacity="0.5" />

          <!-- Copernicus Crater -->
          <circle cx="21" cy="23" r="1" fill="#ffffff" opacity="0.85" />
        </g>
        `
            : ''
        }

        <!-- 3D Spherical Edge Shadow Overlay -->
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#sphereShadow)" />
      </g>

      <!-- Outer Limb Ring -->
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.25" />
    </svg>`;
  }

  // ── Render Modern Minimalist SVG Weather Glyphs ───────────────
  private getIconGlyph(icon: string, size = 20): string {
    const s = size;
    switch (icon) {
      case 'sunny':
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="w-glyph w-glyph-sunny">
          <circle cx="12" cy="12" r="4.2" fill="rgba(245, 158, 11, 0.22)" stroke="#f59e0b" stroke-width="1.8"/>
          <path d="M12 2.5v2.2M12 19.3v2.2M3.7 12h2.2M18.1 12h2.2M5.5 5.5l1.6 1.6M16.9 16.9l1.6 1.6M5.5 18.5l1.6-1.6M16.9 7.1l1.6-1.6" stroke="#f59e0b"/>
        </svg>`;

      case 'clear-night':
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="w-glyph w-glyph-night">
          <path d="M20.5 13.05A8.5 8.5 0 1 1 11 3.5a6.5 6.5 0 0 0 9.5 9.55z" fill="rgba(96, 165, 250, 0.18)" stroke="#60a5fa"/>
          <path d="M18.5 4.5l.3.9.9.3-.9.3-.3.9-.3-.9-.9-.3.9-.3z" fill="#93c5fd" stroke="none"/>
        </svg>`;

      case 'partly-cloudy':
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="w-glyph w-glyph-partly-cloudy">
          <circle cx="15.5" cy="8.5" r="3.2" fill="rgba(245, 158, 11, 0.28)" stroke="#f59e0b" stroke-width="1.6"/>
          <path d="M15.5 3.5v1.2M20.5 8.5h-1.2M19 5l-.9.9M12 7l-.8.8" stroke="#f59e0b" stroke-width="1.5"/>
          <path d="M16 19.5H7.5a4.5 4.5 0 0 1-.5-8.97 5.5 5.5 0 0 1 10.32-1.78A3.75 3.75 0 0 1 16 19.5z" fill="rgba(var(--bg-rgb), 0.85)" stroke="var(--ink)"/>
        </svg>`;

      case 'partly-cloudy-night':
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="w-glyph w-glyph-partly-night">
          <path d="M17.5 6.5A4.5 4.5 0 0 1 14 3.2a4.5 4.5 0 1 0 4.8 5.6c-.4.4-.8.6-1.3.7z" fill="rgba(96, 165, 250, 0.22)" stroke="#60a5fa" stroke-width="1.5"/>
          <path d="M16.5 19.5H8a4.5 4.5 0 0 1-.5-8.97 5.5 5.5 0 0 1 10.32-1.78A3.75 3.75 0 0 1 16.5 19.5z" fill="rgba(var(--bg-rgb), 0.85)" stroke="var(--ink)"/>
        </svg>`;

      case 'cloudy':
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="w-glyph w-glyph-cloudy">
          <path d="M7.5 9.5a4 4 0 0 1 7.4-1.8 3.5 3.5 0 0 1 3.1 3.5c0 .3-.05.6-.13.88" stroke="var(--ink-dim)" opacity="0.5" stroke-dasharray="2 2"/>
          <path d="M17 19.5H6.5a4.5 4.5 0 0 1-.5-8.97 5.5 5.5 0 0 1 10.32-1.78A3.75 3.75 0 0 1 17 19.5z" fill="rgba(var(--bg-rgb), 0.75)" stroke="var(--ink)"/>
        </svg>`;

      case 'rain':
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="w-glyph w-glyph-rain">
          <path d="M17 15.5H6.5a4.5 4.5 0 0 1-.5-8.97 5.5 5.5 0 0 1 10.32-1.78A3.75 3.75 0 0 1 17 15.5z" fill="rgba(var(--bg-rgb), 0.75)" stroke="var(--ink)"/>
          <path d="M8.5 18l-1 3.5M12.5 18l-1 3.5M16.5 18l-1 3.5" stroke="#38bdf8" stroke-width="1.8"/>
        </svg>`;

      case 'snow':
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="w-glyph w-glyph-snow">
          <path d="M17 15H6.5a4.5 4.5 0 0 1-.5-8.97 5.5 5.5 0 0 1 10.32-1.78A3.75 3.75 0 0 1 17 15z" fill="rgba(var(--bg-rgb), 0.75)" stroke="var(--ink)"/>
          <path d="M9 19h.01M12 18h.01M12 21h.01M15 19h.01" stroke="#93c5fd" stroke-width="2.5"/>
        </svg>`;

      case 'storm':
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="w-glyph w-glyph-storm">
          <path d="M17 14.5H6.5a4.5 4.5 0 0 1-.5-8.97 5.5 5.5 0 0 1 10.32-1.78A3.75 3.75 0 0 1 17 14.5z" fill="rgba(var(--bg-rgb), 0.75)" stroke="var(--ink)"/>
          <path d="M12.5 14l-2 4h3l-1.5 4.5 4.5-5.5h-3z" fill="#f59e0b" stroke="#f59e0b" stroke-width="0.8" stroke-linejoin="miter"/>
        </svg>`;

      case 'fog':
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="w-glyph w-glyph-fog">
          <path d="M4 11h16M6 14.5h12M4 18h16M8 7.5h8" stroke="var(--ink-dim)" opacity="0.8"/>
        </svg>`;

      default:
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7">
          <circle cx="12" cy="12" r="5" fill="var(--accent)"/>
        </svg>`;
    }
  }

  private getHeroIconGlyph(condition: string): string {
    const c = condition.toLowerCase();
    const isNight = new Date().getHours() < 6 || new Date().getHours() >= 18;
    let iconKey = 'sunny';
    if (c.includes('rain') || c.includes('drizzle')) iconKey = 'rain';
    else if (c.includes('thunder') || c.includes('storm')) iconKey = 'storm';
    else if (c.includes('snow')) iconKey = 'snow';
    else if (c.includes('fog') || c.includes('mist')) iconKey = 'fog';
    else if (c.includes('partly')) iconKey = isNight ? 'partly-cloudy-night' : 'partly-cloudy';
    else if (c.includes('cloud') || c.includes('overcast')) iconKey = 'cloudy';
    else if (isNight) iconKey = 'clear-night';

    return this.getIconGlyph(iconKey, 54);
  }

  // ── Render DOM Elements ───────────────────────────────────────
  public renderTelemetry(): void {
    const s = this.state;

    const el = (id: string) => document.getElementById(id);
    const setText = (id: string, text: string | number) => {
      const node = el(id);
      if (node) node.textContent = String(text);
    };

    setText('weatherCity', s.city.toUpperCase());
    setText('weatherStationHeaderTag', `// STATION MET-01 [${s.city.toUpperCase()}]`);
    setText('weatherBigTemp', s.temp);
    setText('weatherCondition', `[ STATUS: ${s.condition.toUpperCase()} ]`);
    setText('weatherHigh', `HIGH ${s.high}°C`);
    setText('weatherLow', `LOW ${s.low}°C`);
    setText('weatherFeelsLike', `${s.feelsLike}°C`);
    setText('weatherWindSpeed', `${s.windSpeed} km/h`);
    setText('weatherWindSpeedCard', `${s.windSpeed} km/h`);
    setText('weatherWindDirText', s.windDirText);
    setText('weatherWindGusts', `GUSTS ${s.windGusts} km/h`);
    setText('weatherHumidity', `${s.humidity}%`);
    setText('weatherPressureVal', `${s.pressure} mmHg`);
    setText('weatherPressure', s.pressure);
    setText('weatherDewPointVal', `${s.dewPoint}°C`);
    setText('weatherSunrise', s.sunrise);
    setText('weatherSunset', s.sunset);
    setText('moonPhaseName', s.moonPhase.toUpperCase());
    setText('moonIllumPct', `${s.moonIllum}%`);
    setText('weatherAqiVal', s.aqi);
    setText('weatherAqiCategory', s.aqiCategory);
    setText('weatherUvVal', s.uvIndex);
    setText('weatherUvCategory', s.uvCategory);

    // Weather Condition Hero Glyph (Large Minimalist Icon)
    const glyphWrap = el('weatherConditionGlyph');
    if (glyphWrap) {
      glyphWrap.innerHTML = this.getHeroIconGlyph(s.condition);
    }

    // High-Fidelity Photorealistic Vector Moon Sphere
    const moonWrap = el('moonRenderWrap');
    const moon = this.calculateMoonPhase(new Date());
    if (moonWrap) {
      moonWrap.innerHTML = this.renderMoonPhaseSphere(
        moon.phaseFraction,
        moon.illumination,
        moon.phaseName,
      );
    }
    setText('moonNextPhase', moon.nextPhase);

    // Compass Needle Rotation (Center: 50 50)
    const needle = el('windNeedleGroup');
    if (needle) {
      needle.setAttribute('transform', `rotate(${s.windDirection} 50 50)`);
    }

    // Pressure Gauge Arc Fill
    const pressureArc = el('pressureArcFill');
    if (pressureArc) {
      const fillLen = Math.min(Math.max(((s.pressure - 700) / 100) * 190, 25), 190);
      pressureArc.setAttribute('stroke-dasharray', `${fillLen.toFixed(0)} 260`);
    }

    // Solar Arc Dot Position (ViewBox 0 0 140 56)
    const solarDot = el('solarDot');
    if (solarDot) {
      const now = new Date();
      const curHours = now.getHours() + now.getMinutes() / 60;
      const srParts = s.sunrise.split(':');
      const ssParts = s.sunset.split(':');
      const sr = parseInt(srParts[0], 10) + parseInt(srParts[1] || '0', 10) / 60;
      const ss = parseInt(ssParts[0], 10) + parseInt(ssParts[1] || '0', 10) / 60;

      let pct = 0.5;
      if (curHours >= sr && curHours <= ss) {
        pct = (curHours - sr) / (ss - sr);
      } else if (curHours > ss) {
        pct = 1;
      } else {
        pct = 0;
      }
      const x = 10 + pct * 120;
      const y = (1 - pct) * (1 - pct) * 44 + 2 * (1 - pct) * pct * 4 + pct * pct * 44;
      solarDot.setAttribute('cx', x.toFixed(1));
      solarDot.setAttribute('cy', y.toFixed(1));
    }

    // AQI Pip Position
    const aqiPip = el('weatherAqiPip');
    if (aqiPip) {
      const pct = Math.min(Math.max((s.aqi / 300) * 100, 4), 96);
      aqiPip.style.left = `${pct}%`;
    }

    // UV Pip Position
    const uvPip = el('weatherUvPip');
    if (uvPip) {
      const pct = Math.min(Math.max((s.uvIndex / 12) * 100, 4), 96);
      uvPip.style.left = `${pct}%`;
    }

    this.renderHourlyRail();
    this.renderForecastList();
  }

  private renderHourlyRail(): void {
    const slider = document.getElementById('hourlySlider');
    if (!slider) return;

    slider.innerHTML = '';
    this.state.hourly.forEach((item) => {
      const col = document.createElement('div');
      col.className = 'hourly-item';

      let readOut = `${item.temp}°`;
      if (this.activeHourlyMode === 'rain') {
        readOut = `${item.precipPct}%`;
      } else if (this.activeHourlyMode === 'wind') {
        readOut = `${item.windSpeed} km/h`;
      }

      col.innerHTML = `
        <span class="h-time">${item.time}</span>
        <span class="h-icon">${this.getIconGlyph(item.icon)}</span>
        <span class="h-val">${readOut}</span>
      `;
      slider.appendChild(col);
    });
  }

  private renderForecastList(): void {
    const list = document.getElementById('forecastList');
    if (!list) return;

    list.innerHTML = '';
    const minAll = Math.min(...this.state.daily.map((d) => d.min));
    const maxAll = Math.max(...this.state.daily.map((d) => d.max));
    const rangeAll = Math.max(maxAll - minAll, 1);

    this.state.daily.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'forecast-row';

      const leftPct = Math.round(((item.min - minAll) / rangeAll) * 100);
      const widthPct = Math.max(Math.round(((item.max - item.min) / rangeAll) * 100), 14);

      // Current temperature indicator dot on Today's bar
      const isToday = item.day.toLowerCase() === 'today';
      let currentPipHtml = '';
      if (isToday) {
        const curTempClamped = Math.max(item.min, Math.min(item.max, this.state.temp));
        const curPct = Math.round(
          ((curTempClamped - item.min) / Math.max(item.max - item.min, 1)) * 100,
        );
        currentPipHtml = `<div class="f-bar-cur-pip" style="left: ${curPct}%;" title="Current: ${this.state.temp}°C"></div>`;
      }

      row.innerHTML = `
        <span class="f-day">${item.day}</span>
        <span class="f-icon">${this.getIconGlyph(item.icon)}</span>
        <span class="f-min">${item.min}°</span>
        <div class="f-bar-track">
          <div class="f-bar-fill" style="left: ${leftPct}%; width: ${widthPct}%;">
            ${currentPipHtml}
          </div>
        </div>
        <span class="f-max">${item.max}°</span>
      `;
      list.appendChild(row);
    });
  }
}

// Global window declarations
declare global {
  interface Window {
    __weatherDashboardController?: WeatherDashboardController;
    __weatherEscBound?: boolean;
  }
}

if (typeof window !== 'undefined') {
  const initOrUpdate = () => {
    if (window.__weatherDashboardController) {
      window.__weatherDashboardController.onPageLoad();
    } else {
      window.__weatherDashboardController = new WeatherDashboardController();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOrUpdate);
  } else {
    initOrUpdate();
  }

  document.addEventListener('astro:page-load', initOrUpdate);

  window.addEventListener('easter-egg:unlock', () => {
    initOrUpdate();
  });
}
