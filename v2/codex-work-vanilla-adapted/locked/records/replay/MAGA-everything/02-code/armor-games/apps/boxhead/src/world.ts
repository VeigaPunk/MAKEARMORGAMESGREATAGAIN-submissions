import type { Rect } from './entities';

/** Original Deadlock Rooms layouts. All coordinates are in the 640 × 400 arena. */
export interface ArenaRoom {
  id: string; name: string; detail: string; accent: number; obstacles: Rect[];
  barrels: { x: number; y: number }[];
  spawn: { x: number; y: number }; spawn2: { x: number; y: number };
}
export const ROOMS: ArenaRoom[] = [
  {id:'open-yard',name:'01 / LOADING YARD',detail:'Long lanes · two cover blocks',accent:0xbddd70,
   obstacles:[{x:200,y:140,w:60,h:40},{x:380,y:220,w:60,h:40}],barrels:[{x:150,y:300},{x:500,y:110}],spawn:{x:320,y:200},spawn2:{x:220,y:200}},
  {id:'pillars',name:'02 / PILLAR NINE',detail:'Four pillars · crossfire',accent:0x6acbcc,
   obstacles:[{x:140,y:110,w:36,h:36},{x:464,y:110,w:36,h:36},{x:140,y:254,w:36,h:36},{x:464,y:254,w:36,h:36}],barrels:[{x:320,y:110},{x:320,y:300}],spawn:{x:320,y:200},spawn2:{x:270,y:300}},
  {id:'foundry',name:'03 / THE FOUNDRY',detail:'Central furnace · loop and flank',accent:0xe6a35f,
   obstacles:[{x:266,y:154,w:108,h:92},{x:110,y:100,w:40,h:34},{x:490,y:286,w:40,h:34}],barrels:[{x:234,y:136},{x:407,y:268},{x:520,y:100}],spawn:{x:180,y:210},spawn2:{x:460,y:210}},
  {id:'transfer',name:'04 / TRANSFER BAY',detail:'Staggered crates · narrow sightlines',accent:0xaf9ae3,
   obstacles:[{x:175,y:96,w:44,h:116},{x:307,y:242,w:44,h:110},{x:439,y:96,w:44,h:116}],barrels:[{x:248,y:190},{x:390,y:280},{x:550,y:315}],spawn:{x:100,y:260},spawn2:{x:540,y:260}},
  {id:'sluice',name:'05 / THE SLUICE',detail:'Two channels · open centre',accent:0x65b4dd,
   obstacles:[{x:96,y:152,w:160,h:34},{x:384,y:252,w:160,h:34},{x:310,y:84,w:32,h:42}],barrels:[{x:175,y:230},{x:470,y:195},{x:320,y:330}],spawn:{x:300,y:205},spawn2:{x:350,y:210}},
  {id:'vault',name:'06 / LOCKDOWN',detail:'Four bunkers · explosive corners',accent:0xdf7794,
   obstacles:[{x:155,y:120,w:90,h:45},{x:395,y:120,w:90,h:45},{x:155,y:270,w:90,h:45},{x:395,y:270,w:90,h:45}],barrels:[{x:110,y:105},{x:530,y:105},{x:110,y:330},{x:530,y:330}],spawn:{x:280,y:220},spawn2:{x:360,y:220}},
];
export interface WaveTable { count:number; speed:number; runners:number; spawnEvery:number }
export const WAVE_TABLES: WaveTable[] = [
  {count:8,speed:34,runners:0,spawnEvery:0.9},
  {count:13,speed:39,runners:3,spawnEvery:0.72},
  {count:19,speed:43,runners:5,spawnEvery:0.6},
];
export function waveFor(number:number):WaveTable {
  if(number<=3) return WAVE_TABLES[Math.max(0,number-1)];
  return {count:Math.min(100,19+(number-3)*6),speed:Math.min(66,43+(number-3)*1.5),runners:Math.min(30,5+(number-3)*2),spawnEvery:Math.max(.2,.6-(number-3)*.035)};
}
export type WeaponTier = 'pistol'|'uzi'|'shotgun'|'mines'|'grenades'|'flame'|'rail'|'rockets';
export const WEAPONS:{id:WeaponTier;name:string;at:number;delay:number;cost:number;detail:string}[]=[
 {id:'pistol',name:'SERVICE PISTOL',at:1,delay:.28,cost:0,detail:'Infinite reserve · precise single shot'},
 {id:'uzi',name:'MACHINE PISTOL',at:4,delay:.095,cost:1,detail:'Rapid fire · keep moving'},
 {id:'shotgun',name:'BREACH SHOTGUN',at:7,delay:.55,cost:2,detail:'Five-pellet fan · close crowd control'},
 {id:'mines',name:'PROXIMITY MINES',at:10,delay:.8,cost:3,detail:'Lay a trap · arms after half a second'},
 {id:'grenades',name:'FRAG LAUNCHER',at:14,delay:.65,cost:3,detail:'Impact blast · clears clusters'},
 {id:'flame',name:'THERMAL LANCE',at:20,delay:.065,cost:1,detail:'Short range · sustained crowd damage'},
 {id:'rail',name:'RAIL DRIVER',at:28,delay:.65,cost:3,detail:'Pierces four targets · armor breaker'},
 {id:'rockets',name:'ROCKET SYSTEM',at:40,delay:.9,cost:4,detail:'Wide blast · heavy ordnance'},
];
export class ScoreSystem {
 score=0;mult=1;peak=1;kills=0;private multTimer=0;
 kill():number {const gained=100*this.mult;this.score+=gained;this.kills++;this.mult=Math.min(100,this.mult+1);this.peak=Math.max(this.peak,this.mult);this.multTimer=4.5;return gained;}
 playerHit():void {this.mult=Math.max(1,Math.floor(this.mult*.6));}
 tick(dt:number):void {if(this.mult>1){this.multTimer-=dt;if(this.multTimer<=0){this.mult--;this.multTimer=1.8;}}}
 unlocked():number {return WEAPONS.filter(w=>w.at<=this.peak).length;}
 weaponForMult():WeaponTier {return WEAPONS[this.unlocked()-1].id;}
}
export function fireDelay(w:WeaponTier):number {return WEAPONS.find(a=>a.id===w)!.delay;}
export function ammoPerShot(w:WeaponTier):number {return WEAPONS.find(a=>a.id===w)!.cost;}
