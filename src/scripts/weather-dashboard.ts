/**
 * weather-dashboard.ts — Atmospheric Weather HUD Engine
 *
 * Capabilities:
 * - Dynamic Liquid Glass Lighting: Real-time cursor tracking and ambient orbiting specular sheen.
 * - Resizable Cards: Height adjustments via corner grip and S/M/L presets, remembered on every visit via localStorage cache.
 * - Drag and Drop Reordering: Re-arrange cards with live swap and persistent order caching.
 * - Pin/Unpin Widgets: Keep priority telemetry at top.
 * - Live Atmospheric Telemetry: Open-Meteo API integration with client geolocation.
 * - Zero Emoji Policy: Crisp SVG vector icons.
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

// Initial reference baseline state
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
  uvIndex: 0,
  uvCategory: 'LOW',
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

const CARD_SIZE_PRESETS: Record<string, { S: number; M: number; L: number }> = {
  'card-current': { S: 145, M: 185, L: 235 },
  'card-hourly': { S: 95, M: 120, L: 160 },
  'card-forecast': { S: 190, M: 240, L: 300 },
  'card-atmosphere': { S: 110, M: 135, L: 175 },
  'card-solar-lunar': { S: 110, M: 135, L: 175 },
  'card-air-uv': { S: 95, M: 120, L: 160 },
};

export class WeatherDashboardController {
  private dock: HTMLElement | null = null;
  private rail: HTMLElement | null = null;
  private state: WeatherTelemetryState = { ...DEFAULT_WEATHER_STATE };
  private isEnabled: boolean = true;
  private activeHourlyMode: 'temp' | 'rain' | 'wind' = 'temp';

  // Persistence caches
  private pinnedCards: Set<string> = new Set();
  private cardOrder: string[] = [];
  private cardDimensions: Record<string, number> = {};

  // Dynamic Liquid Glass Lighting state
  private shineFrameId: number | null = null;
  private lightX = 0;
  private lightY = 0;
  private targetLightX = 0;
  private targetLightY = 0;
  private isPointerInside = false;
  private orbitAngle = 0;
  private resizeObserver: ResizeObserver | null = null;
  private resizeDebounceTimer: number | null = null;

  constructor() {
    this.loadCachedPreferences();
    this.initDOM();
    this.initDynamicLiquidGlass();
    this.fetchLiveTelemetry();
  }

  private loadCachedPreferences(): void {
    try {
      const storedEnabled = localStorage.getItem('weather_dashboard_enabled');
      this.isEnabled = storedEnabled !== 'false';

      const storedPinned = localStorage.getItem('weather_card_pinned');
      if (storedPinned) {
        this.pinnedCards = new Set(JSON.parse(storedPinned));
      }

      const storedOrder = localStorage.getItem('weather_card_order');
      if (storedOrder) {
        this.cardOrder = JSON.parse(storedOrder);
      }

      const storedDimensions = localStorage.getItem('weather_card_dimensions');
      if (storedDimensions) {
        this.cardDimensions = JSON.parse(storedDimensions);
      }
    } catch {
      this.isEnabled = true;
    }
  }

  public onPageLoad(): void {
    this.initDOM();
    this.applyVisibility();
    this.applyCachedDimensions();
    this.applyCachedOrder();
    this.renderTelemetry();
  }

  public initDOM(): void {
    this.dock = document.getElementById('weatherDashboard');
    this.rail = document.getElementById('weatherCardsRail');
    this.bindDOM();
    this.applyVisibility();
    this.initResizeObserver();
  }

  private bindDOM(): void {
    this.updateMasterSwitchUI();

    // Bottom status bar master toggle
    const toggleSwitch = document.getElementById('weatherHudToggle');
    const handleSwitch = (e: Event) => {
      e.stopPropagation();
      this.toggleMasterSwitch();
    };

    if (toggleSwitch && toggleSwitch.dataset.weatherBound !== 'true') {
      toggleSwitch.dataset.weatherBound = 'true';
      toggleSwitch.addEventListener('click', handleSwitch);
    }

    // Dock Close / Minimize Button
    const closeBtn = document.getElementById('weatherCloseDockBtn');
    if (closeBtn && closeBtn.dataset.closeBound !== 'true') {
      closeBtn.dataset.closeBound = 'true';
      closeBtn.addEventListener('click', () => this.toggleMasterSwitch());
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

    // Card Size Preset buttons (S / M / L)
    const sizeBtns = document.querySelectorAll<HTMLButtonElement>('.card-size-btn');
    sizeBtns.forEach((btn) => {
      if (btn.dataset.sizeBound !== 'true') {
        btn.dataset.sizeBound = 'true';
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const card = btn.closest<HTMLElement>('.weather-card');
          if (card && card.id) {
            this.cycleCardSize(card.id, btn);
          }
        });
      }
    });

    this.bindDragAndDrop();
  }

  // ── Card Resizability & Dimensions Cache ───────────────────────
  private initResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return;

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const card = entry.target as HTMLElement;
        const id = card.id;
        if (!id) continue;
        const h = Math.round(entry.contentRect.height);
        if (h > 60) {
          this.cardDimensions[id] = h;
          this.updateSizeIndicator(id, h);
        }
      }

      if (this.resizeDebounceTimer !== null) {
        window.clearTimeout(this.resizeDebounceTimer);
      }
      this.resizeDebounceTimer = window.setTimeout(() => {
        try {
          localStorage.setItem('weather_card_dimensions', JSON.stringify(this.cardDimensions));
        } catch {}
      }, 200);
    });

    const cards = document.querySelectorAll<HTMLElement>('.weather-card');
    cards.forEach((card) => {
      this.resizeObserver?.observe(card);
    });
  }

  private applyCachedDimensions(): void {
    for (const [id, height] of Object.entries(this.cardDimensions)) {
      const card = document.getElementById(id);
      if (card && typeof height === 'number' && height > 60) {
        card.style.height = `${height}px`;
        this.updateSizeIndicator(id, height);
      }
    }
  }

  private cycleCardSize(cardId: string, btnEl?: HTMLElement): void {
    const card = document.getElementById(cardId);
    if (!card) return;

    const presets = CARD_SIZE_PRESETS[cardId] || { S: 120, M: 160, L: 220 };
    const currentH = card.offsetHeight;

    let nextH: number;
    let nextLabel: 'S' | 'M' | 'L';

    if (currentH < presets.M - 15) {
      nextH = presets.M;
      nextLabel = 'M';
    } else if (currentH < presets.L - 15) {
      nextH = presets.L;
      nextLabel = 'L';
    } else {
      nextH = presets.S;
      nextLabel = 'S';
    }

    card.style.height = `${nextH}px`;
    this.cardDimensions[cardId] = nextH;

    try {
      localStorage.setItem('weather_card_dimensions', JSON.stringify(this.cardDimensions));
    } catch {}

    const indicator = btnEl
      ? btnEl.querySelector<HTMLElement>('.size-indicator')
      : card.querySelector<HTMLElement>('.size-indicator');
    if (indicator) indicator.textContent = nextLabel;
  }

  private updateSizeIndicator(cardId: string, currentH: number): void {
    const card = document.getElementById(cardId);
    if (!card) return;
    const presets = CARD_SIZE_PRESETS[cardId] || { S: 120, M: 160, L: 220 };
    const indicator = card.querySelector<HTMLElement>('.size-indicator');
    if (!indicator) return;

    if (currentH <= presets.S + 15) {
      indicator.textContent = 'S';
    } else if (currentH <= presets.M + 25) {
      indicator.textContent = 'M';
    } else {
      indicator.textContent = 'L';
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
      localStorage.removeItem('weather_card_dimensions');
    } catch {}

    this.pinnedCards.clear();
    this.cardOrder = [];
    this.cardDimensions = {};

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
          card.style.height = '';
          const pinBtn = card.querySelector<HTMLElement>('.widget-pin-btn');
          if (pinBtn) pinBtn.classList.remove('active');
          const indicator = card.querySelector<HTMLElement>('.size-indicator');
          if (indicator) indicator.textContent = 'M';
          this.rail?.appendChild(card);
        }
      });
    }
  }

  // ── Master Switch ─────────────────────────────────────────────
  public toggleMasterSwitch(): void {
    this.isEnabled = !this.isEnabled;
    try {
      localStorage.setItem('weather_dashboard_enabled', this.isEnabled ? 'true' : 'false');
    } catch {}

    this.applyVisibility();
    this.updateMasterSwitchUI();
  }

  public updateMasterSwitchUI(): void {
    const toggleSwitch = document.getElementById('weatherHudToggle');
    const status = document.getElementById('weatherHudStatus');
    const label = this.isEnabled ? 'ON' : 'OFF';

    if (toggleSwitch) {
      toggleSwitch.classList.toggle('is-active', this.isEnabled);
      toggleSwitch.setAttribute('aria-checked', this.isEnabled ? 'true' : 'false');
    }
    if (status) status.textContent = label;
  }

  private applyVisibility(): void {
    if (!this.dock) return;
    this.dock.classList.toggle('is-active', this.isEnabled);
  }

  // ── Dynamic Liquid Glass Lighting Engine ──────────────────────
  private initDynamicLiquidGlass(): void {
    this.targetLightX = window.innerWidth * 0.82;
    this.targetLightY = window.innerHeight * 0.35;
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
        const radius = 160;
        const cx = window.innerWidth * 0.84;
        const cy = window.innerHeight * 0.38;
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

  // ── Hourly Mode Switch ─────────────────────────────────────────
  public setHourlyMode(mode: 'temp' | 'rain' | 'wind'): void {
    this.activeHourlyMode = mode;
    const tabs = document.querySelectorAll<HTMLButtonElement>('.weather-cond-tab');
    tabs.forEach((tab) => {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === mode);
    });
    this.renderHourlyRail();
  }

  // ── Telemetry Fetch & Rendering ────────────────────────────────
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
    const uv = Math.round(dly.uv_index_max?.[0] ?? 0);

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

  private calculateMoonPhase(date: Date): { phaseName: string; illumination: number } {
    const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
    const synodicMonth = 29.53058867;
    const diffDays = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const phaseFraction = (diffDays % synodicMonth) / synodicMonth;
    const normalized = (phaseFraction + 1) % 1;

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

    return { phaseName, illumination };
  }

  // ── Render SVG Weather Glyphs (Zero Emoji Policy) ─────────────
  private getIconGlyph(icon: string): string {
    switch (icon) {
      case 'sunny':
        return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="12" cy="12" r="4" fill="var(--accent)"/>
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
        </svg>`;
      case 'clear-night':
        return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="var(--accent)"/>
        </svg>`;
      case 'partly-cloudy':
        return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 3v2m4.24 1.76l1.42-1.42M19 10h2" stroke-linecap="round"/>
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" fill="rgba(var(--accent-rgb), 0.15)"/>
        </svg>`;
      case 'partly-cloudy-night':
        return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M16 4a5 5 0 0 0-3.8 8.2A6 6 0 1 0 16 18h1.5a3.5 3.5 0 0 0 0-7A5 5 0 0 0 16 4z" fill="rgba(var(--accent-rgb), 0.15)"/>
        </svg>`;
      case 'cloudy':
        return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="rgba(var(--ink-rgb), 0.1)"/>
        </svg>`;
      case 'rain':
        return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M16 13v6m-4-6v6m-4-6v6" stroke="var(--accent)" stroke-linecap="round"/>
          <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" stroke-linecap="round"/>
        </svg>`;
      case 'snow':
        return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/>
          <path d="M8 15h.01M8 19h.01M12 17h.01M12 21h.01M16 15h.01M16 19h.01" stroke-width="2.5" stroke-linecap="round"/>
        </svg>`;
      case 'storm':
        return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M19 16.9A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>
          <polyline points="13 11 9 17 15 17 11 23" fill="var(--accent)"/>
        </svg>`;
      case 'fog':
        return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M4 14h16M4 18h16M4 10h16M8 6h8" stroke-linecap="round"/>
        </svg>`;
      default:
        return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="12" cy="12" r="5" fill="var(--accent)"/>
        </svg>`;
    }
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
    setText('weatherBigTemp', s.temp);
    setText('weatherCondition', `[ STATUS: ${s.condition.toUpperCase()} ]`);
    setText('weatherHigh', `H:${s.high}°`);
    setText('weatherLow', `L:${s.low}°`);
    setText('weatherFeelsLike', `${s.feelsLike}°C`);
    setText('weatherWindSpeed', `${s.windSpeed} km/h`);
    setText('weatherWindSpeedCard', `${s.windSpeed} km/h`);
    setText('weatherWindDirText', s.windDirText);
    setText('weatherHumidity', `${s.humidity}%`);
    setText('weatherPressure', s.pressure);
    setText('weatherSunrise', s.sunrise);
    setText('weatherSunset', s.sunset);
    setText('moonPhaseName', s.moonPhase.toUpperCase());
    setText('moonIllumPct', `${s.moonIllum}%`);
    setText('weatherAqiVal', s.aqi);
    setText('weatherAqiCategory', s.aqiCategory);
    setText('weatherUvVal', s.uvIndex);
    setText('weatherUvCategory', s.uvCategory);

    // Weather Condition Glyph
    const glyphWrap = el('weatherConditionGlyph');
    if (glyphWrap) {
      glyphWrap.innerHTML = this.getIconGlyph(
        s.condition.toLowerCase().includes('rain')
          ? 'rain'
          : s.condition.toLowerCase().includes('cloud')
            ? 'partly-cloudy'
            : 'sunny',
      );
    }

    // Compass Needle Rotation (Center: 42 42)
    const needle = el('windNeedleGroup');
    if (needle) {
      needle.setAttribute('transform', `rotate(${s.windDirection} 42 42)`);
    }

    // Pressure Gauge Arc Fill
    const pressureArc = el('pressureArcFill');
    if (pressureArc) {
      const fillLen = Math.min(Math.max(((s.pressure - 700) / 100) * 160, 20), 160);
      pressureArc.setAttribute('stroke-dasharray', `${fillLen.toFixed(0)} 220`);
    }

    // Solar Arc Dot Position (ViewBox 0 0 110 46)
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
      const x = 8 + pct * 94;
      const y = 36 - Math.sin(pct * Math.PI) * 30;
      solarDot.setAttribute('cx', x.toFixed(1));
      solarDot.setAttribute('cy', y.toFixed(1));
    }

    // AQI Pip Position
    const aqiPip = el('weatherAqiPip');
    if (aqiPip) {
      const pct = Math.min(Math.max((s.aqi / 300) * 100, 2), 98);
      aqiPip.style.left = `${pct}%`;
    }

    // UV Pip Position
    const uvPip = el('weatherUvPip');
    if (uvPip) {
      const pct = Math.min(Math.max((s.uvIndex / 12) * 100, 3), 97);
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
        readOut = `${item.windSpeed}`;
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
      const widthPct = Math.max(Math.round(((item.max - item.min) / rangeAll) * 100), 12);

      row.innerHTML = `
        <span class="f-day">${item.day}</span>
        <span class="f-icon">${this.getIconGlyph(item.icon)}</span>
        <span class="f-min">${item.min}°</span>
        <div class="f-bar-track">
          <div class="f-bar-fill" style="left: ${leftPct}%; width: ${widthPct}%;"></div>
        </div>
        <span class="f-max">${item.max}°</span>
      `;
      list.appendChild(row);
    });
  }
}

// Global initialization & View Transitions preservation
declare global {
  interface Window {
    __weatherDashboardController?: WeatherDashboardController;
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
}
