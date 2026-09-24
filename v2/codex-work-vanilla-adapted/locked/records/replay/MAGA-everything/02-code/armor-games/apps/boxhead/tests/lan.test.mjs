import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {chromium} from '@playwright/test';import path from 'node:path';import {fileURLToPath} from 'node:url';import {mkdir} from 'node:fs/promises';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../../../..');
const executablePath=process.env.CHROMIUM_PATH??'/root/.cache/magga/chrome-headless-shell-linux64/chrome-headless-shell';
const pagePath=process.env.SITE_ROOT?'/boxhead/':'/';
const evidence=process.env.EVIDENCE_DIR??path.join(root,'ship-records/evidence/boxhead');

test('two real LAN clients: lobby, movement, shots, pause, reconnect, deathmatch and leave',async()=>{
 const server=spawn(process.execPath,[process.env.HOST_SCRIPT??path.join(root,'tooling/deadlock-host.mjs')],{env:{...process.env,HOST:'127.0.0.1',PORT:'4318',DEADLOCK_ROOT:process.env.SITE_ROOT??path.join(root,'MAGA-everything/02-code/armor-games/apps/boxhead/dist')},stdio:'pipe'});
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',c=>reject(new Error('Host exited '+c)));});
 const browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  await mkdir(evidence,{recursive:true});
  const a=await browser.newContext({viewport:{width:1280,height:800}}),b=await browser.newContext({viewport:{width:1280,height:800}});
  const p1=await a.newPage(),p2=await b.newPage(),errors=[];for(const p of [p1,p2])p.on('pageerror',e=>errors.push(e.message));
  await Promise.all([p1.goto(`http://127.0.0.1:4318${pagePath}?debug`),p2.goto(`http://127.0.0.1:4318${pagePath}?debug`)]);
  await Promise.all([p1.waitForFunction(()=>window.__maga),p2.waitForFunction(()=>window.__maga)]);
  await p1.screenshot({path:path.join(evidence,'title.png')});
  await p1.locator('#lan').click();await p1.locator('#lan-create').click();await p1.waitForFunction(()=>document.getElementById('lan-status').textContent.includes('You are P1'));
  const code=(await p1.locator('#lan-status').textContent()).match(/ROOM ([A-F0-9]{6})/)[1];
  await p2.locator('#lan').click();await p2.locator('#lan-code').fill(code);await p2.locator('#lan-join').click();
  await p1.waitForFunction(()=>!document.getElementById('lan-start').disabled);await p1.locator('#lan-start').click();
  await Promise.all([p1.waitForFunction(()=>window.__maga.game.state==='playing'),p2.waitForFunction(()=>window.__maga.game.state==='playing')]);
  assert.notEqual(await p2.evaluate(()=>window.__maga.game.sfx.musicTimer),null,'Guest music starts with the match');
  const before=await p1.evaluate(()=>window.__maga.game.slots.map(s=>({...s.p.pos})));
  await p1.keyboard.down('KeyD');await p2.keyboard.down('KeyS');await p1.keyboard.down('Space');await p2.keyboard.down('Space');await p1.waitForFunction(()=>window.__maga.game.slots[0].p.pos.x>385&&window.__maga.game.slots[1].p.pos.y>250);
  await p1.keyboard.up('KeyD');await p2.keyboard.up('KeyS');await p1.keyboard.up('Space');await p2.keyboard.up('Space');await p1.waitForFunction(()=>window.__maga.game.remote?.axis.y===0);
  const after=await p1.evaluate(()=>window.__maga.game.slots.map(s=>({...s.p.pos})));await p2.waitForFunction(y=>Math.abs(window.__maga.game.slots[1].p.pos.y-y)<4,after[1].y);const guest=await p2.evaluate(()=>window.__maga.game.slots.map(s=>({...s.p.pos})));
  assert.ok(after[0].x>before[0].x+50,JSON.stringify({before,after}));assert.ok(after[1].y>before[1].y+40,JSON.stringify({before,after}));assert.ok(Math.abs(after[1].y-guest[1].y)<4);
  await p1.screenshot({path:path.join(evidence,'lan-host.png')});await p2.screenshot({path:path.join(evidence,'lan-guest.png')});
  await p2.keyboard.press('Escape');await p1.waitForFunction(()=>window.__maga.game.state==='paused');await p2.waitForFunction(()=>window.__maga.game.state==='paused');assert.equal(await p2.evaluate(()=>window.__maga.game.sfx.musicTimer),null,'Guest music stops on shared pause');
  await p2.locator('#settings').click();await p2.waitForTimeout(200);assert.equal(await p1.evaluate(()=>window.__maga.game.state),'paused');await p2.locator('#settings-close').click();
  await p1.keyboard.press('Escape');await p1.waitForFunction(()=>window.__maga.game.state==='playing');await p2.waitForFunction(()=>window.__maga.game.state==='playing'&&window.__maga.game.sfx.musicTimer!==null);
  const resumedMusic=await p2.evaluate(()=>window.__maga.game.sfx.musicTimer);await p2.waitForTimeout(250);assert.equal(await p2.evaluate(()=>window.__maga.game.sfx.musicTimer),resumedMusic,'Snapshots must not restart the music loop');
  // A real transport outage freezes the host; the EventSource reconnects the same authenticated client.
  await b.setOffline(true);await p1.waitForFunction(()=>window.__maga.game.networkBlocked);await b.setOffline(false);await p1.waitForFunction(()=>!window.__maga.game.networkBlocked,{timeout:10000});
  // Host changes mode through the actual lobby UI; both clients keep their identity.
  await p1.locator('#lan').click();await p1.locator('#lan-mode').selectOption('deathmatch');await p1.locator('#lan-start').click();
  await p2.waitForFunction(()=>window.__maga.game.mode==='deathmatch');
  // P1 aims left at P2, held fire is ordinary input; no state injection.
  const rect=await p1.locator('canvas').boundingBox();await p1.mouse.move(rect.x+220/640*rect.width,rect.y+200/400*rect.height);await p1.keyboard.press('Digit7');await p1.keyboard.down('Space');
  try{await p1.waitForFunction(()=>window.__maga.game.slots[0].kills>=5,null,{timeout:80000});}catch(e){console.log('DM timeout',await p1.evaluate(()=>({frame:window.__maga.game.capture(),blocked:window.__maga.game.networkBlocked,remoteAge:performance.now()-window.__maga.game.remote.at,fire:window.__maga.input.isDown('fire')})));throw e;}await p1.keyboard.up('Space');
  await p2.waitForFunction(()=>window.__maga.game.state==='victory');assert.equal(await p2.evaluate(()=>window.__maga.game.sfx.musicTimer),null,'Guest music stops on victory');const dm=await p1.evaluate(()=>({kills:window.__maga.game.slots.map(s=>s.kills),hp:window.__maga.game.slots.map(s=>s.p.hp)}));
  await p1.screenshot({path:path.join(evidence,'lan-deathmatch.png')});
  // Idle legal players are naturally overrun in co-op; verify the other ending and guest retry.
  await p1.locator('#lan').click();await p1.locator('#lan-mode').selectOption('coop');await p1.locator('#lan-start').click();await p2.waitForFunction(()=>window.__maga.game.mode==='coop'&&window.__maga.game.state==='playing');
  assert.notEqual(await p2.evaluate(()=>window.__maga.game.sfx.musicTimer),null,'Guest music resumes for a new run');
  await p2.waitForFunction(()=>window.__maga.game.state==='dead',null,{timeout:100000});assert.equal(await p2.evaluate(()=>window.__maga.game.sfx.musicTimer),null,'Guest music stops on natural defeat');
  await p2.screenshot({path:path.join(evidence,'lan-coop-defeat.png')});
  await p2.keyboard.press('Space');await p2.waitForFunction(()=>window.__maga.game.state==='playing'&&window.__maga.game.sfx.musicTimer!==null);
  await p2.locator('#lan').click();await p2.locator('#lan-leave').click();await p1.waitForFunction(()=>window.__maga.game.networkRole===null);
  assert.deepEqual(errors,[]);console.log(JSON.stringify({room:code,before,after,guest,dm,guestMusic:{pause:true,resume:true,stableLoop:true,victory:true,naturalDefeat:true,retry:true},errors}));
 }finally{await browser.close();server.kill();}
});
