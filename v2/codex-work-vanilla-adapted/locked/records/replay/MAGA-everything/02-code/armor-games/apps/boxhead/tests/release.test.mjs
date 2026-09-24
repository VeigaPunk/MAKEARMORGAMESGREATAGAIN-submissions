import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {chromium} from '@playwright/test';import path from 'node:path';import {fileURLToPath} from 'node:url';import {mkdir} from 'node:fs/promises';
const pagePath=process.env.SITE_ROOT?'/boxhead/':'/';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../../../..');
const evidence=process.env.EVIDENCE_DIR??path.join(root,'ship-records/evidence/boxhead');
const executablePath=process.env.CHROMIUM_PATH??'/root/.cache/magga/chrome-headless-shell-linux64/chrome-headless-shell';

test('real controls: corrupt preferences, all rooms, local co-op, armory, touch and retry',async()=>{
 const server=spawn(process.execPath,[process.env.HOST_SCRIPT??path.join(root,'tooling/deadlock-host.mjs')],{env:{...process.env,HOST:'127.0.0.1',PORT:'4319',DEADLOCK_ROOT:process.env.SITE_ROOT??path.join(root,'MAGA-everything/02-code/armor-games/apps/boxhead/dist')},stdio:'pipe'});await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);});
 const browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  await mkdir(evidence,{recursive:true});const page=await browser.newPage({viewport:{width:1280,height:800}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  // Fault-injection preference boot check; gameplay below uses real keyboard/touch inputs only.
  await page.addInitScript(()=>{localStorage.setItem('maga:boxhead:keymaps','null');localStorage.setItem('maga:boxhead:highscore','null');});
  await page.goto(`http://127.0.0.1:4319${pagePath}?debug`);await page.waitForFunction(()=>window.__maga);await page.locator('#settings').click();assert.equal(await page.locator('#key-bindings button').count(),13);await page.locator('#settings-close').click();
  await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__maga.game.state==='mode');await page.keyboard.press('Digit1');await page.waitForFunction(()=>window.__maga.game.state==='room');await page.screenshot({path:path.join(evidence,'rooms.png')});
  const roomIds=[];
  for(let i=1;i<=6;i++){
   await page.keyboard.press('Digit'+i);await page.waitForFunction(()=>window.__maga.game.state==='playing');roomIds.push(await page.evaluate(()=>window.__maga.game.room.id));
   await page.keyboard.press('Escape');await page.waitForFunction(()=>window.__maga.game.state==='paused');await page.keyboard.press('KeyM');await page.waitForFunction(()=>window.__maga.game.state==='mode');await page.keyboard.press('Digit1');await page.waitForFunction(()=>window.__maga.game.state==='room');
  }
  assert.equal(new Set(roomIds).size,6);
  await page.keyboard.press('KeyM');await page.waitForFunction(()=>window.__maga.game.state==='mode');await page.keyboard.press('Digit2');await page.waitForFunction(()=>window.__maga.game.state==='room');await page.keyboard.press('Digit1');await page.waitForFunction(()=>window.__maga.game.state==='playing');
  const before=await page.evaluate(()=>window.__maga.game.slots.map(s=>({...s.p.pos})));
  await page.keyboard.down('KeyD');await page.keyboard.down('ArrowDown');await page.keyboard.down('Space');await page.keyboard.down('KeyL');await page.waitForFunction(()=>window.__maga.game.slots[0].p.pos.x>365&&window.__maga.game.slots[1].p.pos.y>245);
  for(const key of ['KeyD','ArrowDown','Space','KeyL'])await page.keyboard.up(key);
  const coop=await page.evaluate(()=>({positions:window.__maga.game.slots.map(s=>s.p.pos),bullets:window.__maga.game.bullets.length}));assert.ok(coop.positions[0].x>before[0].x&&coop.positions[1].y>before[1].y);assert.ok(coop.bullets>0);
  await page.screenshot({path:path.join(evidence,'local-coop.png')});await page.keyboard.press('Escape');await page.waitForFunction(()=>window.__maga.game.state==='paused');await page.keyboard.press('KeyM');await page.waitForFunction(()=>window.__maga.game.state==='mode');await page.keyboard.press('Digit3');await page.waitForFunction(()=>window.__maga.game.state==='room');await page.keyboard.press('Digit1');await page.waitForFunction(()=>window.__maga.game.state==='playing');
  const rect=await page.locator('canvas').boundingBox();await page.mouse.move(rect.x+560/640*rect.width,rect.y+200/400*rect.height);
  const arsenal=[];
  for(let i=1;i<=8;i++){await page.keyboard.press('Digit'+i);await page.waitForTimeout(100);await page.keyboard.down('Space');await page.waitForTimeout(900);await page.keyboard.up('Space');arsenal.push(await page.evaluate(()=>({weapon:window.__maga.game.slots[0].weapon,ammo:window.__maga.game.player.ammo,bullets:window.__maga.game.bullets.map(b=>({mine:b.mine,grenade:b.grenade,pierce:b.pierce,damage:b.damage,blast:b.blastRadius}))})));}
  assert.deepEqual(arsenal.map(a=>a.weapon),[0,1,2,3,4,5,6,7]);assert.ok(arsenal[3].bullets.some(b=>b.mine));assert.ok(arsenal[6].bullets.some(b=>b.damage===4));assert.ok(arsenal[7].bullets.some(b=>b.blast===88));
  await page.locator('#settings').click();await page.locator('#armory').click();await page.screenshot({path:path.join(evidence,'armory.png')});await page.keyboard.press('Escape');assert.equal(await page.locator('#settings-dialog').evaluate(d=>d.open),true);assert.equal(await page.evaluate(()=>window.__maga.game.state),'paused');await page.locator('#exit-game').click();
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));await phone.goto(`http://127.0.0.1:4319${pagePath}?debug`);await phone.waitForFunction(()=>window.__maga);
  const r=await phone.locator('canvas').boundingBox(),point=(x,y)=>({x:r.x+x*r.width/640,y:r.y+y*r.height/400});
  for(const [x,y,state] of [[320,255,'mode'],[300,160,'room'],[165,130,'playing']]){const p=point(x,y);await phone.touchscreen.tap(p.x,p.y);await phone.waitForFunction(state=>window.__maga.game.state===state,state);}
  const cdp=await mobile.newCDPSession(phone),stick=point(78,326),fire=point(574,330),end=point(110,326);
  const pos=await phone.evaluate(()=>window.__maga.game.player.pos.x);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...stick,id:0},{...fire,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...end,id:0},{...fire,id:1}]});await phone.waitForFunction(x=>window.__maga.game.player.pos.x>x+25,pos);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await phone.waitForFunction(()=>window.__maga.touch.stick===null&&!window.__maga.touch.fire);await phone.screenshot({path:path.join(evidence,'touch.png')});
  await phone.locator('#pause').tap();await phone.waitForFunction(()=>window.__maga.game.state==='paused');await phone.locator('#pause').tap();await phone.waitForFunction(()=>window.__maga.game.state==='playing');
  // Let the real swarm defeat the stationary player, then use a real tap to retry.
  await phone.waitForFunction(()=>window.__maga.game.state==='dead',null,{timeout:75000});const deadPoint=point(320,230);await phone.touchscreen.tap(deadPoint.x,deadPoint.y);await phone.waitForFunction(()=>window.__maga.game.state==='playing');assert.equal(await phone.evaluate(()=>window.__maga.game.player.hp),100);
  assert.deepEqual(errors,[]);console.log(JSON.stringify({roomIds,coop,weapons:arsenal.map(a=>a.weapon),touchRetry:true,corruptPreferences:true,errors}));
 }finally{await browser.close();server.kill();}
});
