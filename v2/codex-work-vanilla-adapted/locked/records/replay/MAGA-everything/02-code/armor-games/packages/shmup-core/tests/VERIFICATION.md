# Shooter verification · current expedition

The shared simulation contains one engine and two data packs. Starfall Flock has 11 sectors × (9 formations + commander) = 110 encounters. Cluck Horizon has 2 sectors × (10 formations + commander) = 22 encounters.

Current simulation gate: 12/12 pass. This includes all encounter transitions, boss damage/telegraphs, loss/respawn, malformed saves, checkpoint restore, weapon and life economy, pause, content coverage, and seeded pilots using ordinary movement/fire/missiles through both campaigns. Collision-level fixtures are isolated unit tests, not presented as player completion evidence.

Production browser gates:

- `legal-input.mjs`: serves built applications or `SITE_ROOT`, blocks external requests, starts a fresh context, exercises settings and reload, then plays every encounter using browser KeyboardEvents (`isTrusted=false`) through the production Input handlers. Its observer only reads game state. Default timing uses a controlled rAF/performance clock at 20 Hz; the unchanged production simulation still runs 120 Hz physics, with input decisions every 100 ms. `SHMUP_NATIVE=1` sends native keyboard events; `SHMUP_REALTIME=1` uses native keyboard events and normal scheduling. Native menus, start, persistence and pause checks are also exercised in the default run. Results include method, virtual and actual elapsed times, every encounter, final score, lives, reload persistence and errors. No game state, save, entity, collision, health or progression is injected.
- `touch-input.mjs`: fresh 390×844 contexts; native CDP movement/fire smoke for both control layouts in both games, followed by one full wave using browser PointerEvents (`isTrusted=false`) through the actual canvas touch zones. Reads positions to steer, checks release and 44 CSS-pixel targets. Timing is explicitly controlled as above. The first wave is tested in each layout, not a full mobile campaign.
- `failure-input.mjs`: native Playwright keyboard events with normal wall-clock scheduling against `SITE_ROOT` (default `delivery/site`). Fresh contexts, read-only telemetry, natural egg collisions reduce three lives to zero; actual game-over → hangar → relaunch controls restore the initial three lives/zero score. No game-state/save/clock mutation; CDP focus emulation only.
- `browser.test.mjs`: historical isolated UI/collision fixtures. These mutate fixture state and do not substantiate campaign completion.

Baseline builds were played with real movement, held fire, a missile and pause before simulation edits. The original two-sector expanded balance builds were also completed in normal wall-clock browser play: Starfall 41,400 points / two lives, Cluck 41,025 / one life. Those intermediate receipts are under each app's `proofs/balance/` and are not evidence for the subsequent full Starfall route.

Current-source results are recorded in each app's `proofs/ship/*.json`:

| Game | Completed encounters | Score / lives | Retries | Controlled seconds | Wall seconds including UI checks |
| --- | ---: | ---: | ---: | ---: | ---: |
| Starfall Flock | 99 formations + 11 commanders | 196,500 / 5 | 0 | 1,029.9 | 1,787.780 |
| Cluck Horizon | 20 formations + 2 commanders | 41,175 / 5 | 0 | 217.5 | 649.158 |

Both final campaigns passed native settings, best-score/unlock reload, pause freeze, sector selection and checkpoint-resume assertions. Both games passed the two portrait touch layouts. Native natural-failure/retry checks against the copied site passed in 33.658 seconds (Starfall) and 36.065 seconds (Cluck); receipts and screenshots are in `ship-records/evidence/shooters-failure/`. Every browser receipt has zero page errors and external requests. Referenced-entry/vendor/art hashes match the copied production assets. No Safari, full mobile campaign or physical-device claim is made.
