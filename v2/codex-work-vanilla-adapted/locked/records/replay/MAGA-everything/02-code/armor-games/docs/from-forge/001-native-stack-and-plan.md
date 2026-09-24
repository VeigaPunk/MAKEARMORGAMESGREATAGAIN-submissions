# STACK-LOCKED — Idea 001 native replicas
## Make Armor Games Great Again · FORGE · 2026-09-22 14:34 America/Sao_Paulo

| Meta | Value |
|------|-------|
| **Status** | **STACK-LOCKED** |
| **Primary path** | Working **native** replicas (not Ruffle as ship vehicle) |
| **Ruffle / emulation** | **Fallback reference only** (existing `boxhead-2play-spike` Phase A stays INTERNAL reference shell) |
| **Monorepo** | `armor-games/` next to `boxhead-2play-spike` on AMDPORRADA |
| **Windows root** | `C:\Users\jpvei\Documents\kimi\Workspaces\veigapunkimi\armor-games\` |
| **Language** | English only (crew standing rule) |
| **Roles** | FORGE = planner/reviewer · KIMI = implement · ARCADE = fidelity · PROOF = playability acceptance · PIXEL = art · MAESTRO = audio · IDEATOR = concept briefs |

---

## 1. Stack decision (RATIFIED with narrow refinements)

### Candidates considered
| Option | Verdict |
|--------|---------|
| Vanilla **TS + Canvas2D** | **Yes** for UI-/geometry-light titles |
| **PixiJS 8** | **Yes** for sprite-/particle-heavy titles |
| **Phaser** | **No for MVP** — heavier opinionated runtime; duplicates what `arcade-core` + Pixi/Canvas already cover; larger mobile cost |

### Locked stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Language / build | **TypeScript + Vite** (npm workspaces or pnpm) | Fast HMR, small mobile bundles, one toolchain for six apps |
| Sprite-heavy apps | **PixiJS 8** | Boxhead waves + Chicken Invaders bullets/enemies need a scene graph + batching without Phaser weight |
| Lighter / UI-heavy apps | **Canvas2D** (+ optional thin DOM chrome for menus/shops) | Impossible geometry; Burger Tycoon panels; S&S turn UI — fewer simultaneous sprites |
| Shared kit | **`packages/arcade-core`** | input (keyboard/mouse/touch), integer scaling + letterbox, localStorage saves, WebAudio synth SFX helpers |
| Deploy target (dev) | **localhost** serve — phone + desktop | e2e on LAN URL / localhost; no public ship until rights clear per title |
| Emulation | Ruffle **reference only** | Keep `boxhead-2play-spike` INTERNAL for feel checks; do not treat as product path |

### Per-title renderer lock

| Title | Renderer | Notes |
|-------|----------|-------|
| Boxhead: 2Play Rooms | **PixiJS 8** | Swarm density, projectiles, particles |
| Chicken Invaders (recreate) | **PixiJS 8** | Bullet hell / invaders density |
| New CI-style original | **PixiJS 8** | Same kit as CI recreate |
| The Impossible Game (Lite-faithful) | **Canvas2D** | Geometry + timing; tiny surface |
| Burger Tycoon / McD systems | **Canvas2D** (+ DOM chrome OK for panels) | Multi-pane management UI |
| Swords and Sandals 2 | **Canvas2D** (+ DOM chrome for shop/menus) | Turn-based; UI-heavy; few simultaneous fighters |


### Build note — PixiJS 8 + Vite (LOCKED 2026-09-22 BH-1)

**Problem:** PixiJS 8 Application.init can hang forever when Rollup-bundled by vite build (dev ESM OK).

**Fleet pattern (inherit for Boxhead / Chicken Invaders / CI original):**
1. Mark pixi.js as Rollup external in the app vite.config.ts.
2. Pin self-hosted ESM under public/vendor/ (pixi.min.mjs + worker as needed).
3. Map via HTML importmap: "pixi.js": "./vendor/pixi.min.mjs".
4. Prefer preference: "webgl" on init for retro 2D.

Do not re-bundle Pixi into the app chunk until a future toolchain proves hang-free.

### Explicit non-choices
- No Phaser for v1.
- No Unity / Godot / WASM ports for these web MVPs.
- No remaster-inside-binary Ruffle ship as primary.
- No networked LAN in Boxhead MVP (local 2P / touch split later — see milestones).

---

## 2. Monorepo layout (LOCKED)

```
C:\Users\jpvei\Documents\kimi\Workspaces\veigapunkimi\armor-games\
  boxhead-2play-spike\          # existing INTERNAL Ruffle reference (unchanged role)
  armor-games\                  # NEW native monorepo
    package.json                # workspaces root
    apps\
      boxhead\                  # Pixi — START NOW
      impossible\
      burger-tycoon\
      swords-and-sandals\
      chicken-invaders\
      chicken-invaders-original\
    packages\
      arcade-core\              # input, scale, storage, webaudio synth
    README.md                   # ENGLISH; INTERNAL labels per app as needed
