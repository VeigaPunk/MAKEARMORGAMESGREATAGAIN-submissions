# Notes for the catalog operator

- `site/` is a fully static release; serve it from any static host. Block
  Siege's LAN mode needs `node lan-relay.mjs` run once on the LAN (bundled in
  the release root, zero dependencies) — it serves the site and pairs one
  host with one guest. Solo and local co-op/deathmatch work without it.
- All seven player-facing titles are original evocations; URL slugs keep the
  checkpoint's original folder names for link stability.
- Verified end-to-end via `npm run verify` (typecheck, 46/46 model tests,
  114/114 maze replays, build, 46/46 Playwright checks on chromium+firefox
  including a two-browser LAN pairing test, plus per-game input pilots).
  Details in `delivery/records/VERIFICATION.md`.
- Known limits: touch verified via emulation, Safari untested; the six
  bundled module apps require HTTP (ES modules), not file://.
- Sector-8 shmup waves received a final difficulty retune before the lock;
  it is included in this build, and all 11 campaign tests including both
  real-input pilots pass.
