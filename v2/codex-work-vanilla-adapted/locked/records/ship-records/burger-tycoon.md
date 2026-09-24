# Burger Tycoon — living ship record

## Survey and decision · 2026-09-23

Found two implementations: `prototypes/burger-tycoon.html` (standalone mechanics/art proof) and `MAGA-everything/02-code/armor-games/apps/burger-tycoon` (TypeScript pure economy plus Canvas scenes and accessible DOM operations). `arcade/` links the app build only. Git history reviewed through `f8449eb`, `69f9b24`, `2d30570`, and `4f5cc41`; CHECKPOINT, concept spec 03, build card, verification/RELEASE, prior Burger verdicts and tests were read as historical claims.

**Keep and extend the native app.** Its causal crop → herd → patty → restaurant chain, disease, board interventions and dirty-action backlash work and have direct regression coverage. Keep the authored flat scenes brought over from the prototype. Retire the prototype from reachability (already absent from entry point); do not discard its lessons. Add deeper management decisions, calmer session pacing with explicit simulation-speed control, operational guidance, full volume settings and readable compact dashboard. The source's old “declared guesses” are replaced with documented, intentional original tuning, never represented as measured source-game values.

## Baseline played before production edits

`npm run setup` and `npm run build`: PASS (seven-game dist). Normal Chrome failed due environment UNIX socket restrictions; official Chrome for Testing Headless Shell 154.0.8037.57 works. A Playwright-driven baseline session used actual buttons: open, sow, buy cattle, cheap feed, cut corners, 15 seconds, Escape pause. HUD: cash $540, reputation 70%, net +$8/sec; pause heading “Meeting adjourned.” Evidence: `verification/evidence/baseline/burger-title.png`, `burger-play.png`. The four illustrations are coherent, but desktop monitoring needs too much scrolling, there is no volume control, and the economy has too few management levers.

## Preservation comparison

The existing eleven actions, dirty flags, safe save/reload, two failure causes, best survival record, four pane hotkeys, mouse/touch buttons, pause and flat animation remain. Added systems must preserve clean unattended bankruptcy and dirty profit → disease → reputation collapse. No copied logos, characters or assets.

## Acceptance / verification (completed)

- [x] Baseline build and real-button play captured.
- [x] Sustain a managed operation for five real-time-equivalent minutes with pointer inputs, verified with native wall-clock desktop and touch sessions.
- [x] Failure, retry, pause, settings, reload, phone tabs, nested release path.
- [x] Final rule gate, exact commands and observed results.

## Asset provenance / consulted material

Checkpoint source, the concept spec and build card above, checkpoint verification, git history and own knowledge of the reference. Existing original procedural scene illustrations and oscillator music retained/extended. No third-party remakes, project renditions, fork pages or evaluation targets consulted. No source-original branding/art/audio copied.


## Final copied-release proof · 2026-09-24

Observed complete PASS at `2026-09-24T00:39:31.967Z`, served from the frozen copied release at `/workspace/scratch/05b3d5bae7f8/delivery/site` under the nested route `/proof/second-wind/burger-tycoon/`. Game source and copied production files were unchanged during this verification. Only the player harness and this record were updated; evidence files were generated.

Rerun from the workspace root, with the installed local Chromium runtime (or set `CHROMIUM_PATH`):

```sh
SITE_ROOT=/workspace/scratch/05b3d5bae7f8/delivery/site node MAGA-everything/02-code/armor-games/apps/burger-tycoon/tests/player.mjs
node --test MAGA-everything/02-code/armor-games/apps/burger-tycoon/tests/economy.test.mjs
```

The player harness starts its own local server and two independent Chromium Headless Shell browsers: desktop 1440 × 960 and touch-enabled mobile emulation 390 × 844. Both use **native wall-clock animation throughout**. Chromium focus emulation keeps the two headless pages focused; there are no animation-clock overrides, internal action calls, save injections, or company-state writes. Inputs are real mouse, touchscreen, wheel and keyboard events, checked against the visible controls. The debug surface is read only for telemetry. The final run observed no automatic pauses.

The clean management policy used visible controls to lease one pasture, plant soy at each 30-company-second checkpoint, and purchase five cattle when observed stock fell below four. Normal pace remained 1×. One simulation second equals four displayed company seconds.

