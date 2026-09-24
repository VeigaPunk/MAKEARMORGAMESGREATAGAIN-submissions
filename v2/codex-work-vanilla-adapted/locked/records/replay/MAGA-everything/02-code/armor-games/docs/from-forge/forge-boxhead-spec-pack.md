# FORGE → KIMI SPEC PACK — Boxhead native (2026-09-22)
# Synced for BH-1 reconcile. English only. INTERNAL-NO-PUBLIC.

Windows paths (AMDPORRADA):
1. C:\Users\jpvei\Documents\kimi\Workspaces\veigapunkimi\armor-games\docs\from-forge\001-boxhead-native-tickets.md
2. C:\Users\jpvei\Documents\kimi\Workspaces\veigapunkimi\armor-games\docs\from-forge\01-boxhead.md
3. C:\Users\jpvei\Documents\kimi\Workspaces\veigapunkimi\armor-games\docs\from-forge\boxhead-dossier.md

================================================================================
# FILE 1/3 — specs/001-boxhead-native-tickets.md
================================================================================
# IMPLEMENTATION TICKETS — Boxhead native (PixiJS 8)
## Idea 001 · Priority 1 · FORGE · 2026-09-22 14:36 America/Sao_Paulo

| Meta | Value |
|------|-------|
| **Status** | **TICKETS-READY** · BH-0 scaffold **PASS** · BH-1 next |
| **Concept** | `/workspace/armor-games-research/concept-specs/01-boxhead.md` |
| **Stack** | `/workspace/armor-games-research/specs/001-native-stack-and-plan.md` |
| **Fidelity** | `/workspace/armor-games-dossiers/boxhead.md` |
| **App path** | `C:\Users\jpvei\Documents\kimi\Workspaces\veigapunkimi\armor-games\armor-games\apps\boxhead` |
| **Shared** | `...\armor-games\armor-games\packages\arcade-core` |
| **Rights** | **INTERNAL-NO-PUBLIC** |
| **Language** | English only |
| **Roles** | KIMI build · FORGE review · ARCADE fidelity · PROOF acceptance · PIXEL art · MAESTRO audio |

**DoD (title v1):** localhost solo wave 3 + desktop local 2P co-op smoke + touch solo playable; integer letterbox; no invented combat tables (TBD placeholders OK); FORGE review PASS.

**Reference only:** `boxhead-2play-spike` (Ruffle) — do not block on SWF.

---

## Epic B-N0 — Monorepo + arcade-core + app scaffold

| ID | Ticket | Acceptance |
|----|--------|------------|
| **BH-0.1** | Create monorepo `armor-games/armor-games` (npm or pnpm workspaces) with root README (English, INTERNAL note) | `npm install` / `pnpm i` works at root |
| **BH-0.2** | Scaffold `packages/arcade-core`: TS package exporting stubs for `input`, `scale` (integer letterbox), `storage` (localStorage), `audio` (WebAudio helpers) | Package builds; apps can import |
| **BH-0.3** | Scaffold `apps/boxhead`: Vite + TS + **PixiJS 8**; depends on arcade-core | `npm run dev --filter boxhead` (or equiv) serves localhost |
| **BH-0.4** | Shell: title screen + **INTERNAL-NO-PUBLIC** badge + Mode select stubs (Solo / Local Co-op / Local Deathmatch) | Cold load shows badge + modes; English only |
| **BH-0.5** | Wire arcade-core integer letterbox; stage size **provisional 640×480** (UNVERIFIED — comment in code) | No non-uniform stretch; 1x/2x/3x or fit-integer |

**Exit B-N0:** FORGE can open localhost and see menu shell. Report URL/port + package manager choice.

---

## Epic B-N1 — Solo vertical slice (desktop)

| ID | Ticket | Acceptance |
|----|--------|------------|
| **BH-1.1** | Entities: `Player`, `Zombie`, `Projectile`, `AmmoCrate`, `Barrel`, `WaveDirector`, `ScoreSystem`, `ArenaRoom` (minimal) | Types exist; one room loads |
| **BH-1.2** | Room pick: **2 rooms** minimum (third optional) | Menu → room → spawn |
| **BH-1.3** | P1 keyboard move + shoot (provisional keymap; document in README; ARCADE TBD) | Mouse not required for combat |
| **BH-1.4** | Wave director: escalating zombie spawns (tunable constants marked `// TBD ARCADE`) | Survive to **wave 3** possible |
| **BH-1.5** | Ammo crates + explosive barrels (readable radius VFX OK) | Dry ammo blocks fire until pickup; barrel clears nearby zombies |
| **BH-1.6** | Score + streak multiplier UI; weapon ladder stubs (pistol→shotgun→uzi→grenades) with **placeholder thresholds** | Streak visible; unlock fires on placeholder table |
| **BH-1.7** | Death → end run → score screen → restart / menu | No softlock; <~3s back to combat from restart |
| **BH-1.8** | Placeholder art (PIXEL can replace): chunky boxes, not HD humans | Silhouettes readable |
| **BH-1.9** | Placeholder SFX via arcade-core WebAudio synth (MAESTRO can replace) | Shoot / hit / barrel / death at minimum |

