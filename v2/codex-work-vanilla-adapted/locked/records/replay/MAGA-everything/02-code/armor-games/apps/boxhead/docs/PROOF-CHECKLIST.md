# PROOF checklist — Boxhead native (BH-3.3 template)

Pass/fail template from concept spec §Acceptance hooks +
`07-acceptance/boxhead-playability-checklist.md`. PROOF fills Verdict +
Evidence per row; FAIL rows use the repro template in the master checklist.

| # | Hook (concept §Acceptance) | Gate | Verdict | Evidence |
|---|----------------------------|------|---------|----------|
| 1 | Solo waves 1–3 completable, no softlock; death ends run + shows score | B-N1+ | ☐ | |
| 2 | Desktop co-op: P1+P2 move & shoot simultaneously, one keyboard, no focus steal | B-N2+ | ☐ | |
| 3 | Mid-run swarm density feels chaotic arcade (not sparse) | B-N1+ | ☐ | |
| 4 | Ammo crate restores shooting when dry; barrel clears nearby zombies, readable radius | B-N1+ | ☐ | |
| 5 | Kill streak visibly affects score / unlock cadence | B-N1+ | ☐ | |
| 6 | Deathmatch: both players damage each other; match ends on agreed rule (TBD) without crash | B-N2+ | ☐ | |
| 7 | Mobile layout A: two thumbs control two players ≥60s, no UI blocking shots | B-N2+ / WAIVE | ☐ | |
| 8 | Stage letterboxed; no non-uniform stretch warping movement | all | ☐ | |
| 9 | Cold restart menu → combat < ~3s on localhost mid-tier laptop | all | ☐ | |
| 10 | English-only strings; no leftover placeholder locales | all | ☐ | |

## Environment record

| Field | Value |
|-------|-------|
| Build / commit | |
| URL | http://localhost:5173 |
| OS / browser | |
| Input | desktop / touch |
| Date | |

## Section gates (master checklist)

- A smoke / boot: A1–A5 ☐
- B solo e2e: B1–B10 ☐ · modes: B11–B14 ☐
- C touch: C1–C6 ☐
- D display: D1–D4 ☐
- E desktop controls: E1–E5 ☐
- F perf: F1–F7 ☐
- G suite matrix: see master file
