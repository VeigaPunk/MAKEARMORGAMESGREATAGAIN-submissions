# Pulsebound · mission survey and ship record

## Checkpoint surveyed before editing
- Read `CHECKPOINT.md`, concept spec 02, build card, fidelity dossier, prototype card, prototype verdict, runtime verdicts 05/12, current app/README, shared input/audio/storage and app git history.
- History `2e74d55` scaffold → `69f9b24` gap/side collision fixes → `4f5cc41` three-course collection attempt. Kept deterministic 120 Hz physics, fixed jump impulse, front-edge block collision, lethal pits, instant retry and latched input.
- Existing scope is three short original courses (27.5, 35, 40.8 seconds), one repeating eight-note music pattern, practice and sequential unlocks. It is neither the exact 2010 layout nor full commercial content. Historic design documents defer full content; the current mission explicitly supersedes that slice limit.
- Exact reference measurements / first-party assets are absent. Original work under the new name **Pulsebound** retains the one-button auto-run / precision jump / restart vocabulary. No copied tracks, geometry, names or third-party remakes.
- Pre-edit live play was attempted against Vite :5174 through installed Chrome. It failed before page load: sandbox `socket() Operation not permitted` in Chrome process-singleton setup. Escalation was automatically rejected. Parent confirmed CUA localhost is blocked too; implementation proceeds with this limitation recorded, pending an authorized browser runner.

## Intended release scope
Five authored full-length courses with original musical arrangements, complete sequential normal campaign, separate practice records/checkpoints, medals, settings/calibration, keyboard/pointer/touch, pause/focus recovery, resilient local saves, authored minimalist art. Course duration and actual verification results will be recorded below after implementation.

## Baseline play and completed implementation
The sanctioned Chrome Headless Shell later became available. Played the untouched collection build: clicking Start and sending a real Space press moved the cube to x=78, y=271.35 (airborne), with the existing visual/hazard loop visible. Baseline screenshot: `apps/impossible/evidence/baseline.png`.

The campaign now has five full courses, 100 / 108 / 116 / 124 / 140 seconds (9:48 total without retries), requiring 54 / 71 / 82 / 92 / 104 jumps along the verification routes. Each is an explicit, authored phrase order; none is generated randomly. Normal unlocks all five, gold/silver/bronze rewards, independent practice records and fixed safe checkpoints are implemented. The original collision fixes and 160 ms retry target remain.

All five score arrangements are new: distinct melody, tonal center and chord progression; bass, pad, lead, kick, snare, hats and fills; introduction, development and closing sections. The course grid is 120 BPM, four bars per phrase. WebAudio buffers seek to simulation position on retry/checkpoint/resume. Art uses original Canvas geometry and five atmospheric palettes. Settings include music/effects levels, input delay, signed audio offset and reduced motion. Keyboard, pointer and a portrait touch pad enter the same fixed impulse loop. Focus loss pauses.

## Verification so far
- App TypeScript and Vite build: pass.
- App deterministic tests: 13/13 pass, including all five complete routes with 60 Hz input, every practice checkpoint, lethal misses, front-edge collision, fixed jump and 166.7 ms retry bound.
- Shared gameplay suite updated to the full campaign: 11/11 pass (Burger assertions unchanged).
- Wall-clock full browser attempt reached approximately 98% of First Light, but narrow chained-platform inputs missed under concurrent browser load; stopped after retries. **This is not recorded as a full clear.**
- Complete browser traversal uses Playwright Clock to advance normal requestAnimationFrame callbacks, while Playwright sends real keyboard presses. Read-only debug telemetry only; no state injection, teleport, invulnerability, simulation calls or synthetic completion. Real-time smoke remains separate; final results are below.

## Browser-discovered regression and fix
The complete five-course input run succeeded (all five on attempt 1, no deaths), then real-time touch verification exposed a startup timing defect. Original score generation can delay the start handler enough that an already-queued rAF timestamp precedes the reset `last` timestamp. The previous one-sided time clamp admitted a negative delta: the simulation waited to catch up and the visual flash became red. Fixed the frame delta to the closed interval 0–50 ms. This does not change fixed-step physics.

Fresh real-time Chromium smoke after the fix passes desktop input, pause/resume, music transport, emulated touch jump and 390×844 viewport fit. Observed music/simulation phase difference was 10 ms; no page errors. Pre-fix screenshots retain explicit `pre-fix-` names. The full campaign was rerun after this fix; all five courses and the post-campaign touch check pass.

## Final verification results
Chromium 154.0.8037.57. `apps/impossible/evidence/browser-report.json` is a clean passing report, with screenshots of every course in play and every completion screen. Every course used the normal locked/unlocked UI path and actual Playwright keyboard input. Total: 403 key presses, five first-attempt clears, zero deaths. This is controlled-clock browser completion, not a claim of human wall-clock mastery.

| Course | Simulated course time | Keyboard presses | Final x | Result |
|---|---:|---:|---:|---|
| First Light | 100 s | 54 | 36000 | Clear, no deaths |
| Blue Shift | 108 s | 71 | 38880 | Clear, no deaths |
| Glasswork | 116 s | 82 | 41760 | Clear, no deaths |
| Emberline | 124 s | 92 | 44640 | Clear, no deaths |
| Event Horizon | 140 s | 104 | 50400 | Clear, no deaths |