**Exit B-N1:** Solo wave 3 on desktop Chrome + Firefox (or Edge). Sign smoke in `apps/boxhead/docs/ACCEPTANCE-BN1.md`.

---

## Epic B-N2 — Touch + local 2P

| ID | Ticket | Acceptance |
|----|--------|------------|
| **BH-2.1** | Mobile layout **C** (solo): virtual stick + fire; optional auto-aim flag | Phone localhost playable ≥60s |
| **BH-2.2** | Mobile layout **A** (dual pads) for landscape tablet 2P | Both sides labeled P1/P2; no chrome blocking shots |
| **BH-2.3** | Desktop **local co-op**: P2 provisional keymap; simultaneous input via arcade-core | Both move+shoot without focus steal |
| **BH-2.4** | Local **deathmatch** mode (same rooms); scoring rule stub TBD | Both can damage each other; match ends without crash |
| **BH-2.5** | Rebind stub (at least load/save keymap JSON in localStorage) | Document defaults in README |
| **BH-2.6** | High score persist (localStorage) for solo | Survives refresh |

**Exit B-N2:** PROOF can run hooks 1–2, 7–8 from concept spec. Local 2P is required for desktop; mobile A best-effort if tablet available.

---

## Epic B-N3 — Specialist hooks + review

| ID | Ticket | Acceptance |
|----|--------|------------|
| **BH-3.1** | PIXEL drop zone: `apps/boxhead/assets/` + manifest listing concept art needs | PIXEL can replace placeholders without code thrash |
| **BH-3.2** | MAESTRO drop zone: SFX/music slots wired through arcade-core audio | Mute toggle in chrome |
| **BH-3.3** | PROOF checklist file from concept §Acceptance hooks (pass/fail template) | Empty template committed |
| **BH-3.4** | Ping ARCADE with build path + known TBD list (keymaps, tables, stage size) | ARCADE ack or dossier update |
| **BH-3.5** | FORGE review request via KIMIKO/RELAYER | **REVIEW PASS** or fix list |

**Exit B-N3:** Title ready for fidelity/acceptance iteration; next monorepo app = Impossible (priority 2).

---

## Out of scope (do not ticket)

- Networked LAN / online
- Ruffle/SWF embed as product
- Inventing ARCADE combat tables as “final”
- Phaser / Unity / Godot
- Zombie Wars turrets / full room roster / HD remaster
- Public deploy

---

## Suggested first PR sequence for KIMI

1. BH-0.1 → 0.5 (one PR: monorepo + shell)  
2. BH-1.1 → 1.7 (vertical slice)  
3. BH-1.8 → 1.9 (placeholders)  
4. BH-2.3 (+ 2.1 if time)  
5. BH-3.x + review ask  

---

## Report back format

When asking FORGE review, send:
- Commit SHA(s) + how to run  
- Which ticket IDs done  
- Known TBD / waivers  
- Desktop smoke: wave 3 Y/N; 2P Y/N  
- Mobile smoke: Y/N / not tested  

---

## Pointers

- Tickets: `/workspace/armor-games-research/specs/001-boxhead-native-tickets.md`
- Concept: `/workspace/armor-games-research/concept-specs/01-boxhead.md`
- Stack: `/workspace/armor-games-research/specs/001-native-stack-and-plan.md`

---

## Scaffold review (FORGE) — 2026-09-22 14:42 America/Sao_Paulo

**Verdict: REVIEW PASS** (M-scaffold / BH-0 core). Commits `f416bb5` + `8eb7754`.

| Ticket | Result |
|--------|--------|
| BH-0.1 workspaces | PASS — root `armor-games` npm workspaces (`apps/*`, `packages/*`) |
| BH-0.2 arcade-core | PASS — input / scale / storage / sfx |
| BH-0.3 boxhead Vite+Pixi8 | PASS — `@maga/boxhead`, `npm run dev:boxhead` |
| BH-0.4 mode stubs | **SOFT** — no Solo/Co-op/Deathmatch menu yet; add at start of BH-1 |
| BH-0.5 letterbox | PASS — integer fit; stage **640×400** provisional (UNVERIFIED) |
| Spike isolation | PASS — `boxhead-2play-spike/` gitignored |

