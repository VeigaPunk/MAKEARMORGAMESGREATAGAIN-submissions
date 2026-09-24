/** Offline production-browser acceptance. Controlled browser animation clock by default;
 * SHMUP_REALTIME=1 uses normal wall-clock time. No health/entity/progression/save
 * or collision writes. Read-only observer; default browser KeyboardEvents
 * (isTrusted=false) through production Input; SHMUP_NATIVE=1 uses native keys.
 * Controlled animation callbacks run at 20 Hz with unchanged 120 Hz physics. */
import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import {browserPath,browserArgs} from '../../../../../../tooling/browser.mjs';
import { installBrowserClock } from './browser-clock.mjs';
import { installEventPilot } from './event-pilot.mjs';

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const chromiumPath = browserPath();
const mime = {'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.css':'text/css'};
const server = http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url,'http://local'), segments=url.pathname.split('/').filter(Boolean), app=segments.shift();
    let root, file;
    if(process.env.SITE_ROOT) {
      root=path.resolve(process.env.SITE_ROOT);
      file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
      if(file===root)file=path.join(root,'index.html');
    } else {
      if (!['chicken-invaders','chicken-invaders-original'].includes(app)) throw new Error('bad path');
      root=path.join(base,'apps',app,'dist');
      file=path.resolve(root,segments.join('/')||'index.html');
    }
    if(!file.startsWith(root+path.sep)) throw new Error('bad path');
    if((await stat(file)).isDirectory()) file=path.join(file,'index.html');
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]??'application/octet-stream'});res.end(await readFile(file));
  } catch {res.writeHead(404);res.end('Not found');}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=process.env.ARCADE_URL ?? `http://127.0.0.1:${server.address().port}`;

