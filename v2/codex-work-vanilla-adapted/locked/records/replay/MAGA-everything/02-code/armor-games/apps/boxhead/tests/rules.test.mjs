import test from 'node:test';import assert from 'node:assert/strict';
import {ROOMS,WEAPONS,ScoreSystem,waveFor,ammoPerShot} from '../src/world.ts';
const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
test('all rooms have clear player spawns and a connected walkable floor',()=>{
 for(const room of ROOMS){
  for(const p of [room.spawn,room.spawn2])assert.ok(!room.obstacles.some(o=>overlaps({x:p.x-6,y:p.y-4,w:12,h:12},o)),room.id);
  const cells=[];for(let y=80;y<=360;y+=20)for(let x=20;x<=620;x+=20)if(!room.obstacles.some(o=>overlaps({x:x-6,y:y-6,w:12,h:12},o)))cells.push([x,y]);
  const keys=new Set(cells.map(([x,y])=>`${x},${y}`)),seen=new Set(),queue=[cells[0]];while(queue.length){const [x,y]=queue.shift(),key=`${x},${y}`;if(seen.has(key)||!keys.has(key))continue;seen.add(key);for(const [dx,dy] of [[20,0],[-20,0],[0,20],[0,-20]])queue.push([x+dx,y+dy]);}assert.equal(seen.size,keys.size,room.id);
 }
});
test('streak unlocks every weapon, survives hits, and infinite pistol prevents empty-ammo deadlock',()=>{
 const score=new ScoreSystem();for(let i=0;i<45;i++)score.kill();assert.equal(score.unlocked(),8);const peak=score.peak;score.playerHit();score.tick(20);assert.equal(score.peak,peak);assert.equal(score.unlocked(),8);assert.equal(ammoPerShot('pistol'),0);assert.equal(new Set(WEAPONS.map(w=>w.id)).size,8);
});
test('endless director increases pressure with bounded speed and population',()=>{
 let count=0;for(let wave=1;wave<=10000;wave++){const d=waveFor(wave);assert.ok(d.count>=count&&d.count<=100);assert.ok(d.speed<=66);assert.ok(d.spawnEvery>=.2);count=d.count;}
});