The same passing run verifies saved unlocks after reload, short key presses, pause freezing, resume, practice respawns, signed audio-offset persistence, emulated touch and phone width fit, with zero page errors. The full-run bundle hash is `5777ee35c3b043c49d9740813b12a75f91e89d4d9e1f9e884f53c9bc58b37286`.

A subsequent isolated calibration correction schedules silence when a negative audio offset precedes music time zero; the default zero-offset campaign path and physics are unchanged. Final real-time smoke against that bundle passes real keyboard/touch, pause/resume, audio transport and the negative calibration branch. Requested −150 ms offset measured −120 ms after 300 ms; uncalibrated phase difference was 51 ms in that run (an earlier run measured 10 ms). Final JS hash: `a2d8edc8793571b5867d7e050e622d2917a52a68a762c4099f34b920395b9d71`. The final smoke captures its own asset hash in `evidence/smoke-report.json`.

All 13 app rule tests, TypeScript, Vite build and diff whitespace checks pass. The shared 11-test gameplay suite passed after updating the Impossible-specific assertions to the full charts. Source scope: `apps/impossible`, its new tests/evidence, the Impossible portions of shared gameplay/browser tests, and this record. No shared engine, launcher, publication, push or submission lock changes made by this lane.

### Offline rerun commands
From repository root, with dependencies already installed:

```bash
npm --prefix MAGA-everything/02-code/armor-games run typecheck -w @maga/impossible
node --test MAGA-everything/02-code/armor-games/apps/impossible/tests/campaign.test.mjs
npm --prefix MAGA-everything/02-code/armor-games run build -w @maga/impossible
PULSEBOUND_BROWSER=/path/to/chrome-headless-shell node MAGA-everything/02-code/armor-games/apps/impossible/tests/browser.mjs --deterministic
SITE_ROOT=/absolute/path/to/delivery/site PULSEBOUND_BROWSER=/path/to/chrome-headless-shell node MAGA-everything/02-code/armor-games/apps/impossible/tests/browser.mjs --smoke
```

The harness starts its own server and browser in one invocation. `ARCADE_URL=http://127.0.0.1:4173` can replace `SITE_ROOT` for an already-running collection. Omit `--deterministic` for real-time course play. All game assets are local; no network music or fonts.

### Limits
- Original five-course content, not a reproduction of the commercial levels or music. Exact 2010 geometry, measured latency/hitbox parity and commercial medal criteria remain unestablished by the historical sources.
- Physical phone/tablet input, Safari/Firefox and audio-device latency are not verified in this lane. Touch evidence uses Chromium device emulation.
- Continuous wall-clock musical sync over a whole ten-minute campaign and subjective sound quality were not certified; controlled-clock completion does not test those. Short real-time transport/calibration checks are measured separately above.
- No level editor or user-authored chart import. The release scope here is the complete authored campaign.

## Final copied-release gate · 2026-09-24
Executed the exact copied-site command:

```bash
SITE_ROOT=/workspace/scratch/05b3d5bae7f8/delivery/site node MAGA-everything/02-code/armor-games/apps/impossible/tests/browser.mjs --smoke
```

**PASS**, Chromium 154.0.8037.57, report timestamp `2026-09-24T00:06:59.919Z`. Verified copied-release title, real keyboard jump, pause, resume, running music transport, signed audio calibration, real emulated touchscreen jump and phone viewport fit; zero page errors. Observed uncalibrated audio phase error: **14 ms**. Requested −150 ms calibration measured **−157 ms**.

Fetched script `/impossible/assets/index-BtFAFK1L.js` and the file at `delivery/site/impossible/assets/index-BtFAFK1L.js` both hash to **`a2d8edc8793571b5867d7e050e622d2917a52a68a762c4099f34b920395b9d71`** (SHA-256). The copied launcher helper `/return.js` hashes to `7375f7e147c7f74e2b25d7f63e332027617c5337adda7a69c84cde60a24c5ea7`.

Evidence: `apps/impossible/evidence/smoke-report.json`, `release-smoke.png`, `title-desktop.png`, `title-phone.png`, and `touch-play.png`. An initial attempt exposed only a harness directory-resolution error (`/impossible/` was not resolved to `index.html`); the harness was corrected and rerun. Smoke failures now write a separate report and cannot overwrite the complete campaign report. **No game or copied delivery files changed for this final gate.**

## Provenance declaration

Consulted the supplied checkpoint, its Impossible Game concept/build/fidelity/prototype records, prior verification, git history, and own knowledge of the one-button reference. Retained tested collision rules; authored all new chart sequences, names, geometric scenes and music. Browser and test APIs use installed official tooling. No third-party remake, project rendition, fork, source music, or commercial level asset was consulted or copied.

## Packaged release gate · 2026-09-24

`node delivery/records/verify.mjs` completed with PASS from the self-contained replay/runtime package against the actual copied site. It passed 60 rules, 114 maze validations, all 14 desktop/mobile game cases under a nested path, real-time runner smoke, and the two-client LAN test. The retained receipt and logs are in `delivery/records/evidence/offline-final/`; `results.json` records exact commands and exit codes. The game-specific full campaign results and input-method limits above remain distinct from this default gate.

## Final provenance declaration

Consulted material is the checkpoint source, design documents, prototypes and git history, the official reference/tool sources specifically listed above, and this run's local implementation and verification evidence. No other project rendition, fork, third-party remake or unopened envelope was consulted. Operator finalization after an agent-session interruption changed records/packaging only; the tested game code was preserved.
