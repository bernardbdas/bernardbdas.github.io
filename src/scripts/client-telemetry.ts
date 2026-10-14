/**
 * Client Telemetry Module
 *
 * Detects and displays user IP address, coordinates (lat/long), and city.
 * Free, privacy-respecting, zero-auth, with graceful fallback.
 */

interface GeoData {
  ip: string;
  latitude: number;
  longitude: number;
  city: string;
  country_code: string;
}

export function initClientTelemetry(): void {
  const locEl = document.getElementById('telemetry-loc');
  const ipEl = document.getElementById('telemetry-ip');
  const container = document.getElementById('client-telemetry');
  if (!locEl || !ipEl) return;

  function formatCoord(lat: number, lon: number): string {
    const latDir = lat >= 0 ? '°N' : '°S';
    const lonDir = lon >= 0 ? '°E' : '°W';
    return `${Math.abs(lat).toFixed(2)}${latDir}, ${Math.abs(lon).toFixed(2)}${lonDir}`;
  }

  function formatIp(ip: string): string {
    // Truncate long IPv6 strings gracefully for HUD presentation
    if (ip.length > 18 && ip.includes(':')) {
      const parts = ip.split(':');
      return `${parts.slice(0, 3).join(':')}::`;
    }
    return ip;
  }

  let fullTelemetry = '';

  async function fetchTelemetry(): Promise<void> {
    try {
      const res = await fetch('https://ipwho.is/', {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Network response not ok');
      const data: GeoData = await res.json();

      if (data.latitude !== undefined && data.longitude !== undefined) {
        const coordStr = formatCoord(data.latitude, data.longitude);
        const cityStr = data.city ? ` [${data.city.toUpperCase()}]` : '';
        locEl!.textContent = `${coordStr}${cityStr}`;
      } else {
        locEl!.textContent = 'ONLINE';
      }

      if (data.ip) {
        ipEl!.textContent = formatIp(data.ip);
        fullTelemetry = `IP: ${data.ip}\nLocation: ${data.city || 'Unknown'}, ${data.country_code || ''}\nCoordinates: ${data.latitude}, ${data.longitude}`;
      }
    } catch {
      // Graceful offline / ad-blocker fallback
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        locEl!.textContent = tz ? tz.toUpperCase() : 'ONLINE';
        ipEl!.textContent = 'LOCAL';
      } catch {
        locEl!.textContent = 'CONNECTED';
        ipEl!.textContent = 'SECURE';
      }
    }
  }

  // Click to copy telemetry data
  if (container) {
    container.addEventListener('click', async () => {
      if (!fullTelemetry) return;
      try {
        await navigator.clipboard.writeText(fullTelemetry);
        const originalText = locEl.textContent;
        locEl.textContent = 'COPIED TO CLIPBOARD';
        setTimeout(() => {
          locEl.textContent = originalText;
        }, 1600);
      } catch {
        // clipboard access denied, ignore silently
      }
    });
  }

  fetchTelemetry();
}

// Initialize on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initClientTelemetry);
} else {
  initClientTelemetry();
}
