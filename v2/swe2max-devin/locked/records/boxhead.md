# Ship record — Block Siege: 2Play Rooms (reference: Boxhead: 2Play Rooms, 2007)

## Survey
- `MAGA-everything/02-code/armor-games/apps/boxhead/` — PixiJS 8 app: title →
  mode select (solo / local co-op / local deathmatch) → room select (2 rooms)
  → endless escalating waves, zombies+runners, ammo crates, explosive barrels,
  streak-multiplier weapon ladder (pistol→shotgun→uzi→grenades), high score,
  touch layout C (stick+FIRE, auto-aim), keyboard rebind support, ?debug hook.
- `prototypes/` has no Boxhead file — app is the only rendition.
- Missing vs mission: **LAN play** (required: two devices on one LAN, no
  accounts/internet/relay), devil special enemy (externally confirmed in the
  original), third room, deeper weapon ladder.

## Decision: EXTEND
Game loop is faithful and verified; presentation is cohesive. Keep engine and
rooms, add: LAN mode (host-authoritative over a bundled zero-dep WebSocket
relay — one-command `node tooling/lan-relay.mjs` that also serves the site),
devil ranged enemy, third room (CROSSROADS), railgun tier, music upgrade.
Title renamed to "Block Siege: 2Play Rooms" (rights).

## Verification
- `apps/boxhead/tests/release.test.mjs` — input-only pilots: solo + coop reach
  wave 6+ and die through the real damage path, deathmatch reaches 5 kills;
  devil-hunting and fireball-dodging pilot logic; menu/pause/retry; touch
  fire. Last observed: 7/7 pass.
- `apps/boxhead/tests/lan.test.mjs` — zero-dep relay unit test: WS upgrade,
  room pairing, msg forwarding, peer-left. Last observed: 1/1 pass.
- `verification/browser/lan.spec.js` — two real browser pages through the real
  relay: pairing, welcome, remote input (guest→host movement), snapshot
  replication (zombies, damage propagation both directions), deathmatch mode
  propagation, remote combat hits. Last observed: 4/4 pass (chromium+firefox).
- Notable fixes this run: esbuild const-folding folded `sock.onMessage:null`
  into a dead check (handlers moved to closure vars); `invuln` was wall-clock
  based — converted to sim-time (also fixes pause-drain); melee radius 14→17
  fixes a cornered-player stalemate; devil ramp retuned (wave 4+, slower
  fireballs, 12 dmg) after pilot evidence.

## Provenance
Checkpoint code + design dossier `05-dossiers/boxhead.md`, spec
`02-concept-specs/01-boxhead.md`, operator knowledge of the 2007 original.
No external renditions consulted.
