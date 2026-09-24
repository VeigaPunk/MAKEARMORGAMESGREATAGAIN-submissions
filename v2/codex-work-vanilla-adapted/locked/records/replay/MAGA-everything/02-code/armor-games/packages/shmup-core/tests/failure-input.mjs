/** Native real-time failure/retry gate. Fresh browser contexts, normal rAF and
 * performance clocks, real Playwright keyboard events, read-only __maga queries.
 * No gameplay/state/save/clock mutation; no shooting or missile commands.
 * CDP focus emulation prevents headless focus loss from pausing the application.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from '@playwright/test';
import { serve } from '../../../../../../arcade/serve.mjs';
import { browserPath, browserArgs } from '../../../../../../tooling/browser.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../../../..');
const siteRoot=path.resolve(process.env.SITE_ROOT??path.join(root,'delivery/site'));
const evidence=path.resolve(process.env.EVIDENCE_DIR??path.join(root,'ship-records/evidence/shooters-failure'));
const apps=process.env.SHMUP_APP?[process.env.SHMUP_APP]:['chicken-invaders','chicken-invaders-original'];
assert.ok(apps.every(app=>['chicken-invaders','chicken-invaders-original'].includes(app)),'Unknown shooter app');
const server=serve(siteRoot,{host:'127.0.0.1',port:0});
await new Promise((resolve,reject)=>{server.once('listening',resolve);server.once('error',reject);});
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:browserPath(),headless:true,args:browserArgs});
const receipts=[];
try {
 for(const app of apps){
  const directory=path.join(evidence,app);await mkdir(directory,{recursive:true});
  const context=await browser.newContext({viewport:{width:1280,height:800}});
  const page=await context.newPage();page.setDefaultTimeout(20000);
  const cdp=await context.newCDPSession(page);
  await cdp.send('Emulation.setFocusEmulationEnabled',{enabled:true});
  const started=Date.now(),errors=[],external=[],inputs=[],losses=[];let held=new Set();
  const receipt={app,siteRoot,method:'Native Playwright keyboard events, normal browser wall clock/rAF, fresh context; read-only __maga telemetry; no gameplay, save or clock writes; CDP focus emulation only; no fire/missile commands',viewport:{width:1280,height:800},inputs,losses,errors,externalRequests:external,pass:false};
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{const url=route.request().url();if(url.startsWith(origin+'/'))return route.continue();external.push(url);return route.abort();});
  const key=async(type,code)=>{inputs.push({elapsedMs:Date.now()-started,type,code});await page.keyboard[type](code);};
  const press=async code=>{inputs.push({elapsedMs:Date.now()-started,type:'press',code});await page.keyboard.press(code);};
  const steer=async wanted=>{for(const code of held)if(!wanted.has(code))await key('up',code);for(const code of wanted)if(!held.has(code))await key('down',code);held=wanted;};
  const capture=async name=>{const shot=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true});await writeFile(path.join(directory,name+'.png'),Buffer.from(shot.data,'base64'));};
  const state=()=>page.evaluate(()=>{const g=window.__maga,s=g.sim;return{...g.state,time:s.waveT,ship:{x:s.ship.x,y:s.ship.y,vx:s.ship.vx,vy:s.ship.vy,alive:s.ship.alive,invuln:s.ship.invuln},eggsDetailed:s.eggs.map(e=>({x:e.x,y:e.y,vx:e.vx,vy:e.vy})),chickensDetailed:s.chickens.map(c=>({x:c.x,y:c.y,dive:c.dive,dvx:c.dvx,dvy:c.dvy})),fireHeld:s.fireHeld,bullets:s.bullets.length,missilesFlying:s.missiles.length};});
  try{
   const html=await readFile(path.join(siteRoot,app,'index.html'));
   const entry=html.toString().match(/src="([^\"]+\.js)"/);
   receipt.build={indexSha256:createHash('sha256').update(html).digest('hex'),entry:entry?.[1]??null};
   if(entry){const js=await readFile(path.resolve(siteRoot,app,entry[1].replace(/^\.\//,'')));receipt.build.entrySha256=createHash('sha256').update(js).digest('hex');}
   await page.goto(`${origin}/${app}/?debug`);await page.waitForFunction(()=>window.__maga);
   assert.equal((await state()).mode,'title');
   await press('Enter');await page.waitForFunction(()=>window.__maga.state.mode==='play');
   const initial=await state();assert.equal(initial.lives,3);assert.equal(initial.score,0);receipt.initial=initial;
   let previousLives=initial.lives,last;
   const limit=Number(process.env.FAILURE_TIMEOUT_MS??180000);
   while(Date.now()-started<limit){
    const s=await state();last=s;
    assert.equal(s.paused,false,'Unexpected focus pause during native failure run');
    assert.equal(s.fireHeld,false,'No fire input may remain held');
    assert.equal(s.missilesFlying,0,'No missile command was sent');
    if(s.lives<previousLives){losses.push({elapsedMs:Date.now()-started,from:previousLives,to:s.lives,cause:s.lastDeath,ship:s.ship});console.log(app,'lost life',s.lives,JSON.stringify(s.lastDeath));previousLives=s.lives;}
    if(s.mode==='gameover')break;
    assert.equal(s.mode,'play','No-fire loss pilot should stay in the opening wave');
    if(!s.ship.alive){await steer(new Set());await page.waitForTimeout(90);continue;}
    // Intentionally intercept a real falling egg in the legal flight lane.
    // The predictor observes entity velocities; it never changes them.
    const targetY=350;let targetX=480,cost=Infinity;
    for(const egg of s.eggsDetailed){
      const t=(targetY-egg.y)/egg.vy;
      if(t<-.08||t>3.2)continue;
      const x=egg.x+egg.vx*Math.max(0,t);if(x<25||x>935)continue;
      const reach=Math.abs(x-s.ship.x)/340;
      const c=Math.max(0,reach-t)*4+t*.2+reach*.15;
      if(c<cost){cost=c;targetX=x;}
    }
    // If a diving body has already entered the lane, collide with it as well.
    for(const bird of s.chickensDetailed)if(bird.y>300&&bird.y<500){const d=Math.hypot(bird.x-s.ship.x,bird.y-s.ship.y)/340;if(d<cost){cost=d;targetX=bird.x;}}
    const dx=targetX-s.ship.x-s.ship.vx*.12,dy=targetY-s.ship.y-s.ship.vy*.12;
    const wanted=new Set();if(dx>6)wanted.add('ArrowRight');else if(dx< -6)wanted.add('ArrowLeft');if(dy>6)wanted.add('ArrowDown');else if(dy< -6)wanted.add('ArrowUp');
    await steer(wanted);await page.waitForTimeout(70);
   }
   await steer(new Set());
   assert.equal(last.mode,'gameover',`Natural loss timeout: ${JSON.stringify(last)}`);assert.equal(last.lives,0);assert.deepEqual(losses.map(l=>l.to),[2,1,0]);assert.ok(losses.every(l=>['egg','chicken','boss'].includes(l.cause?.cause)));
   receipt.gameover=last;await capture('gameover');
   // Different supported native confirmation keys exercise both end-screen routes.
   const confirmKey=app==='chicken-invaders'?'Enter':'KeyR';await press(confirmKey);await page.waitForFunction(()=>window.__maga.state.mode==='title');
   receipt.hangar=await state();receipt.confirmKey=confirmKey;await capture('hangar');
   await press('Enter');await page.waitForFunction(()=>window.__maga.state.mode==='play');
   const retry=await state();assert.equal(retry.lives,3);assert.equal(retry.score,0);assert.equal(retry.shipAlive,true);assert.equal(retry.wave,1);assert.equal(retry.chapter,1);assert.equal(retry.lastDeath,null);assert.equal(retry.paused,false);
   receipt.retry=retry;await capture('retry');
   assert.deepEqual(errors,[]);assert.deepEqual(external,[]);receipt.pass=true;receipt.elapsedMs=Date.now()-started;
   console.log(app,'NATIVE FAILURE/RETRY PASS',receipt.elapsedMs+'ms');
  }catch(error){receipt.failure=String(error);receipt.elapsedMs=Date.now()-started;try{receipt.lastState=await state();await capture('failure');}catch{}throw error;}
  finally{await steer(new Set()).catch(()=>{});await writeFile(path.join(directory,'failure-retry.json'),JSON.stringify(receipt,null,2));receipts.push(receipt);await context.close();}
 }
}finally{
 await browser.close();await new Promise(resolve=>server.close(resolve));await mkdir(evidence,{recursive:true});await writeFile(path.join(evidence,'results.json'),JSON.stringify({pass:receipts.length===apps.length&&receipts.every(r=>r.pass),siteRoot,receipts:receipts.map(r=>({app:r.app,pass:r.pass,elapsedMs:r.elapsedMs,losses:r.losses,build:r.build,errors:r.errors,externalRequests:r.externalRequests}))},null,2));
}
