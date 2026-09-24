import { Application, Assets, Container, Graphics, Sprite, Text, TilingSprite, type Texture } from 'pixi.js';
import { Input, Sfx, load, save } from '@maga/arcade-core';
import {
  AmmoCrate, Barrel, BlastRing, Player, Projectile, Zombie,
  clamp, dist, type Vec,
} from './entities';
import { ROOMS, waveFor, ScoreSystem, ammoPerShot, fireDelay, WEAPONS, type WeaponTier, type ArenaRoom } from './world';
import { TouchControls } from './touch';
import { loadBindings } from './settings';

/**
 * Deadlock Rooms: endless survival, local co-op/deathmatch and browser-hosted LAN.
 * Six original rooms and eight equipment families use the shipped tuning in world.ts.
 * Keyboard shots follow the facing direction; mouse aim is optional on desktop.
 * Original-content decisions and verification are recorded in ship-records/boxhead.md.
 */

const STAGE_W = 640;
const STAGE_H = 400; // Fixed 8:5 logical arena; the display preserves this aspect ratio.
const CRATE_AMMO = 16;
const BARREL_RADIUS = 55;
const BARREL_PLAYER_DAMAGE = 25;
const DM_TARGET_KILLS = 5; // A complete match ends as soon as either player reaches five kills.
const DM_RESPAWN = 1.4;

const P1_COLOR = 0xe8e8f0;
const P2_COLOR = 0x7ab8ff;

export type GameState = 'title' | 'mode' | 'room' | 'playing' | 'paused' | 'dead' | 'victory';
export type Mode = 'solo' | 'coop' | 'deathmatch';

/** per-player runtime state */
interface PlayerSlot {
  p: Player;
  cooldown: number;
  lastPointerAim: Vec | null;
  pointerAimAge: number;
  kills: number; // deathmatch scoring
  respawnTimer: number; // deathmatch
  alive: boolean;
  weapon: number;
}

export class Game {
  private world = new Container();
  private menu = new Container();
  private hud = new Container();

  private state: GameState = 'title';
  private mode: Mode = 'solo';
  private room: ArenaRoom = ROOMS[0];

  private slots: PlayerSlot[] = [];
  private zombies: Zombie[] = [];
  private bullets: Projectile[] = [];
  private crates: AmmoCrate[] = [];
  private barrels: Barrel[] = [];
  private blasts: BlastRing[] = [];

  public remote: { axis: Vec; aim: Vec | null; fire: boolean; weapon: number; at: number } | null = null;
  public networkRole: 'host' | 'guest' | null = null;
  public networkBlocked = false;
  public reducedMotion = false;
  private weaponPress = 0;
  private chosenRoom = 0;
  private toast = new Text({text:'',style:{fontFamily:'monospace',fontSize:12,fill:0xc4f04d,align:'center'}});
  private toastTimer = 0;
  private weaponHud = new Graphics();
  private waveLabel = new Text({text:'',style:{fontFamily:'monospace',fontSize:10,fill:0x94aaa7}});
  private spawnQueue = 0;
  private spawnTimer = 0;
  private wave = 0;
  private waveBreak = 0;
  private crateTimer = 8;
  /** Explicit ?stress fixture holds roughly 100 movers for performance probes.
   *  Normal survival caps simultaneous enemies at 60 and each wave at 100. */
  private stress = new URLSearchParams(location.search).has('stress');
  private high = 0;
  private scoreSys = new ScoreSystem();

  private hudText!: Text;
  private banner!: Text;
  private menuChip = new Container();
  private overlay = new Graphics();
  private hudPlate = new Graphics();
  /** direct-authored art (public/art/*.svg); menus/arena work without them,
   *  these decorate once the async load resolves. */
  private logoTex: Texture | null = null;
  private floorTex: Texture | null = null;

  constructor(
    private app: Application,
    private input: Input,
    private sfx: Sfx,
    private touch: TouchControls,
  ) {
    const savedHigh=load<unknown>('boxhead','highscore',0);
    this.high=typeof savedHigh==='number'&&Number.isFinite(savedHigh)?Math.max(0,Math.floor(savedHigh)):0;
    // Load validated additive key bindings from the settings UI over mode defaults.
    // We deliberately do NOT persist the resolved defaults — saving mode-mixed
    // maps would pollute the other mode on the next boot (solo keeps arrows on
    // P1, versus gives them to P2). Save only genuine user rebinds here.
    const savedKeys = loadBindings();
    if (savedKeys) input.setKeymaps(savedKeys);
    app.stage.addChild(this.world);
    app.stage.addChild(this.menu);
    app.stage.addChild(this.hud);
    app.stage.addChild(touch.view);

    this.hudText = new Text({ text: '', style: { fill: 0xf5c542, fontSize: 12, fontFamily: 'monospace', lineHeight: 16 } });
    this.hudText.x = 14;
    this.hudText.y = 10;
    this.hudPlate.rect(10, 10, 620, 44).fill({ color: 0x080e12, alpha: 0.86 }).stroke({color: 0x515947, width: 1});
    this.hudText.x = 18; this.hudText.y = 15;
    this.hud.addChild(this.hudPlate, this.hudText, this.overlay);

    this.banner = new Text({
      text: '',
      style: { fill: 0xffffff, fontSize: 17, fontFamily: 'monospace', align: 'center', lineHeight: 25 },
    });
    this.banner.anchor = 0.5;
    this.banner.x = STAGE_W / 2;
    this.banner.y = STAGE_H / 2 - 30;
    this.hud.addChild(this.banner);

    // touch MENU chip for end screens (D-14): phones have no M key.
    const chipBg = new Graphics()
      .roundRect(-64, -18, 128, 36, 6)
      .fill({ color: 0x1a1a24, alpha: 0.92 })
      .stroke({ width: 1, color: 0xf5c542 });
    const chipText = new Text({ text: 'MENU', style: { fill: 0xf5c542, fontSize: 14, fontFamily: 'monospace' } });
    chipText.anchor = 0.5;
    this.menuChip.addChild(chipBg, chipText);
    this.menuChip.x = STAGE_W / 2;
    this.menuChip.y = STAGE_H - 44;
    this.menuChip.visible = false;
    this.hud.addChild(this.menuChip);
    // authored art preload — decorative only; failures leave procedural look.
    Assets.load<Texture>('./art/boxhead-logo.svg')
      .then((t) => { this.logoTex = t; if (this.state === 'title') this.showTitle(); })
      .catch(() => { /* keep text-only title */ });
    Assets.load<Texture>('./art/floor-tile.svg')
      .then((t) => { this.floorTex = t; })
      .catch(() => { /* keep flat arena fill */ });
    this.toast.anchor.set(.5); this.toast.x=320; this.toast.y=80;
    this.waveLabel.x=18; this.waveLabel.y=380;
    this.hud.addChild(this.weaponHud, this.waveLabel, this.toast);
    for(let i=0;i<8;i++){const label=new Text({text:String(i+1),style:{fontFamily:'monospace',fontSize:9,fill:0x101918}});label.position.set(420+i*26,37);this.hud.addChild(label);}
    window.addEventListener('keydown',e=>{
      if(e.repeat || (e.target instanceof HTMLElement && /^(INPUT|SELECT|BUTTON)$/.test(e.target.tagName)))return;
      if(this.state==='room' && /^Digit[1-6]$/.test(e.code)){this.chosenRoom=Number(e.code.slice(5))-1;this.startRun(this.chosenRoom);return;}
      if(this.state!=='playing')return;
      const number=/^Digit[1-8]$/.test(e.code)?Number(e.code.slice(5))-1:-1;
      const player=this.networkRole==='guest'?1:0;
      if(number>=0){this.weaponPress=number+1;this.selectWeapon(player,number);}
      if(e.code==='KeyQ'||e.code==='KeyE'){const next=(this.slots[player].weapon+(e.code==='KeyQ'?-1:1)+this.unlockedCount())%this.unlockedCount();this.selectWeapon(player,next);this.weaponPress=next+1;}
      if(this.slots[1]&&(e.code==='BracketLeft'||e.code==='BracketRight'))this.selectWeapon(1,(this.slots[1].weapon+(e.code==='BracketLeft'?-1:1)+this.unlockedCount())%this.unlockedCount());
    });
    this.showTitle();
  }

