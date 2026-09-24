# Boxhead: 2Play Rooms — Native Replica Concept Spec

## Meta

| Field | Value |
|-------|-------|
| **Slug** | `boxhead` |
| **Working title** | Boxhead: 2Play Rooms (native replica) |
| **Target version for feel** | **Boxhead: 2Play Rooms (2007 Flash)** — primary; Rooms-family loop |
| **Status** | concept |
| **Rights** | **INTERNAL-NO-PUBLIC** — localhost internal OK; public ship needs clearance (Sean Cooper / Crazy Monkey / Fire Source chain — verify). Armor Games was host, not IP owner. |
| **Ship path** | Native from-scratch (browser, **PixiJS 8**). **Not** Ruffle/SWF as ship vehicle (reference-only). |
| **Renderer (locked)** | **PixiJS 8** (swarm / projectiles / particles) |
| **Shared kit** | `packages/arcade-core` — input, integer letterbox scale, localStorage, WebAudio helpers |
| **Stack lock** | `/workspace/armor-games-research/specs/001-native-stack-and-plan.md` — prior EMULATE/Ruffle ship path **superseded**; Ruffle spike = reference-only |
| **Language** | English only |
| **Priority** | **1** (FORGE STACK-LOCKED — cite `/workspace/armor-games-research/specs/001-native-stack-and-plan.md`) |
| **Idea** | 001 — Make Armor Games Great Again (post-pivot) |

## Core loop

Concrete player steps for a v1 run:

1. **Boot / menu** — Title → Mode select: Solo Survival | Local Co-op | Local Deathmatch.
2. **Room pick** — Choose from a small set of arena rooms (v1: 2–3 rooms). Shared camera, top-down.
3. **Spawn** — Player(s) appear as chunky box characters with starting pistol + limited ammo.
4. **Survive waves** — Zombies (and specials if verified) spawn in escalating density; player moves + shoots; pick up **ammo crates**; use **explosive barrels** for crowd control.
5. **Score treadmill** — Kills build score; kill-streak multipliers feed **weapon unlock/upgrade** curve (pistol → shotgun → uzi → grenades, etc.). Exact thresholds: **TBD from ARCADE playtest**.
6. **Death / end run** — On death (solo) or wipe (co-op rules TBD from playtest), show wave reached + score; offer restart / menu.
7. **Optional deathmatch** — Same arenas, players vs each other with pickups; scoring rules **TBD from ARCADE playtest**.

Session feel target: **~5–20 minutes** per arcade run; “just one more wave.”

## Feel targets

What “exactly like original” means in player terms (not pixel-perfect asset theft):

- **Chunky low-fi boxes** — characters and props read as blocky mid-2000s Flash arena shooters, not modern HD zombie games.
- **Chaotic swarm density** — pressure ramps; screen fills with threats; survival feels frantic, not tactical cover-shooter.
- **Arcade score chasing** — streaks matter; weapon upgrades feel earned mid-run, not loadout menus.
- **Local co-op social chaos** — two humans on one machine sharing the arena (the nostalgia hook). Not online matchmaking.
- **Readable pickups** — ammo crates and barrels are obvious at a glance.
- **Short restart loop** — die → see score → instantly back in.

Non-goals for feel: networked latency, remaster sheen, cinematic intros.

## Controls

### Desktop (keyboard/mouse)

- **Primary authenticity:** dual keyboard maps (shared keyboard), mouse not required for core combat.
- **Player 1 (default proposal until ARCADE capture):** WASD move; shoot keys on right-hand cluster (e.g. I/J/K/L or arrow-adjacent) — **exact defaults TBD from ARCADE playtest / original keymap capture**.
- **Player 2:** Arrow keys move + dedicated shoot cluster — **TBD from ARCADE playtest**.
- **Rebinds:** v1 should support user-definable maps (original 2Play claimed this).
- **Mouse:** optional aim-assist or menu only; do not require mouse for fidelity combat.
- **Modes:** Solo uses P1 map only; Co-op = both; Deathmatch = both, hostile.

### Mobile (touch mapping)

Must be playable **one- or two-handed**. Documented layout:

| Layout | Use case | Mapping |
|--------|----------|---------|
| **A — Dual virtual pads (2P preferred)** | Two players on one tablet / large phone landscape | Left half: virtual stick (P1 move) + fire buttons; right half: virtual stick (P2 move) + fire buttons. Split screen chrome labels “P1 / P2”. |
| **B — Shared + AI (1 human)** | Solo phone / one-handed | Single left stick + right fire fan (4-dir or auto-aim + fire). Optional “AI buddy” toggle for co-op-like clutter without second human — **label clearly as non-original convenience**; original fidelity path remains human 2P. |
| **C — Solo one-handed** | Portrait or thumb reach | Left stick (or swipe-relative move) + large Fire button; optional auto-aim toward nearest zombie to preserve survival readability on small screens. |

**Risk callout:** Virtual sticks will never match keyboard chord fidelity for 2P; PROOF must judge “playable and fun” on mobile, while desktop remains the fidelity reference.

**Not in v1:** networked LAN / online multiplayer (deferred; Immortal-era P2P is a different product generation).

## Content scope — Playable v1 (IN)

