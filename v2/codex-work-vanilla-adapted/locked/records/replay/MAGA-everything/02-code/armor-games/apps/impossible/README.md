# Pulsebound

A complete original five-course precision runner: one fixed impulse, one button, instant retries. Built from the checkpoint's 120 Hz runner around the 2010 Lite feel target. This is original geometry, branding and music; exact reference timing/layout parity is not claimed.

| Course | Duration | Character |
|---|---:|---|
| First Light | 1:40 | Basic pulse, pit timing, first platform transfers |
| Blue Shift | 1:48 | Higher landings and chained jumps |
| Glasswork | 1:56 | Triple spikes and contrasting rhythmic phrases |
| Emberline | 2:04 | Dense platform phrases and long pit transfers |
| Event Horizon | 2:20 | Final combination of the campaign's vocabulary |

Normal clears unlock the next course. A flawless course earns gold; at most five deaths earns silver; every other normal clear earns bronze. Practice uses fixed safe checkpoints every two phrases, separate progress records, and never grants medals or normal unlocks. Saved settings and campaign records are scoped to Pulsebound and deployment path. Old short-course records do not award full-course clears.

Space, Up, Z, click, or touch-down jumps. R retries. Escape pauses. Touch devices also have a large bottom jump pad in portrait. Focus loss pauses. Settings include music/effects levels, reduced motion, intentional input delay (0 ms is fastest), and audio offset. No variable-height jump, double jump, speed changes, or auto-jump.

The five original synth arrangements use bass, harmony, lead, kick, snare, hats and fills with distinct melodies and tonal centers. Charts and scores share a 120 BPM, four-bar phrase grid. Audio renders locally into a seekable buffer and follows simulation position through retry, practice respawns and pause. No network audio assets are required.

From the repository root (dependencies already installed):

```bash
npm --prefix MAGA-everything/02-code/armor-games run typecheck -w @maga/impossible
node --test MAGA-everything/02-code/armor-games/apps/impossible/tests/campaign.test.mjs
npm --prefix MAGA-everything/02-code/armor-games run build -w @maga/impossible
PULSEBOUND_BROWSER=/path/to/chrome-headless-shell node MAGA-everything/02-code/armor-games/apps/impossible/tests/browser.mjs --deterministic
```

The browser script serves the built app itself and completes all five courses through real keyboard presses with ordinary animation frames advanced by Playwright Clock, then checks save reload, pause, practice separation, timing settings and emulated touch. Omit `--deterministic` for wall-clock play (roughly ten minutes plus retries). Use `SITE_ROOT=/path/to/site` or `ARCADE_URL=http://127.0.0.1:4173` to check the copied collection, and `--smoke` for a brief real-time release check. Its diagnostics are read-only. `evidence/browser-report.json` and screenshots record the latest result. Deterministic tests additionally verify every course and practice spawn, gap lethality, front-edge block collision, and fixed impulse.

See `ship-records/pulsebound.md` from the repository root for the source survey, measured verification and remaining limits.
