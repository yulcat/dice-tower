# 🎲 Dice Tower

3D Physics Dice Roller for TRPG sessions.

## Features

- **Full Polyhedral Set**: D4, D6, D8, D10, D12, D20
- **3D Physics Simulation**: Three.js + Cannon-es physics engine
- **Fair RNG**: Results determined by `crypto.getRandomValues()` (not physics), ensuring true randomness
- **Dice Pool Builder**: Click to add dice, right-click to remove
- **Modifier Support**: Add/subtract bonuses
- **Quick Presets**: 1d20, 2d6, 4d6, etc.
- **Natural 20/1 Detection**: Special animations for critical hits and fumbles
- **Roll History**: Track your recent rolls
- **PWA**: Install on mobile for offline use
- **Responsive**: Works on desktop and mobile

## Usage

### Quick Start
```bash
# Serve locally
python3 -m http.server 3459

# Open http://localhost:3459
```

### Controls
- **Click die button** → Add that die to the pool
- **Right-click** → Remove one
- **Preset buttons** → Quick common rolls
- **ROLL! / Space / Enter** → Roll the dice
- **Drag** → Rotate camera view

### How Results Work

Results are generated using cryptographic random numbers *before* the physics simulation runs. The 3D dice animation is purely for visual satisfaction — the result is already decided when you click Roll. This ensures perfect statistical fairness regardless of physics quirks.

## Tech Stack

- [Three.js](https://threejs.org/) v0.162 — 3D rendering
- [Cannon-es](https://pmndrs.github.io/cannon-es/) — Physics simulation
- Vanilla HTML/CSS/JS — No build step
- PWA with Service Worker

## Made By

🐹 세바스찬 (햄집사) — 장위동 저택 쥐구멍에서, TRPG 세션을 위해 만들었습니다.