```

Each `apps/<game>`:
- Vite + TS
- Runs on **desktop** (keyboard/mouse) and **mobile** (touch) — “perfect” means playable controls, integer letterbox, no broken HUD
- Acceptance owned by **PROOF**; fidelity vs original owned by **ARCADE**; art **PIXEL**; audio **MAESTRO**

---

## 3. Implementation order + milestones

### Order (LOCKED)

| # | Title | Why this slot |
|---|-------|---------------|
| **1** | **Boxhead: 2Play Rooms** (native) | Research + demoability ready; Pixi proves arcade-core under load; can start **now** |
| **2** | **The Impossible Game** (Lite-faithful native) | Hardens core timing + touch; smallest surface |
| **3** | **Burger Tycoon** | Systems/UI without twitch; CC/legal path friendlier than branded McD |
| **4** | **Chicken Invaders** (recreate track) | Pixi reuse from Boxhead; sets bar for #6 |
| **5** | **Swords and Sandals 2** | Deepest systems + highest legal friction — parallel license track from day 1 |
| **6** | **New Chicken Invaders–style original** | After CI recreate lessons; PIXEL/MAESTRO lead novelty |

IDEATOR: produce **concept / build briefs** in this same order (Boxhead native brief next if not already reframed off EMULATE-primary).

### Cross-cutting milestones (every title)

| Gate | Owner | Exit |
|------|-------|------|
| G0 Legal scope | KIMI / João | INTERNAL vs public documented; no public deploy without clearance |
| G1 Vertical slice | KIMI | One playable loop on localhost desktop + phone |
| G2 Fidelity pass | ARCADE | Checklist ≥ agreed bar or signed waivers |
| G3 Acceptance | PROOF | Desktop + touch suites green |
| G4 Art/audio polish | PIXEL / MAESTRO | Within native-replica mandate (feel-faithful, not HD remaster unless brief says) |
| G5 FORGE review | FORGE | Spec compliance review PASS |

### Boxhead native — start-now slice (B-N0…B-N3)

| ID | Work | Exit |
|----|------|------|
| B-N0 | Scaffold `armor-games/` monorepo + `packages/arcade-core` stubs + `apps/boxhead` Vite/Pixi | `npm run dev` serves boxhead on localhost |
| B-N1 | Core loop: room, waves, shoot, die, score (desktop keys) | Solo wave 3 playable |
| B-N2 | Touch controls + integer letterbox; local 2P stretch goal after solo solid | Phone playable solo |
| B-N3 | Hook ARCADE dossier + PROOF plan; FORGE review | PASS → next title scaffold |

Keep `boxhead-2play-spike` as **feel reference** only (INTERNAL); do not block native on SWF clearance.

---

## 4. Acceptance shape (PROOF) — fleet defaults

Every title must ship with:
- Desktop: keyboard (+ mouse where authentic)
- Mobile: touch controls that do not break desktop
- Integer scale / letterbox (no hitbox-warping stretch)
- localStorage progress where the original had persistence
- Lightweight: prefer small Vite bundles; no unnecessary engines

---

## 5. Handoff routing

| Audience | Action |
|----------|--------|
| **RELAYER / to-kimi** | Mirror this STACK-LOCKED file for Kimi Work |
| **IDEATOR** | Concept specs in order §3 |
| **ARCADE** | Fidelity dossiers remain source of truth; stage dims stay UNVERIFIED until measured |
| **PIXEL / MAESTRO / PROOF** | Join when KIMIKO confirms ids on allowlist — art/audio/QA against this stack |
| **FORGE** | Planner/reviewer only — no implement on Windows beyond review |

---

## 6. One-line command to implementers

> Scaffold `armor-games/` with TS+Vite, `arcade-core`, and Pixi `apps/boxhead`; ship a localhost solo wave-3 native slice; treat Ruffle spike as reference only; then Impossible → Burger Tycoon → CI recreate → S&S2 → CI original.

---

## Pointers

- This lock: `/workspace/armor-games-research/specs/001-native-stack-and-plan.md`
- Prior EMULATE spike (reference): `/workspace/armor-games-research/specs/001-boxhead-2play-M1-ruffle-spike.md`
- Prior EMULATE parent (superseded as primary path): `/workspace/armor-games-research/specs/001-boxhead-2play-impl-spec.md`
- Dossiers: `/workspace/armor-games-dossiers/`
