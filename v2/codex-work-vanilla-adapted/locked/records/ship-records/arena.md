# Crown & Sand — living ship record

## Survey · 2026-09-23

Read `CHECKPOINT.md`, concept spec, fidelity dossier, build card, prototype card/implementation, app sources, app README/tests, prior smoke/deep verdicts, and the stored desktop combat screenshot.

The production candidate is `MAGA-everything/02-code/armor-games/apps/swords-and-sandals`: TypeScript pure rules, Canvas2D authored arena art, DOM menus/actions, shared storage/audio helpers, Vite. Retained and extended this architecture because it already supplies working accessible controls, progression guards, and offline tests. The separate single-file prototype is a five-opponent mechanics proof with different declared-guess formulas, no reusable production advantages over the current model; it remains historical reference.

Checkpoint baseline: 12 opponents, 3 four-bout tournaments, 8 permanent items, 3 looks, 6-point character creation, attack/special/potion/guard, one saved character. Prior D-23/27/28/29/30/31 regressions were already guarded. Baseline Node rules verification passed 5 tests and 8,400 seeded campaigns (84 legal builds × 100 seeds), maximum two defeats.

The historical dossier contains no captured authoritative combat tables, full roster, spell list, or exact original progression. Its scoped concept requests 3–5 opponents and explicitly defers the historical full campaign. This release uses an original authored campaign; it cannot claim source-game numerical or campaign parity. Player-facing title: **Crown & Sand**. Technical slug stays stable for save/build compatibility.

Baseline play attempts before code edits: Vite runs when explicitly bound to `127.0.0.1:5178`; its default all-interface binding fails `uv_interface_addresses` with EPERM. Existing real-input Playwright campaign driver failed before loading the page: full Chrome `/root/.cache/magga/chrome-linux64/chrome` aborted at `process_singleton_posix.cc` because `socket()` was denied. Cloud browser navigation to the local URL separately reported `ERR_BLOCKED_BY_CLIENT`. Neither attempt constituted gameplay. Parent authorized continuing after recording the environment blocker.

Recovery: the official Chrome headless shell works when the game server and browser run within one execution context. After implementation had started, the untouched baseline `dist/` was played successfully with actual desktop clicks: creation, all twelve bouts, purchases, reloads after victories, champion and restart; zero reported page errors. Historical markup/corrupt-save security probes also passed. Fresh baseline screenshots are in `tests/evidence/baseline/`. This establishes a baseline playthrough, but its successful timing was after the first source edits, not before.

## Scope correction and implemented release

The coordinator checked the original author’s production site (`https://swordsandsandals.com/`), which identifies twenty Arena Champions in the historical second game. The user’s complete-game request supersedes the old v1 slice. The initial twenty-bout/five-chapter extension was therefore treated as a milestone, not full scope. Final content is twenty four-bout tournament arcs with twenty named champions and sixty preliminaries: eighty authored opponents. Names, stories, formula values, items, and champion traits remain original; exact historical content parity is still not asserted.

