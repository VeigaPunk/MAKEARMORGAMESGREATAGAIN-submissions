import { Graphics } from 'pixi.js';

/**
 * Deadlock Rooms procedural art and collision bodies.
 * Outlined armor, limbs, visors, shadows and role markings are the shipped art.
 * Combat values use the Deadlock Rooms tuning documented in README.md and world.ts.
 */

export type Vec = { x: number; y: number };

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function dist(a: Vec, b: Vec): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const OUTLINE = { width: 1, color: 0x000000 };

// --- Player ------------------------------------------------------------------
export class Player {
  g = new Graphics();
  pos: Vec;
  /** facing = last move direction; shots fire this way (keyboard-only combat) */
  facing: Vec = { x: 1, y: 0 };
  hp = 100;
  ammo = 70;
  private protectedUntil = 0;
  get invuln(): number { return Math.max(0, (this.protectedUntil - performance.now()) / 1000); }
  set invuln(seconds: number) { this.protectedUntil = performance.now() + Math.max(0, seconds) * 1000; }
  speed = 138;

  constructor(x: number, y: number, color = 0xe8e8f0) {
    this.pos = { x, y };
    this.draw(color);
    this.g.x = x;
    this.g.y = y;
  }

  draw(color: number): void {
    this.g.clear()
      .ellipse(1, 5, 10, 6).fill({ color: 0x000000, alpha: 0.35 })
      .rect(-6, 4, 5, 6).fill(0x1b2026).stroke(OUTLINE)
      .rect(1, 4, 5, 6).fill(0x1b2026).stroke(OUTLINE)
      .rect(-8, -5, 16, 11).fill(color).stroke(OUTLINE)
      .rect(-4, -4, 8, 10).fill(0x465052).stroke(OUTLINE)
      .rect(-3, -1, 6, 2).fill(0x9ead86)
      .rect(-5, -13, 10, 9).fill(color).stroke(OUTLINE)
      .rect(-5, -13, 10, 3).fill(0x727d79)
      .rect(-3, -9, 6, 2).fill(0x172329)
      .rect(5, -11, 3, 10).fill(0x2b3139).stroke(OUTLINE)
      .rect(5, -13, 3, 3).fill(0xaab6b9);
  }

  move(axis: Vec, dt: number, bounds: { w: number; h: number }, solids: Rect[]): void {
    if (axis.x !== 0 || axis.y !== 0) {
      const d = Math.hypot(axis.x, axis.y) || 1;
      this.facing = { x: axis.x / d, y: axis.y / d };
    }
    // axis-separated moves so we slide along walls/obstacles
    const norm = Math.max(1, Math.hypot(axis.x, axis.y));
    this.tryMove(this.pos.x + axis.x / norm * this.speed * dt, this.pos.y, bounds, solids);
    this.tryMove(this.pos.x, this.pos.y + axis.y / norm * this.speed * dt, bounds, solids);
    this.g.x = this.pos.x;
    this.g.y = this.pos.y;
    this.g.rotation = Math.atan2(this.facing.y, this.facing.x) + Math.PI / 2;
  }

  private tryMove(nx: number, ny: number, bounds: { w: number; h: number }, solids: Rect[]): void {
    const r = { x: nx - 6, y: ny - 4, w: 12, h: 12 };
    if (nx < 16 || nx > bounds.w - 16 || ny < 68 || ny > bounds.h - 26) return;
    for (const s of solids) if (rectsOverlap(r, s)) return;
    this.pos.x = nx;
    this.pos.y = ny;
  }

  tickFlash(_dt: number): void {
    if (this.invuln > 0) {
      this.g.alpha = Math.sin(this.invuln * 30) > 0 ? 1 : 0.4;
    } else {
      this.g.alpha = 1;
    }
  }
}

// --- Zombie ------------------------------------------------------------------
export class Zombie {
  g = new Graphics();
  hp: number;
  speed: number; // Wave base speed, adjusted by runner and enemy-role multipliers.
  runner: boolean;
  hitFlash = 0;
  kind: 'walker'|'runner'|'brute'|'warden'|'volatile';
  cooldown = 1.8;
  telegraph = 0;
  private routeAge = 0;
  private waypoint: Vec | null = null;
  dead = false;

