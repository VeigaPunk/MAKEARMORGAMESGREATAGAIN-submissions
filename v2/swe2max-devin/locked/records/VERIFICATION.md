# Verification evidence — Armor Arcade v1.0 (codex edition)

All commands run from the repository root with zero network access and no new
dependencies. Node v24.21.0, npm 11.19.0, Playwright 1.63.0 (chromium +
firefox), Chromium executable
`/home/node/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`.

## Full gate

    CHROMIUM_PATH=<playwright-chromium> npm run verify

which is `npm run typecheck && npm test && node hardest/validate.mjs &&
npm run build && npm run test:browser`. Last observed: green end to end.

- typecheck: `tsc --noEmit` across all 8 workspaces — clean.
- `npm test` — 46/46 node:test suites pass:
  - `verification/tests/*.test.mjs` — input maps, save isolation, impossible
    tapes for all five courses, burger sim guards, subdirectory saves.
  - `hardest/regression.mjs`.
  - `apps/swords-and-sandals/tests/progression.test.mjs` — 8,400 seeded
    campaigns × 210 builds, all complete, max 4 defeats; migration +
    injection guards.
  - `apps/burger-tycoon/tests/sim.test.mjs` — clean/dirty economy, crisis
    events, lawsuit, collapse.
  - `apps/boxhead/tests/lan.test.mjs` — real WS handshake/pairing/forwarding/
    peer-loss against `tooling/lan-relay.mjs`.
  - `packages/shmup-core/tests/campaign.test.mjs` — 8-sector structure, all
    formations/bosses, real-input pilot clears BOTH campaigns on 5 seeds.
- `node hardest/validate.mjs` — 114/114 levels pass deterministic replays.
- `npm run build` — 7 games into `dist/`, clean.
- `npm run test:browser` (`tooling/verify-browser.mjs`) — all green:
  - Playwright suite 46/46 (chromium + firefox): per-game production assets
    at desktop AND phone widths, Impossible five-course real-key campaign,
    Burger actions/pause/save/collapse, shared input blur/short-tap, two-
    player key independence, arcade navigation, subdirectory deployment
    under `/magga/codex/`, and `lan.spec.js` two-real-browser LAN co-op +
    deathmatch (pairing, welcome, remote input, snapshots, remote hits).
  - `apps/boxhead/tests/release.test.mjs` 7/7: real-input pilots complete
    solo + coop score loops (death through the real damage path at wave 6+),
    deathmatch to 5 kills, menu/pause/retry, contact/death/high-score,
    toolbar focus, portrait touch fire.
  - `packages/shmup-core/tests/browser.test.mjs` 4/4: both packs, controls,
    boss rendering, touch targets.
  - `hardest/browser-check.mjs`: real-input replays L1/L30/L97/L109/L111/L114
    clear 0 deaths; corrupt-save, medal, pause/focus, touch proofs.
  - `apps/swords-and-sandals/tests/browser.mjs`: full 16-bout UI campaign to
    champion + restart on desktop and emulated touch; injection-safe names.

## LAN (Block Siege)

    node delivery/site/lan-relay.mjs        # or tooling/lan-relay.mjs --root dist

Verified with two real browser pages through the real relay (both chromium
and firefox): pairing handshake, host welcome → mode propagation, guest input
moving the host-simulated P2, 15 Hz snapshots replicating zombies/damage to
the guest, and a remote kill registering on the host.

## Known limits

- Touch is verified via emulated pointer/touch events, not physical devices.
- Safari untested (chromium + firefox only).
- The six bundled apps require HTTP (ES modules); serve statically as the
  site README describes.
