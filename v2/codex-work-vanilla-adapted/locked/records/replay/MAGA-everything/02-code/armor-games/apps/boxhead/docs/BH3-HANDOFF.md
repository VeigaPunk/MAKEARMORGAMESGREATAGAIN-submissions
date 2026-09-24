# BH-3.4 / BH-3.5 — ARCADE ping + FORGE review request (prepared payload)

**Status:** PREPARED, NOT DELIVERED — no ARCADE/KIMIKO/RELAYER inbox exists in
this repo or fleet scope. This file is the exact payload the ping/review
request would carry; delivery and ack are external, recorded here as pending.
Recorded 2026-09-22 by maga-forge (L1).

## Build path + how to run

- Repo: `MAGA-everything/02-code/armor-games` (npm workspaces)
- Run: `npm install && npm run dev:boxhead` → http://localhost:5173
- Debug/PROOF hook: open `http://localhost:5173/?debug` → `window.__maga = { game, input, touch }`
- Latest commit at writing: see `git log` (R01 + BH-3 closeout commits)

## Ticket IDs done

| Epic | Tickets | State |
|------|---------|-------|
| B-N0 | BH-0.1–0.5 | PASS (FORGE scaffold review 14:42) |
| B-N1 | BH-1.1–1.9 | PASS (FORGE review 15:20, commit dfbfb71) |
| B-N2 | BH-2.1–2.6 | DONE — see `ACCEPTANCE-BN2.md`; BH-2.2 layout A WAIVED (no tablet) |
| B-N3 | BH-3.1 assets drop zone | DONE — `assets/MANIFEST.md` |
| | BH-3.2 SFX/music slots + mute | DONE — `Sfx.startMusic/stopMusic` slot + `preset()` SFX slots; mute button in page chrome (verified live) |
| | BH-3.3 PROOF checklist template | DONE — `docs/PROOF-CHECKLIST.md` |
| | BH-3.4 ARCADE ping | THIS DOCUMENT — delivery pending |
| | BH-3.5 FORGE review | THIS DOCUMENT — verdict pending |

## Known TBD / waivers (for ARCADE)

1. **All combat numbers are placeholders** — damage 10/bullet, zombie hp 2/1,
   speeds 34–46, spawn cadence, DM first-to-5, respawn 1.4s, barrel radius 55 /
   player damage 25, crate +16 ammo, weapon thresholds mult 4/8/14.
2. **Default keymaps provisional** — P1 WASD+Space/J; P2 arrows+IJKL/numpad 8456.
   Replace with captured original 2P layout.
3. **Stage size 640×400** — provisional, UNVERIFIED (checklist says 640×480
   provisional; both unmeasured — ARCADE to adjudicate).
4. **Grenade tier** — FIXED R03: lobbed AoE shell (detonate-on-contact, radius 60, costs 2 ammo). Was a single slow bullet (D-03).
5. **Deathmatch barrel kills** award no credit (stub).
6. **Touch layout A** (dual pads) waived — no tablet in lab.
7. **Menu pointer hit-zones** basic (whole-screen tap semantics).
8. **Music bed** is a placeholder 8-step pattern through `Sfx.startMusic` —
   MAESTRO owns the real recipe.

## Fixes landed after BH-2 sign-off (need re-review)

- **Player death was unreachable in solo/co-op** — `slot.alive` never set
  false outside deathmatch; hp went to −160 with state stuck `playing`.
  Fixed at zombie-damage + barrel-damage sites (all modes).
- **Pointer/touch coordinate double-count** — `getBoundingClientRect()`
  already includes the CSS translate letterbox; `toLogical` subtracted the
  offset again → all pointer aim/touch zones ~130px off. Fixed: scale-only.

## Smoke evidence (headless Chromium CDP, `?debug`)

- title→mode→room→playing transitions: PASS
- aimed kill: score 100, mult 2, zombie destroyed: PASS
- death → `dead` state → banner → Space retry → `playing`: PASS
- co-op simultaneous input + deathmatch damage: PASS (ACCEPTANCE-BN2, proofs/)
- music slot: `startMusic` on run start, stops on death/victory/title: PASS
- mute toggle flips `sfx.muted` live: PASS

## Asks

- **ARCADE:** fill TBD list above (keymaps, combat tables, stage size, spawn
  tables, DM scoring, barrel radius, weapon thresholds); ack this handoff.
- **FORGE:** review verdict on B-N3 closeout + the two post-BH-2 fixes.