async function run(app) {
 const browser=await chromium.launch({executablePath:chromiumPath,headless:true,args:browserArgs});
 const dir=path.join(base,'apps',app,'proofs','ship');await mkdir(dir,{recursive:true});
 const events=[],errors=[],network=[]; const start=Date.now(); let virtualMs=0; const controlled=process.env.SHMUP_REALTIME!=='1';
 try {
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  if(controlled)await page.addInitScript(installBrowserClock);
  const cdp=await page.context().newCDPSession(page);
  const capture=async file=>{const {data}=await cdp.send('Page.captureScreenshot',{format:'png'});await writeFile(file,Buffer.from(data,'base64'));};
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{if(route.request().url().startsWith(origin))return route.continue();network.push(route.request().url());return route.abort();});
  await page.goto(`${origin}/${app}/?debug`);await page.waitForFunction(()=>window.__maga);
  const scope=await page.evaluate(()=>({sectors:window.__maga.sim.pack.sectors.length,formations:window.__maga.sim.pack.sectors.reduce((n,s)=>n+s.waves.length,0)}));
  await capture(path.join(dir,'title.png'));
  await page.locator('#settings').click();await page.locator('#flight-motion').check();await page.locator('#flight-touch').selectOption('one');
  await capture(path.join(dir,'settings.png'));await page.locator('#flight-close').click();
  await page.reload();await page.waitForFunction(()=>window.__maga);
  assert.equal(await page.evaluate(()=>window.__maga.sim.reducedMotion),true);
  assert.equal(await page.evaluate(()=>window.__maga.touch.layout),'one');
  await page.locator('#mute').click();
  await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__maga.state.mode==='play');
  await page.keyboard.down('Space');
  if(controlled)await page.evaluate(()=>window.__shmupClock.pause());
  const advance=async(ms)=>{if(controlled){await page.evaluate(ms=>window.__shmupClock.pump(ms),ms);virtualMs+=ms;}else await page.waitForTimeout(ms);};
  let previous=new Map(),lastTime=0,lastPhase='',lastMissile=0,retries=0,held=new Set(['Space']);
  const keys=async wanted=>{for(const k of [...held])if(!wanted.has(k)){await page.keyboard.up(k);held.delete(k);}for(const k of wanted)if(!held.has(k)){await page.keyboard.down(k);held.add(k);}};
  const domPilot=controlled&&process.env.SHMUP_NATIVE!=='1';
  if(domPilot){
   await page.keyboard.up('Space');held.clear();await page.evaluate(installEventPilot);
   while(Date.now()-start<3600000){
    const batch=await page.evaluate(()=>window.__shmupPilot.run(30000));virtualMs=batch.virtualMs;retries=batch.retries;
    for(const entry of batch.events){events.push({elapsedMs:Date.now()-start,...entry});console.log(app,`${entry.mode}:${entry.chapter}:${entry.wave}`,'score',entry.score,'lives',entry.lives,'virtualSeconds',Math.round(virtualMs/1000));}
    const s=batch.state;await writeFile(path.join(dir,'progress.json'),JSON.stringify({complete:s.mode==='win',virtualMs,retries,elapsedMs:Date.now()-start,mode:s.mode,chapter:s.chapter,wave:s.wave,score:s.score,lives:s.lives}));
    if(batch.events.length&&(s.boss||[0,4,8,9].includes(s.wave)||s.mode==='win')){
     if(s.boss){const settle=await page.evaluate(()=>window.__shmupPilot.run(1300,false));events.push(...settle.events);virtualMs=settle.virtualMs;}
     await capture(path.join(dir,`${s.mode}-${s.chapter}-${s.boss?'boss':s.wave+1}.png`));
    }
    if(s.mode==='win')break;
   }
   await page.evaluate(()=>window.__shmupPilot.stop());
  } else {
  for (let frame=0;Date.now()-start<3600000;frame++) {
   const state=await page.evaluate(()=>{
    const s=window.__maga.sim;
    return {mode:s.mode,time:s.waveT,paused:s.paused,chapter:s.chapter,wave:s.waveIdx,total:s.wavesTotal,score:s.score,lives:s.lives,weapon:s.weaponLv,missiles:s.missileN,
     ship:{x:s.ship.x,y:s.ship.y,vx:s.ship.vx,vy:s.ship.vy,alive:s.ship.alive},
     targets:s.boss?[{id:'boss',x:s.boss.x,y:s.boss.y}]:s.chickens.map(c=>({id:`${c.bx}:${c.by}:${c.type}`,x:c.x,y:c.y})),
     boss:s.boss?{name:s.pack.bosses[s.boss.type].name,hp:s.boss.hp,max:s.boss.max,x:s.boss.x}:null,
     eggs:s.eggs.map(e=>({x:e.x,y:e.y,vx:e.vx,vy:e.vy})),
     birds:s.chickens.map(c=>({x:c.x,y:c.y,dive:c.dive,dvx:c.dvx,dvy:c.dvy})),pickups:s.pickups.map(p=>({x:p.x,y:p.y,kind:p.kind})),lastDeath:s.lastDeath};
   });
   const phase=`${state.mode}:${state.chapter}:${state.wave}:${state.boss?'boss':'wave'}`;
   if(phase!==lastPhase){events.push({elapsedMs:Date.now()-start,...state,targets:state.targets.length,eggs:state.eggs.length,birds:state.birds.length,pickups:state.pickups.length});console.log(app,phase,'score',state.score,'lives',state.lives,'virtualSeconds',Math.round(virtualMs/1000));lastPhase=phase;await writeFile(path.join(dir,'progress.json'),JSON.stringify({complete:false,virtualMs,retries,elapsedMs:Date.now()-start,phase,score:state.score,lives:state.lives}));
    if(state.boss||[0,4,9].includes(state.wave)||state.mode==='win')await capture(path.join(dir,`${state.mode}-${state.chapter}-${state.boss?'boss':state.wave+1}.png`));
   }
   if(state.mode==='win'){assert.equal(state.chapter,scope.sectors);assert.ok(state.lives>0);break;}
   if(state.mode==='gameover'){if(++retries>30)throw new Error(`pilot exhausted retries: ${JSON.stringify(state.lastDeath)}`);await keys(new Set());await page.keyboard.press('Enter');await advance(100);await page.keyboard.press('KeyC');await advance(100);previous.clear();continue;}
   if(state.paused)throw new Error('unexpected pause');
   if(state.mode!=='play'){await advance(160);continue;}
   const now=controlled?virtualMs:Date.now(),dt=state.time>lastTime?Math.max(.025,state.time-lastTime):.1;lastTime=state.time;
   let targetX=480,targetCost=Infinity;const next=new Map();
   for(const t of state.targets){const old=previous.get(t.id);const vx=old===undefined?0:(t.x-old)/dt;next.set(t.id,t.x);const hitTime=Math.max(0,(state.ship.y-t.y)/560);const lead=Math.max(30,Math.min(930,t.x+vx*hitTime));const cost=Math.abs(lead-state.ship.x);if(cost<targetCost){targetCost=cost;targetX=lead;}}
   previous=next;
   const pickup=state.pickups.filter(p=>p.y>260&&(p.kind==='gift'?state.weapon<2:state.missiles<5)).sort((a,b)=>b.y-a.y)[0];if(pickup)targetX=pickup.x;
   let bestX=state.ship.x,bestCost=Infinity;
   for(let x=30;x<=930;x+=15){
    let cost=Math.abs(x-targetX)*.16+Math.abs(x-state.ship.x)*.07;
    for(const egg of state.eggs){const t=(state.ship.y-egg.y)/egg.vy;if(t<-.1||t>1.7)continue;const ex=egg.x+egg.vx*Math.max(0,t);cost+=Math.max(0,70-Math.abs(x-ex))*(1.85-Math.max(0,t))*7;}
    for(const bird of state.birds){const t=bird.dive?(state.ship.y-bird.y)/bird.dvy:0;const bx=bird.x+(bird.dive?bird.dvx*Math.max(0,t):0);if(Math.abs(bird.y-state.ship.y)<95||(bird.dive&&t>0&&t<1.5))cost+=Math.max(0,90-Math.abs(bx-x))*14;}
    if(cost<bestCost){bestCost=cost;bestX=x;}
   }
   const dx=bestX-state.ship.x-state.ship.vx*.13,dy=485-state.ship.y-state.ship.vy*.13;
   const wanted=new Set(['Space']);if(dx>10)wanted.add('ArrowRight');else if(dx< -10)wanted.add('ArrowLeft');if(dy>10)wanted.add('ArrowDown');else if(dy< -10)wanted.add('ArrowUp');await keys(wanted);
   if(state.boss&&Math.abs(state.boss.x-state.ship.x)<65&&state.missiles>0&&now-lastMissile>500){await page.keyboard.press('KeyX');lastMissile=now;}
   await advance(controlled?100:70);
  }
  }
  await keys(new Set());
  if(controlled)await page.evaluate(()=>window.__shmupClock.resume());
  const final=await page.evaluate(()=>window.__maga.state);assert.equal(final.mode,'win');
  await capture(path.join(dir,'victory.png'));
  assert.equal(new Set(events.filter(e=>e.boss).map(e=>e.chapter)).size,scope.sectors);assert.equal(new Set(events.filter(e=>e.mode==='play'&&!e.boss).map(e=>`${e.chapter}:${e.wave}`)).size,scope.formations);
  await page.keyboard.press('Enter');await page.reload();await page.waitForFunction(()=>window.__maga);
  const restored=await page.evaluate(()=>window.__maga.state);assert.equal(restored.best,final.score);assert.equal(restored.unlocked,scope.sectors);
  await page.keyboard.press('Digit2');await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__maga.state.chapter===2&&window.__maga.state.mode==='play');
  await page.locator('#pause').click();const paused=await page.evaluate(()=>({x:window.__maga.state.shipX,score:window.__maga.state.score}));await page.waitForTimeout(300);assert.deepEqual(await page.evaluate(()=>({x:window.__maga.state.shipX,score:window.__maga.state.score})),paused);await page.keyboard.press('Escape');
  await page.reload();await page.waitForFunction(()=>window.__maga);await page.keyboard.press('KeyC');await page.waitForFunction(()=>window.__maga.state.mode==='play');assert.equal(await page.evaluate(()=>window.__maga.state.chapter),2);
  await writeFile(path.join(dir,'campaign.json'),JSON.stringify({method:domPilot?'Browser KeyboardEvents (isTrusted=false) through production Input handlers; native keyboard/menu smoke separately; read-only observation; controlled rAF/performance clock at 20 Hz, 120 Hz production physics; no game-state writes; all external requests blocked':controlled?'Native keyboard events; read-only observation; controlled rAF/performance clock; no game-state writes; all external requests blocked':'Real keyboard events; read-only observation; normal wall-clock runtime; all external requests blocked',virtualMs,retries,elapsedMs:Date.now()-start,final,restored,errors,externalRequests:network,events},null,2));
  assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
 } finally {await browser.close();}
}

try {await Promise.all((process.env.SHMUP_APP?[process.env.SHMUP_APP]:['chicken-invaders','chicken-invaders-original']).map(run));}
finally{await new Promise(r=>server.close(r));}