  get player(): Player { return this.slots[0].p; }

  togglePause(): void {
    if (this.state === 'paused') {
      this.state = 'playing'; this.banner.text = '';
      this.sfx.startMusic([110,0,110,0,131,0,98,0],160);
    } else this.pauseForFocus();
  }

  pauseForFocus(): void {
    if (this.state !== 'playing') return;
    this.state = 'paused'; this.sfx.stopMusic();
    this.banner.text = 'PAUSED\nESC / P / SPACE / tap — resume\nM — menu';
  }

  // --- menus -----------------------------------------------------------------
  private clearMenu(): void {
    this.menu.removeChildren().forEach((c) => c.destroy());
  }

  private menuText(lines: string[], yStart = 120): void {
    lines.forEach((line, i) => {
      const t = new Text({
        text: line,
        style: {
          fill: i === 0 ? 0xf5c542 : 0xe8e8f0,
          fontSize: i === 0 ? 26 : 15,
          fontFamily: 'monospace',
          align: 'center',
        },
      });
      t.anchor = 0.5;
      t.x = STAGE_W / 2;
      t.y = yStart + i * 30;
      this.menu.addChild(t);
    });
  }

  private showTitle(): void {
    this.state = 'title';
    this.sfx.stopMusic();
    this.clearMenu();
    this.world.visible = false;
    this.hud.visible = false;
    this.banner.text = '';
    if (this.logoTex) {
      const logo = new Sprite(this.logoTex);
      logo.anchor.set(0.5);
      logo.x = STAGE_W / 2;
      logo.y = 72;
      logo.scale.set(0.72);
      this.menu.addChild(logo);
    }
    this.menuText([
      'DEADLOCK ROOMS',
      'THE DOORS ARE SEALED. HOLD YOUR GROUND.',
    ], 170);
    this.menuButton('ENTER THE ARENA', 'SPACE / ENTER / TAP', 255);
    const best=new Text({text:`PERSONAL BEST ${this.high.toString().padStart(7,'0')}   •   6 ROOMS / 8 WEAPONS`,style:{fill:0x809994,fontSize:11,fontFamily:'monospace'}});best.anchor.set(.5);best.position.set(320,352);this.menu.addChild(best);
  }

  private menuButton(label: string, detail: string, y: number): void {
    const bg = new Graphics().rect(58,y-22,524,46).fill(0x1a2225).stroke({color:0x657055,width:1});
    bg.rect(58,y-22,5,46).fill(0xc4f04d);
    const a = new Text({text:label,style:{fontFamily:'monospace',fontSize:17,fontWeight:'bold',fill:0xecf1e0}});
    a.x=76; a.y=y-15;
    const b = new Text({text:detail,style:{fontFamily:'monospace',fontSize:10,fill:0xa3b0ab}});
    b.x=76; b.y=y+6;
    this.menu.addChild(bg,a,b);
  }

  private showModeSelect(): void {
    this.state = 'mode'; this.sfx.stopMusic(); this.world.visible = false;
    this.banner.text = ''; this.hud.visible = false;
    this.clearMenu();
    this.menuText(['SELECT MODE'], 90);
    this.menuButton('1  SOLO SURVIVAL', 'WASD / ARROWS MOVE · SPACE FIRE · MOUSE AIM · Q/E WEAPON', 160);
    this.menuButton('2  LOCAL CO-OP', 'ENDLESS · P1 WASD + SPACE · P2 ARROWS + IJKL / NUMPAD', 220);
    this.menuButton('3  LOCAL DEATHMATCH', 'FIRST TO 5 · EIGHT WEAPONS · TWO PLAYERS, ONE KEYBOARD', 280);
    const tip=new Text({text:'TWO DEVICES? USE LAN IN THE TOOLBAR',style:{fill:0x86b8ba,fontSize:11,fontFamily:'monospace'}});tip.anchor.set(.5);tip.position.set(320,345);this.menu.addChild(tip);
  }