- Twenty authored four-bout tournaments / eighty opponents / twenty tournament champions. The twelve-bout baseline continues through the Moonlit Crucible and Crown Ascendant, then fifteen distant circuits leading to Lyra, Crown of the Free. Each arc has an authored introduction and four named opponents. Five atmosphere palettes, weapon silhouettes, and preserved visible enemy attack rhythms. Later champions add bulwark (normal-attack damage reduction), one-use healing instead of a reply, low-health rage, focus-draining heavy attacks, or relentless normal attacks, paired with distinct heavy-strike cadences. Their traits are announced even in compact phone combat.
- Forty-two permanent gear upgrades. Existing eight and their gates/costs remain, followed by thirty-four later items. All eighty victories award 1,760 XP and reach level forty-five. Shop initially shows relevant upgrades; the whole catalog is one button away. Save gold capacity was extended for the full campaign economy. Combat/economy remains in one pure rules module.
- Original attack, shield breaker, potion, and guard remain viable. Added three finite javelins per bout, two starting focus (max three), Sunfire at level three (two focus, ignores armor), and Moon ward at level two (one focus, healing + brace). Guard recovers focus. Illegal, depleted, gated, or unknown moves consume no turn.
- Ten independent character slots, safe migration of old single-slot saves, character ledger, safe leave-bout action, and explicit champion retirement. Retiring a slot now clears it immediately, fixing the previous fresh-character/reload return to the old champion. Saving failure is visibly reported rather than silently claiming success.
- New original title and player-facing copy. No historical source branding in live game title/footer; technical slug remains for integration.
- Authored procedural audio: lute/drum loops, steel/miss/guard/magic/heal/purchase/victory/defeat cues; starts on interaction, respects persistent shared mute and the visible master-volume slider, stops music and scheduled cues when hidden. No external audio or image fetches.
- Javelin projectile, spell/guard rings, both fighters' damage and healing feedback. Fixed final-hit animation showing the next opponent before the current bout resolved.
- Focus retention for creation and combat controls; all actions via mouse/touch and hotkeys 1–7; live logs, resource status, disabled gates, 48px combat hit targets, reduced motion. Compact phone arena header and cropped decorative sky keep more controls visible.

## Verification

Reproducible commands from repository root:

```sh
npm --prefix MAGA-everything/02-code/armor-games run typecheck --workspace @maga/swords-and-sandals
node --test MAGA-everything/02-code/armor-games/apps/swords-and-sandals/tests/progression.test.mjs
node MAGA-everything/02-code/armor-games/apps/swords-and-sandals/tests/browser.mjs
```

The browser driver starts its own same-context local Vite server, unless `SAS_URL` points to an existing same-context static server. Set `CHROMIUM_PATH` to a suitable browser if needed. No progression injection: all game changes use real clicks, keyboard presses, or touch taps; the debug snapshot is observational only.

- TypeScript: passed.
- Final rules: **8 tests passed**, including **8,400 complete eighty-opponent campaigns**, all 84 legal creation builds × 100 seeds. Maximum twelve defeats before completion. The eighth test exercises champion-specific traits. Latest complete run took 69.4 seconds under concurrent browser load. This deliberately uses the original four-action strategy, proving additions are optional. Also validates purchase/reward duplication guards, corrupt saves, invalid moves, defeat recovery, finite ammo, spell gating, focus regeneration, and old four-/twelve-win migration.
- First new desktop run: **20 victories**, **212 turns**, **20 attempts**, **12 legal purchases**, zero page errors, zero external requests. Reload after every bout, slot-two creation, return to preserved slot-one champion, and persisted retirement all passed.
- First new phone run was interrupted by a deliberate CSS edit triggering Vite HMR; the driver observed a transient missing debug object. It was not claimed as a complete pass. Frozen-source rerun includes both devices plus an explicit Moon ward move and a deliberate guard-only defeat to verify recovery.
- Final full-campaign browser gate: **PASSED** in both isolated contexts. `tests/evidence/browser-report.json` records the exact results below. Every action was a real click, key press, or emulated touch; all seven combat actions were exercised.

| Device | Victories | Combat turns | Attempts | Defeats during campaign | Purchases | Page errors | External requests |
|---|---:|---:|---:|---:|---:|---:|---:|
| Desktop | 80 | 1,088 | 89 | 9 | 42 | 0 | 0 |
| Emulated touch, 390 × 844 | 80 | 1,029 | 84 | 4 | 42 | 0 | 0 |

