# Ship record — Fowl Play: The Next Wave (reference: Chicken Invaders 2: The Next Wave, 2002)

## Survey
- `apps/chicken-invaders/` + `packages/shmup-core/` — shared PixiJS shmup
  skeleton with content packs. Checkpoint scope: 2 sectors × 3 waves + 1 boss
  each, 3 weapon tiers, gifts/food, lives, chapter unlock persistence, touch
  layouts A/B.
- `prototypes/chicken-invaders.html` — mechanics proof (superseded by app).
- Missing vs mission: real campaign length (CI2 = Pluto→Sun arc, ~110 waves),
  formation variety, boss variety, weapon ladder depth.

## Decision: EXTEND
Engine is clean and data-driven. Extend shmup-core to a full campaign model
(named sectors, wave scripts, per-sector bosses, new formations incl.
asteroid/belt waves, more enemy archetypes, 4 weapon tiers) and author an
8-sector replica-flavored campaign. Title renamed to "Fowl Play: The Next
Wave" (rights). Cluck Horizon rides the same engine — no fork.

## Verification
- `packages/shmup-core/tests/campaign.test.mjs` — 8-sector structure, every
  formation type clears, every named boss reachable/defeatable, and a
  real-input pilot clears the full replica campaign end-to-end (all 5 seeds).
  Last observed: 11/11 pass.
- `packages/shmup-core/tests/browser.test.mjs` — desktop controls, toolbar
  focus, named boss + result rendering, portrait touch, 44px fire targets.
  Last observed: 4/4 pass.
- Playwright release suite: production asset + desktop/phone viewport checks
  pass on chromium and firefox.

## Provenance
Checkpoint code + `05-dossiers/chicken-invaders.md`, spec `04`. CI2 wave
scripts are a documented evidence gap — authored waves are original work in
the original's structure, not copies.
