# ACCEPTANCE — B-N2 (Local 2P + touch)

**Build:** BH-2 pass · 2026-09-22 · KIMI (Kimi Work)
**How to run:** `npm run dev:boxhead` at monorepo root, or serve `apps/boxhead/dist` statically.
**Automated proof:** `node scripts/bh2-2p-smoke.js` (workspace) — 8/8 checks green on 2026-09-22.

| Hook | Result | Notes |
|------|--------|-------|
| BH-2.1 touch layout C (solo) | PASS (structure) | Virtual stick bottom-left + FIRE button bottom-right (`src/touch.ts`), drawn in stage units, shown on `(pointer: coarse)` or first touch, alpha 0.42; auto-aim nearest zombie already in `game.ts`; zones claim pointer capture so taps don't leak into aim. Human phone run still pending (PROOF). |
| BH-2.2 touch layout A (dual pads, tablet 2P) | WAIVED | Best-effort per ticket; no tablet in the lab. Deferred to BH-3/fidelity pass — solo stick covers the phone case. |
| BH-2.3 desktop local co-op | PASS | P1 WASD + Space/J; P2 arrows + shoot cluster (IJKL, numpad 8456). Both players moved + fired **simultaneously** in headless run (P1 x 320→624 ammo 24→16; P2 x 220→533 ammo 24→16, overlapping holds). Zombies chase nearest living player. |
| BH-2.4 local deathmatch | PASS | No zombies; bullets damage opponent only (never owner — hitbox fix); first-to-5-kills stub rule (TBD ARCADE); respawn 1.4s at room spawns; match-end banner without crash. P2 hp 100→50 from P1 fire in automated run. |
| BH-2.5 rebind stub | PASS | Keymap JSON load/save through arcade-core storage (`boxhead/keymaps`); `Input.setKeymaps/getKeymaps` merges over mode defaults; defaults documented in README. No rebind UI yet (BH-3+). |
| BH-2.6 high score persist | PASS | Solo/co-op best score in `boxhead/highscore`, survives refresh (arcade-core storage). |

## Stack facts recorded for FORGE (affect every future app)

1. **arcade-core Input is now 2P-aware.** `setMode('solo'|'versus')` switches keyboard ownership: solo gives P1 arrows+WASD; versus splits (P1 WASD, P2 arrows+IJKL/numpad). P2 API: `isDown2/wasPressed2/moveAxis2/fireAxis2`. Menus keep using P1 API + tap.
2. **Pointer-aim needs `pointer.seen`** — the boot position (0,0) must never count as an aim target; games must gate pointer aim on `seen` or keyboard-facing combat breaks (bullets fly to the corner). Boxhead does this in `updatePlayers`.
3. **Never persist mode-resolved keymaps.** Saving solo defaults then loading them in versus re-binds arrows to P1 and P2 loses movement. Persist user rebinds only.

## Smokes
- Desktop co-op simultaneous input: **Y** (headless Chrome CDP; `proofs/bh2-2p-coop.png`)
- Desktop deathmatch damage + match structure: **Y** (headless Chrome CDP; `proofs/bh2-2p-deathmatch.png`)
- Solo wave 3: carried from B-N1 (still passes typecheck/build; aim change noted below)
- Mobile touch: **not tested on real hardware** — layout C renders on coarse pointers; PROOF to confirm ≥60s phone play

## Behavior change vs B-N1 (intentional, flagged for ARCADE)
Desktop aim now requires a real pointer event (`pointer.seen`). Pure keyboard play always fires in facing direction — this is the concept spec's authenticity target (keyboard-only combat). BH-1's headless kill happened to land via the old boot-position bug aiming at (0,0); that path is closed.

## Known TBD / waivers
- All combat numbers still `// TBD ARCADE` (damage 10/bullet, DM target 5 kills, respawn 1.4s).
- Default keymaps provisional until ARCADE captures the original 2P layout.
- Deathmatch barrel kills award no credit (stub); grenade tier still fires single projectile.
- Touch layout A (dual pads) waived this slice; menu pointer hit-zones still basic (whole-screen tap semantics).