Both runs reloaded after every bout, created a second character, restored the original eighty-win champion, and retired that champion with the cleared slot remaining cleared after reload. Desktop additionally yielded a bout without reward and intentionally lost a separate bout by guarding to verify recovery. Full-campaign screenshots include creation, combat, Moonlit Crucible, Arena Eternal, and final champion for both viewports.
- Visually inspected baseline champion, desktop/phone combat, both Arena Eternal captures, both eighty-win champion screens, and the final Aster desktop/phone previews. The expanded phone HUD remains readable and no horizontal overflow was observed during the full runs.
- Integration review then required an explicit pause flow. Added a native accessible Pause/Resume dialog, toolbar button and Escape toggle; it stops animation/music and blocks new actions while preserving the already-resolved turn and its completion timer. Also added long-name wrapping and fitted audio controls on narrow phones. **These UI changes happened after the full eighty-win gate.** The combat/progression module was unchanged: SHA-256 `5dc564afeed954a69941eb042dcc0dfbe349dc09c551fcd94580ab16e4a443ba`.
- Focused final-source smoke (`tests/preview.mjs`): **PASSED**. Real input creates Aster, verifies master volume 100/0/recovery and reload persistence, mute persistence, pauses during a resolving action, confirms the next hotkey cannot change HP/round while paused, resumes with Escape, performs another legal action, and exercises the Resume button. Desktop, 390px phone, and 320px narrow-phone layouts have no horizontal overflow. A first focused run found a 12px volume-control overflow; corrected the grid minimums and reran successfully.
- Separate clean previews: `tests/evidence/crown-and-sand-preview.png`, `crown-and-sand-phone.png`, `crown-and-sand-cover.png`, and `crown-and-sand-pause.png`. These use the normal character Aster, not the literal-markup security-test name.
- Final app production build: **PASSED**, 12 modules; `index.html` 15.10 kB, JS 39.36 kB before gzip. Focused copied-production smoke: **PASSED** beneath `/nested/crown/swords-and-sandals/`, including the final pause, volume/mute, keyboard and narrow-layout checks. The first copied standalone build exposed absolute `/assets` URLs (the collection build had already overridden this); set the app’s own Vite base to `./`, rebuilt, copied to a separate temporary directory and reran successfully. Game sources are final.

## Limits and release handoff

Original full-roster/formula parity cannot be established from the provided reference documentation and is not claimed. There are twenty original tournament arcs / eighty bouts, anchored to the documented twenty-champion campaign scale; these are not a captured historical roster. Browser phone coverage is emulated touch, not a physical phone. Safari/Firefox and human listening/audition are not yet verified. Shared audio was changed by the coordinating lane; app uses its supported Sfx API.

Only this app, its tests/evidence, and this living record were changed by the arena lane. The collection launcher needs the player-facing title **Crown & Sand**, while retaining the slug. No publish, push, source-asset scraping, or third-party remake lookup.


## Provenance

The supplied repository checkpoint and its local concept/dossier/build/prototype/verification records were the implementation and historical research basis. The retained Canvas2D arena, first twelve opponents, initial eight items, portraits, and shared helpers came from that checkpoint. This lane authored sixty-eight additional opponent names, seventeen additional tournament names, twenty chapter introductions, thirty-four added items, champion traits, ranged/focus rules, save-slot UI, pause/audio controls, vector effects, and the original synthesized musical motifs and sound recipes. The coordinator separately verified the twenty-champion scale against the original author's production website, https://swordsandsandals.com/; no third-party remake code, art, music, fonts, or assets were fetched or copied. Existing Vite/TypeScript/Playwright dependencies and shared arcade helpers remain repository dependencies. Browser evidence was generated locally using the official Chromium headless shell through real-input drivers. All new player-facing branding is Crown & Sand; the legacy technical slug is retained only for integration and save compatibility. No publication or repository push was performed.

## Packaged release gate · 2026-09-24

`node delivery/records/verify.mjs` completed with PASS from the self-contained replay/runtime package against the actual copied site. It passed 60 rules, 114 maze validations, all 14 desktop/mobile game cases under a nested path, real-time runner smoke, and the two-client LAN test. The retained receipt and logs are in `delivery/records/evidence/offline-final/`; `results.json` records exact commands and exit codes. The game-specific full campaign results and input-method limits above remain distinct from this default gate.

## Final provenance declaration

Consulted material is the checkpoint source, design documents, prototypes and git history, the official reference/tool sources specifically listed above, and this run's local implementation and verification evidence. No other project rendition, fork, third-party remake or unopened envelope was consulted. Operator finalization after an agent-session interruption changed records/packaging only; the tested game code was preserved.