  private showRoomSelect(): void {
    this.state = 'room'; this.world.visible = false; this.hud.visible = false;
    this.clearMenu();
    this.menuText(['SELECT A SEALED ROOM'], 48);
    ROOMS.forEach((room,i)=>{
      const x=38+(i%2)*288,y=96+Math.floor(i/2)*91;
      const bg=new Graphics().rect(x,y,276,78).fill(0x152228).stroke({color:room.accent,width:1});
      const title=new Text({text:room.name,style:{fill:room.accent,fontSize:13,fontFamily:'monospace',fontWeight:'bold'}});title.position.set(x+13,y+12);
      const desc=new Text({text:room.detail,style:{fill:0x9db1ad,fontSize:10,fontFamily:'monospace'}});desc.position.set(x+13,y+34);
      const mini=new Graphics();for(const o of room.obstacles)mini.rect(x+13+o.x*.16,y+45+o.y*.052,o.w*.16,Math.max(2,o.h*.052)).fill(room.accent);
      this.menu.addChild(bg,title,desc,mini);
    });
    const tip=new Text({text:'1–6 SELECT  /  TAP A ROOM  /  M MODE SELECT',style:{fill:0x77928e,fontSize:10,fontFamily:'monospace'}});tip.anchor.set(.5);tip.position.set(320,378);this.menu.addChild(tip);
  }

  // --- run lifecycle ------------------------------------------------------------
  private startRun(roomIdx: number): void {
    this.room = ROOMS[clamp(roomIdx, 0, ROOMS.length - 1)];
    this.chosenRoom = roomIdx;
    this.clearMenu();
    this.clearField();
    this.world.visible = true;
    this.hud.visible = true;

    // room geometry
    this.world.removeChildren().forEach((c) => c.destroy());
    const arena = new Graphics();
    arena.rect(10,10,620,380).fill(0x1b2325).stroke({width:3,color:0x586454});
    this.world.addChild(arena);
    if (this.floorTex) {
      const floor = new TilingSprite({texture:this.floorTex,width:616,height:376});
      floor.x=12; floor.y=12; floor.alpha=0.5; this.world.addChild(floor);
    }
    const detail = new Graphics();
    for(let x=18;x<625;x+=32) detail.moveTo(x,12).lineTo(x,388).stroke({color:0x657365,alpha:0.12,width:1});
    for(let y=18;y<388;y+=32) detail.moveTo(12,y).lineTo(628,y).stroke({color:0x657365,alpha:0.12,width:1});
    for(let i=0;i<26;i++) {
      const x=28+(i*173)%570,y=65+(i*97)%298;
      detail.rect(x,y,3+i%7,1).fill({color:0xa3ac90,alpha:0.15});
    }
    for (const x of [14,610]) for(let y=70;y<370;y+=22) detail.poly([x,y,x+14,y+9,x+14,y+17,x,y+8]).fill({color:0xd1af42,alpha:0.25});
    for (const o of this.room.obstacles) {
      detail.rect(o.x+5,o.y+6,o.w,o.h).fill({color:0x000000,alpha:0.45});
      detail.rect(o.x,o.y,o.w,o.h).fill(0x495456).stroke({width:2,color:0x141d20});
      detail.rect(o.x+2,o.y+2,o.w-4,5).fill(0x738077);
      detail.rect(o.x+2,o.y+o.h-6,o.w-4,4).fill(0x2e383c);
      for(const dx of [5,o.w-7]) for(const dy of [9,o.h-10]) detail.rect(o.x+dx,o.y+dy,2,2).fill(0xadb99d);
    }
    this.world.addChild(detail);

    const twoPlayer = this.mode !== 'solo';
    this.input.setMode(twoPlayer && !this.networkRole ? 'versus' : 'solo');

    this.slots = [{
      p: new Player(this.room.spawn.x, this.room.spawn.y, P1_COLOR),
      cooldown: 0, lastPointerAim: null, pointerAimAge: 99, kills: 0, respawnTimer: 0, alive: true, weapon: 0,
    }];
    this.world.addChild(this.slots[0].p.g);
    if (twoPlayer) {
      this.slots.push({
        p: new Player(this.room.spawn2.x, this.room.spawn2.y, P2_COLOR),
        cooldown: 0, lastPointerAim: null, pointerAimAge: 99, kills: 0, respawnTimer: 0, alive: true, weapon: 0,
      });
      this.world.addChild(this.slots[1].p.g);
    }

    for (const b of this.room.barrels) {
      const barrel = new Barrel({ ...b });
      this.barrels.push(barrel);
      this.world.addChild(barrel.g);
    }

    this.scoreSys = new ScoreSystem();
    this.toastTimer = 3; this.toast.text = this.mode==='deathmatch' ? 'FIRST TO FIVE · 1–8 WEAPONS' : 'HOLD THE ROOM · KEEP THE STREAK';
    this.waveBreak = 0;
    this.wave = 0;
    this.crateTimer = 8; // D-10: stale timer carried an instant crate into retries
    this.state = 'playing';
    this.banner.text = '';
    // Shipped sparse combat pulse: A2 / A2 / C3 / G2, alternating rests, 160 ms steps.
    // The short triangle-wave pattern sits beneath combat cues and stops on pause/end.
    this.sfx.startMusic([110, 0, 110, 0, 131, 0, 98, 0], 160);
    if (this.mode === 'deathmatch') {
      this.spawnQueue = 0;
    } else {
      this.nextWave();
    }
    this.updateHud();
  }

  private nextWave(): void {
    if (this.wave > 0) {
      // A short resupply window keeps the next wave viable while preserving attrition.
      for (const slot of this.slots) if (slot.alive) {
        slot.p.ammo += 28;
        slot.p.hp = Math.min(100, slot.p.hp + 10);
      }
      if(this.mode==='coop')for(let i=0;i<this.slots.length;i++)if(!this.slots[i].alive)this.respawn(i);
      this.persistHigh();
      this.sfx.preset('pickup');
    }
    this.wave += 1;
    this.toast.text=`WAVE ${this.wave}${this.wave%5===0?' / WARDEN INBOUND':''}`;this.toastTimer=2.5;
    const def = waveFor(this.wave);
    this.spawnQueue = def.count;
    this.spawnTimer = 0.5;
    this.waveBreak = 0;
    this.sfx.preset('ui');
  }

  private gameOver(): void {
    this.state = 'dead';
    this.persistHigh();
    this.sfx.stopMusic();
    this.sfx.preset('death');
    this.banner.text =
      `OVERRUN ON WAVE ${this.wave} (${this.room.name})\n` +
      `SCORE ${this.scoreSys.score} · BEST ${this.high}\n` +
      `SPACE / tap — retry · M — menu`;
  }

