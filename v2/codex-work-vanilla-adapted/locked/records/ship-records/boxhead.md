# Deadlock Rooms — ship record

Owner: Boxhead lane. Status: implementation and scoped verification complete; final copied-release gate owned by root. Not locked.

## Survey and decision

Read `CHECKPOINT.md`, the Boxhead fidelity dossier, playability checklist, visual direction, native build card, app README, runtime verdicts 01–04 and 08, current release tests, and scoped git history (`1c45956` → `4f5cc41`). The only runnable Boxhead implementation is `MAGA-everything/02-code/armor-games/apps/boxhead`; there is no Boxhead standalone prototype or second engine in this checkpoint. Older Forge and history specs document an abandoned Ruffle path without a cleared SWF. That is historical evidence, not a viable shipped implementation.

Keep and extend the native Pixi implementation. Its unified input, touch ownership, proportional letterboxing, bounded delta, focus pause, collision separation, end-screen retry, synthesized audio and crate fixes are useful. Replace the incomplete four-tier/two-room content and old player branding with original **Deadlock Rooms** content. Historical Boxhead naming remains only in internal path/history identifiers.

Rules retained: endless survival; shared-screen local co-op; deathmatch first to five with respawns; score/streak progression; crates and barrel chains; grenade owner exemption; both local keyboard inputs; touch movement does not fire; all releases clear touch controls; retry/menu clears overlays; focus loss pauses; dry ammo must never deadlock combat. Pistol will be unlimited, per the design build card's recorded lesson.

Pre-edit runtime attempt: launched Vite successfully on `127.0.0.1:5182`, but Chromium launch was denied by the executor (`socket() failed: Operation not permitted`). Browser/server resolution requested from root. No gameplay implementation edits at this point.

## Intended extension

Eight selectable weapon families; six original room layouts; walkers, runners, armored brutes, ranged wardens and volatile enemies; wave escalation, permanent-in-run weapon unlocks and wave resupply/revive. LAN uses a bundled Node-built-in-only host, with local browser authority and a second independent client, room codes and disconnect/pause behavior. No account or hosted service.

## Verification

Pending.

## Implemented release

- Original player-facing **Deadlock Rooms** name, authored SVG identity, industrial palette, six room cards with geometry previews, equipment manual and health/weapon information. Portrait has an extra readable status strip and 44-pixel toolbar targets.
- Six original rooms: Loading Yard, Pillar Nine, The Foundry, Transfer Bay, The Sluice and Lockdown. Player spawn clearance and connected walkable floor are checked for every room.
- Eight distinct selectable weapons: unlimited service pistol; rapid machine pistol; five-pellet shotgun; arming proximity mines; impact frags; short thermal stream; armor-piercing rail rounds; wide-blast rockets. Run unlock thresholds 1/4/7/10/14/20/28/40. Peak unlocks persist through damage. Empty weapons fall back to pistol; crates never gate the ability to fight.
- Walkers, runners, armored brutes (wave 3+), volatile attackers (wave 4+) and telegraphed ranged wardens (wave 5+). Visibility-graph navigation around cover; endless director capped at 100 enemies per wave, 60 simultaneously, 66 base movement speed.
- Local solo/co-op/deathmatch kept. Co-op wave clear revives fallen partners; deathmatch awards fired-explosive kills, respawns and ends at five. Both keyboard players work simultaneously. Q/E, 1–8, P2 brackets and a touch toolbar button select equipment.
- Settings: volume, fullscreen, additive key bindings with saved-value validation, field manual, menu exit. Existing high scores retained, corrupt/null preferences recover safely. Pausing, dialog escape, focus loss, touch release, natural death and retry have explicit handling.
- LAN: `tooling/deadlock-host.mjs`, Node built-ins only, static hosting + authenticated two-client SSE/HTTP relay. Browser P1 authority; room codes; guest movement/aim/fire and host snapshots; bounded request bodies; origin checks; disconnected room cleanup; stale-input stop/freeze; reconnect; either-player pause; idempotent modal pause; shared departure. No account or remote service.

## Baseline runtime and retained lessons

The initial executor restriction was resolved using the official cached `chrome-headless-shell`. The unmodified baseline `dist/boxhead/` was played with real Enter/1/1, movement and Space events. Captured `before.png`: wave 1, 100 HP, 11 remaining rounds after firing. This confirmed the limited-pistol baseline problem and the existing readable procedural arena. Source edits followed the survey; baseline runtime was exercised from untouched built assets.