| Observed result | Desktop | Emulated touch |
| --- | ---: | ---: |
| Native elapsed time for management | 363.116 s | 302.100 s |
| Displayed company age at survival check | 300.390 s | 301.543 s |
| Simulation time at survival check | 75.097500 | 75.385725 |
| Cash | $290.097500 | $290.385725 |
| Reputation / backlash | 70 / 0 | 70 / 0 |
| Cattle remaining | 8.239923 | 8.198206 |
| Dividends paid | 1 | 1 |
| Natural reputation-collapse simulation time | 117.096150 | 117.481125 |
| Cash remaining at collapse | $476.820330 | $476.036791 |
| Retry simulation time / cash | 0.007200 / $500.007200 | 0 / $500 |

Both sessions also passed a three-second frozen pause, volume adjustment to 1%, scene-motion toggle and persistence, mute/unmute, reload and Continue company, phone operation tabs, and a no-horizontal-overflow check. The deliberate failure sequence enabled all three dirty shortcuts through their buttons and selected the public 4× speed control. Both companies naturally reached reputation 0 and backlash 100 with positive cash, displayed **The public has spoken.**, and restarted through **Build another company**. No page exceptions or HTTP errors were recorded. A separate fresh native-clock touch check at `2026-09-24T00:42:17.369Z` tapped all four tabs, including Headquarters, and asserted the matching selected tab and visible operation after each tap; `evidence/touch-tabs.json` records PASS with no page errors. The four economy regression tests also passed.

Desktop's wall time exceeded its displayed age under concurrent rendering load; the result is not presented as a frame-rate benchmark. Earlier controlled-clock experiments stalled input acknowledgments, and an initial native parallel attempt timed out while the desktop company was still healthy. The final native-clock/focus-emulated run completed. The prior missing-action locator failure was not conclusively reproduced as an economy defect; telemetry in the final run verifies healthy companies at both 150 and 300 displayed seconds.

Evidence: `MAGA-everything/02-code/armor-games/apps/burger-tycoon/evidence/player-results.json` contains exact checkpoints, action-before/action-after telemetry, settings/reload, collapse/retry, asset hashes and the empty error list. The tested copied scripts were:

- `burger-tycoon/assets/index-bT-scIum.js` — SHA-256 `719ac6b2f3dd82d7e5e0e5e7b0cf98d22e24989bceef4233193a8e637143a27f`
- `return.js` — SHA-256 `7375f7e147c7f74e2b25d7f63e332027617c5337adda7a69c84cde60a24c5ea7`

A separate fresh native-clock desktop session opened the company and planted soy using actual mouse input, then captured all four operation panes and their controls. It is a clean starting-dashboard preview, not the five-minute state: `evidence/dashboard-desktop.png` (1440 × 926, SHA-256 `22b3eecc2d60f351ed8edf26c39b14bef6392ba8e0aa05c608a5d305ee3a989d`) and `evidence/dashboard-desktop-preview.png` (640 × 412, SHA-256 `5f7dbcd71f8246a79818b664f87e6fb09cc037e36319f258f91e335a66c273c3`), relative to the Burger app. Capture used the native Chromium surface at clip 0,0,1440,926, with preview scale 640/1440.

### Provenance endpoint and limits

Reference access ended with the checkpoint application/prototype, concept/build documentation, prior verification and selected git history described above, plus existing reference knowledge. Final verification consulted only this original implementation and its own test harness; no additional source-original session, third-party rendition, fork, remake or evaluation target was consulted. The procedural illustrations and oscillator score retain their original project provenance. This verifies the authored rendition's observed behavior, not measured parity with the source-original economy or timing. Physical phones, Safari and Firefox remain unverified; mobile results are Chromium touch emulation. The final player proof does not assess listening quality of the full score.

## Packaged release gate · 2026-09-24

`node delivery/records/verify.mjs` completed with PASS from the self-contained replay/runtime package against the actual copied site. It passed 60 rules, 114 maze validations, all 14 desktop/mobile game cases under a nested path, real-time runner smoke, and the two-client LAN test. The retained receipt and logs are in `delivery/records/evidence/offline-final/`; `results.json` records exact commands and exit codes. The game-specific full campaign results and input-method limits above remain distinct from this default gate.

## Final provenance declaration

Consulted material is the checkpoint source, design documents, prototypes and git history, the official reference/tool sources specifically listed above, and this run's local implementation and verification evidence. No other project rendition, fork, third-party remake or unopened envelope was consulted. Operator finalization after an agent-session interruption changed records/packaging only; the tested game code was preserved.