  constructor(public pos: Vec, speed: number, runner: boolean, kind?: Zombie['kind']) {
    this.kind = kind ?? (runner ? 'runner' : 'walker');
    this.speed = runner ? speed * 1.8 : speed;
    this.hp = this.kind === 'brute' ? 10 : this.kind === 'warden' ? 5 : runner ? 1 : 2;
    if (this.kind === 'brute') this.speed *= .65;
    if (this.kind === 'volatile') this.speed *= 1.3;
    this.runner = runner;
    const color = this.kind === 'brute' ? 0x9d98ba : this.kind === 'warden' ? 0xad54d6 : this.kind === 'volatile' ? 0xf2a32a : runner ? 0xd43a3a : 0x6a8f3a;
    this.g.ellipse(1, 7, 10, 5).fill({color: 0x000000, alpha: 0.4})
      .rect(-5, 5, 4, 6).fill(0x242825).stroke(OUTLINE)
      .rect(2, 5, 4, 6).fill(0x242825).stroke(OUTLINE)
      .rect(-7, -4, 14, 12).fill(runner ? 0x762a30 : 0x4c5944).stroke(OUTLINE)
      .rect(-10, -7, 3, 9).fill(color).stroke(OUTLINE)
      .rect(7, -7, 3, 9).fill(color).stroke(OUTLINE)
      .rect(-5, -12, 10, 9).fill(color).stroke(OUTLINE)
      .rect(-3, -9, 2, 2).fill(0xffe69b)
      .rect(2, -9, 2, 2).fill(0xffe69b)
      .rect(-1, -5, 4, 1).fill(0x281d19);
    if (this.kind === 'brute') { this.g.scale.set(1.35); this.g.rect(-8,-6,16,5).fill(0x757589); }
    if (this.kind === 'warden') this.g.poly([-5,-12,-8,-18,-1,-13,5,-12,8,-18,1,-13]).fill(0xe59aff);
    if (this.kind === 'volatile') this.g.circle(0,0,5).fill(0xffd76d);
    this.g.x = pos.x;
    this.g.y = pos.y;
  }

  chase(target: Vec, dt: number, bounds: { w: number; h: number }, solids: Rect[], crowd: Zombie[]): void {
    this.routeAge -= dt;
    if (this.routeAge <= 0) { this.waypoint = routeAround(this.pos, target, solids); this.routeAge = .5; }
    target = this.waypoint ?? target;
    const d = dist(this.pos, target) || 1;
    const vx = ((target.x - this.pos.x) / d) * this.speed * dt;
    const vy = ((target.y - this.pos.y) / d) * this.speed * dt;
    this.step(vx, 0, bounds, solids);
    this.step(0, vy, bounds, solids);

    // gentle separation so the swarm doesn't collapse into one blob
    for (const o of crowd) {
      if (o === this || o.dead) continue;
      const sd = dist(this.pos, o.pos);
      if (sd > 0 && sd < 14) {
        this.pos.x += ((this.pos.x - o.pos.x) / sd) * 20 * dt;
        this.pos.y += ((this.pos.y - o.pos.y) / sd) * 20 * dt;
      }
    }

    if (this.hitFlash > 0) {
      this.hitFlash -= dt;
      this.g.alpha = this.hitFlash > 0 ? 0.5 : 1;
    }
    this.g.x = this.pos.x;
    this.g.y = this.pos.y;
    this.g.rotation = Math.atan2(target.y - this.pos.y, target.x - this.pos.x) + Math.PI / 2;
  }

  private step(dx: number, dy: number, bounds: { w: number; h: number }, solids: Rect[]): void {
    const nx = this.pos.x + dx;
    const ny = this.pos.y + dy;
    const r = { x: nx - 6, y: ny - 4, w: 12, h: 12 };
    if (nx < 16 || nx > bounds.w - 16 || ny < 68 || ny > bounds.h - 26) return;
    for (const s of solids) if (rectsOverlap(r, s)) return;
    this.pos.x = nx;
    this.pos.y = ny;
  }

  destroy(): void {
    this.dead = true;
    this.g.destroy();
  }
}

// --- Projectile ----------------------------------------------------------------
export class Projectile {
  g = new Graphics();
  life = 1.4;
  owner = 0;
  grenade = false;
  damage = 1;
  pierce = 0;
  blastRadius = 60;
  enemy = false;
  mine = false;
  age = 0;
  hits = new Set<Zombie>();

  constructor(public pos: Vec, public vel: Vec, kind: 'bullet' | 'grenade' = 'bullet') {
    if (kind === 'grenade') {
      // Impact shell: the circular silhouette distinguishes explosive ordnance from tracers.
      this.g.circle(0, 0, 4).fill(0x3a5f2a).stroke({ width: 1, color: 0x000000 });
    } else {
      this.g.rect(-2, -1, 5, 2).fill(0xf5c542);
    }
    this.g.x = pos.x;
    this.g.y = pos.y;
  }