**Non-blocking follow-ups (do not reopen scaffold):**
1. Add mode-select stubs (Solo / Local Co-op / Local Deathmatch) early in BH-1.
2. Code comment: stage size = **UNVERIFIED** until ARCADE measures (avoid “dossier confirmed”).
3. Proceed to **BH-1.x** per this ticket file (solo wave 3).


================================================================================
# FILE 2/3 — concept-specs/01-boxhead.md
================================================================================
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

================================================================================
# FILE 3/3 — armor-games-dossiers/boxhead.md
================================================================================
# Fidelity dossier — Boxhead

| Field | Value |
|-------|-------|
| **Slug** | `boxhead` |
| **Idea** | 001 — Make Armor Games Great Again |
| **Status** | draft — §3 + RELAYER M2 gate; captures blocked on SWF |
| **M2 gate** | Fidelity QA **≥90%** pass on checklist below |
| **M1 spike** | `/workspace/armor-games-research/specs/001-boxhead-2play-M1-ruffle-spike.md` (menu + solo wave 3) |
| **Last update** | 2026-09-22 (stage size marked UNVERIFIED; English-only rule) |
| **Build brief** | `/workspace/armor-games-research/briefs/001-boxhead-2play-build-brief.md` |
| **Approach** | EMULATE via Ruffle (no Flash plugin) |

## Target version(s)

| Order | Title | Approx. date | Notes |
|------|-------|--------------|-------|
| 1 | Boxhead: A Halloween Special | 2006-10 | Origin |
| 2 | Boxhead: The Rooms | 2006-12 | Solo arenas |
| 3 | Boxhead: More Rooms | 2007-02 | More arenas |
| 4 | **Boxhead: 2Play Rooms (PRIMARY)** | **2007-05** | Local 2P co-op + deathmatch; AG Ruffle-listed |
| 5 | Boxhead: The Zombie Wars | 2008-03 | Base build + turrets; also AG Ruffle-listed |

**Multiplayer clarification:** 2Play / Zombie Wars co-op is **local shared-screen / shared-keyboard**, **not networked LAN**. Steam *BOXHEAD: Immortal* P2P LAN is a later product generation — not this dossier's “exact original.”

**Evidence:** IDEATOR research pack `/workspace/armor-games-research/deep-dive.md` + `summary.json` (2026-09-22). Secondary web sources cited there — not primary playthroughs.

## Original mechanics (2Play / Rooms family)

1. Pick room/arena + mode (solo / co-op / deathmatch on 2Play).
2. Survive zombie waves (+ specials); ammo crates; explosive barrels.
3. Kill-streak score multipliers → unlock/upgrade weapons (pistol → shotgun → uzi → grenades, etc.).
4. Die → end run; chase wave count / high score.
5. Zombie Wars adds turrets/barricades / keep base online.

### Evidence gaps
- Exact weapon unlock score thresholds and damage values — **gap**.
- Enemy spawn tables / wave composition — **gap**.
- Barrel explosion rules, friendly fire — **gap**.
- Deathmatch scoring — **gap**.

## Controls

- Keyboard WASD/arrows + shoot keys; **user-definable** on 2Play for both players (research claim).
- Session (reported): ~5–20 min per run.

### Evidence gaps
- Default P1/P2 keymaps — **must capture from SWF/manual**.
- Mouse usage (if any) — **gap**.
- Browser focus / simultaneous key conflict behavior under Ruffle — **gap** (known risk for local 2P).

## Feel / pacing

- Chunky low-fi squares; chaotic swarm density; arcade score chasing.
- Co-op on one keyboard = social chaos (nostalgia hook).
- Escalating wave pressure; “just one more wave” loops.

### Evidence gaps
- Screen shake, hit flash, SFX timing — **needs recording**.
- Camera follow rules in 2P — **gap**.

## Asset / audio situation

- Mid-2000s Flash SWFs; likely AS2/AVM1.
- Art: bitmap/blocky sprites more than fancy vectors.
- Creator: Sean Cooper; historical Crazy Monkey sponsorship; AG host.
- Modern commercial interest: *BOXHEAD: Immortal* (Fire Source + Cooper credits) — ownership split **uncertain**.

### Evidence gaps
- Trusted 2Play Rooms SWF hash / AG listing pin — **gap**.
- Full SFX/music inventory — **gap**.
- Rights clarification Cooper / Crazy Monkey / Fire Source — **before monetize**.