  private dmEnd(winner: number): void {
    this.state = 'victory';
    this.sfx.stopMusic();
    this.banner.text =
      `P${winner + 1} WINS THE DEATHMATCH ${this.slots[winner].kills}–${this.slots[1 - winner].kills}\n` +
      `FIRST TO ${DM_TARGET_KILLS} · ${this.room.name}\n` +
      `SPACE / tap — rematch · M — menu`;
  }

  private persistHigh(): void {
    if (this.scoreSys.score > this.high) {
      this.high = this.scoreSys.score;
      save('boxhead', 'highscore', this.high);
    }
  }

  private clearField(): void {
    for (const z of this.zombies) z.destroy();
    for (const b of this.bullets) b.destroy();
    for (const c of this.crates) c.g.destroy();
    for (const bl of this.blasts) bl.destroy();
    for (const s of this.slots) s.p.g.destroy();
    this.zombies = [];
    this.bullets = [];
    this.crates = [];
    this.barrels = [];
    this.blasts = [];
    this.slots = [];
    this.spawnQueue = 0;
  }

  // --- main tick -----------------------------------------------------------------
  tick(dt: number): void {
    if(this.networkRole==='guest'){this.touch.setActive(this.state==='playing');this.touch.tick();return;}
    if(this.networkBlocked){this.input.endFrame();return;}
    // touch zones exist only during gameplay — menus/end screens get raw taps
    this.touch.setActive(this.state === 'playing');
    this.overlay.clear();
    if (this.state === 'paused' || this.state === 'dead' || this.state === 'victory') {
      this.overlay.rect(0,0,STAGE_W,STAGE_H).fill({color:0x06090b,alpha:0.76});
      this.overlay.rect(36,105,568,146).fill(0x172024).stroke({color:0xc4f04d,width:1});
    }
    this.menuChip.visible = this.state === 'dead' || this.state === 'victory';
    if (this.state === 'playing' && this.input.wasPressed('pause')) {
      this.state = 'paused';
      this.banner.text = 'PAUSED\nESC / P / SPACE / tap — resume\nM — menu';
      this.sfx.stopMusic();
    } else if (this.state === 'paused') {
      if (this.input.wasPressed('pause') || this.input.wasPressed('fire') || this.input.pointer.tapped) {
        this.state = 'playing';
        this.sfx.startMusic([110, 0, 110, 0, 131, 0, 98, 0], 160);
        this.banner.text = '';
      } else if (this.input.wasPressed('action')) {
        // Pause remains keyboard- and touch-accessible; tapping the banner quits.
        this.showModeSelect();
      }
    } else switch (this.state) {
      case 'title':
        if (this.input.wasPressed('fire') || this.input.wasPressed('action') || this.input.pointer.tapped) this.showModeSelect();
        break;
      case 'mode': {
        const tap = this.input.pointer.tapped;
        const y = this.input.pointer.y;
        const selection = this.input.wasPressed('slot3') || (tap && y >= 250) ? 2
          : this.input.wasPressed('slot2') || (tap && y >= 190) ? 1
          : this.input.wasPressed('slot1') || this.input.wasPressed('fire') || tap ? 0 : -1;
        if (selection >= 0) { this.mode = (['solo','coop','deathmatch'] as Mode[])[selection]; this.showRoomSelect(); }
        break;
      }
      case 'room': {
        if(this.input.wasPressed('action'))this.showModeSelect();
        else if(this.input.pointer.tapped){const p=this.input.pointer;const col=p.x<320?0:1,row=Math.floor((p.y-96)/91);if(row>=0&&row<3&&p.y<96+row*91+78)this.startRun(row*2+col);}
        else if(this.input.wasPressed('fire'))this.startRun(0);
        break;
      }
      case 'playing':
        this.tickPlaying(dt);
        break;
      case 'dead':
      case 'victory': {
        // D-14: touch has no keys — tap retries, MENU chip tap exits
        const p = this.input.pointer;
        const chipTap = p.tapped && Math.abs(p.x - STAGE_W / 2) < 64 && Math.abs(p.y - (STAGE_H - 44)) < 20;
        if (this.input.wasPressed('action') || chipTap) this.showModeSelect();
        else if (this.input.wasPressed('fire') || p.tapped) this.startRun(ROOMS.indexOf(this.room));
        break;
      }
    }
    this.touch.tick();
    this.input.endFrame();
  }

  private tickPlaying(dt: number): void {
    // Cap motion catch-up; Player independently guards damage with a monotonic clock.
    const gameplayDt = Math.min(dt, 0.05);
    dt = gameplayDt;
    this.toastTimer=Math.max(0,this.toastTimer-dt);this.toast.visible=this.toastTimer>0;
    const oldUnlocked=this.unlockedCount();
    this.updatePlayers(dt);
    if (this.mode !== 'deathmatch') {
      this.updateSpawning(dt);
      this.updateZombies(dt);
    }
    this.updateBullets(dt);
    if (this.state !== 'playing') { this.updateHud(); return; }
    this.updateProps(dt);
    this.scoreSys.tick(dt);
    if(this.unlockedCount()>oldUnlocked){this.toast.text=`UNLOCKED / ${WEAPONS[this.unlockedCount()-1].name}`;this.toastTimer=3;this.sfx.preset('pickup');for(const s of this.slots)s.weapon=this.unlockedCount()-1;}
    this.updateHud();

    if (this.mode === 'deathmatch') {
      // handled in bullet/player collisions (dmEnd)
    } else if (this.slots.every((s) => !s.alive)) {
      this.gameOver();
    }
  }


