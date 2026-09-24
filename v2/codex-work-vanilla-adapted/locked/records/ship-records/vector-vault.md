# Vector Vault — ship record

## Mandate and selected implementation

Read `CHECKPOINT.md` first: this is unfinished material with seven requested
browser-era game descendants. The precision maze lane owns `hardest/`; it
preserves the complete 114-chamber corpus and deterministic completion gate.

Survey: `hardest/` is the sole precision-maze runtime found in the repository.
`prototypes/impossible-game.html` and the `apps/impossible` implementation are
the separate one-button platformer, not alternate maze implementations. The
launcher previously copied the same `hardest/` engine, shell and corpus. The
reference-named cover is launcher presentation, not an alternative game.

Inspected the checkpoint, `hardest/README.md`, `LEVEL-FORMAT.md`, full shell and
save/engine/solver interfaces, relevant history, prior release report,
`verification/divergence.md` (D-45–D-50 and D-65), and original maze boot/level
reports under `.ufo/scopes/maga-verify/r05-wave/`. Art doctrine explicitly allows
minimal geometric rendering for this precision genre. Historical implementation
commits: `62ed5a7` (30-level base), `fe83d90` (keys/portals), `9336a53` and
`7e829dd` (96-level corpus), `f24ba11` (moving walls and 114), then shipping
repairs in `4f5cc41` and `9d48e75`.

Decision: retain this mature deterministic engine, all geometry and authored
hazard paths, and the dependency-free offline boot. Add an original visual
identity and improve the actual play/learning/settings surfaces. Do not replace
the 114 levels with a sample or generated set.

## Baseline before implementation

- `node hardest/validate.mjs`: **114/114** schema, reachability, completion.
- `node --test hardest/regression.mjs`: **7/7**.
- Original HEAD was extracted to `/tmp/vector-baseline` and its unmodified
  `browser-check.mjs` passed with Chrome headless shell: six complete exact
  frame replays (1, 30, 97, 109, 111, 114), corrupt saves, medal rendering,
  pause/focus, immediate death persistence, touch movement/cancellation.
- A separate temporary Node VM shell replay drove pre-edit keyboard handlers
  through chambers 1–3, preserving actual sequential clear/unlock flow.
- Regular Chrome initially failed with this execution environment's socket
  EPERM. Official headless shell resolved this; no browser gate was waived.

## Shipped work

- Original name **Vector Vault** with coral signal, midnight/ice board palette,
  cyan interface, gold shards, and blue patrols. New chamber atlas includes
  numbered locked tiles, visible keyboard focus for locked selection, miniature
  map previews, progress, medal tally, difficulty, and independent records.
- Original names for formerly reference-titled chambers: 30 **Terminal One**,
  60 **Terminal Two**, 96 **Vault Zero**. Their layouts are unchanged.
- Accessible HTML buttons for resume, next chamber, retry, and atlas; full
  toolbar equivalents; keyboard/touch chamber selector; concise field guide.
- Persistent effects volume and reduced-motion preference with system fallback.
  Opening settings pauses; closing does not silently resume the simulation.
- Storage failure notice; existing corrupt-save migration retained. Actual
  campaign completion is based on all 114 records, not merely the final ID.
- Correct APEX tier for the moving-wall finale (previous 120 cutoff made APEX
  unreachable in the 114-level set).
- All movement/collision/respawn/coin/key/portal/mover simulation code unchanged.

## Verification and evidence

See `hardest/README.md` for exact offline commands. The new
`hardest/campaign-check.mjs` starts from clean storage and replays each solver's
legal 60 Hz input tape through shipping DOM keyboard handlers. It progresses
only through Play and Continue controls. It never sets the player position,
status, unlock count, or saved results, and never uses probe start/input calls.
The requestAnimationFrame clock is controlled for deterministic comparison.

The full campaign run writes its per-chamber frames, times, deaths, and unlocks
to `hardest/evidence/campaign-results.json`, plus desktop/mobile atlas and clear
screenshots. It additionally exercises trusted browser keyboard input and real
CDP touch events. Synthetic event replay is explicitly distinguished from
human real-time campaign play. The historical browser regression suite's
intentional state corruption and injected collision are separate fault tests,
not clear evidence.

Final measurements (2026-09-23):

- Full campaign: **114/114** earned clears, **97,625** 60 Hz input frames,
  **1,621.679** simulated seconds, **19** deaths. Every chamber's time/deaths
  match the independent solver. All 114 saved records present.
- Validator: **114/114**. Regression tests: **7/7**. Historical browser suite:
  **6/6** exact replays plus all save, focus, death, and touch checks pass.
- Final `visual-check.mjs`: trusted Playwright keyboard clears chamber 1 on
  both desktop (1200×980) and emulated mobile (390×844), each at the exact
  solver time **3.5791666667 seconds**, zero deaths. Real reload retains
  chamber 2 unlock and changed volume/reduced-motion preferences.
- Settings pause the run; touch movement/cancel is verified through CDP.
  No page errors and no horizontal overflow in tested viewports.
- Visually inspected desktop atlas/clear and mobile atlas/play/pause images.
  Caught a too-small phone atlas and replaced it with a large chamber card,
  preview and progress count; added readable objective/death/time HUD outside
  the canvas on narrow screens. Final snapshots carry the `final-` prefix.
- `git diff --check` passes. Engine, manifest, 114 geometry definitions and
  autopilot are unchanged; three level display names differ.

Exact commands are in `hardest/README.md`. Both new scripts accept
`SITE_ROOT=/path/to/delivery/site` or `HARDEST_URL` so the final copy can be
verified rather than the source page. The run here used
`CHROMIUM_PATH=/root/.cache/magga/chrome-headless-shell-linux64/chrome-headless-shell`.
No installation/network is needed after Node, Playwright, and Chromium exist.

Limits: all-114 is synthetic DOM-input replay with a controlled clock; the
additional two chamber-1 clears use trusted browser key events. Touch testing
is emulated Chromium, not physical hardware. No Safari claim, human full
campaign claim, or perceptual audio listening claim is made.

## Provenance declaration

Consulted the supplied checkpoint, its design pack, original 114-level corpus, deterministic validator/autopilot, prior verification and git history, together with own knowledge of the precision-maze reference. Retained geometry and hard-won collision rules; authored the atlas, typography, UI, cues and responsive presentation. No third-party remake, project rendition, fork, commercial artwork or audio asset was consulted or copied.

## Packaged release gate · 2026-09-24

`node delivery/records/verify.mjs` completed with PASS from the self-contained replay/runtime package against the actual copied site. It passed 60 rules, 114 maze validations, all 14 desktop/mobile game cases under a nested path, real-time runner smoke, and the two-client LAN test. The retained receipt and logs are in `delivery/records/evidence/offline-final/`; `results.json` records exact commands and exit codes. The game-specific full campaign results and input-method limits above remain distinct from this default gate.

## Final provenance declaration

Consulted material is the checkpoint source, design documents, prototypes and git history, the official reference/tool sources specifically listed above, and this run's local implementation and verification evidence. No other project rendition, fork, third-party remake or unopened envelope was consulted. Operator finalization after an agent-session interruption changed records/packaging only; the tested game code was preserved.
