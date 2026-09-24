# Ship record — The World's Toughest Game (reference: The World's Hardest Game)

## Survey
- `hardest/` — dependency-free engine + 114 authored levels (coins, keys/doors,
  teleports, moving walls, checkpoints, medals, pars, tiers), deterministic
  validator `node hardest/validate.mjs`, autopilot, save/progress persistence,
  touch joystick. 114/114 PASS at survey time.
- Supersedes the original's 30 levels with a 114-level authored corpus.

## Decision: KEEP
Complete already. Only player-facing title rename (rights) + minor chrome
polish; corpus, engine and validator untouched.

## Verification
- `node hardest/validate.mjs` → 114/114 PASS (deterministic, zero-dep).
- `hardest/browser-check.mjs` → real-input replays of L1/L30/L97/L109/L111/
  L114 clear with 0 deaths; corrupt saves, medals, pause/focus, touch.
  Last observed: all PASS.
- Playwright release + subdirectory specs pass on chromium and firefox.

## Provenance
Checkpoint code only.
