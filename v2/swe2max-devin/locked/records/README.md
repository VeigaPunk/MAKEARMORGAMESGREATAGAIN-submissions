# Ship records — MAGGA v2

One living record per game, created/updated in place. Each begins with the
implementation survey and the keep / extend / port / replace decision, and ends
as the ship record: acceptance checklist, verification commands + last observed
results, asset provenance, deferrals.

This run's master decisions:

- **Architecture: keep + extend.** The checkpoint's TypeScript/Vite monorepo
  (`MAGA-everything/02-code/armor-games`, PixiJS for Boxhead + both shmups,
  Canvas2D/DOM for Impossible/Burger/Sand&Steel, zero-dependency `hardest/`)
  builds clean, all 33 rule/regression tests and 114/114 level proofs pass,
  and every game boots with a coherent look. The code is small, readable and
  carries a defect register worth preserving. Rebuilding on a different engine
  would buy nothing the mission asks for. Renderer stays as-is per game.
- **Scope raised from checkpoint "v1 slice" to shippable campaigns.** The
  concept specs were written as slice scopes; the mission requires original
  scope or better. Concretely: shmups get 8-sector campaigns with per-sector
  bosses and more formations/weapons; Impossible grows from 3 to 5 courses;
  Sand & Steel grows to 16 opponents + magic/ranged shops; Boxhead gains LAN
  play (required by the mission), devils, a third room and another weapon tier;
  Burger Tycoon gains more actions/events; Hardest already exceeds the
  original (114 vs 30 levels).
- **Rights posture: all player-facing titles are original evocations.**
  In-game titles, launcher branding and submission names are renamed:
  Boxhead → **Block Siege: 2Play Rooms**, Chicken Invaders → **Fowl Play: The
  Next Wave**, The Impossible Game → **The Impossible Cube**, The World's
  Hardest Game → **The Merciless Maze**, Swords & Sandals →
  **Sand & Steel**, launcher → **Armor Arcade**. Cluck Horizon and Burger
  Tycoon were already original. URL slugs (`boxhead/`, `chicken-invaders/`…)
  are kept for link/test stability; slugs are paths, not branding.
- **Verification strategy:** Playwright drives the real production build with
  real input events (KeyboardEvent/PointerEvent/clicks). Scripted pilots read
  `?debug` snapshots only to *decide* inputs — never to inject state.
  Zero-dependency harnesses (`hardest/validate.mjs`, node:test suites, LAN
  smoke test) stay runnable with no network.

Per-game files: `boxhead.md`, `chicken-invaders.md`, `cluck-horizon.md`,
`hardest.md`, `impossible.md`, `burger-tycoon.md`, `swords-and-sandals.md`.
