# Ship record — Sand & Steel (reference: Swords & Sandals 2: Emperor's Reign, 2007)

## Survey
- `apps/swords-and-sandals/` — DOM+Canvas turn-based arena RPG: gladiator
  creation (name, look, 4 stats × 6 points), 12 opponents over 3 tournaments
  with distinct heavy-strike rhythms, 8 shop items with level gates, potions,
  guard/special/attack kit, autosave + save validation, authored colosseum
  art, mobile layout.
- `prototypes/swords-and-sandals.html` — mechanics proof (superseded).
- Original S&S2 adds: more opponents/champions, magic spells, ranged weapon,
  more shops and gear; checkpoint is a leaner slice.

## Decision: EXTEND
Grow to 16 opponents across 4 tournaments (adds The Sun Throne), add a magic
shop (4 spells) and ranged weapon slot, expand the smithy to ~14 items, widen
character looks. Keep the DOM/Canvas presentation and validated save schema
(save version bump with migration).

## Verification
- `tests/progression.test.mjs` — 8,400 seeded campaigns × 210 legal builds:
  all complete; max 4 defeats before completion; no duplicate rewards; volley
  spends arrows; save v1→v2 migration; injection guards. 8/8 pass.
- `tests/browser.mjs` — full 16-bout UI campaign to champion + restart, gear
  and spell purchases, reload persistence, desktop AND emulated touch;
  stored-name markup stays literal (injection-safe). Pass.
- Playwright release + subdirectory specs pass on chromium and firefox.

## Provenance
Checkpoint code + dossier/spec. Opponent names are original evocations.
