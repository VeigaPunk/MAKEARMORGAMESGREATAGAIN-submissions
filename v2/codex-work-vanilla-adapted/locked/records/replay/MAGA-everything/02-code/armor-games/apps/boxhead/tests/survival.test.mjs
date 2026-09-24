import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {chromium} from '@playwright/test';import path from 'node:path';import {fileURLToPath} from 'node:url';import {mkdir} from 'node:fs/promises';
const pagePath=process.env.SITE_ROOT?'/boxhead/':'/';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../../../..');
const evidence=process.env.EVIDENCE_DIR??path.join(root,'ship-records/evidence/boxhead');
test('real keyboard/mouse pilot reaches escalating survival content',async()=>{
 const server=spawn(process.execPath,[process.env.HOST_SCRIPT??path.join(root,'tooling/deadlock-host.mjs')],{env:{...process.env,HOST:'127.0.0.1',PORT:'4320',DEADLOCK_ROOT:process.env.SITE_ROOT??path.join(root,'MAGA-everything/02-code/armor-games/apps/boxhead/dist')},stdio:'pipe'});await new Promise(r=>server.stdout.once('data',r));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/root/.cache/magga/chrome-headless-shell-linux64/chrome-headless-shell',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
 await mkdir(evidence,{recursive:true});const page=await browser.newPage({viewport:{width:1000,height:700}});await page.goto(`http://127.0.0.1:4320${pagePath}?debug`);await page.waitForFunction(()=>window.__maga);await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__maga.game.state==='mode');await page.keyboard.press('Digit1');await page.waitForFunction(()=>window.__maga.game.state==='room');await page.keyboard.press('Digit2');await page.waitForFunction(()=>window.__maga.game.state==='playing');
 const rect=await page.locator('canvas').boundingBox();let held=new Set(),corner=0;const corners=[{x:80,y:85},{x:550,y:85},{x:550,y:345},{x:80,y:345}],types=new Set();let reached=1,last;
 const started=Date.now();await page.keyboard.down('Space');
 while(Date.now()-started<150000){
  const f=await page.evaluate(()=>{const g=window.__maga.game;return{state:g.state,wave:g.wave,p:{...g.player.pos},hp:g.player.hp,ammo:g.player.ammo,weapon:g.slots[0].weapon,score:g.scoreSys.score,peak:g.scoreSys.peak,z:g.zombies.map(z=>({pos:z.pos,kind:z.kind})),crates:g.crates.map(c=>c.pos)}});last=f;reached=Math.max(reached,f.wave);for(const z of f.z)types.add(z.kind);if(f.state!=='playing'||reached>=6)break;
  if(Math.hypot(corners[corner].x-f.p.x,corners[corner].y-f.p.y)<25)corner=(corner+1)%4;
  let target=corners[corner];if(f.ammo<15&&f.crates.length)target=f.crates.reduce((a,b)=>Math.hypot(a.x-f.p.x,a.y-f.p.y)<Math.hypot(b.x-f.p.x,b.y-f.p.y)?a:b);
  let dx=target.x-f.p.x,dy=target.y-f.p.y;const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
  for(const z of f.z){const zx=f.p.x-z.pos.x,zy=f.p.y-z.pos.y,zd=Math.hypot(zx,zy);if(zd<75){dx+=zx/(zd||1)*(75-zd)/25;dy+=zy/(zd||1)*(75-zd)/25;}}
  const next=new Set();if(dx>.2)next.add('KeyD');if(dx<-.2)next.add('KeyA');if(dy>.2)next.add('KeyS');if(dy<-.2)next.add('KeyW');for(const key of held)if(!next.has(key))await page.keyboard.up(key);for(const key of next)if(!held.has(key))await page.keyboard.down(key);held=next;
  if(f.z.length){const z=f.z.reduce((a,b)=>Math.hypot(a.pos.x-f.p.x,a.pos.y-f.p.y)<Math.hypot(b.pos.x-f.p.x,b.pos.y-f.p.y)?a:b);await page.mouse.move(rect.x+z.pos.x/640*rect.width,rect.y+z.pos.y/400*rect.height);}
  await page.waitForTimeout(75);
 }
 for(const key of held)await page.keyboard.up(key);await page.keyboard.up('Space');await page.screenshot({path:path.join(evidence,'survival.png')});console.log(JSON.stringify({reached,types:[...types],last,elapsed:Date.now()-started}));assert.ok(reached>=4,'Pilot must clear the three introductory waves');assert.ok(last.score>0);assert.ok(last.peak>=7,'Ordinary kills unlocked shotgun');
 }finally{await browser.close();server.kill();}
});
