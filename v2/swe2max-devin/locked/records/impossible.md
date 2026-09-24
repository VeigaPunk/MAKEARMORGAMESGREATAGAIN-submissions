# Ship record — The Impossible Cube (reference: The Impossible Game; feel: 2010 Lite)

## Survey
- `apps/impossible/` — Canvas2D fixed-impulse autorunner, deterministic 120 Hz
  sim, jump buffer + coyote, instant respawn, 3 courses (First Light / Cold
  Front / Last Ember), practice checkpoints, unlocks, per-course records,
  beat-synced synth notes, pause/focus handling.
- `prototypes/impossible-game.html` — mechanics proof (superseded).
- Missing vs mission: full-game content target = five levels (dossier: Fire
  Aura, Original, Chaoz Fantasy, Heaven, Phazd). Checkpoint ships 3.

## Decision: EXTEND
Author courses 4–5 (harder, distinct palette/rhythm), keep deterministic sim,
rename title, verify all five with real-input clear runs + 0-death proofs.

## Verification
- `verification/tests` gameplay tapes: all five courses (First Light, Cold
  Front, Last Ember, Overdrive, Terminal Velocity) clear with discrete 60Hz
  jump input; misses kill and retry instantly; landing never snaps through
  platforms. Last observed: pass.
- Playwright `release.spec.js` five-course campaign test drives real
  keypresses through unlocks/save/retry; practice/pause/blur spec covers
  checkpoint saves. Last observed: pass on chromium and firefox.

## Provenance
Checkpoint code + dossier/spec. Course layouts are original geometry in the
original's vocabulary (single spikes, double/triple spikes, blocks, gaps).
