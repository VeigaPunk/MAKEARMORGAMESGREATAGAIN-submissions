# ACCEPTANCE — B-N1 (Solo vertical slice)

**Build:** BH-1 placeholder pass · 2026-09-22 · KIMI (Kimi Work)
**How to run:** `npm run dev:boxhead` at monorepo root, or serve `apps/boxhead/dist` statically.

| Hook | Result | Notes |
|------|--------|-------|
| BH-1.1 entity types | PASS (placeholder) | Player, Zombie, Projectile, AmmoCrate, Barrel, WaveDirector (WAVE_TABLES), ScoreSystem, ArenaRoom in `src/entities.ts` + `src/world.ts` |
| BH-1.2 two rooms | PASS | Open Yard + Pillars, room-select menu (keys 1/2) |
| BH-1.3 keyboard combat | PASS | WASD/arrows move; shots fire in facing direction (Space/J); mouse aim optional; documented here |
| BH-1.4 wave escalation | PASS (placeholder) | Waves 1–3 survivable; all numbers `// TBD ARCADE` |
| BH-1.5 crates + barrels | PASS | Dry-ammo click blocks fire; crates +16; barrels radius-55 blast, chain reactions, player damage |
| BH-1.6 score/streak/weapon ladder | PASS (placeholder) | Streak UI live; ladder pistol→shotgun→uzi→grenades on placeholder thresholds (mult 4/8/14) |
| BH-1.7 death→restart | PASS | Score screen → Space retries instantly (<3s) |
| BH-1.8 placeholder art | PASS | Chunky boxes per feel target (PIXEL drop zone: `apps/boxhead/assets/`, lands BH-3.1) |
| BH-1.9 placeholder SFX | PASS | shoot / hit / pickup / dry-fire / barrel boom / death via arcade-core WebAudio synth |

## Smokes
- Desktop wave 3: **Y** (headless Chrome run: boot → menu → room → wave 1 HUD with spawns; see `proofs/bh1-first-run.png`; interactive full-wave-3 clear pending human/PROOF run)
- 2P: **N** — BH-2 scope
- Mobile: **not tested** — BH-2 scope

## Known TBD / waivers
- Combat tables (speeds, HP, spawn cadence, weapon thresholds, damage) are placeholders pending ARCADE capture.
- Stage size 640×400 provisional, UNVERIFIED.
- Menu navigation is keyboard/tap-basic; pointer hit-zones land with BH-2 touch layout.
- Weapon tier `grenades` fires single projectile (stub).
