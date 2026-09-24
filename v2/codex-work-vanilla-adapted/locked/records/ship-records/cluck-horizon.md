# Cluck Horizon — living ship record

Status: production source complete; final 22-encounter campaign, both touch layouts and native failure/retry verified.

## Scope and decisions
The full original concept scope is **two sectors, 20 named formations and two commanders = 22 encounters**. The Breakfast Belt and Royal Roost Express each have ten waves followed by a commander. The Flockbird, Glider and Bruiser oppose a distinct courier craft. Soup Laser, Spatula Spread and Whisk Barrage, teal/orange SVG actors, Mother Goose/Rooster Regent, courier jokes and two original music beds distinguish this content pack. No simulation code is duplicated.

The previously observed normal-time two-sector balance clear was 41,025 points with one life; it remains separately labeled because the later renderer/repair improvements changed the final build.

## Survey and architecture
Read CHECKPOINT v 2; both shooter concept specs/build cards; the fidelity dossier; the zero-dependency prototype; shared sim/render/touch/boot; runtime verdicts 07/11 and prototype verdict; release verification; .ufo shooter defect handoffs; and the git shipping history. The original production baseline had two sectors with three formations plus a boss each. Existing scoring, boss labels, touch release, respawn protection, pickup progression and HUD clamp fixes were preserved.

Retain the Pixi app and one 120 Hz fixed-step engine in `packages/shmup-core`. Both small app entry points select content-pack data. Campaigns, palettes, SVG references, names, music and boss scripts live in the packs; there is no engine fork. The stable package paths/save namespaces preserve old records. Layered SVG actors, orbital backgrounds, HUD, menus, settings and touch are shared systems with distinct content.

## Controls, persistence and presentation
WASD/arrows move; Space/Z/left mouse fire; X/Shift/right mouse launch missiles; Esc/P pause. Explicit twin-thumb and one-thumb/autofire layouts have 44 CSS-pixel action targets. Portrait adds readable native status and 48-pixel launch/continue buttons. Settings persist volume/music, reduced motion and touch layout; Save & Hangar and C/Continue resume the latest wave boundary. Invalid checkpoint values are rejected. Focus loss clears controls and pauses. No external assets are fetched.

The renderer uses native device resolution capped at 2, avoiding forced supersampling on modest hardware. Static stars are cached when reduced motion is enabled. Formations start at y 95 and bosses settle at y 135, keeping established actors below the HUD; the fly-in is intentionally clipped at the screen edge.

## Resolved tuning
These are intentional original values, not research placeholders or claims of measured commercial parity. Acceleration 2600/damping 7.5 gives short, responsive coast; maximum 400 px/s traverses the 960-pixel field in about 2.4 seconds. Eggs at 170 px/s preserve a readable reaction interval. Three gun tiers fire every 0.17 seconds and never downgrade; 12-damage missiles make pickups meaningful without deleting bosses. Respawn is 1.2 seconds with 2 seconds of protection. Every 5,000 points grants a capped life. Commander clears repair one life and add one missile: a full-route combat-pilot attrition failure motivated this visible reward. Commander bursts have 0.7-second warnings and accelerate at half health.

## Evidence and reproducibility
The untouched baseline builds were played with real movement, held fire, a missile and pause before simulation edits, after resolving the initial headless-browser blocker. `apps/*/proofs/baseline/` contains screenshots and read-only state receipts. Both intermediate two-sector builds were completed through normal-time native-keyboard play; `proofs/balance/` preserves those receipts separately.

The shared simulation gate passes 12/12: all encounter transitions, real-combat seeded pilots, collision-unit fixtures, game over, protected respawn, scoring, corrupt saves, checkpoint resume, content coverage, pause and telegraphs. Collision-injection unit fixtures are explicitly not player-completion evidence.

Final browser verification passed all 20 formations and both commanders: **41,175 points, five lives, zero checkpoint retries**, 217.5 simulated seconds and 649.158 seconds of wall time including native menu/persistence checks. `apps/chicken-invaders-original/proofs/ship/campaign.json` records every encounter, zero page errors and zero external requests; `victory.png` shows the final result. Native checks also verified saved settings, sector unlock/best-score reload, pause freeze, sector selection and C/checkpoint resume. Both 390×844 touch layouts passed native steering and a complete first wave with released controls and 44 CSS-pixel action targets (`touch-twin.json`, `touch-one.json`): twin-thumb 1,400 points / three lives; one-thumb 1,400 / three lives. The full-campaign controller emits KeyboardEvents with `isTrusted=false` through production Input handlers. It observes read-only state and pumps the production rAF callbacks at 20 Hz; the unchanged engine still advances 120 Hz physics. Touch proof combines native CDP steering/fire smoke and complete-wave PointerEvents through production zones. No health, score, entities, collisions, progress or saves are injected. Normal-time native-input evidence is separate. These exact methods are recorded in JSON. `build-assets.json` verifies that every tested production asset matches the copied `delivery/site/chicken-invaders-original` assets; the current JavaScript entry is `index-x8t4EDjn.js`.

Natural failure and retry also passed against the final copied site in 36.065 seconds of normal wall-clock browser play. Native arrow inputs steered into real eggs, losing lives 3 → 2 → 1 → 0; R returned the game-over screen to the hangar and Enter relaunched with three lives, zero score and the first formation. No game state, save or clock was modified; CDP focus emulation only kept the headless page focused. Receipt and three screenshots: `ship-records/evidence/shooters-failure/chicken-invaders-original/`. Zero page errors and external requests were recorded.

Run from the repository root after building both apps:

```sh
node --test MAGA-everything/02-code/armor-games/packages/shmup-core/tests/campaign.test.mjs
node MAGA-everything/02-code/armor-games/packages/shmup-core/tests/legal-input.mjs
node MAGA-everything/02-code/armor-games/packages/shmup-core/tests/touch-input.mjs
SITE_ROOT=delivery/site node MAGA-everything/02-code/armor-games/packages/shmup-core/tests/failure-input.mjs
```

`SITE_ROOT=delivery/site` targets the final copied site. `ARCADE_URL` targets an already running same-process server. Browser runtime resolution comes from shared `tooling/browser.mjs`; `CHROMIUM_PATH` overrides it. `SHMUP_REALTIME=1` selects normal-time native keyboard play and `SHMUP_NATIVE=1` selects native keyboard events with the controlled clock. Physical devices and Safari have not been exercised. No publishing or pushing occurred.

## Provenance declaration
Only the supplied checkpoint, its source/docs/prototypes/history, our own implementation/game-design knowledge, and the official InterAction production page informed this work. No other candidate rendition, third-party remake, extracted commercial asset or external soundtrack was searched or used. All new artwork, wave scripts, names and synth arrangements are original.

## Packaged release gate · 2026-09-24

`node delivery/records/verify.mjs` completed with PASS from the self-contained replay/runtime package against the actual copied site. It passed 60 rules, 114 maze validations, all 14 desktop/mobile game cases under a nested path, real-time runner smoke, and the two-client LAN test. The retained receipt and logs are in `delivery/records/evidence/offline-final/`; `results.json` records exact commands and exit codes. The game-specific full campaign results and input-method limits above remain distinct from this default gate.

## Final provenance declaration

Consulted material is the checkpoint source, design documents, prototypes and git history, the official reference/tool sources specifically listed above, and this run's local implementation and verification evidence. No other project rendition, fork, third-party remake or unopened envelope was consulted. Operator finalization after an agent-session interruption changed records/packaging only; the tested game code was preserved.