  // --- players -------------------------------------------------------------------
  private updatePlayers(dt: number): void {
    this.slots.forEach((slot, idx) => {
      if (!slot.alive) {
        if (this.mode === 'deathmatch') {
          slot.respawnTimer -= dt;
          if (slot.respawnTimer <= 0) this.respawn(idx);
        }
        return;
      }
      slot.p.tickFlash(dt);

      const coarse = matchMedia('(pointer: coarse)').matches;
      let axis: Vec;
      if (idx === 0) {
        // keyboard or virtual stick; on touch the stick owns movement — field
        // taps must not drag the player (D-15)
        axis = this.touch.stick ?? this.input.moveAxis(slot.p.pos.x, slot.p.pos.y, 30, false);
      } else {
        axis = this.networkRole==='host' ? (this.remote&&performance.now()-this.remote.at<500?this.remote.axis:{x:0,y:0}) : this.input.moveAxis2();
      }
      slot.p.move(axis, dt, { w: STAGE_W, h: STAGE_H }, this.room.obstacles);

      slot.cooldown -= dt;

      if (idx === 0) {
        // optional mouse aim on desktop (last pointer position wins for 2s)
        const p = this.input.pointer;
        slot.pointerAimAge += dt;
        if (!coarse && p.seen && (p.active || dist(p, slot.p.pos) > 24)) {
          slot.lastPointerAim = { x: p.x, y: p.y };
          slot.pointerAimAge = 0;
        }
        // D-15: on touch only the FIRE button shoots — any-canvas-touch firing
        // made the movement stick drain ammo
        const wantsFire = this.input.isDown('fire') || this.touch.fire;
        if (wantsFire && slot.cooldown <= 0) this.tryFire(slot, idx);
      } else {
        const remote=this.networkRole==='host'?this.remote:null;
        if(remote){slot.lastPointerAim=remote.aim;slot.pointerAimAge=0;if(remote.weapon>=0)this.selectWeapon(1,remote.weapon);}
        const fa = this.networkRole==='host' ? (remote?.fire&&performance.now()-remote.at<500 ? slot.p.facing : null) : this.input.fireAxis2();
        if (fa) slot.p.facing = fa; // P2 aims with the shoot cluster itself
        if (fa && slot.cooldown <= 0) this.tryFire(slot, idx);
      }
    });
  }

  private respawn(idx: number): void {
    const slot = this.slots[idx];
    const s = idx === 0 ? this.room.spawn : this.room.spawn2;
    slot.p.pos = { ...s };
    slot.p.hp = 100;
    slot.p.invuln = 2;
    slot.p.ammo = 70;
    slot.alive = true;
    slot.p.g.visible = true;
    slot.p.g.x = s.x;
    slot.p.g.y = s.y;
  }

  private aimDir(slot: PlayerSlot): Vec {
    const coarse = matchMedia('(pointer: coarse)').matches;
    if (coarse) {
      // auto-aim nearest zombie; in deathmatch aim at the opponent
      const target = this.mode === 'deathmatch'
        ? (this.slots.find((s) => s !== slot && s.alive)?.p.pos ?? null)
        : this.nearestZombie(slot.p.pos)?.pos ?? null;
      if (target) {
        const d = dist(target, slot.p.pos) || 1;
        return { x: (target.x - slot.p.pos.x) / d, y: (target.y - slot.p.pos.y) / d };
      }
    }
    if (slot.lastPointerAim && slot.pointerAimAge < 2 && !coarse) {
      const d = dist(slot.lastPointerAim, slot.p.pos);
      if (d > 4) {
        return { x: (slot.lastPointerAim.x - slot.p.pos.x) / d, y: (slot.lastPointerAim.y - slot.p.pos.y) / d };
      }
    }
    return slot.p.facing;
  }

  private tryFire(slot: PlayerSlot, owner: number): void {
    let weapon = WEAPONS[slot.weapon]?.id ?? 'pistol';
    if(slot.p.ammo<ammoPerShot(weapon)){slot.weapon=0;weapon='pistol';}
    const cost = ammoPerShot(weapon);
    if (slot.p.ammo < cost) {
      slot.cooldown = 0.25;
      this.sfx.blip({ wave: 'square', freq: 140, freqEnd: 90, duration: 0.05, volume: 0.5 }); // dry click
      return;
    }
    slot.p.ammo -= cost;
    slot.cooldown = fireDelay(weapon);

    const dir = this.aimDir(slot);
    const from = { x: slot.p.pos.x + dir.x * 14, y: slot.p.pos.y + dir.y * 14 };
    const speed = 340;
    const shoot = (d: Vec, kind: 'bullet' | 'grenade' = 'bullet') => {
      const b = new Projectile({ ...from }, { x: d.x * speed, y: d.y * speed }, kind);
      b.owner = owner;
      if(weapon==='rail'){b.damage=4;b.pierce=4;b.g.tint=0x78dcec;}
      if(weapon==='flame'){b.life=.32;b.g.tint=0xff7632;b.g.scale.set(2);}
      if(weapon==='rockets'){b.blastRadius=88;b.g.tint=0xf6ae53;b.g.scale.set(1.5);}
      if(weapon==='mines'){b.mine=true;b.grenade=true;b.life=24;b.vel={x:0,y:0};b.pos={...slot.p.pos};b.g.tint=0x79d8ce;}
      if (kind === 'grenade') (b as Projectile & { grenade?: boolean }).grenade = true;
      this.bullets.push(b);
      this.world.addChild(b.g);
    };
    if (weapon === 'grenades' || weapon === 'rockets' || weapon==='mines') {
      // Impact ordnance detonates on contact or expiry; mines wait until armed.
      shoot(dir, 'grenade');
    } else {
      shoot(dir);
      if (weapon === 'shotgun') {
        const a = Math.atan2(dir.y, dir.x);
        for (const off of [-0.3,-0.15,0.15,0.3]) {
          shoot({ x: Math.cos(a + off), y: Math.sin(a + off) });
        }
      }
    }
    const flash = new BlastRing(from, 7, 0xfff0ac);
    this.blasts.push(flash); this.world.addChild(flash.g);
    if(weapon==='uzi'||weapon==='flame')this.sfx.blip({wave:'sawtooth',freq:weapon==='flame'?120:440,freqEnd:60,duration:.035,volume:.18});
    else if(weapon==='shotgun'||weapon==='rockets')this.sfx.blip({wave:'sawtooth',freq:130,freqEnd:35,duration:.15,volume:.35});
    else this.sfx.preset('shoot');
  }