  tick(dt: number): boolean {
    this.age += dt;
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.life -= dt;
    this.g.x = this.pos.x;
    this.g.y = this.pos.y;
    this.g.rotation = Math.atan2(this.vel.y, this.vel.x);
    return this.life > 0;
  }

  hitSolid(solids: Rect[], bounds: { w: number; h: number }): boolean {
    if (this.pos.x < 12 || this.pos.x > bounds.w - 12 || this.pos.y < 12 || this.pos.y > bounds.h - 12) return true;
    const r = { x: this.pos.x - 2, y: this.pos.y - 1, w: 4, h: 2 };
    return solids.some((s) => rectsOverlap(r, s));
  }

  destroy(): void {
    this.g.destroy();
  }
}

// --- AmmoCrate -----------------------------------------------------------------
export class AmmoCrate {
  g = new Graphics();
  taken = false;

  constructor(public pos: Vec) {
    // readable pickup: yellow box with dark band
    this.g.rect(-7, -5, 14, 10).fill(0xf5c542).stroke(OUTLINE)
      .rect(-7, -1.5, 14, 3).fill(0x8a6d1a)
      .rect(-2, -4, 4, 8).fill(0xfff1a1)
      .rect(-9, 6, 18, 2).fill({color:0xf5c542,alpha:0.35});
    this.g.x = pos.x;
    this.g.y = pos.y;
  }

  take(): void {
    this.taken = true;
    this.g.destroy();
  }
}

// --- Barrel --------------------------------------------------------------------
export class Barrel {
  g = new Graphics();
  exploded = false;
  fuse = -1; // chain-lighting delay

  constructor(public pos: Vec) {
    this.g.rect(-6, -8, 12, 16).fill(0xb03030).stroke(OUTLINE)
      .rect(-6, -5, 12, 2).fill(0x503f38)
      .rect(-6, 4, 12, 2).fill(0x503f38)
      .poly([-3,2,0,-3,3,2]).fill(0xffd35d)
      .rect(-4, -7, 3, 1).fill(0xf6755d);
    this.g.x = pos.x;
    this.g.y = pos.y;
  }

  explode(): void {
    this.exploded = true;
    this.g.destroy();
  }
}

/** expanding ring VFX for explosions */
export class BlastRing {
  g = new Graphics();
  t = 0;
  readonly dur = 0.35;

  constructor(pos: Vec, readonly radius: number, readonly color = 0xf5c542) {
    this.g.x = pos.x;
    this.g.y = pos.y;
  }

  tick(dt: number): boolean {
    this.t += dt;
    const k = this.t / this.dur;
    this.g.clear().circle(0, 0, Math.max(1, this.radius * k)).stroke({ width: 3, color: this.color, alpha: 1 - k });
    return k < 1;
  }

  destroy(): void {
    this.g.destroy();
  }
}

// --- shared ---------------------------------------------------------------------
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Visibility graph around cover corners prevents enemies from pinning on solid cover. */
function routeAround(from: Vec, target: Vec, solids: Rect[]): Vec {
  const clear=(a:Vec,b:Vec)=>!solids.some(s=>{
    const steps=Math.ceil(dist(a,b)/8);
    for(let i=0;i<=steps;i++){const t=i/Math.max(1,steps),x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;if(x>s.x-9&&x<s.x+s.w+9&&y>s.y-10&&y<s.y+s.h+10)return true;}return false;
  });
  if(clear(from,target))return target;
  const nodes=[from,target,...solids.flatMap(s=>[{x:s.x-14,y:s.y-15},{x:s.x+s.w+14,y:s.y-15},{x:s.x-14,y:s.y+s.h+15},{x:s.x+s.w+14,y:s.y+s.h+15}])];
  const ds=nodes.map(()=>Infinity),prev=nodes.map(()=>-1),seen=new Set<number>();ds[0]=0;
  for(let i=0;i<nodes.length;i++){let b=-1;for(let k=0;k<nodes.length;k++)if(!seen.has(k)&&(b<0||ds[k]<ds[b]))b=k;if(b<0||b===1||!Number.isFinite(ds[b]))break;seen.add(b);for(let k=1;k<nodes.length;k++)if(!seen.has(k)&&clear(nodes[b],nodes[k])){const nd=ds[b]+dist(nodes[b],nodes[k]);if(nd<ds[k]){ds[k]=nd;prev[k]=b;}}}
  let n=1;while(prev[n]>0)n=prev[n];return prev[n]===0?nodes[n]:target;
}