Retained the historical fixes for focus/input reset, stale banner clearing, real grenade area damage, owner exemption, dual keyboard ownership, touch zone isolation, cross-canvas release, uniform letterboxing, deathmatch supplies, bounded motion catch-up and endless progression. Earlier dossiers describe several superseded incomplete versions; none is represented as current verification.

## Executed verification

Environment: Linux, Playwright, Chromium headless shell from `/root/.cache/magga/chrome-headless-shell-linux64/chrome-headless-shell`, software WebGL, desktop 1280×800 and emulated touch 390×844. All browser gameplay below used real keyboard/mouse/CDP touch events; game state reads were read-only. Corrupt saved preferences are a separately identified fault-injection check.

| Test | Result | Evidence |
| --- | --- | --- |
| TypeScript typecheck and Vite production build | Pass | App typecheck; build ~57KB app JS plus vendored Pixi |
| Six rooms, clear spawns and connected floor | Pass | `tests/rules.test.mjs`, `rooms.png` |
| Complete unlock ladder, persistence through hits, infinite pistol | Pass | `tests/rules.test.mjs` |
| Endless director through wave 10,000, bounded population/speed | Pass | `tests/rules.test.mjs` |
| Real local mode/room controls; all six rooms enter/exit | Pass | `tests/release.test.mjs` |
| Simultaneous local co-op movement/fire | Pass | P1 x320→377.49; P2 y200→257.49; 4 active bullets; `local-coop.png` |
| Eight weapons selected/fired through actual keys | Pass | Selected indexes 0–7; mine, rail damage and rocket radius inspected; `armory.png` |
| Corrupt `null` keymap/high-score startup | Pass | Ready-room controls and game boot remain available |
| Real two-finger touch, release, pause, natural death and tap retry | Pass | `touch.png`; retry at 100 HP |
| Two independent LAN clients | Pass | Separate isolated browser contexts, authenticated HTTP/SSE; `lan-host.png`, `lan-guest.png` |
| LAN movement synchronization | Pass | P1 x320→402.8; P2 y200→275.9; guest positions identical after input release |
| LAN pause and already-paused guest settings | Pass | Both clients paused; opening settings did not resume authority |
| LAN transport outage/recovery | Pass | Browser context offline/online; host froze and recovered without state injection |
| LAN first-to-five match and leave | Pass | Real keyboard-selected rail then unlimited fallback; final 5–0; both clients saw victory; guest departure closed room; `lan-deathmatch.png` |
| Browser page errors | Pass | Empty error arrays for local/touch and LAN suites |

LAN suite: 59.0 seconds. Local/touch suite: 46.2 seconds. Three rule tests: pass. Screenshots live under `ship-records/evidence/boxhead/`.

During verification, fixed real failures: guest focus remained on a button and swallowed Space; pause edge could be dropped during an outstanding input request; live snapshots immediately closed a reopened guest lobby; an established SSE stream did not necessarily close during an offline simulation, requiring explicit input liveness checks. Retested the complete flow after these fixes.

## Offline commands and packaging integration

Final static release folder:

```sh
node deadlock-host.mjs
```

Open the printed LAN address ending `/boxhead/` on both devices. Host creates a room, guest joins its code, host chooses mode/room and starts. Full instructions are `apps/boxhead/LAN.md` (copy as `Deadlock-LAN.md`). The script detects a colocated `index.html`, so copying it beside the built site's index makes that folder directly runnable. Optional environment variables: `HOST`, `PORT`, `SITE_ROOT`; positional root and `DEADLOCK_ROOT` also supported.

Source-checkout validation:

```sh
npm --prefix MAGA-everything/02-code/armor-games run typecheck -w @maga/boxhead
npm --prefix MAGA-everything/02-code/armor-games run build -w @maga/boxhead -- --base=./
node --test MAGA-everything/02-code/armor-games/apps/boxhead/tests/rules.test.mjs
CHROMIUM_PATH=/path/to/chrome-headless-shell node --test MAGA-everything/02-code/armor-games/apps/boxhead/tests/release.test.mjs
CHROMIUM_PATH=/path/to/chrome-headless-shell node --test MAGA-everything/02-code/armor-games/apps/boxhead/tests/lan.test.mjs
```

Final copied-site gate (host and browser run inside the same executor invocation):

```sh
SITE_ROOT=delivery/site HOST_SCRIPT=delivery/site/deadlock-host.mjs CHROMIUM_PATH=/path/to/chrome-headless-shell node --test MAGA-everything/02-code/armor-games/apps/boxhead/tests/lan.test.mjs
SITE_ROOT=delivery/site HOST_SCRIPT=delivery/site/deadlock-host.mjs CHROMIUM_PATH=/path/to/chrome-headless-shell node --test MAGA-everything/02-code/armor-games/apps/boxhead/tests/release.test.mjs
```

