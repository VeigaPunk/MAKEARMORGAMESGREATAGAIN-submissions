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
