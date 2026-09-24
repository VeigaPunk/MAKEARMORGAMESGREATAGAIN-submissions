# Vector Vault

A dependency-free Canvas2D precision game: **114 authored chambers**, one
continuous unlock campaign. Guide a coral signal through moving blue patrols,
collect every gold shard, and reach the green exit. Keys release gates, paired
portals warp between rooms, flags create checkpoints, and sliding pistons can
push or crush the player.

The simulation and authored layouts from the checkpoint remain intact. Vector
Vault adds its own visual identity, chamber atlas with live map previews,
accessible pause/clear actions, field guide, audio volume, and persistent motion
preferences. It uses no external service, account, framework, or downloaded media.

## Play

Open `hardest/index.html` in a browser (`file://` works), or serve this directory
with any static server. Keyboard: arrows or WASD to move; R retries; Escape
pauses; M toggles sound. Touch: drag anywhere on the board for a floating
joystick. Landscape gives more room on small phones. Toolbar buttons provide
the same actions, and the chamber selector works with keyboard or touch.

Settings pause an active run. Reduced motion respects your system preference
until you choose a setting. Progress, total deaths, medals, fastest clears,
fewest-death records, volume, and motion preferences save on this device.
Interrupted attempts restart from the chamber's beginning; completed records
persist. If storage is unavailable, the footer explains that progress lasts
only for the current tab. Corrupt and older saves are sanitized automatically.

Gold means zero deaths, silver means at most two, and bronze means a clear.
Fastest time and fewest deaths are independent records. Every chamber can be
replayed once unlocked.

## Files

| File | Purpose |
|---|---|
| `index.html`, `style.css` | Accessible shell and original visual identity |
| `game.js` | Rendering, audio, input, menus, and campaign flow |
| `engine.js` | Pure deterministic simulation at 240 Hz |
| `save.js` | Defensive persistence and independent best records |
| `levels/` | All 114 authored chamber maps and hazards |
| `manifest.js`, `pars.js` | Shipped corpus manifest and generated par times |
| `autopilot.js` | Deterministic legal-input completion solver |
| `validate.mjs` | Schema, reachability, and all-chamber completion gate |
| `campaign-check.mjs` | Clean-save 114-chamber DOM-input campaign replay |
| `visual-check.mjs` | Trusted keyboard clears, reload persistence, responsive review |
| `browser-check.mjs` | Historical browser regression and fault-injection suite |
| `evidence/` | Rerunnable campaign results and browser screenshots |

## Verify offline

From the repository root (Node 22+; browser checks need the root Playwright
dev dependency and an installed Chromium):

```sh
node --test hardest/regression.mjs
node hardest/validate.mjs
CHROMIUM_PATH=/path/to/chromium node hardest/browser-check.mjs
CHROMIUM_PATH=/path/to/chromium node hardest/campaign-check.mjs
CHROMIUM_PATH=/path/to/chromium node hardest/visual-check.mjs
```

The campaign test starts with empty storage, selects Play, then sends normal
DOM keyboard events through the shipping handlers at a deterministic 60 Hz
animation clock. It uses the actual Continue button between chambers and
requires all 114 records to be earned. It never calls the `start` or `input`
probe, changes player coordinates, changes unlocks, or writes wins. Every
clear's death count and time must match its independent solver tape. The same
run checks real Playwright keyboard input, browser-dispatched touch movement
and cancellation, pause, settings, mobile overflow, and browser errors.

DOM keyboard events are synthetic; this is a reproducible control-path proof,
not a claim that a person played 114 chambers in real time. The older
`browser-check.mjs` separately retains explicit corrupt-save and collision
fault injection. Its injected collision is a regression check, not completion
evidence. Safari and physical phones have not been tested.

Set `HARDEST_URL` to verify a served production URL with the campaign/visual checks,
or `SITE_ROOT=/path/to/delivery/site` to test its copied `hardest/index.html`.
Otherwise they use the source `file://` page. Evidence is rewritten under `hardest/evidence/`.

Content authoring and regeneration: `LEVEL-FORMAT.md`, `gen-manifest.mjs`,
`gen-pars.mjs`, and `difficulty.mjs`. Titles changed for chambers 30, 60, and 96;
layout data, routes, patrols, and challenge count were preserved.