  // --- zombies -------------------------------------------------------------------
  private updateSpawning(dt: number): void {
    if (this.spawnQueue > 0 && this.zombies.length < 60) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        const def = waveFor(this.wave);
        const runner = def.runners > 0 && this.spawnQueue <= def.runners;
        this.spawnZombie(runner, def.speed);
        this.spawnQueue -= 1;
        this.spawnTimer = def.spawnEvery;
      }
    } else if (this.spawnQueue === 0 && this.zombies.length === 0) {
      this.waveBreak += dt;
      if (this.waveBreak > 2.5) this.nextWave();
    }
    // D-08: ?stress keeps ~100 movers on the field, including runner variants.
    if (this.stress && this.zombies.length < 100) this.spawnZombie(Math.random() < 0.35, 60 + Math.random() * 40);
  }

  private spawnZombie(runner: boolean, speed: number): void {
    const edge = Math.floor(Math.random() * 4);
    const pos: Vec =
      edge === 0 ? { x: 22, y: 75 + Math.random() * (STAGE_H - 105) } :
      edge === 1 ? { x: STAGE_W - 22, y: 75 + Math.random() * (STAGE_H - 105) } :
      edge === 2 ? { x: 22 + Math.random() * (STAGE_W - 44), y: 72 } :
                   { x: 22 + Math.random() * (STAGE_W - 44), y: STAGE_H - 30 };
    let kind:Zombie['kind']=runner?'runner':'walker';
    if(this.wave>=3&&this.spawnQueue%9===0)kind='brute';
    if(this.wave>=4&&this.spawnQueue%11===0)kind='volatile';
    if(this.wave>=5&&this.spawnQueue%13===0)kind='warden';
    const z = new Zombie(pos, speed, runner, kind);
    this.zombies.push(z);
    this.world.addChild(z.g);
  }

  private updateZombies(dt: number): void {
    for (const z of [...this.zombies]) {
      if(z.dead)continue;
      // chase the nearest living player
      let target: Player | null = null;
      let bd = Infinity;
      for (const s of this.slots) {
        if (!s.alive) continue;
        const d = dist(z.pos, s.p.pos);
        if (d < bd) { bd = d; target = s.p; }
      }
      if (!target) continue;
      if(z.kind==='warden'){
        z.cooldown-=dt;
        z.telegraph=z.cooldown<.5?1:0;z.g.tint=z.telegraph?0xffbca3:0xffffff;
        if(z.cooldown<=0){const d=dist(z.pos,target.pos)||1;const b=new Projectile({...z.pos},{x:(target.pos.x-z.pos.x)/d*140,y:(target.pos.y-z.pos.y)/d*140});b.enemy=true;b.owner=-1;b.life=3;b.g.tint=0xee65b5;b.g.scale.set(2);this.bullets.push(b);this.world.addChild(b.g);z.cooldown=2.8;this.sfx.blip({wave:'triangle',freq:600,freqEnd:160,duration:.15,volume:.15});}
      }
      if(z.kind!=='warden'||bd>140)z.chase(target.pos, dt, { w: STAGE_W, h: STAGE_H }, this.room.obstacles, this.zombies);
      if(z.kind==='volatile'&&bd<28){z.cooldown-=dt;z.g.tint=0xffe278;if(z.cooldown<1){z.hp=0;z.dead=true;this.detonate(z.pos,48);continue;}}

      for (const s of this.slots) {
        if (!s.alive || s.p.invuln > 0) continue;
        if (dist(z.pos, s.p.pos) < 14) {
          s.p.hp -= 10; // Contact hit: 10 HP, followed by 0.8 seconds of protection.
          s.p.invuln = 0.8;
          this.scoreSys.playerHit();
          this.sfx.preset('hit');
          if (s.p.hp <= 0) {
            s.alive = false;
            s.p.g.visible = false;
            this.sfx.preset('death');
          }
        }
      }
    }
  }

  // --- bullets -------------------------------------------------------------------
  private updateBullets(dt: number): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      const owner = (b as Projectile & { owner?: number }).owner ?? 0;
      const alive = b.tick(dt) && !b.hitSolid(this.room.obstacles, { w: STAGE_W, h: STAGE_H });
      let dead = !alive;
      if(b.mine&&b.age>.5&&this.zombies.some(z=>dist(z.pos,b.pos)<34))dead=true;
      if(b.mine&&b.age>.5&&this.mode==='deathmatch'&&this.slots.some((s,i)=>i!==owner&&s.alive&&dist(s.p.pos,b.pos)<34))dead=true;
      if(b.mine&&!dead)continue;
      if(b.enemy){
        for(const slot of this.slots)if(slot.alive&&slot.p.invuln<=0&&dist(slot.p.pos,b.pos)<12){slot.p.hp-=12;slot.p.invuln=.6;dead=true;this.scoreSys.playerHit();this.sfx.preset('hit');if(slot.p.hp<=0){slot.alive=false;slot.p.g.visible=false;}}
        if(dead){b.destroy();this.bullets.splice(i,1);}continue;
      }

      if (!dead) {
        for (const barrel of this.barrels) {
          if (!barrel.exploded && barrel.fuse < 0 && dist(barrel.pos, b.pos) < 10) {
            barrel.fuse = 0;
            dead = true;
            break;
          }
        }
      }

      if (!dead) {
        for (let j = this.zombies.length - 1; j >= 0; j--) {
          const z = this.zombies[j];
          if (!b.hits.has(z) && dist(z.pos, b.pos) < (z.kind==='brute'?16:11)) {
            b.hits.add(z);z.hp -= b.damage;
            const impact = new BlastRing(z.pos, z.hp <= 0 ? 17 : 8, z.runner ? 0xc76348 : 0x99bd5b);
            this.blasts.push(impact); this.world.addChild(impact.g);
            dead = b.pierce-- <= 0;
            if (z.hp <= 0) {
              this.scoreSys.kill();
              z.destroy();
              this.zombies.splice(j, 1);
            } else {
              z.hitFlash = 0.1;
            }
            break;
          }
        }
      }

      if (!dead) {
        // players hit by bullets only in deathmatch; a bullet never hits its
        // owner (it spawns 14px out, inside the 11px hitbox radius)
        if (this.mode === 'deathmatch') {
          for (let k = 0; k < this.slots.length; k++) {
            if (k === owner) continue;
            const slot = this.slots[k];
            if (!slot.alive || slot.p.invuln > 0) continue;
            if (dist(slot.p.pos, b.pos) < 11) {
              slot.p.hp -= b.damage*12;
              dead = true;
              if (slot.p.hp <= 0) {
                slot.alive = false;
                slot.p.g.visible = false;
                slot.respawnTimer = DM_RESPAWN;
                const killer = this.slots[1 - k];
                killer.kills += 1;
                this.sfx.preset('death');
                if (killer.kills >= DM_TARGET_KILLS) this.dmEnd(1 - k);
              } else {
                slot.p.invuln = 0.35;
                this.sfx.preset('hit');
              }
              break;
            }
          }
        }
      }

      if (dead) {
        // grenades detonate on ANY termination — hit, wall, or expiry (D-03)
        if ((b as Projectile & { grenade?: boolean }).grenade) this.detonate(b.pos, b.blastRadius, b.owner);
        b.destroy();
        this.bullets.splice(i, 1);
      }
    }
  }

  // --- props ---------------------------------------------------------------------
  private updateProps(dt: number): void {
    // All modes supply ammo; the deathmatch spec explicitly includes pickups.
      if (this.crates.length < 2) this.crateTimer = Math.max(0, this.crateTimer - dt);
      if (this.crateTimer <= 0 && this.crates.length < 2) {
        this.crateTimer = this.mode==='deathmatch'?6:8;
        const pos = this.freeSpot();
        if (pos) {
          const c = new AmmoCrate(pos);
          this.crates.push(c);
          this.world.addChild(c.g);
        }
      }
      for (let i = this.crates.length - 1; i >= 0; i--) {
        const c = this.crates[i];
        for (const s of this.slots) {
          if (!s.alive) continue;
          if (dist(c.pos, s.p.pos) < 15) {
            s.p.ammo = Math.min(240,s.p.ammo + CRATE_AMMO*2);
            if(this.mode!=='deathmatch')s.p.hp=Math.min(100,s.p.hp+8);
            this.sfx.preset('pickup');
            c.take();
            this.crates.splice(i, 1);
            break;
          }
        }
      }

    // barrels: fuses and chain reactions
    for (const barrel of this.barrels) {
      if (barrel.exploded) continue;
      if (barrel.fuse >= 0) {
        barrel.fuse += dt;
        if (barrel.fuse > 0.12) this.explodeBarrel(barrel);
      }
    }

    // blast VFX
    for (let i = this.blasts.length - 1; i >= 0; i--) {
      if (!this.blasts[i].tick(dt)) {
        this.blasts[i].destroy();
        this.blasts.splice(i, 1);
      }
    }
  }

  private explodeBarrel(barrel: Barrel): void {
    barrel.explode();
    this.detonate(barrel.pos, BARREL_RADIUS);
  }
  /** Shared blast rule: eliminate enemies inside the radius, deal 25 HP to
   *  unprotected players inside 0.8×radius, and ignite nearby barrels.
   *  Fired explosives exempt their owner; partners remain vulnerable.
   *  Environmental barrel blasts have no owner exemption or PvP kill credit. */
  private detonate(pos: Vec, radius: number, owner?: number): void {

    const ring = new BlastRing(pos, radius);
    this.blasts.push(ring);
    this.world.addChild(ring.g);
    this.sfx.blip({ wave: 'sawtooth', freq: 90, freqEnd: 30, duration: 0.35, volume: 0.9 });

    for (let j = this.zombies.length - 1; j >= 0; j--) {
      const z = this.zombies[j];
      if (dist(z.pos, pos) < radius) {
        this.scoreSys.kill();
        z.destroy();
        this.zombies.splice(j, 1);
      }
    }
    for (const s of this.slots) {
      if (!s.alive || s.p.invuln > 0) continue;
      if (owner !== undefined && this.slots.indexOf(s) === owner) continue; // D-19: shooter exempt from own grenade
      if (dist(s.p.pos, pos) < radius * 0.8) {
        s.p.hp -= BARREL_PLAYER_DAMAGE;
        s.p.invuln = 0.8;
        if (this.mode !== 'deathmatch') this.scoreSys.playerHit();
        this.sfx.preset('hit');
        if (s.p.hp <= 0) {
          s.alive = false;
          s.p.g.visible = false;
          this.sfx.preset('death');
          if (this.mode === 'deathmatch') {
            s.respawnTimer = DM_RESPAWN;
            if(owner!==undefined&&owner>=0&&this.slots[owner]!==s){this.slots[owner].kills++;if(this.slots[owner].kills>=DM_TARGET_KILLS)this.dmEnd(owner);}
          }
        }
      }
    }
    // chain other barrels
    for (const other of this.barrels) {
      if (!other.exploded && other.fuse < 0 && dist(other.pos, pos) < radius) {
        other.fuse = 0;
      }
    }
  }

  private freeSpot(): Vec | null {
    for (let tries = 0; tries < 20; tries++) {
      const pos = { x: 40 + Math.random() * (STAGE_W - 80), y: 84 + Math.random() * (STAGE_H - 122) };
      if (this.slots.some((s) => dist(pos, s.p.pos) < 60)) continue;
      const r = { x: pos.x - 8, y: pos.y - 6, w: 16, h: 12 };
      if (this.room.obstacles.some((o) => r.x < o.x + o.w && r.x + r.w > o.x && r.y < o.y + o.h && r.y + r.h > o.y)) continue;
      return pos;
    }
    return null;
  }

  private nearestZombie(from: Vec): Zombie | null {
    let best: Zombie | null = null;
    let bd = Infinity;
    for (const z of this.zombies) {
      const d = dist(z.pos, from);
      if (d < bd) { bd = d; best = z; }
    }
    return best;
  }

  public capture() {
    return {room:this.chosenRoom,mode:this.mode,state:this.state,wave:this.wave,score:this.scoreSys.score,mult:this.scoreSys.mult,peak:this.scoreSys.peak,high:this.high,remaining:this.spawnQueue,banner:this.banner.text,toast:this.toastTimer>0?this.toast.text:'',
      slots:this.slots.map(s=>({pos:s.p.pos,facing:s.p.facing,hp:s.p.hp,ammo:s.p.ammo,weapon:s.weapon,kills:s.kills,alive:s.alive,angle:s.p.g.rotation})),
      zombies:this.zombies.map(z=>({pos:z.pos,speed:z.speed,kind:z.kind,hp:z.hp,angle:z.g.rotation,tint:z.g.tint})),
      bullets:this.bullets.map(b=>({pos:b.pos,vel:b.vel,grenade:b.grenade,mine:b.mine,enemy:b.enemy,tint:b.g.tint,angle:b.g.rotation})),
      crates:this.crates.map(c=>c.pos),barrels:this.barrels.map(b=>({pos:b.pos,exploded:b.exploded})),
      blasts:this.blasts.map(b=>({pos:{x:b.g.x,y:b.g.y},radius:b.radius,t:b.t,color:b.color}))};
  }
  public applyFrame(f:ReturnType<Game['capture']>):void {
    if(!this.slots.length||this.chosenRoom!==f.room||this.mode!==f.mode||!this.world.visible){this.mode=f.mode;this.startRun(f.room);}
    // A guest receives state transitions rather than running the authority's lifecycle methods.
    // Mirror the music lifecycle once on resume, and stop it for pause or either end state.
    if(f.state==='playing'&&this.state!=='playing')this.sfx.startMusic([110,0,110,0,131,0,98,0],160);
    else if(f.state!=='playing')this.sfx.stopMusic();
    this.state=f.state;this.wave=f.wave;this.spawnQueue=f.remaining;this.scoreSys.score=f.score;this.scoreSys.mult=f.mult;this.scoreSys.peak=f.peak;this.high=f.high;this.banner.text=f.banner;
    this.toast.text=f.toast;this.toast.visible=!!f.toast;
    f.slots.forEach((data,i)=>{const s=this.slots[i];if(!s)return;s.p.pos={...data.pos};s.p.facing=data.facing;s.p.hp=data.hp;s.p.ammo=data.ammo;s.weapon=data.weapon;s.kills=data.kills;s.alive=data.alive;s.p.g.visible=data.alive;s.p.g.position.set(data.pos.x,data.pos.y);s.p.g.rotation=data.angle;});
    for(const z of this.zombies)z.destroy();this.zombies=f.zombies.map(d=>{const z=new Zombie(d.pos,d.speed,d.kind==='runner',d.kind);z.hp=d.hp;z.g.rotation=d.angle;z.g.tint=d.tint;this.world.addChild(z.g);return z;});
    for(const b of this.bullets)b.destroy();this.bullets=f.bullets.map(d=>{const b=new Projectile(d.pos,d.vel,d.grenade?'grenade':'bullet');b.g.rotation=d.angle;b.g.tint=d.tint;this.world.addChild(b.g);return b;});
    for(const c of this.crates)c.g.destroy();this.crates=f.crates.map(pos=>{const c=new AmmoCrate(pos);this.world.addChild(c.g);return c;});
    for(const b of this.barrels)if(!b.exploded)b.g.destroy();this.barrels=f.barrels.map(d=>{const b=new Barrel(d.pos);if(d.exploded)b.explode();else this.world.addChild(b.g);return b;});
    for(const b of this.blasts)b.destroy();this.blasts=f.blasts.map(d=>{const b=new BlastRing(d.pos,d.radius,d.color);b.t=d.t;b.tick(0);this.world.addChild(b.g);return b;});
    this.overlay.clear();if(this.state!=='playing')this.overlay.rect(0,0,640,400).fill({color:0x06090b,alpha:.76});
    this.menuChip.visible=this.state==='dead'||this.state==='victory';this.updateHud();
  }
  public remoteAim():Vec|null {
    if(!this.slots.length)return null;const slot=this.slots[this.networkRole==='guest'?1:0];
    if(matchMedia('(pointer: coarse)').matches){const target=this.mode==='deathmatch'?this.slots[0]?.p.pos:this.nearestZombie(slot.p.pos)?.pos;return target??null;}
    return this.input.pointer.seen?{x:this.input.pointer.x,y:this.input.pointer.y}:null;
  }

  private unlockedCount(): number { return this.mode==='deathmatch'?8:this.scoreSys.unlocked(); }
  public selectWeapon(player:number,index:number):void {if(this.slots[player]&&index>=0&&index<this.unlockedCount())this.slots[player].weapon=index;}
  public cycleWeapon():void {const p=this.networkRole==='guest'?1:0;if(!this.slots[p])return;const next=(this.slots[p].weapon+1)%this.unlockedCount();this.selectWeapon(p,next);this.weaponPress=next+1;}
  public selectedWeapon():number {return this.slots[this.networkRole==='guest'?1:0]?.weapon??0;}
  public startNetwork(mode:Mode,room:number):void {this.mode=mode;this.startRun(room);}
  public menuExit():void {this.showModeSelect();}
  public status():string {return this.state;}
  public mobileSummary():string {const s=this.slots[this.networkRole==='guest'?1:0];if(!s||['title','mode','room'].includes(this.state))return 'SIX ROOMS. EIGHT WEAPONS.\nRotate your device for a larger arena.';return `${this.state==='playing'?(this.mode==='deathmatch'?'FIRST TO FIVE':'WAVE '+this.wave):this.state.toUpperCase()} · ${Math.max(0,s.p.hp)} HP\n${WEAPONS[s.weapon].name} · ${s.weapon===0?'∞ AMMO':s.p.ammo+' AMMO'}`;}
  public consumeWeaponPress():number {const n=this.weaponPress;this.weaponPress=0;return n;}
  private updateHud(): void {
    const p=this.slots[0],q=this.slots[1];if(!p)return;
    const weapon=WEAPONS[p.weapon]??WEAPONS[0];
    this.hudText.style.fontSize=11;
    this.hudText.text=this.mode==='deathmatch'
      ? `DEATHMATCH   P1 ${p.kills} — ${q?.kills??0} P2   FIRST TO ${DM_TARGET_KILLS}\nP1 ${Math.max(0,p.p.hp)}HP ${WEAPONS[p.weapon].id.toUpperCase()} / ${p.p.ammo}   P2 ${Math.max(0,q?.p.hp??0)}HP ${WEAPONS[q?.weapon??0].id.toUpperCase()}`
      : `WAVE ${this.wave}   SCORE ${this.scoreSys.score.toString().padStart(7,'0')}   ×${this.scoreSys.mult}   BEST ${this.high}\nP1 ${Math.max(0,p.p.hp)}HP  ${weapon.id.toUpperCase()}  ${weapon.cost===0?'∞':p.p.ammo}${q?`   P2 ${q.alive?Math.max(0,q.p.hp)+'HP':'DOWN'} ${WEAPONS[q.weapon].id.toUpperCase()}`:''}`;
    this.weaponHud.clear();
    for(let i=0;i<8;i++){const x=412+i*26,unlocked=i<this.unlockedCount();this.weaponHud.rect(x,36,21,12).fill(i===p.weapon?this.room.accent:unlocked?0x445b54:0x233233);}
    this.waveLabel.text=`${this.room.name}   /   ${this.mode==='deathmatch'?'Q/E CYCLE • [ ] P2 CYCLE':this.spawnQueue+this.zombies.length+' HOSTILES • Q/E CYCLE • 1–8 SELECT'}${this.networkRole?'   /   LAN '+this.networkRole.toUpperCase():''}`;
  }
}
