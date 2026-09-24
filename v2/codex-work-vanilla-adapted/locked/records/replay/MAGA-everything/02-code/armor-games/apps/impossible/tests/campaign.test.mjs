import test from 'node:test';import assert from 'node:assert/strict';
import {Runner,COURSES,DT,GROUND_Y,CUBE} from '../src/runner.ts';
import {tapeFor} from './tapes.mjs';
for(let course=0;course<COURSES.length;course++){
 test(`${COURSES[course].name}: complete fixed-step route with 60 Hz button input`,()=>{
  const r=new Runner();r.courseIndex=course;const tape=tapeFor(COURSES[course]);let n=0;
  for(let tick=0;r.state==='running'&&tick<20000;tick++){if(tick%2===0&&r.x>=tape[n]){r.jump();n++;}r.step();}
  assert.equal(r.state,'clear');assert.equal(r.deaths,0);assert.equal(n,tape.length);assert.ok(r.time>=100);
 });
 test(`${COURSES[course].name}: every practice respawn address has safe runway`,()=>{
  const r=new Runner();r.courseIndex=course;r.practice=true;
  for(const cp of COURSES[course].checkpoints){r.checkpoint=cp;r.reset();for(let n=0;n<90;n++)r.step();assert.equal(r.state,'running',`unsafe flag ${cp}`);assert.equal(r.deaths,0);}
 });
}
test('Pit miss is lethal and death restart is at most 167 ms',()=>{
 const r=new Runner();while(r.state==='running')r.step();assert.equal(r.state,'dead');let ticks=0;while(r.state==='dead'){r.step();ticks++;}assert.ok(ticks*DT<=.167);assert.equal(r.attempt,2);assert.equal(r.x,0);
});
test('Block front edge kills before visible body penetrates',()=>{
 const r=new Runner();r.courseIndex=1;const block=COURSES[1].obstacles.find(o=>o[0]==='block');r.x=block[1]-CUBE;r.y=GROUND_Y-CUBE;r.step();assert.equal(r.state,'dead');
});
test('A held input does not change impulse or jump repeatedly',()=>{
 const r=new Runner();r.jump();r.step();const impulse=r.vy;assert.equal(impulse,-880);for(let i=0;i<100;i++)r.step();assert.equal(r.grounded,true);assert.equal(r.vy,0);
});