`EVIDENCE_DIR` can redirect screenshots for the copied-site gate. Node 22+ is the only LAN host runtime requirement; source build and browser test tooling are development-only dependencies.

## Additional legal-input survival pilot

`tests/survival.test.mjs` ran a read-only-state pilot issuing real mouse movement and keyboard events for 151.8 seconds. It cleared four waves and reached wave 5 alive at 58 HP, scored 217,200, achieved peak streak 60 (all eight weapons unlocked), and encountered all five enemy roles: walker, runner, brute, volatile and warden. Screenshot: `survival.png`. No game state, health, ammo, score, wave, position or collision value was injected. The pilot naturally fell back to the unlimited pistol after spending unlocked-weapon ammunition, and collected additional supplies. It ended by the test time budget while still playing, consistent with endless survival.

## Exact limits

LAN has two players and browser-hosted simulation authority; keep the host tab open. Focus loss pauses, but there is no host migration. This is LAN play, not an internet matchmaking service. Static-only hosting supports solo/local play, with a clear LAN-host instruction when the relay endpoint is absent. Local co-op on one phone is not claimed; touch supports solo and separate-device LAN. Physical phones, Safari, real Wi-Fi latency and additional desktop engines were not available in this lane's environment. No original Flash art, SWF, music or brand assets are used. This is original content informed by the checkpoint, not an exact-fidelity claim.

## Final copied-release gate — PASS

Executed all three browser suites directly against **`/workspace/scratch/05b3d5bae7f8/delivery/site`**, served by its bundled **`delivery/site/deadlock-host.mjs`**. No game source edits or delivery writes were needed. The only harness improvement made `survival.test.mjs` honor `EVIDENCE_DIR`, matching the other two suites.

```sh
SITE_ROOT=/workspace/scratch/05b3d5bae7f8/delivery/site \
HOST_SCRIPT=/workspace/scratch/05b3d5bae7f8/delivery/site/deadlock-host.mjs \
EVIDENCE_DIR=/workspace/scratch/05b3d5bae7f8/ship-records/evidence/boxhead/copied-release \
CHROMIUM_PATH=/root/.cache/magga/chrome-headless-shell-linux64/chrome-headless-shell \
node --test \
  MAGA-everything/02-code/armor-games/apps/boxhead/tests/lan.test.mjs \
  MAGA-everything/02-code/armor-games/apps/boxhead/tests/release.test.mjs \
  MAGA-everything/02-code/armor-games/apps/boxhead/tests/survival.test.mjs
```

**3 tests passed, 0 failed.** Combined elapsed time 161.9 seconds with the three browser suites running concurrently under software WebGL.

- **LAN, 130.7 s:** two independent browser contexts created/joined the room through the actual UI. P1 moved x320→409.7; P2 moved y200→255.2. Guest positions matched the authority exactly after input release. Guest pause, already-paused Settings, offline/online recovery, first-to-five deathmatch, both-client victory and shared departure all passed. Final score 5–0; zero browser page errors.
- **Local/touch, 94.2 s:** all six final-release rooms; simultaneous local keyboard movement/fire; all eight weapons selected and fired; corrupt-null preference recovery; real two-finger CDP touch, release, pause, natural death and tap retry. Nested Field Manual Escape closed only that dialog and left Settings/game paused. Zero browser page errors.
- **Survival, 157.6 s:** legal keyboard/mouse pilot cleared the introductory waves and reached wave 4 alive at 100 HP, score 83,800, peak streak 39, rail equipped. Observed walker, runner, brute and volatile roles during this time-bounded copied-release run. The separate source-build run above reached wave 5 and observed wardens/all eight unlocks; these distinct results are not conflated.

Final screenshots are in `ship-records/evidence/boxhead/copied-release/`: `title.png`, `rooms.png`, `local-coop.png`, `armory.png`, `touch.png`, `lan-host.png`, `lan-guest.png`, `lan-deathmatch.png`, `survival.png`. Visually reviewed the copied-release portrait screenshot: the new readable health/weapon status and larger toolbar are present, with the complete playfield visible.

## Final source-comment reconciliation

Audited current app source and the asset manifest for inherited placeholder/TBD/handoff language. The remaining future-work comments were stale descriptions of the checkpoint, not missing branches or missing runtime assets. Replaced them with the actual Deadlock Rooms behavior:

