import test from 'node:test';
import assert from 'node:assert/strict';
import { Runner, DT, LEVEL_END, GROUND_Y, CUBE, COURSES } from '../../MAGA-everything/02-code/armor-games/apps/impossible/src/runner.ts';
import { Sim } from '../../MAGA-everything/02-code/armor-games/apps/burger-tycoon/src/sim.ts';
import { load } from '../../MAGA-everything/02-code/armor-games/packages/arcade-core/src/storage.ts';
import { tapeFor } from '../../MAGA-everything/02-code/armor-games/apps/impossible/tests/tapes.mjs';
export const jumps=tapeFor(COURSES[0]);
test('Pulsebound entire normal course clears with discrete player jump presses',()=>{
 const r=new Runner();let next=0;for(let i=0;i<18000&&r.state==='running';i++){if(r.x>=jumps[next]){r.jump();next++;}r.step();}
 assert.equal(r.state,'clear');assert.equal(r.deaths,0);assert.equal(r.x,LEVEL_END);assert.equal(next,jumps.length);
});
test('Pulsebound misses kill, instant retries, and practice keeps its checkpoint',()=>{
 const r=new Runner();while(r.state==='running')r.step();assert.equal(r.state,'dead');assert.equal(r.deaths,1);
 for(let i=0;i<20;i++)r.step();assert.equal(r.state,'running');assert.equal(r.attempt,2);assert.ok(r.x<10);
 r.practice=true;r.checkpoint=COURSES[0].checkpoints[0];r.die();for(let i=0;i<20;i++)r.step();assert.ok(r.x>=r.checkpoint&&r.x<r.checkpoint+10);assert.equal(r.y,GROUND_Y-CUBE);
});
test('Pulsebound landing never snaps a cube upward through a platform',()=>{
 const r=new Runner();const block=COURSES[0].obstacles.find(x=>x[0]==='block');r.x=block[1]-CUBE;r.y=GROUND_Y-CUBE;r.grounded=false;r.vy=50;r.step(DT);assert.equal(r.state,'dead');
});
test('Burger clean idle economy reaches bankruptcy and can start over',()=>{
 const s=new Sim();for(let i=0;i<120000&&!s.s.over;i++)s.tick(1/60);
 assert.equal(s.s.over,true);assert.match(s.s.overReason,/BANKRUPT/);assert.ok(s.s.t>60);s.reset();assert.equal(s.s.cash,500);assert.equal(s.s.over,false);
});
test('Burger dirty throughput increases earnings then causes backlash and collapse',()=>{
 const clean=new Sim(),dirty=new Sim();dirty.act('farm',2);dirty.act('feed',1);dirty.act('rest',1);
 for(let i=0;i<600;i++){clean.tick(1/60);dirty.tick(1/60);}assert.ok(dirty.s.cash>clean.s.cash);assert.ok(dirty.s.backlash>clean.s.backlash);
 for(let i=0;i<20000&&!dirty.s.over;i++)dirty.tick(1/60);
 assert.equal(dirty.s.over,true);assert.match(dirty.s.overReason,/REPUTATION/);assert.ok(dirty.events.some(e=>/DISEASE/.test(e)));
});
test('Burger actions cannot spend unavailable resources or mutate a closed company',()=>{
 const s=new Sim();s.s.cash=0;const before=structuredClone(s.s);assert.equal(s.act('farm',1),null);assert.deepEqual(s.s,before);
 s.s.over=true;assert.equal(s.act('farm',0),null);assert.equal(s.s.crops,before.crops);
});
test('Shared score storage survives invalid primitives and unavailable storage',()=>{
 for(const raw of ['null','{}','"oops"','-2','1e999','broken']){globalThis.localStorage={getItem:()=>raw};assert.equal(load('game','best',0),0);}
 globalThis.localStorage={getItem:()=>{throw Error('blocked');}};assert.equal(load('game','best',7),7);delete globalThis.localStorage;
});

for(let course=1;course<COURSES.length;course++)test(`Pulsebound ${COURSES[course].name} clears with discrete jumps at 60Hz input`,()=>{
 const r=new Runner();r.courseIndex=course;const tape=tapeFor(COURSES[course]);let next=0;for(let i=0;i<18000&&r.state==='running';i++){if(i%2===0&&r.x>=tape[next]){r.jump();next++;}r.step();}assert.equal(r.state,'clear');assert.equal(r.deaths,0);assert.equal(next,tape.length);
});