- Solo survival in **2–3 rooms**.
- **Local 2P co-op** on desktop (split keyboard); mobile dual pads or shared+AI note as above.
- **Local deathmatch** on desktop (same rooms); mobile deathmatch if dual pads exist, else defer.
- Enemy: basic zombies + at least one special type if ARCADE confirms presence (“devils” / equivalents) — otherwise stub specials behind playtest.
- Pickups: ammo crates; explosive barrels.
- Weapon progression chain matching original *feel* order (pistol → shotgun → uzi → grenades…); numbers **TBD from ARCADE playtest**.
- Score + streak multiplier presentation; local high-score persist (localhost storage).
- English UI/menus only.

## Content scope — Deferred

- Networked LAN / online co-op.
- Full room roster from More Rooms / all arenas.
- Boxhead: The Zombie Wars base-build / turrets.
- Halloween Special narrative framing.
- Remastered HD art packs / new weapons not in 2Play Rooms.
- Cloud accounts, leaderboards beyond localhost.
- Exact SWF binary wrap.

## Art needs (for PIXEL)

- **Style:** Blocky bitmap “box” characters; flat/low-fi mid-2000s portal aesthetic; top-down readable silhouettes.
- **Palette:** Limited, high-contrast floors vs blood/zombie tones; avoid modern PBR / lighting.
- **v1 asset list:**
  - Player box (P1/P2 tint variants)
  - Zombie + 1 special enemy
  - Weapons VFX (muzzle flashes / pellets for shotgun feel)
  - Ammo crate, explosive barrel (idle + explode frames)
  - 2–3 room tile sets / props (walls, obstacles)
  - UI: menus, score, streak, death screen, virtual stick chrome
- **What NOT to modernize:** Do not replace boxes with realistic humans; no Bloom/HDR; no Smooth AA that softens hit readability; keep chunky pixels/blocks.

## Audio needs (for MAESTRO)

**v1 priorities:**

1. Gun SFX per weapon class (pistol / shotgun / uzi / grenade) — punchy, arcade, short.
2. Zombie hit / death / player hurt.
3. Barrel explode.
4. Pickup collect stinger.
5. Wave escalate sting (optional but high value).
6. Menu blip + death jingle.
7. Short loopable combat bed (low priority vs SFX; can be silent with opt-in music).

Exact original mix: **TBD from ARCADE playtest** (dossier gap). Prefer original-inspired, not ripped commercial tracks without clearance.

## Acceptance hooks (for PROOF)

Testable feel/behavior checks (5–10):

1. Solo: complete waves 1–3 without softlocks; death ends run and shows score.
2. Desktop co-op: P1 and P2 move and shoot **simultaneously** on one keyboard without focus steal.
3. Swarm density at mid-run feels “chaotic arcade,” not sparse (side-by-side vs ARCADE capture when available).
4. Ammo crate pickup restores shooting when dry; barrel detonation clears nearby zombies with readable radius.
5. Kill streak visibly affects score / unlock cadence (exact numbers later).
6. Deathmatch: both players can damage each other; match ends on agreed rule (TBD) without crash.
7. Mobile layout A: two thumbs can control two players on landscape tablet for ≥60s without UI blocking shots.
8. Stage letterboxed; no non-uniform stretch warping movement feel.
9. Cold restart from menu to in-game combat in under ~3s on localhost mid-tier laptop.
10. English-only strings; no leftover placeholder locales.

## Open questions / ARCADE gaps

- Default P1/P2 keymaps from original.
- Exact weapon unlock score thresholds and damage tables.
- Enemy spawn tables / wave composition.
- Barrel explosion radius/damage; friendly fire rules.
- Deathmatch scoring.
- Camera follow rules in 2P.
- Native stage size (dossier: provisional **640×480** until measured — UNVERIFIED).
- Screen shake / hit flash / SFX timing reference clips.
- Trusted reference captures (solo waves 1–3, co-op mid-run, deathmatch) — blocked until cleared playthrough.

**Do not invent combat numbers** — fill with **TBD from ARCADE playtest**.

## Notes for FORGE

**Stack (FORGE STACK-LOCKED — cite `/workspace/armor-games-research/specs/001-native-stack-and-plan.md`):**
- App: `armor-games/apps/boxhead` — **PixiJS 8** + TypeScript + Vite.
- Shared: `packages/arcade-core` (keyboard/mouse/touch input, integer scaling + letterbox, localStorage saves, WebAudio synth SFX helpers).
- Monorepo start-now slice: B-N0 scaffold → B-N1 solo wave 3 → B-N2 touch + letterbox (local 2P stretch) → B-N3 ARCADE/PROOF/FORGE review.
- Keep `boxhead-2play-spike` as **INTERNAL feel reference only** — do not block native on SWF clearance; **no Ruffle as product path**.
- No Phaser / Unity / Godot for v1.


- **Performance / payload:** Lightweight browser build; target comfortable 60fps on mid laptop for ~50–100 on-screen movers; mobile 30–60fps acceptable. Keep first paint / transfer small (IDEATOR suggestion: aim sub-few-MB compressed art+audio for v1 rooms — FORGE owns budgets).
- **Suggested entity types:** `Player`, `Zombie`, `SpecialEnemy`, `Projectile`, `AmmoCrate`, `Barrel`, `Pickup`, `WaveDirector`, `ScoreSystem`, `ArenaRoom`, `VirtualStick` (mobile).
- **Input:** Desktop dual-keyboard is critical path; mobile virtual pads secondary.
- **No stack prescription** — FORGE chooses engine/framework; this spec is feel + scope only.
- **Clarify:** v1 MP = local only; networked LAN deferred (not a fidelity miss if absent).
