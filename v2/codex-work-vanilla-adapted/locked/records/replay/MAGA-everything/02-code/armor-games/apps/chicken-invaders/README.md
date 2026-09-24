# Starfall Flock

An original browser expedition inspired by the early poultry-shooter formula. Fly from Pluto to the Sun through **11 sectors and 110 encounters**: nine formations and a commander at every stop. Six formation behaviors, three visually distinct flock types, three escalating guns, ration-fed missiles and phased bosses all run through the same `@maga/shmup-core` engine used by Cluck Horizon.

This extends the checkpoint's two-sector slice to the original's published campaign scale. The official reference page, https://www.interactionstudios.com/chickeninvaders2.php, advertises 11 planets and 110 levels including ten secret levels. Starfall's route, enemy art, names, scripts and music are newly authored: it offers 110 authored encounters, not an exact reconstruction of the commercial game's level layouts or secret objectives.

The route is Pluto, Neptune, Uranus, Saturn, Jupiter, the Asteroid Belt, Mars, Earth, Venus, Mercury and the Sun. Every commander has its own SVG design, palette, movement tempo, volley and burst script. At half health it accelerates its attack cycle. Each sector has a colored orbital backdrop. Two original synth motifs transpose across the route, with the opening motif returning at Starheart.

Start with three lives and two missiles. Star Caches upgrade Comet Needle → Twin Nova → Prism Fan. Rations add a missile, capped at six. Every 5,000 points adds a life, capped at five; each commander clear repairs one life and adds one missile. Respawning takes 1.2 seconds and grants two seconds of protection. A checkpoint stores the start of each wave; continue restores the earned score, equipment and lives at that boundary. Chapter unlocks, best score, touch preference, motion preference and audio settings persist locally. Invalid save values are rejected.

| Action | Desktop |
| --- | --- |
| Move | WASD or arrows |
| Fire | Space, Z or left mouse |
| Missile | X, Shift or right mouse |
| Pause | Esc, P or toolbar |
| Launch / results | Enter or tap |
| Previous / next unlocked sector | 1 / 2 |
| Continue checkpoint | C or Continue button |

Settings provide master volume, music, reduced motion, twin-thumb or one-thumb controls, and Save & Hangar. Twin thumbs steer on the left and hold FIRE on the right; one-thumb drag steers and fires together. Missile/fire targets are at least 44 CSS pixels. Portrait has readable status and native 48-pixel launch/continue buttons outside the playfield. Focus loss releases input and pauses play.

Run `npm run dev:chicken` from the monorepo directory (port 5176). Build with `npm run build -w @maga/chicken-invaders -- --base ./`. The historical package path and save namespace `maga:chicken-invaders:` stay stable.

Verification from the repository root:

```sh
node --test MAGA-everything/02-code/armor-games/packages/shmup-core/tests/campaign.test.mjs
node MAGA-everything/02-code/armor-games/packages/shmup-core/tests/legal-input.mjs
node MAGA-everything/02-code/armor-games/packages/shmup-core/tests/touch-input.mjs
SITE_ROOT=delivery/site node MAGA-everything/02-code/armor-games/packages/shmup-core/tests/failure-input.mjs
```

Browser gates serve the app production builds themselves and block external requests. `SITE_ROOT=/absolute/site` tests a copied collection; `ARCADE_URL` targets an already running server. `CHROMIUM_PATH` selects a local browser. `SHMUP_APP=chicken-invaders` runs only this campaign; `SHMUP_REALTIME=1` uses normal wall-clock scheduling. By default the long campaign gate uses a controlled browser rAF/performance clock at 20 Hz, while the unchanged production simulation runs 120 Hz physics. A read-only controller emits browser KeyboardEvents (`isTrusted=false`) through the production input handlers in 100 ms input batches. `SHMUP_NATIVE=1` instead sends native keyboard events. Native menu/keyboard checks and native CDP touch movement smoke are recorded separately. Touch wave checks use browser PointerEvents (`isTrusted=false`) through the actual canvas touch zones. It never writes health, entities, projectiles, progression, saves or collision state. Separate simulation fixtures are explicitly unit-level tests. Current receipts/screenshots are in `proofs/ship/`; baseline and intermediate wall-clock balance receipts are separate.
