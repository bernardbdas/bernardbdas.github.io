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

export function initClientTelemetry(): void {
  const locEl = document.getElementById('telemetry-loc');
  const ipv4El = document.getElementById('telemetry-ipv4');
  const ipv4Pill = document.getElementById('telemetry-ipv4-pill');
  const ipv6Pill = document.getElementById('telemetry-ipv6-pill');
  const container = document.getElementById('client-telemetry');

  if (!locEl || !ipv4El) return;

  let fullTelemetry = '';

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
    updateAll('.telemetry-loc-val', locStr);

    // Update IPv4
    if (ipv4) {
      updateAll('.telemetry-ipv4-val', ipv4);
      setDisplayAll('.telemetry-ipv4-container', 'inline-flex');
      if (ipv4Pill) {
        ipv4Pill.title = `IPv4 Address: ${ipv4}`;
      }
    } else {
      setDisplayAll('.telemetry-ipv4-container', 'none');
    }

    // Update IPv6
    if (ipv6) {
      updateAll('.telemetry-ipv6-val', ipv6);
      setDisplayAll('.telemetry-ipv6-container', 'flex');
      if (ipv6Pill) {
        ipv6Pill.style.display = 'inline-flex';
        ipv6Pill.title = `IPv6 Address: ${ipv6}`;
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

  // Click to copy telemetry data on any telemetry container
  const copyTargets = [
    container,
    document.querySelector('.footer-telemetry-grid'),
    document.querySelector('.mobile-drawer-hud'),
  ].filter(Boolean) as HTMLElement[];

  copyTargets.forEach((target) => {
    target.addEventListener('click', async () => {
      if (!fullTelemetry) return;
      try {
        await navigator.clipboard.writeText(fullTelemetry);
        const locEls = document.querySelectorAll('.telemetry-loc-val');
        const prevTexts: string[] = [];
        locEls.forEach((el) => {
          prevTexts.push(el.textContent || '');
          el.textContent = 'COPIED TO CLIPBOARD';
        });
        setTimeout(() => {
          locEls.forEach((el, idx) => {
            el.textContent = prevTexts[idx] || '';
          });
        }, 1600);
      } catch {
        // clipboard access denied, ignore silently
      }
    });
  });

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
