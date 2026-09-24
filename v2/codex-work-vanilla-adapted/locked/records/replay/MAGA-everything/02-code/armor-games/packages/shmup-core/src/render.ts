import { Assets, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { BTN, STAGE_H, STAGE_W, type ShmupSim } from './sim';

/**
 * PixiJS 8 renderer for the shared shmup skeleton — draws `ShmupSim` state
 * each frame. Port of the proto's Canvas2D draw() to Pixi Graphics/Text.
 * Original SVG fleets/commanders and vector orbital scenery are selected by
 * content-pack data; vector bird/ship geometry remains a resilient load fallback.
 */

function gradientTexture(bg0: number, bg1: number): Texture {
  const cv = document.createElement('canvas');
  cv.width = 1; cv.height = STAGE_H;
  const g = cv.getContext('2d')!;
  const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`;
  const grad = g.createLinearGradient(0, 0, 0, STAGE_H);
  grad.addColorStop(0, hex(bg1));
  grad.addColorStop(1, hex(bg0));
  g.fillStyle = grad;
  g.fillRect(0, 0, 1, STAGE_H);
  return Texture.from(cv);
}

export class ShmupRenderer {
  readonly view = new Container();
  private bg = new Graphics();
  private sectorSky = new Graphics();
  private stillStars = new Graphics();
  private skyChapter = 0;
  private field = new Graphics();   // stars, pickups, chickens, boss, eggs, shots, ship, particles
  private art = new Container();
  private textures = new Map<string, Texture>();
  private sprites: Sprite[] = [];
  private spriteUsed = 0;
  private hud = new Container();
  private bossLabel: Text;
  private bestLabel: Text;
  private menuLayer = new Container();
  private btnLabels!: { ch1: Text; ch2: Text; start: Text; resume: Text };
  private bannerBg = new Graphics();
  private bannerText: Text;
  private hudText: Text;
  private hudRight: Text;
  private jokeText: Text;
  private hintText: Text;
  private titleTexts: Text[] = [];
  private lastHud = '';
  private lastRight = '';
  private lastJoke = '';
  private lastBanner = '';

  constructor(private sim: ShmupSim) {
    const pack = sim.pack;
    // gradient backdrop as a 1px-wide texture stretched to the stage
    const bgTex = gradientTexture(pack.bg0, pack.bg1);
    this.bg.rect(0, 0, STAGE_W, STAGE_H).fill({ texture: bgTex });
    for (const star of sim.stars) this.stillStars.rect(star.x,star.y,star.s,star.s).fill({color:0xffffff,alpha:0.35+star.s/4});
    for (const name of [pack.art.ship, ...pack.art.enemies, ...pack.art.bosses]) {
      Assets.load<Texture>(`./art/${name}.svg`).then(t => this.textures.set(name, t)).catch(() => {});
    }

    this.hudText = new Text({ text: '', style: { fill: 0xffffff, fontSize: 14, fontFamily: 'Arial, sans-serif', lineHeight: 20 } });
    this.hudText.x = 18; this.hudText.y = 10;
    this.hudRight = new Text({ text: '', style: { fill: 0xffffff, fontSize: 14, fontFamily: 'Arial, sans-serif', align: 'right', lineHeight: 20 } });
    this.hudRight.anchor.set(1, 0);
    this.hudRight.x = STAGE_W - 14; this.hudRight.y = 8;
    this.jokeText = new Text({ text: '', style: { fill: 0x8ce99a, fontSize: 14, fontFamily: 'Arial, sans-serif', align: 'center' } });
    this.jokeText.anchor.set(0.5, 0);
    this.jokeText.x = STAGE_W / 2; this.jokeText.y = STAGE_H - 120;
    this.hintText = new Text({
      text: 'WASD / ARROWS  MOVE     SPACE / Z / CLICK  FIRE     X / SHIFT / RIGHT CLICK  MISSILE     ESC  PAUSE',
      style: { fill: 0x888899, fontSize: 11, fontFamily: 'Arial, sans-serif' },
    });
    this.hintText.x = 14; this.hintText.y = STAGE_H - 18;
    this.bossLabel = new Text({ text: '', style: { fill: pack.accent, fontSize: 12, fontFamily: 'Arial, sans-serif', fontWeight: 'bold' } });
    this.bossLabel.anchor.set(0.5, 0); this.bossLabel.x = STAGE_W / 2; this.bossLabel.y = 8;
    this.hud.addChild(this.hudText, this.hudRight, this.jokeText, this.hintText, this.bossLabel);
    this.bestLabel = new Text({ text: '', style: { fill: 0xb0becf, fontSize: 13, fontFamily: 'Arial, sans-serif' } });
    this.bestLabel.anchor.set(0.5); this.bestLabel.x = STAGE_W / 2; this.bestLabel.y = 445;
    this.menuLayer.addChild(this.bestLabel);

    this.bannerText = new Text({
      text: '', style: { fill: 0xffffff, fontSize: 22, lineHeight: 34, fontFamily: 'Arial, sans-serif', fontWeight: 'bold', align: 'center' },
    });
    this.bannerText.anchor.set(0.5, 0.5);
    this.bannerText.x = STAGE_W / 2; this.bannerText.y = STAGE_H / 2 + 1;

    this.view.addChild(this.bg, this.sectorSky, this.stillStars, this.field, this.art, this.hud, this.menuLayer, this.bannerBg, this.bannerText);
    this.buildTitle();
  }

  // ---------------- title ----------------
  private buildTitle(): void {
    const pack = this.sim.pack;
    const mk = (text: string, y: number, size: number, fill: number, bold = false): Text => {
      const t = new Text({
        text, style: { fill, fontSize: size, fontFamily: 'Arial, sans-serif', align: 'center', fontWeight: bold ? 'bold' : 'normal' },
      });
      t.anchor.set(0.5, 0.5); t.x = STAGE_W / 2; t.y = y;
      this.titleTexts.push(t); this.menuLayer.addChild(t);
      return t;
    };
    const titleText = mk(pack.title, 120, 44, pack.accent, true);
    // Each pack supplies its original wordmark; text is the load fallback.
    if (pack.art.title) {
      Assets.load<Texture>(`./art/${pack.art.title}.svg`)
        .then((tex) => {
          const s = new Sprite(tex);
          s.anchor.set(0.5); s.x = STAGE_W / 2; s.y = 110;
          s.width = 620; s.height = 620 * tex.height / tex.width;
          this.menuLayer.addChild(s);
          titleText.visible = false;
        })
        .catch(() => { /* asset absent — text title stays */ });
    }
    mk(pack.sub, 193, 16, 0xb8cbd1);
    mk(`${pack.sectors.length} SECTORS  /  ${pack.sectors.reduce((n,s)=>n+s.waves.length+1,0)} ENCOUNTERS  /  ONE BRAVE PILOT`, 233, 11, 0x8398a7);
    mk('ENTER  LAUNCH     1 / 2  PREVIOUS / NEXT     C  CONTINUE', 478, 13, 0x96afba);
    mk(this.sim.pack.id === 'replica'
      ? 'AN ORIGINAL STARRY ARCADE EXPEDITION'
      : 'AN ORIGINAL COURIER ADVENTURE', 503, 11, 0x6d848c);
    // persistent button labels — drawTitleButtons only restyles them
    const mkBtn = (r: { x: number; y: number; w: number; h: number }): Text => {
      const t = new Text({ text: '', style: { fontSize: 13, fontFamily: 'Arial, sans-serif', fontWeight: 'bold' } });
      t.anchor.set(0.5, 0.5); t.x = r.x + r.w / 2; t.y = r.y + r.h / 2 + 1;
      this.menuLayer.addChild(t);
      return t;
    };
    this.btnLabels = { ch1: mkBtn(BTN.ch1), ch2: mkBtn(BTN.ch2), start: mkBtn(BTN.start), resume: mkBtn(BTN.resume) };
    this.menuLayer.visible = false;
  }

  private drawTitleButtons(): void {
    const g = this.field, sim = this.sim;
    const btn = (r: { x: number; y: number; w: number; h: number }, label: Text, text: string, on: boolean) => {
      g.roundRect(r.x, r.y, r.w, r.h, 4)
        .fill({ color: on ? sim.pack.accent : 0x222233 })
        .stroke({ width: 1, color: 0xffffff });
      label.text = text;
      label.style.fill = on ? 0x111111 : 0xddddee;
    };
    btn(BTN.ch1, this.btnLabels.ch1, `← ${sim.titleSel > 1 ? 'PREVIOUS SECTOR' : 'FIRST SECTOR'}`, sim.titleSel > 1);
    btn(BTN.ch2, this.btnLabels.ch2, sim.titleSel < sim.unlocked ? 'NEXT SECTOR →' : 'NEXT SECTOR LOCKED', sim.titleSel < sim.unlocked);
    btn(BTN.start, this.btnLabels.start, `LAUNCH · SECTOR ${sim.titleSel}`, true);
    this.btnLabels.resume.visible = !!sim.checkpoint;
    if (sim.checkpoint) btn(BTN.resume, this.btnLabels.resume, `CONTINUE · ${sim.checkpoint.chapter}-${sim.checkpoint.wave + 1}`, false);
  }

  // ---------------- entities ----------------
  private sprite(name: string, x: number, y: number, width: number, height: number, rotation = 0): boolean {
    const tex = this.textures.get(name);
    if (!tex) return false;
    let sprite = this.sprites[this.spriteUsed++];
    if (!sprite) { sprite = new Sprite(tex); sprite.anchor.set(0.5); this.sprites.push(sprite); this.art.addChild(sprite); }
    sprite.texture = tex; sprite.visible = true; sprite.x = x; sprite.y = y;
    sprite.width = width; sprite.height = height; sprite.rotation = rotation;
    return true;
  }

  private drawBird(x: number, y: number, k: number, type = 0, boss = false): void {
    const g = this.field, pack = this.sim.pack;
    const name = boss ? pack.art.bosses[type] : pack.art.enemies[type];
    const w = boss ? 44 : type === 1 ? 50 : 46;
    if (this.sprite(name, x, y - 3 * k, w * k, (boss ? 43 : 42) * k, this.sim.reducedMotion ? 0 : Math.sin(this.sim.waveT * 2 + x) * 0.045)) return;
    const variant = boss ? pack.bosses[type] : pack.enemyTypes[type];
    const edge = { width: 1.3 * k, color: 0x332342 };
    const flap = Math.sin(this.sim.waveT * 6 + x * 0.03) * 4 * k;
    g.ellipse(x - 16 * k, y - flap, 10 * k, 5 * k).fill(variant.headColor).stroke(edge);
    g.ellipse(x + 16 * k, y - flap, 10 * k, 5 * k).fill(variant.headColor).stroke(edge);
    g.ellipse(x, y + 2 * k, 16 * k, 14 * k).fill(variant.color).stroke(edge);
    g.ellipse(x - 3 * k, y + 5 * k, 10 * k, 8 * k).fill({ color: 0xfff8dd, alpha: 0.72 });
    g.ellipse(x, y - 12 * k, 9 * k, 8 * k).fill(0xfff6de).stroke(edge);
    g.poly([x - 7*k,y - 19*k,x - 5*k,y - 25*k,x,y - 21*k,x + 4*k,y - 26*k,x + 7*k,y - 19*k]).fill(variant.headColor).stroke(edge);
    g.poly([x - 4*k,y - 10*k,x + 4*k,y - 10*k,x,y - 5*k]).fill(0xf39b35).stroke(edge);
    g.circle(x - 4*k, y - 14*k, 2*k).fill(0x241d28);
    g.circle(x + 4*k, y - 14*k, 2*k).fill(0x241d28);
    g.rect(x - 10*k,y + 15*k,6*k,2*k).fill(0xf39b35);
    g.rect(x + 4*k,y + 15*k,6*k,2*k).fill(0xf39b35);
    if (boss || type === 2) {
      g.circle(x,y - 11*k,13*k).stroke({ color: 0xc7edff, alpha: 0.65, width: 1.5*k });
      // Pixi arcs join the current path: begin at the arc itself, never the origin.
      g.moveTo(x - 11*k, y - 11*k).arc(x,y - 11*k,11*k,Math.PI,Math.PI*1.35).stroke({ color: 0xffffff, alpha: 0.8, width: 2*k });
    }
  }

  private drawShip(): void {
    const g = this.field, pack = this.sim.pack, s = this.sim.ship;
    const flame = 8 + Math.sin(this.sim.waveT * 48) * 4;
    for (const off of [-8,8]) {
      g.poly([s.x+off-3,s.y+12,s.x+off+3,s.y+12,s.x+off,s.y+20+flame]).fill(pack.accent);
      g.poly([s.x+off-1.5,s.y+12,s.x+off+1.5,s.y+12,s.x+off,s.y+17+flame/2]).fill(0xfff4c2);
    }
    if (this.sprite(pack.art.ship, s.x,s.y,42,50,this.sim.reducedMotion ? 0 : s.vx/5000)) return;
    g.poly([s.x,s.y-22,s.x-19,s.y+14,s.x-6,s.y+9,s.x,s.y+15,s.x+6,s.y+9,s.x+19,s.y+14]).fill(0xbed8ed).stroke({color:0x375e81,width:1.5});
    g.poly([s.x,s.y-22,s.x-8,s.y-1,s.x+8,s.y-1]).fill(pack.ship);
    g.ellipse(s.x,s.y-5,4,7).fill(0x8ee9ff).stroke({color:0x264c74,width:1});
    g.rect(s.x-18,s.y+6,5,5).fill(pack.accent); g.rect(s.x+13,s.y+6,5,5).fill(pack.accent);
  }

  /** full redraw — call once per rendered frame */
  draw(): void {
    const sim = this.sim, g = this.field;
    g.clear();
    if (this.skyChapter !== sim.chapter) {
      this.skyChapter = sim.chapter;
      const sky = this.sectorSky.clear(), color = sim.sector.planet;
      const px = sim.chapter === 1 ? 810 : 130, py = sim.chapter === 1 ? 128 : 420;
      for (let i = 5; i > 0; i--) sky.circle(px, py, 130 + i * 18).fill({ color, alpha: 0.015 * (6 - i) });
      sky.circle(px, py, 134).fill({color, alpha:0.2}).stroke({color:sim.pack.accent,alpha:0.13,width:2});
      sky.ellipse(px, py+12, 245, 47).stroke({color:sim.pack.accent,alpha:0.1,width:3});
      for (let i=0; i<5; i++) sky.ellipse(150+i*138,240+i*30,180,50).fill({color,alpha:0.025});
    }
    this.spriteUsed = 0;
    for (const sprite of this.sprites) sprite.visible = false;
    this.bossLabel.text = '';

    // stars
    this.stillStars.visible = sim.reducedMotion;
    for (const s of sim.reducedMotion ? [] : sim.stars) {
      g.rect(s.x, s.y, s.s, s.s).fill({ color: 0xffffff, alpha: 0.35 + s.s / 4 });
    }

    if (sim.mode === 'title') {
      this.menuLayer.visible = true;
      this.drawBird(115, 340, 2.2, 0); this.drawBird(845, 340, 2.2, 2);
      this.drawTitleButtons();
      this.bestLabel.text = `${sim.pack.sectors[sim.titleSel-1].name}  ·  ${sim.unlocked}/${sim.pack.sectors.length} OPEN  ·  BEST ${sim.best.toString().padStart(6, '0')}`;
      this.hintText.visible = false;
      this.setBanner('');
      this.hudText.text = ''; this.hudRight.text = ''; this.jokeText.text = '';
      this.lastHud = this.lastRight = this.lastJoke = '';
      return;
    }
    this.menuLayer.visible = false;
    this.hintText.visible = !matchMedia('(pointer: coarse)').matches;
    g.rect(0,0,STAGE_W,55).fill({ color: 0x041019, alpha: 0.76 });

    const progress = (Math.min(sim.waveIdx, sim.wavesTotal) + (sim.boss ? (1-sim.boss.hp/sim.boss.max) : 0)) / (sim.wavesTotal + 1);
    g.rect(0,55,STAGE_W,2).fill({color:sim.pack.accent,alpha:0.12});
    g.rect(0,55,STAGE_W*progress,2).fill({color:sim.pack.accent,alpha:0.8});
    // pickups
    for (const p of sim.pickups) {
      g.circle(p.x,p.y,13).stroke({ color: sim.pack.accent, width: 1, alpha: 0.5 });
      if (p.kind === 'gift') {
        g.rect(p.x - 9, p.y - 7, 18, 14).fill(sim.pack.accent).stroke({ width: 1, color: 0xffffff });
        g.rect(p.x - 9, p.y - 1.5, 18, 3).fill(sim.pack.bg1);
        g.rect(p.x - 2, p.y - 7, 4, 14).fill(0xffe8ff);
      } else {
        g.circle(p.x, p.y, 8).fill(0xffa94d).stroke({ width: 1, color: 0xffffff });
        g.rect(p.x - 2, p.y - 11, 4, 6).fill(0xe8590c);
      }
    }
    // chickens
    for (const c of sim.chickens) this.drawBird(c.x, c.y, 1, c.type);
    // boss
    if (sim.boss) {
      const b = sim.boss;
      if (b.warn > 0) {
        g.circle(b.x, b.y, 62 + Math.sin(b.t * 30) * 6).stroke({ width: 3, color: sim.pack.accent });
      }
      this.drawBird(b.x, b.y, 3.2, b.type, true);
      this.bossLabel.text = `${sim.pack.bosses[b.type].name}${b.warn > 0 ? ' · BURST' : b.hp <= b.max*.5 ? ' · PHASE II' : ''}`;
      g.rect(STAGE_W / 2 - 120, 28, 240, 10).fill(0x333333);
      g.rect(STAGE_W / 2 - 120, 28, 240 * Math.max(0, b.hp) / b.max, 10).fill(sim.pack.accent);
      g.rect(STAGE_W / 2 - 120, 28, 240, 10).stroke({ width: 1, color: 0xffffff });
    }
    else if (sim.waveBannerT > 0) this.bossLabel.text = sim.waveName.toUpperCase();
    // eggs
    for (const e of sim.eggs) {
      g.ellipse(e.x, e.y, 5, 8).fill(sim.pack.egg).stroke({ width: 1, color: 0x948b6b });
    }
    // bullets / missiles
    for (const b of sim.bullets) { g.roundRect(b.x-3,b.y-10,6,16,3).fill({color:sim.pack.ship,alpha:0.3}); g.roundRect(b.x-1.5,b.y-8,3,12,1).fill(0xeaffef); }
    for (const m of sim.missiles) {
      g.rect(m.x - 4, m.y - 12, 8, 20).fill(0xffd43b);
      g.rect(m.x - 4, m.y + 6, 8, 4).fill(0xff6b6b);
    }
    // ship (blink while invulnerable)
    if (sim.ship.alive && (sim.ship.invuln <= 0 || ((sim.waveT * 16) | 0) % 2 === 0)) this.drawShip();
    // particles
    for (const p of sim.parts) {
      g.rect(p.x, p.y, p.s, p.s).fill({ color: p.col, alpha: Math.max(0, p.life * 2) });
    }

    // HUD (Text objects update only on change)
    const hud = `SCORE ${sim.score.toString().padStart(6,'0')}  ·  BEST ${Math.max(sim.best,sim.score).toString().padStart(6,'0')}\n${'♥ '.repeat(Math.max(0,sim.lives))}  ${sim.pack.weapons[sim.weaponLv]}  ·  MISSILES ${sim.missileN}`;
    if (hud !== this.lastHud) { this.hudText.text = hud; this.lastHud = hud; }
    const right = `${sim.sector.name}\n${sim.boss ? 'BOSS ENCOUNTER' : sim.mode === 'clear' || sim.mode === 'win' ? 'SECTOR SECURED' : `WAVE ${Math.min(sim.waveIdx + 1, sim.wavesTotal)} / ${sim.wavesTotal}`}`;
    if (right !== this.lastRight) { this.hudRight.text = right; this.lastRight = right; }
    const joke = sim.noticeT > 0 ? sim.notice : sim.jokeT > 0 && sim.pack.jokes ? (sim.pack.jokes[sim.chapter - 1] ?? '') : '';
    if (joke !== this.lastJoke) { this.jokeText.text = joke; this.lastJoke = joke; }

    // banners
    let banner = '';
    if (sim.paused) banner = 'PAUSED\nESC / P OR TAP TO RESUME';
    else if (sim.mode === 'clear') banner = `SECTOR ${sim.chapter} SECURED\n${sim.pack.sectors[sim.chapter].name}\n${sim.pack.sectors[sim.chapter].subtitle}`;
    else if (sim.mode === 'gameover') banner = `FLIGHT ENDED\nSCORE ${sim.score}  ·  BEST ${sim.best}\nENTER / R / TAP — return to hangar`;
    else if (sim.mode === 'win') banner = `MISSION COMPLETE · ALL ${sim.pack.sectors.length} SECTORS CLEARED\nSCORE ${sim.score}  ·  BEST ${sim.best}\nENTER / R / TAP — return to hangar`;
    this.setBanner(banner);
  }

  private setBanner(t: string): void {
    if (t === this.lastBanner) return;
    this.lastBanner = t;
    this.bannerBg.clear();
    if (t) this.bannerBg.rect(0, 0, STAGE_W, STAGE_H).fill({ color: 0x000811, alpha: 0.66 })
      .roundRect(130, STAGE_H / 2 - 80, STAGE_W - 260, 160, 8).fill({ color: 0x0b1925, alpha: 0.97 }).stroke({ color: this.sim.pack.accent, width: 2 });
    this.bannerText.text = t;
  }
}
