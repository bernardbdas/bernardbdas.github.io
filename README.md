# bernardbdas.github.io

[![Deploy Astro site to Pages](https://github.com/bernardbdas/bernardbdas.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/bernardbdas/bernardbdas.github.io/actions/workflows/deploy.yml)
[![Node Version](https://img.shields.io/badge/node-%3E%3D22.12.0-blue.svg)](https://nodejs.org/)
[![Astro Version](https://img.shields.io/badge/astro-5.x-orange.svg)](https://astro.build/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Tactical Engineering Instrument & Digital Laboratory**  
> Personal portfolio, research dashboard, and system showcase for **Bernard Birendra Das** — AI & Machine Learning Engineer specializing in distributed training, high-throughput inference serving, agentic graph systems, and embedded edge perception.

---

## ⚡ Architecture & Key Capabilities

- **Cyber-Brutalist HUD Design**: Minimalist terminal-inspired aesthetic featuring interactive tactile instrument readouts, custom typography, glassmorphism overlays, and CRT scanlines.
- **Three.js 3D Wireframe Terrain**: GPU-accelerated interactive canvas featuring dynamic Perlin noise vertex displacement, cursor interaction waves, and lazy-loaded initialization.
- **Continuous Atmospheric Soundscape Engine**:
  - **7 Ambient Soundscapes** (Subterranean loop + 6 atmospheric interludes).
  - Uninterrupted audio playback across ClientRouter page navigations.
  - Independent Ambient toggle and UI Sound FX (`FX // ON` / `FX // OFF`) controls.
  - Interactive Micro-Sounds Pool: tactile mechanical clicks, acoustic hover ripples, modal chords, analog slider ticks, and theme energy pulses.
  - Automatic audio ducking when video or demonstration media is active.
- **Interactive Project Demonstrations (`ProjectDemoModal`)**:
  - 6 Production Systems (`SYS_01` to `SYS_06`) with interactive demonstration overlays.
  - **Custom Video Player**: Scrubber, time telemetry, mute toggle, variable playback speeds (`1.0x`, `1.5x`, `2.0x`), and CRT radar scanline telemetry.
  - **Simulated Terminal Replay**: High-velocity benchmark runner with timestamped logs, color-coded status levels (`INIT`, `INFO`, `METRIC`, `SUCCESS`), and live re-run triggers.
  - **System Architecture Blueprints**: Deep topology diagrams, microservice breakdowns, and hardware benchmark deltas.
- **Tactical Instruments**:
  - **Live Uptime / Age Counter**: Microsecond-precision live counter with one-click toggle between standard (`Y D H:M:S.ms`) and decimal (`YRS`) formats.
  - **Dual-Mode World Clock**: Displays local browser time/date/timezone; double-click/double-tap toggles to Bernard's IST clock (`Asia/Kolkata`); single-click copies active timestamp to clipboard.
- **Dynamic 5-Palette Color Engine**: Instant switching between `Amber`, `Blue`, `Emerald`, `Violet`, and `Light` modes with localStorage persistence.
- **Cultural Media Deck (`/media`)**:
  - **Radio Shack (SDR)**: Real-time Software Defined Radio player streaming global electronic, lo-fi, and ambient stations with frequency oscilloscope simulation and visual club mode.
  - **Curated Cinema & Prestige TV**: Curated media database with strict platform filtering across authorized OTT providers (Apple TV, Netflix, Prime Video, JioHotstar, Mubi, A24, HBO Max, Lionsgate).
- **Responsive Mobile HUD Drawer**: Full-screen mobile navigation drawer featuring a balanced 5-column palette grid, dedicated audio engine buttons, and zero-delay manipulation touch actions.

---

## 🛠️ Tech Stack

| Layer             | Technologies                                                               |
| :---------------- | :------------------------------------------------------------------------- |
| **Framework**     | [Astro 5](https://astro.build/) (Static Site Generation + ViewTransitions) |
| **Graphics & 3D** | [Three.js](https://threejs.org/) (Custom Wireframe Geometry & Shaders)     |
| **Styling**       | Vanilla CSS (CSS Grid, Flexbox, Custom Properties, Glassmorphism)          |
| **Typography**    | Berkeley Mono / JetBrains Mono, Source Serif Pro, Inter                    |
| **Mathematics**   | [KaTeX](https://katex.org/) (LaTeX Mathematical Rendering)                 |
| **Audio**         | HTML5 Audio + Web Audio API (Multi-track Pool & Sound Synthesis)           |
| **Code Quality**  | ESLint, Prettier, Husky, Lint-Staged                                       |
| **Deployment**    | GitHub Actions & GitHub Pages                                              |

---

## 📂 Project Structure

```text
.
├── public/
│   ├── audio/
│   │   ├── ambient/        # 7 atmospheric background loops & interludes
│   │   └── fx/             # Tactical micro-sounds (click, ripple, modal, surge)
│   ├── videos/
│   │   └── projects/       # Screencasts and video demonstrations
│   └── bernard-resume-sourceserifpro.pdf
├── src/
│   ├── components/
│   │   ├── ChromeNav.astro        # Top instruments bar & mobile HUD drawer
│   │   ├── ChromeFooter.astro     # Global footer with telemetry
│   │   ├── Hero.astro             # Terminal identity intro
│   │   ├── About.astro            # Core background & philosophy
│   │   ├── Projects.astro         # Featured production AI/ML systems
│   │   ├── ProjectDemoModal.astro # Interactive video, terminal & arch modal
│   │   ├── Skills.astro           # Core competencies & stack matrix
│   │   ├── Contact.astro          # Secure comms channels & copy buttons
│   │   ├── ResumeModal.astro      # In-browser visual PDF previewer
│   │   ├── SDRRadio.astro         # Software Defined Radio player
│   │   ├── MediaCinema.astro      # Curated cinema deck
│   │   └── MediaTV.astro          # Prestige television deck
│   ├── data/
│   │   ├── projects.ts            # Typed systems metadata, demos & logs
│   │   ├── media-curation.ts      # Film & television curation database
│   │   └── radio-stations.ts      # Live streaming radio stations
│   ├── layouts/
│   │   └── BaseLayout.astro       # Root layout with meta tags & ClientRouter
│   ├── pages/
│   │   ├── index.astro            # Main single-page portfolio & 3D terrain
│   │   ├── media.astro            # Multi-mode media deck (Radio / Cinema / TV)
│   │   ├── research.astro         # Empirical research lab & preprints
│   │   └── blog.astro             # Systems engineering journal
│   ├── scripts/
│   │   ├── age-counter.ts         # High-precision uptime counter engine
│   │   ├── local-clock.ts         # Dual-timezone interactive clock instrument
│   │   ├── ambient-sound.ts       # Audio manager & micro-sounds interaction
│   │   ├── terrain.ts             # Three.js 3D wireframe mesh generator
│   │   └── client-telemetry.ts    # Performance telemetry instrumentation
│   └── styles/
│       └── global.css             # Unified brutalist cyber-HUD design tokens
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `>=22.12.0`
- **Package Manager**: `npm` or `bun`

### Installation

```bash
# Clone repository
git clone https://github.com/bernardbdas/bernardbdas.github.io.git
cd bernardbdas.github.io

# Install dependencies
npm install
```

### Development

```bash
# Start local development server
npm run dev

# Or start in background mode (recommended for agentic workflows)
astro dev --background
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

### Quality & Verification

```bash
# Format codebase with Prettier
npm run format

# Run ESLint validation
npm run lint

# Build static production bundle to ./dist/
npm run build

# Preview production build locally
npm run preview
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

**Bernard Birendra Das** — [GitHub](https://github.com/bernardbdas) • [LinkedIn](https://linkedin.com/in/bernard-birendra-das) • [Website](https://bernardbdas.github.io)
