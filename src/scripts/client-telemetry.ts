/**
 * Client Telemetry Module
 *
 * Detects and displays user IPv4 and IPv6 addresses (if available)
 * alongside geographic coordinates and city.
 * Free, privacy-respecting, zero-auth, with parallel fetch and graceful fallback.
 */

interface GeoData {
  ip?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  country_code?: string;
}

function formatCoord(lat: number, lon: number): string {
  const latDir = lat >= 0 ? '°N' : '°S';
  const lonDir = lon >= 0 ? '°E' : '°W';
  return `${Math.abs(lat).toFixed(2)}${latDir}, ${Math.abs(lon).toFixed(2)}${lonDir}`;
}

async function fetchIpv4(): Promise<string | null> {
  // Primary: api4.ipify.org (JSON, CORS enabled)
  try {
    const res = await fetch('https://api4.ipify.org?format=json', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = (await res.json()) as { ip?: string };
      if (data && typeof data.ip === 'string' && data.ip.includes('.')) {
        return data.ip.trim();
      }
    }
  } catch {
    // try fallback
  }

  // Fallback: ipv4.icanhazip.com (plain text)
  try {
    const res = await fetch('https://ipv4.icanhazip.com', {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const text = (await res.text()).trim();
      if (text && text.includes('.')) {
        return text;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

async function fetchIpv6(): Promise<string | null> {
  // Primary: api6.ipify.org (JSON, CORS enabled)
  try {
    const res = await fetch('https://api6.ipify.org?format=json', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = (await res.json()) as { ip?: string };
      if (data && typeof data.ip === 'string' && data.ip.includes(':')) {
        return data.ip.trim();
      }
    }
  } catch {
    // try fallback
  }

  // Fallback: ipv6.icanhazip.com (plain text)
  try {
    const res = await fetch('https://ipv6.icanhazip.com', {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const text = (await res.text()).trim();
      if (text && text.includes(':')) {
        return text;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

async function fetchGeo(): Promise<GeoData | null> {
  try {
    const res = await fetch('https://ipwho.is/', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      return (await res.json()) as GeoData;
    }
  } catch {
    // ignore
  }
  return null;
}

async function copyText(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textArea);
    return ok;
  } catch {
    return false;
  }
}

export function initClientTelemetry(): void {
  const locEl = document.getElementById('telemetry-loc');
  const locPill = document.getElementById('telemetry-loc-pill');
  const ipv4El = document.getElementById('telemetry-ipv4');
  const ipv4Pill = document.getElementById('telemetry-ipv4-pill');
  const ipv6El = document.getElementById('telemetry-ipv6');
  const ipv6Pill = document.getElementById('telemetry-ipv6-pill');
  const container = document.getElementById('client-telemetry');

  if (!locEl || !ipv4El) return;

  let currentIpv4: string | null = null;
  let currentIpv6: string | null = null;
  let currentLoc: string | null = null;
  let fullTelemetry = '';

  const activeTimeouts = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

  function setupPill(
    pill: HTMLElement | null,
    valEl: HTMLElement | null,
    getValue: () => string | null,
    getDefaultTitle: () => string,
  ): void {
    if (!pill || !valEl) return;

    const executeCopy = async (e: Event): Promise<void> => {
      e.stopPropagation();
      const val = getValue();
      if (!val || val === 'DETECTING...' || val === '---' || val === 'OFFLINE') {
        return;
      }

      const success = await copyText(val);
      if (!success) return;

      const existing = activeTimeouts.get(pill);
      if (existing) clearTimeout(existing);

      pill.classList.add('copied');
      valEl.textContent = 'COPIED!';
      pill.title = `Copied: ${val}`;

      const t = setTimeout(() => {
        pill.classList.remove('copied');
        valEl.textContent = getValue() || '';
        pill.title = getDefaultTitle();
        activeTimeouts.delete(pill);
      }, 1500);

      activeTimeouts.set(pill, t);
    };

    pill.addEventListener('click', executeCopy);
    pill.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        executeCopy(e);
      }
    });
  }

  // Bind individual pill copy actions
  setupPill(
    ipv4Pill,
    ipv4El,
    () => currentIpv4 || ipv4El.textContent?.trim() || null,
    () => (currentIpv4 ? `Click to copy IPv4 (${currentIpv4})` : 'Click to copy IPv4 address'),
  );

  setupPill(
    ipv6Pill,
    ipv6El,
    () => currentIpv6 || ipv6El?.textContent?.trim() || null,
    () => (currentIpv6 ? `Click to copy IPv6 (${currentIpv6})` : 'Click to copy IPv6 address'),
  );

  setupPill(
    locPill,
    locEl,
    () => currentLoc || locEl.textContent?.trim() || null,
    () => (currentLoc ? `Click to copy Location (${currentLoc})` : 'Click to copy Location'),
  );

  // Fallback for clicks directly on container background
  if (container) {
    container.addEventListener('click', async (e) => {
      if ((e.target as HTMLElement).closest('.telemetry-pill')) return;
      if (!fullTelemetry) return;
      await copyText(fullTelemetry);
    });
  }

  async function loadTelemetry(): Promise<void> {
    // Query IPv4, IPv6, and Geolocation concurrently
    const [ipv4Result, ipv6Result, geoResult] = await Promise.allSettled([
      fetchIpv4(),
      fetchIpv6(),
      fetchGeo(),
    ]);

    let ipv4 = ipv4Result.status === 'fulfilled' ? ipv4Result.value : null;
    let ipv6 = ipv6Result.status === 'fulfilled' ? ipv6Result.value : null;
    const geo = geoResult.status === 'fulfilled' ? geoResult.value : null;

    // Cross-fill from geo endpoint if either protocol was unserved by direct endpoints
    if (!ipv4 && geo?.ip && geo.ip.includes('.')) {
      ipv4 = geo.ip.trim();
    }
    if (!ipv6 && geo?.ip && geo.ip.includes(':')) {
      ipv6 = geo.ip.trim();
    }

    function updateAll(selector: string, text: string): void {
      document.querySelectorAll(selector).forEach((el) => {
        el.textContent = text;
      });
    }

    function setDisplayAll(selector: string, display: string): void {
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        el.style.display = display;
      });
    }

    // Update Location
    let locStr = 'ONLINE';
    if (geo && typeof geo.latitude === 'number' && typeof geo.longitude === 'number') {
      try {
        localStorage.setItem('client_geo_lat', String(geo.latitude));
        localStorage.setItem('client_geo_lon', String(geo.longitude));
      } catch {}
      const coordStr = formatCoord(geo.latitude, geo.longitude);
      const cityStr = geo.city ? ` [${geo.city.toUpperCase()}]` : '';
      locStr = `${coordStr}${cityStr}`;
    } else {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        locStr = tz ? tz.toUpperCase() : 'ONLINE';
      } catch {
        locStr = 'ONLINE';
      }
    }
    currentLoc = locStr;
    updateAll('.telemetry-loc-val', locStr);
    if (locPill) {
      locPill.title = `Click to copy Location (${locStr})`;
    }

    // Update IPv4
    if (ipv4) {
      currentIpv4 = ipv4;
      updateAll('.telemetry-ipv4-val', ipv4);
      setDisplayAll('.telemetry-ipv4-container', 'inline-flex');
      if (ipv4Pill) {
        ipv4Pill.title = `Click to copy IPv4 (${ipv4})`;
      }
    } else {
      setDisplayAll('.telemetry-ipv4-container', 'none');
    }

    // Update IPv6
    if (ipv6) {
      currentIpv6 = ipv6;
      updateAll('.telemetry-ipv6-val', ipv6);
      setDisplayAll('.telemetry-ipv6-container', 'inline-flex');
      if (ipv6Pill) {
        ipv6Pill.style.display = 'inline-flex';
        ipv6Pill.title = `Click to copy IPv6 (${ipv6})`;
      }
    } else {
      setDisplayAll('.telemetry-ipv6-container', 'none');
    }

    // Fallback if neither IP was resolvable (e.g. offline / blocking proxy)
    if (!ipv4 && !ipv6) {
      updateAll('.telemetry-ipv4-val', 'OFFLINE');
      setDisplayAll('.telemetry-ipv4-container', 'inline-flex');
    }

    // Build clipboard string
    const lines: string[] = [];
    if (ipv4) lines.push(`IPv4: ${ipv4}`);
    if (ipv6) lines.push(`IPv6: ${ipv6}`);
    if (geo?.city || geo?.country) {
      lines.push(`Location: ${[geo.city, geo.country].filter(Boolean).join(', ')}`);
    }
    if (geo?.latitude !== undefined && geo?.longitude !== undefined) {
      lines.push(`Coordinates: ${geo.latitude}, ${geo.longitude}`);
    }
    fullTelemetry = lines.join('\n');
  }

  loadTelemetry().catch(() => {
    document.querySelectorAll('.telemetry-loc-val').forEach((el) => {
      el.textContent = 'ONLINE';
    });
    document.querySelectorAll('.telemetry-ipv4-val').forEach((el) => {
      el.textContent = 'ACTIVE';
    });
  });
}

// Initialize on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initClientTelemetry);
} else {
  initClientTelemetry();
}
