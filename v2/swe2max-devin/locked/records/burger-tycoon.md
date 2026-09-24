# Ship record — Burger Tycoon (reference: Molleindustria's The McDonald's Videogame, ~2006)

## Survey
- `apps/burger-tycoon/` — DOM+Canvas four-pane sim (Farmland/Feedlot/
  Restaurant/HQ), shared economy, dirty toggles, backlash→disease→reputation
  collapse, board pressure, pause/save/best-survival, tabbed mobile layout,
  illustrated panes.
- `prototypes/burger-tycoon.html` — mechanics proof (superseded).
- Original had more actions per pane (crew wages, hormones, GMO, advertising
  streams) and random crisis events; checkpoint is leaner.

## Decision: EXTEND
Deepen each pane (crew hiring, growth hormones, GMO soy, more dirty options),
add crisis events (health inspection, activist protest, media exposé, mad-cow
scare) tied to the dirty economy. Keep the pane sim + illustrated scenes.

## Verification
- `apps/burger-tycoon/tests/sim.test.mjs` — clean idle economy reaches
  bankruptcy + restart; dirty throughput → backlash → collapse; action guards;
  crew hiring cap; pasture/lobbying counterplay; crisis clock events;
  class-action two-choice flow; original action indices preserved.
  Last observed: all pass.
- Playwright `release.spec.js` burger spec: real clicks through actions,
  keyboard pause, save reload, mobile tabs, collapse retry. Pass on both
  browsers.

## Provenance
Checkpoint code + dossier/spec. Burger Tycoon branding precedent kept.
