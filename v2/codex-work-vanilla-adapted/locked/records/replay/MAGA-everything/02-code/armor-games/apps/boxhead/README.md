# Deadlock Rooms

An original arena survival game inspired by the shared-keyboard browser arena tradition. PixiJS, authored block characters and industrial geometry, synthesized sound, six original rooms and eight weapon families. Historical Boxhead paths remain for compatibility; no original game art, executable or audio is distributed.

From the monorepo:

```sh
npm run dev:boxhead -- --host 127.0.0.1
npm run build -w @maga/boxhead -- --base=./
npm run typecheck -w @maga/boxhead
```

Solo and co-op are endless. Survive increasingly dense waves of walkers, red runners, armored brutes (wave 3 onward), volatile enemies (wave 4) and ranged wardens (wave 5). Wardens flash before firing energy shots. Enemies navigate around cover. Wave clears restore 28 ammunition and 10 health; co-op also revives fallen partners. Supplies restore 32 ammunition and 8 health in survival. Deathmatch is first to five with respawns, supplies and all eight weapons available.

| Weapon | Streak | Role |
| --- | ---: | --- |
| Service pistol | 1 | Unlimited fallback |
| Machine pistol | 4 | Rapid fire |
| Breach shotgun | 7 | Five-pellet spread |
| Proximity mines | 10 | Armed traps |
| Frag launcher | 14 | Impact area damage |
| Thermal lance | 20 | Short range rapid damage |
| Rail driver | 28 | Armor damage and penetration |
| Rocket system | 40 | Wide explosive splash |

Unlocked weapons remain available for the run. Taking damage reduces the current multiplier; the peak remains. Empty weapons fall back to the unlimited pistol so no mode can deadlock on ammunition. Environmental barrel blasts damage players; fired explosives exempt their owner and credit deathmatch kills.

| Action | P1 / solo / each LAN device | Local P2 |
| --- | --- | --- |
| Move | WASD; arrows also in solo/LAN | Arrows |
| Fire | Space; optional mouse aim | I/J/K/L or numpad 8/4/5/6 directional fire |
| Select weapon | Q/E; 1–8; toolbar WEAPON | [ / ] |
| Pause/resume | Esc/P; toolbar | Shared toolbar |
| Exit paused/end screen | M; settings Exit | Shared toolbar |

Touch solo and LAN use a left stick and a right fire target with nearest-enemy aim. Weapon selection, settings, pause, retry and menu are reachable by touch. Local two-player requires a keyboard. Controls, volume, fullscreen and a field manual live in settings. Extra key bindings and volume persist on the device. Focus loss pauses and clears held input.

See [LAN.md](LAN.md) for the one-command offline host and two-device instructions. The host script uses only Node built-ins. Static hosting retains solo/local modes.

Verification hooks remain behind `?debug`: `window.__maga` exposes game/input/touch only when requested. High score key `maga:boxhead:highscore` retains existing players' records.

The real-client LAN test launches its host in the same process environment and uses two isolated browser contexts. A build must exist before running:

```sh
CHROMIUM_PATH=/path/to/chrome-headless-shell node --test apps/boxhead/tests/lan.test.mjs
```

From the repository root, verify a final static collection with:

```sh
SITE_ROOT=delivery/site HOST_SCRIPT=delivery/site/deadlock-host.mjs CHROMIUM_PATH=/path/to/chrome-headless-shell node --test MAGA-everything/02-code/armor-games/apps/boxhead/tests/lan.test.mjs
```

## Shipped tuning, art and sound

These are explicit Deadlock Rooms design values, not measured claims about the historical reference:

| System | Release behavior |
| --- | --- |
| Arena and movement | Fixed 640×400 logical field; 138 units/s player speed with normalized diagonals; cover blocks bodies and projectiles |
| Starting resources | 100 HP, 70 rounds for unlocked weapons, unlimited pistol |
| Damage protection | Contact costs 10 HP followed by 0.8 s protection; warden bolts cost 12 HP; deathmatch bullet damage is 12 × projectile damage with 0.35 s protection |
| Deathmatch | First to five; 1.4 s respawn delay; 2 s spawn protection; all weapons available |
| Blast rules | Enemies inside a blast are eliminated; unprotected players within 80% of its radius lose 25 HP; fired ordnance exempts its owner; environmental barrels do not |
| Score and equipment | 100 × current multiplier per kill; multiplier grows by one per kill up to 100; decay begins after 4.5 s, then one step every 1.8 s; damage retains 60% of the current multiplier, rounded down; peak equipment unlocks remain |
| Opening waves | 8, 13 and 19 enemies with 0.9, 0.72 and 0.6 s spawn intervals; later waves increase within the documented caps |

Art is intentionally rendered from outlined blocks, armor/limb/visor details, role markings, ground shadows, hazard stripes and industrial cover. The SVG logo and floor are finished authored assets. See `assets/MANIFEST.md` for the exact visual inventory; no external art handoff is pending.

The combat music is a deliberately sparse, repeating triangle-wave pulse: `[110, rest, 110, rest, 131, rest, 98, rest]` Hz at 160 ms per step (1.28 s per cycle). It starts with a run and stops on pause, menus and run end. The same short bed supports all modes. It is a synth rhythm, not a claim of a recorded soundtrack or historical audio fidelity.

Weapon cues supplement the shared shoot/hit/pickup/death/UI envelopes: machine-pistol and thermal fire use short 440/120→60 Hz sawtooth sweeps; shotgun/rocket fire uses a heavier 130→35 Hz sweep; explosions use 90→30 Hz; wardens use 600→160 Hz warning shots. All pass through persistent master volume and mute. This is the implemented audio arrangement, with no later music replacement required.
