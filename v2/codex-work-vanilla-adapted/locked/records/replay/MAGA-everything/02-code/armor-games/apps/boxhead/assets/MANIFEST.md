# Deadlock Rooms · shipped visual assets

The release uses authored SVG decoration and runtime Pixi `Graphics` art. The procedural characters, props and effects are the selected production medium. No sprite-sheet delivery or later artist handoff is required by the runtime.

| Shipped source | Visual content |
| --- | --- |
| `public/art/boxhead-logo.svg` | Original Deadlock Rooms lock/visor identity; historical filename retained for compatibility |
| `public/art/floor-tile.svg` | Repeating industrial floor surface |
| `src/entities.ts` · `Player.draw` | Outlined armor, boots, visor, weapon and ground shadow; pale P1 and blue P2 |
| `src/entities.ts` · `Zombie` | Green walkers, red runners, enlarged armored brutes, purple horned wardens, orange volatile core markings |
| `src/entities.ts` · `Projectile` | Directional tracers and circular impact ordnance; firing code adds thermal/rail/rocket tint and size distinctions |
| `src/entities.ts` · `AmmoCrate`, `Barrel` | Banded yellow supply crates; red hazard-marked explosive barrels |
| `src/entities.ts` · `BlastRing` | Expanding hit, muzzle and explosion rings with fading alpha |
| `src/game.ts` · `startRun` | Grid floor, scuffs, perimeter hazard stripes, cover highlights, bolts and offset shadows |
| `src/world.ts` · `ROOMS` | Six original cover/barrel layouts and their accent colors |
| `src/game.ts` · room/menu/HUD rendering | Six room cards with geometry previews, numeric weapon strip, wave/score/health and end-state panels |
| `src/touch.ts` | Movement pad, movable knob and active fire target |
| `index.html` and `src/main.ts` | Toolbar, settings, field manual, LAN dialogs and portrait status strip |

The logical arena is 640×400. Rendering preserves its aspect ratio and uses crisp CSS scaling. Optional SVG-load failures retain a usable text title and procedural floor; this resilience does not represent an unfinished asset slot.

The old PNG filenames once proposed in this manifest are not referenced by the game and are not missing runtime dependencies. Vendored Pixi modules under `public/vendor/` are renderer dependencies, not game art. No original Flash assets are included.
