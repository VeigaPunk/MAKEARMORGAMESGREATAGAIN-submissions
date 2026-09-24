# Crown & Sand

An original turn-based gladiator adventure: eighty authored opponents, twenty four-bout tournaments, forty-two permanent gear upgrades, and ten independent character slots. Create a fighter with six skill points and three cosmetic looks, read the next enemy strike, earn gold and experience, buy equipment, and claim the Twentyfold Laurel. The technical `swords-and-sandals` slug remains stable for build and save compatibility.

The complete campaign reaches level forty-five after eighty wins. Each four-bout chapter has its own introduction, opponent palettes, and champion. Existing twelve-win saves continue into the Moonlit Crucible; fifteen later circuits lead to Lyra, Crown of the Free. The old single save is character slot one. Purchases and completed bouts save automatically. Losing or leaving a bout restores a playable retry and never spends gold or grants rewards. Starting another slot preserves all other characters. Retiring a champion clears only the selected slot and survives reload.

## Play

From the armor-games workspace: `npm run dev --workspace @maga/swords-and-sandals -- --host 127.0.0.1`. Open `http://127.0.0.1:5178`. The root static collection packages the game at `/swords-and-sandals/`.

| Key | Action | Rule |
|---|---|---|
| 1 | Attack | Reliable weapon strike |
| 2 | Shield breaker | More damage, blocks 2 incoming damage, two-action cooldown |
| 3 | Potion | Restores up to 26 HP, blocks 3 damage; two per bout |
| 4 | Guard | Blocks 8 damage, restores 1 focus up to 3 |
| 5 | Javelin | Guaranteed hit through half armor; three per bout |
| 6 | Sunfire | Level 3; costs 2 focus, guaranteed damage ignoring armor |
| 7 | Moon ward | Level 2; costs 1 focus, heals and blocks 6 damage |
| Escape | Pause / Resume | Stops animation and music; blocks new combat actions |

Mouse and touch buttons cover every action and menu. Full health, two potions, three javelins and two focus return each bout. Later champions can reduce ordinary weapon damage, mend once instead of attacking, enrage at low health, drain focus with heavy strikes, or add pressure to normal replies. Their intent always describes the active trait. The original four-action route remains sufficient for every tested stat build; spells and ranged actions are optional. Opponents announce heavy strikes on their own two-, three-, or four-turn rhythms. Focus rings, named controls, live combat logs, 48px combat targets, reduced-motion support, persistent mute and visible master volume, an accessible Pause/Resume dialog, and an in-game handbook support accessible play.

The Canvas2D art is authored in source: colosseum tiers and spectators, helmet/weapon silhouettes, colored tournament atmospheres, braziers, dust, incoming/outgoing damage, javelin animation, spell rings, and laurel celebration. Original synthesized lute/drum patterns and separate steel, miss, guard, healing, magic, purchase, victory and defeat cues need no binary assets or external requests. Audio starts with interaction and suspends while the tab is hidden.

## Offline verification

From repository root, with Node 24+ and installed workspace dependencies:

```sh
node --test MAGA-everything/02-code/armor-games/apps/swords-and-sandals/tests/progression.test.mjs
node MAGA-everything/02-code/armor-games/apps/swords-and-sandals/tests/browser.mjs
node MAGA-everything/02-code/armor-games/apps/swords-and-sandals/tests/preview.mjs
```

The rules gate runs eight tests, including 8,400 seeded eighty-bout campaigns covering all 84 legal creation builds using ordinary combat, purchases, rewards, and reload validation. It also covers malformed saves, duplicate rewards/purchases, invalid moves, defeat recovery, finite ammo, spell gates, focus regeneration, and four-/twelve-win checkpoint continuation and champion traits. All 84 builds completed every tested seed, with a maximum of twelve defeats in the full eighty-bout campaign.

The browser gate starts its own local Vite server unless `SAS_URL` is set. `CHROMIUM_PATH` can select a local Chromium or official headless shell; otherwise the test uses an available local browser or Playwright's browser. It performs actual desktop clicks/key presses and emulated phone taps through all eighty victories, buys upgrades, reloads after every bout, switches character slots, returns to the original champion, and checks retirement persistence. It uses a read-only debug snapshot solely to observe state; no game-state injection or automatic-win hooks. Screenshots and a machine-readable report are written under `tests/evidence/`. The focused preview driver verifies Pause/Resume, volume/mute persistence, and desktop/phone layout while creating the normal character Aster. Both drivers accept `SAS_URL` for a copied production build.

The original author’s production site identifies twenty Arena Champions in the historical second game; this campaign matches that broad scale with twenty original tournament champions and sixty preliminaries. The supplied historical reference documentation lacks authoritative full rosters and formulas. This authored campaign is independently balanced and is not a claim of exact numerical or content parity with the historical reference. Mobile verification is emulated touch; physical devices, Safari, and human listening tests require separate verification. See `ship-records/arena.md` at repository root for this run's exact results.
