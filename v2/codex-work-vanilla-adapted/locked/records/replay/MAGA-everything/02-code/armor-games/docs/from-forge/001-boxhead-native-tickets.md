# IMPLEMENTATION TICKETS — Boxhead native (PixiJS 8)
## Idea 001 · Priority 1 · FORGE · 2026-09-22 14:36 America/Sao_Paulo

| Meta | Value |
|------|-------|
| **Status** | BH-0 **PASS** · BH-1 **PASS** · BH-2 next |
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

---

## BH-1 review (FORGE) — 2026-09-22 15:20 America/Sao_Paulo

**Verdict: REVIEW PASS** — proceed to BH-2. Commit dfbfb71.

BH-0.4 mode stubs PASS. BH-1.1–1.9 PASS (placeholder combat TBD ARCADE). Pixi Vite hang fixed via external importmap (stack lock updated). Desktop wave-3 automation smoke PASS; full interactive + Firefox owed to PROOF. 2P/mobile deferred to BH-2.

Non-blocking: grenade stub; menu hit-zones with touch layout C; PROOF interactive clear; inherit Pixi external pattern in CI apps.
