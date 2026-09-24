# Ship record — Cluck Horizon (original IP, second shmup pack)

## Survey
- `apps/chicken-invaders-original/` — same shmup-core, `cluck` pack: distinct
  palette, courier ship art, flock enemies, 2 bosses, jokes. Same 2-sector
  checkpoint scope as replica.

## Decision: EXTEND
Authors its own 8-sector original campaign on the shared engine (sector names,
enemy roster, bosses, courier-log jokes, weapons named per pack). Distinct
identity preserved side-by-side with the replica pack.

## Verification
- Same shmup-core harness as the replica pack; `campaign.test.mjs` runs a
  real-input pilot through the full 8-sector cluck campaign (all 5 seeds)
  plus structure/boss assertions. Last observed: 11/11 pass.
- `browser.test.mjs` covers both packs: controls, boss rendering, touch,
  fire targets. Last observed: 4/4 pass.
- Playwright release suite: production asset + desktop/phone checks pass on
  chromium and firefox.

## Provenance
Checkpoint code + spec `06-chicken-invaders-original.md`. All names/art
original.