- `entities.ts`: the detailed outlined characters, role markings, shadows, projectiles, props and rings are the shipped procedural art; movement and combat use the documented Deadlock Rooms tuning.
- `game.ts`: fixed 640×400 arena, completed first-to-five match rule, validated additive binding UI, current 60-concurrent/100-per-wave limits, defined contact damage and shared blast ownership rules. Removed the unsupported implication that these numbers were awaiting original-game measurement or ARCADE sign-off.
- `game.ts` music and `main.ts` sound chrome: documented the existing sparse eight-step triangle-wave pulse and completed mute/volume path, without promising a later MAESTRO replacement or a richer soundtrack.
- `assets/MANIFEST.md`: replaced the obsolete proposed-PNG drop list with an inventory of the SVG and procedural art actually loaded/rendered. None of the former PNG filenames is referenced as a required game asset.
- `README.md`: recorded exact movement/resource/damage/streak/wave tuning and the actual music/SFX frequencies and timing. These are original design choices tested in the legal-input runs above; they are not claimed to be measured historical fidelity.

This reconciliation changed only comments and documentation. TypeScript transpilation with `removeComments: true` produced **byte-identical emitted JavaScript** for `entities.ts`, `game.ts` and `main.ts` before/after the comment edits. No production behavior or delivery file was changed, and the copied-release proofs therefore still cover the same implementation. No unfinished art/music replacement or combat-rule stub remains in current app source; archived design/acceptance documents continue to describe their historical checkpoints.

## Audio lifecycle defect found during that audit — fixed and verified

Checking the music documentation exposed one genuine behavior defect: a LAN guest receives snapshots instead of running the host's pause/end methods, so it kept its music timer alive after receiving a paused, dead or victory frame. This was not treated as a future art/audio handoff or hidden by a wording change.

`Game.applyFrame` now mirrors the audio lifecycle: entering `playing` from another state starts the pulse once; receiving `paused`, `dead` or `victory` stops it. Ordinary playing snapshots leave the existing timer intact. This is the sole production behavior change after the comment-only reconciliation above.

Rebuilt `apps/boxhead/dist` (entry `assets/index-DJsmICHS.js`) and passed the expanded native-input two-client LAN suite in **104.7 seconds**, with **zero page errors**. Actual input drove shared pause/resume, an ordinary 5–0 deathmatch, a new co-op run in which both stationary players were naturally defeated, and a guest-triggered Space retry. Read-only checks confirmed guest music stopped for shared pause, victory and natural defeat; resumed for unpause/new run/retry; and retained one stable timer across successive playing snapshots. Movement synchronization, outage/recovery and room departure still passed.

Proof command:

```sh
EVIDENCE_DIR=/workspace/scratch/05b3d5bae7f8/ship-records/evidence/boxhead/audio-lifecycle \
CHROMIUM_PATH=/root/.cache/magga/chrome-headless-shell-linux64/chrome-headless-shell \
node --test MAGA-everything/02-code/armor-games/apps/boxhead/tests/lan.test.mjs
```

The run used the freshly built app directory and the source Node host. No delivery files were written during the active release matrix. Root must refresh the Boxhead production build/source copy with this narrow fix; the earlier copied-release matrix remains valid for its documented pre-fix build. Typecheck and production build passed. Current app source has no placeholder/TBD/stub/future-artist-handoff markers; historical checkpoint documents remain historical.

Shared input defaults are also final authored choices: separated WASD/arrows movement, numpad/IJKL directional fire for P2, and persistent additive remapping. Native simultaneous-key tests validate this layout; no unmeasured historical key-for-key claim remains. The shared input comments were reconciled without changing emitted behavior.

## Provenance declaration

Consulted the supplied checkpoint, its design/dossier/prototype/build records, prior verification, git history and own knowledge of the top-down survival reference. All delivered names, procedural characters/rooms, SVG title art, sound recipes and LAN implementation are original checkpoint or new work. PixiJS and browser/testing APIs are existing official tools, with release licenses included. No third-party remake, project rendition, fork, source-original art/music or remote gameplay service was consulted or copied.

## Packaged release gate · 2026-09-24

`node delivery/records/verify.mjs` completed with PASS from the self-contained replay/runtime package against the actual copied site. It passed 60 rules, 114 maze validations, all 14 desktop/mobile game cases under a nested path, real-time runner smoke, and the two-client LAN test. The retained receipt and logs are in `delivery/records/evidence/offline-final/`; `results.json` records exact commands and exit codes. The game-specific full campaign results and input-method limits above remain distinct from this default gate.

## Final provenance declaration

Consulted material is the checkpoint source, design documents, prototypes and git history, the official reference/tool sources specifically listed above, and this run's local implementation and verification evidence. No other project rendition, fork, third-party remake or unopened envelope was consulted. Operator finalization after an agent-session interruption changed records/packaging only; the tested game code was preserved.