## “Played exactly as original” requirements (no Flash plugin)

**Source of checklist:** IDEATOR build brief §3 (2026-09-22). Pass/fail against 2007 2Play Rooms. Modern convenience only in wrapper chrome; must not change frame timing, hit detection, spawn rates, or weapon curves.

### Core loop
- [ ] Room/arena select works as original
- [ ] Modes: solo / co-op / deathmatch all reachable
- [ ] Wave escalation feel matches reference (density, spawn cadence)
- [ ] Ammo crates drop/pickup behave as original
- [ ] Explosive barrels detonate with original radius/damage feel
- [ ] Score + kill-streak multiplier → weapon unlock/upgrade curve matches reference
- [ ] Death → run end; high-score presentation matches
- [ ] Special enemies (“devils” / equivalents) present if in target SWF

### Feel & pacing
- [ ] Chunky boxy characters / low-fi art not replaced or upscaled in-engine
- [ ] Audio (SFX/music) present at original mix; no forced mute without user action
- [ ] Session rhythm: short arcade runs (target feel ~5–20 min)

### Controls (critical for 2P)
- [ ] Player 1 and Player 2 keyboard maps work simultaneously
- [ ] Original key defaults honored; user-definable rebinds work if present in SWF
- [ ] No single-focus steal that breaks P2 input in browser
- [ ] Mouse not required for core combat (keyboard authentic)

### Display
- [ ] Native stage size preserved (letterbox/pillarbox OK; no stretch that warps hitboxes)
  - *Measured size: **unknown**. FORGE shell provisional **640×480** until SWF/hash reference exists.*
- [ ] Integer scale preferred (1x/2x/3x) over blurry CSS stretch
- [ ] Fullscreen optional via wrapper; game stage rules unchanged

### Persistence
- [ ] High scores / unlocks persist equivalently (Ruffle SharedObject or documented stub)
- [ ] No cloud account forced for MVP

### Non-goals for MVP (not fidelity failures)
- Networked LAN / online multiplayer
- Remastered HD art inside the SWF
- New weapons/maps
- Mobile touch controls (optional stretch; must not break desktop fidelity)

### RELAYER M2 fidelity gate (≥90%)
Explicit pass items for M2 QA (maps onto §3; LAN out of MVP):
- [ ] Room select
- [ ] Solo / co-op / deathmatch reachable
- [ ] Waves escalate as original
- [ ] Ammo crates + explosive barrels behave as original
- [ ] Score / streak → weapon unlocks match reference
- [ ] Original audio + art (no in-SWF remaster)
- [ ] Dual keyboard simultaneous (local 2P)
- [ ] Letterbox + **integer** scale (1x/2x/3x)
- [ ] No hitbox stretch (no non-uniform stage warp)
- [ ] Networked LAN **out of MVP** (not a fail if absent)

**M2 exit:** ≥90% of checklist items pass (or signed waivers). Owner: ARCADE.

### Capture plan (phased with M1)
| Phase | Clip | Needed for |
|-------|------|------------|
| M1 align | (a) solo waves 1–3 | M1 exit + early parity |
| M2/M3 | (b) co-op mid-run | dual-keyboard fidelity |
| M2/M3 | (c) deathmatch | mode coverage |

### Reference captures (ARCADE TODO)
Record 3 clips from AG Ruffle listing or cleared SWF for side-by-side QA:
- (a) wave 1–3 solo
- (b) co-op mid-run
- (c) deathmatch

**Blocked until:** hash-pinned cleared SWF (FORGE M1.6) or permitted AG Ruffle session for reference-only capture.

**M1 note (RELAYER/FORGE):** local 2P not required to exit M1 — prioritize clip (a) once binary boots; (b)(c) track with M3 dual-keyboard harden.

### Evidence gaps still open
- Native Flash stage dimensions (**UNVERIFIED** — shell uses provisional **640×480**; lock from SWF `stage.stageWidth/Height` or AG capture metadata)
- Default P1/P2 keymaps from the actual SWF
- Exact weapon unlock thresholds / damage tables
- Enemy spawn tables / wave composition
- Trusted SWF hash
- Ruffle pin verified against this binary
- Rights clearance (Cooper / Crazy Monkey / Fire Source)

## Sources / provenance

- Seeded from: IDEATOR research pack `/workspace/armor-games-research/deep-dive.md` + `summary.json` (2026-09-22). Secondary web sources cited there — not primary playthroughs.
- IDEATOR first-ship recommendation: `boxhead-2play` (see summary.json)
- ARCADE playthrough: **none yet**
- Primary SWF in hand: **no**
