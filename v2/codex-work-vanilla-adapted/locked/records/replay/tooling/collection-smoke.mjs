#!/usr/bin/env node
/** Independent nested-path production smoke. Player actions only; debug hooks
 * are read-only observations. Does not build, change saves, or modify games.
 * SITE_ROOT=/path/to/site SCREENSHOT_DIR=/path/to/evidence node tooling/collection-smoke.mjs
 */
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { once } from 'node:events';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { browserPath, browserArgs } from './browser.mjs';
import { serve } from '../arcade/serve.mjs';

const repository = fileURLToPath(new URL('..', import.meta.url));
const site = path.resolve(process.env.SITE_ROOT || path.join(repository, 'dist'));
const output = path.resolve(process.env.SCREENSHOT_DIR || path.join(repository, 'verification/evidence/collection-smoke'));
const mount = '/release/check/';
const fullPages = process.env.FULL_PAGE === '1';
const filters = (process.env.FILTER || '').split(',').map(x => x.trim()).filter(Boolean);
const selected = (slug, device) => !filters.length || filters.some(f => f === slug || f === `${slug}:${device}`);
const games = [
  ['boxhead', 'Deadlock Rooms'], ['impossible', 'Pulsebound'],
  ['burger-tycoon', 'Burger Tycoon'], ['chicken-invaders', 'Starfall Flock'],
  ['chicken-invaders-original', 'Cluck Horizon'], ['swords-and-sandals', 'Crown & Sand'],
  ['hardest', 'Vector Vault'],
];
const expectedCases = games.reduce((n, [slug]) => n + ['desktop','mobile'].filter(device => selected(slug, device)).length, 0);
const report = { running:true, fullPages, filters, expectedCases, started: new Date().toISOString(), site, mount, browser: browserPath(), method: 'Fresh browser contexts; real click/tap/keyboard/CDP touch input; read-only game state; nested static hosting. No outcome or progress injection.', manifest: null, launcher: [], cases: [], failures: [] };
await mkdir(output, { recursive: true });
let server, browser;
const recordFailure = (label, error) => { const message = `${label}: ${error.message || error}`; report.failures.push(message); console.error(`FAIL ${message}`); };
const press = async (page, locator, mobile) => { if (mobile) await locator.tap(); else await locator.click(); };
async function state(page, slug) {
  return page.evaluate(slug => {
    const h = window.__hardest, m = window.__maga;
    if (slug === 'hardest') { const s=h.state();return { mode:s.screen, paused:s.screen==='pause', time:s.time, level:s.level, deaths:s.deaths }; }
    if (slug === 'boxhead') { const mode=m.game.status();return { mode, paused:mode==='paused', x:mode==='playing'||mode==='paused'?m.game.player.pos.x:null, y:mode==='playing'||mode==='paused'?m.game.player.pos.y:null }; }
    if (slug === 'impossible') return { mode:m.screen,paused:m.paused,x:m.x,y:m.y,progress:m.progress };
    if (slug === 'burger-tycoon') return { mode:m.paused?'paused':'play',paused:m.paused,time:m.sim.s.t,cash:m.sim.s.cash,crops:m.sim.s.crops };
    if (slug === 'swords-and-sandals') return { mode:m.mode,paused:m.snapshot?.paused??false,hp:m.hp,opponentHp:m.opponentHp,round:m.snapshot?.combat?.round };
    const s=m.state;return {mode:s.mode,paused:s.paused,x:s.shipX,y:s.shipY,alive:s.shipAlive,lives:s.lives,score:s.score};
  }, slug);
}
async function waitMode(page, slug, wanted) {
  const limit = Date.now()+8000;let s;
  while(Date.now()<limit){s=await state(page,slug);if(wanted.includes(s.mode))return s;await page.waitForTimeout(80);}
  throw Error(`Expected ${wanted.join('/')} but saw ${JSON.stringify(s)}`);
}
async function canvasPoint(page,x,y,w,h) {
  const r=await page.locator('canvas:visible').first().boundingBox();assert.ok(r,'Canvas has no visible bounding box');
  return {x:r.x+x/w*r.width,y:r.y+y/h*r.height};
}
async function stageTap(page,mobile,x,y,w,h) {
  const p=await canvasPoint(page,x,y,w,h);if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);
}
async function touchDrag(page,x,y,dx,dy,w,h,hold=250,accepted=null) {
  const p=await canvasPoint(page,x,y,w,h),q=await canvasPoint(page,x+dx,y+dy,w,h);
  const cdp=await page.context().newCDPSession(page);
  try {await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:q.x,y:q.y}]});if(accepted)await accepted();else await page.waitForTimeout(hold);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}finally{await cdp.detach();}
}
async function waitForMovement(page,slug,before) {
  const expires=Date.now()+10000;let after;
  while(Date.now()<expires){after=await state(page,slug);if(Math.hypot(after.x-before.x,after.y-before.y)>1)return after;await page.waitForTimeout(50);}
  throw Error(`Movement input was not accepted: before=${JSON.stringify(before)}, after=${JSON.stringify(after)}`);
}
const deadline = (promise, ms, label) => { let timer; return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(`${label} timed out after ${ms}ms`)),ms);})]).finally(()=>clearTimeout(timer)); };
async function capture(page, file, canvasOnly = false) {
  const cdp=await page.context().newCDPSession(page);
  try {
    let clip;
    if(canvasOnly)clip=await page.locator('canvas:visible').first().evaluate(c=>{const r=c.getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,scale:1};});
    else {const m=await cdp.send('Page.getLayoutMetrics');const r=m.cssContentSize||m.contentSize;clip={x:0,y:0,width:r.width,height:r.height,scale:1};}
    assert.ok(clip.width>0&&clip.height>0,'Screenshot area is empty');
    if(canvasOnly)clip.scale=Math.min(1,640/clip.width);
    const shot=await deadline(cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:true,clip}),20000,`CDP screenshot ${path.basename(file)}`);
    await writeFile(file,Buffer.from(shot.data,'base64'));
  } finally {await deadline(cdp.detach(),2000,'CDP detach').catch(()=>{});}
}
async function resumeViaUI(page,slug,mobile) {
  const inside=slug==='burger-tycoon'?page.locator('#overlay').getByRole('button',{name:'Resume operations',exact:true})
    :slug==='impossible'?page.locator('#overlay').getByRole('button',{name:'Resume',exact:true})
    :slug==='hardest'?page.locator('#continue'):slug==='swords-and-sandals'?page.locator('#resume'):null;
  await press(page,inside&&await inside.isVisible()?inside:page.locator('#pause'),mobile);
}
async function startAndPlay(page,slug,mobile,result) {
  const canvas=page.locator('canvas:visible').first();
  if(slug==='boxhead'){
    await stageTap(page,mobile,320,255,640,400);await waitMode(page,slug,['mode']);
    await stageTap(page,mobile,320,160,640,400);await waitMode(page,slug,['room']);
    await stageTap(page,mobile,170,132,640,400);await waitMode(page,slug,['playing']);
    const before=await state(page,slug);
    if(mobile)await touchDrag(page,78,326,32,0,640,400,350);
    else {await canvas.focus();await page.keyboard.down('ArrowRight');await page.keyboard.down('Space');await page.waitForTimeout(350);await page.keyboard.up('ArrowRight');await page.keyboard.up('Space');}
    const moved=await state(page,slug);assert.notEqual(moved.x,before.x,`Deadlock movement did not move: before=${JSON.stringify(before)}, after=${JSON.stringify(moved)}`);await page.waitForTimeout(1000);
  }else if(slug==='chicken-invaders'||slug==='chicken-invaders-original'){
    await stageTap(page,mobile,480,352,960,540);await waitMode(page,slug,['play']);const before=await state(page,slug);
    if(mobile)await touchDrag(page,180,400,65,0,960,540,450,()=>waitForMovement(page,slug,before));
    else{await canvas.focus();await page.keyboard.down('ArrowRight');await page.keyboard.down('Space');try{await waitForMovement(page,slug,before);}finally{await page.keyboard.up('ArrowRight');await page.keyboard.up('Space');}}
    const after=await state(page,slug);result.input={kind:mobile?'held native touch drag':'held native ArrowRight and Space',before,after};assert.notEqual(after.x,before.x,`Ship movement did not move: before=${JSON.stringify(before)}, after=${JSON.stringify(after)}`);await page.waitForTimeout(350);
  }else if(slug==='impossible'){
    await press(page,page.getByRole('button',{name:'Start run',exact:true}),mobile);await waitMode(page,slug,['play']);
    const before=await state(page,slug);await page.waitForTimeout(150);
    if(mobile&&await page.locator('#jump').isVisible())await page.locator('#jump').tap();else{await canvas.focus();await page.keyboard.press('Space');}
    await page.waitForTimeout(220);const after=await state(page,slug);assert.ok(after.x>before.x,'Runner did not advance');assert.ok(after.mode==='play','Runner left gameplay unexpectedly');
  }else if(slug==='burger-tycoon'){
    await press(page,page.getByRole('button',{name:'Open for business',exact:true}),mobile);await waitMode(page,slug,['play']);
    const before=await state(page,slug);await press(page,page.locator('[data-action="farm-0"]'),mobile);await page.waitForTimeout(350);
    const after=await state(page,slug);assert.ok(after.time>before.time,'Economy clock did not advance');assert.ok(after.crops!==before.crops,'Plant soy did not change stock');
  }else if(slug==='swords-and-sandals'){
    await page.getByLabel('Gladiator name',{exact:true}).fill('Aurelia');
    for(let i=0;i<6;i++)await press(page,page.getByRole('button',{name:'Increase strength',exact:true}),mobile);
    await press(page,page.getByRole('button',{name:/^Enter the arena/}),mobile);
    await press(page,page.getByRole('button',{name:/^Start first bout/}),mobile);await waitMode(page,slug,['arena']);
    const before=await state(page,slug);await press(page,page.getByRole('button',{name:/^⚔ Attack/}),mobile);await page.waitForTimeout(520);
    const after=await state(page,slug);assert.ok(after.round>before.round,'Gladiator action did not advance the bout');
  }else{
    await press(page,page.locator('#play-level'),mobile);await waitMode(page,slug,['play']);const before=await state(page,slug);
    if(mobile)await touchDrag(page,480,288,48,0,960,576,300);
    else{await canvas.focus();await page.keyboard.down('ArrowRight');await page.waitForTimeout(300);await page.keyboard.up('ArrowRight');}
    assert.ok((await state(page,slug)).time>before.time,'Vault clock did not advance');
  }
  return state(page,slug);
}
async function pauseAndSettings(page,slug,mobile,result) {
  const pause=page.locator('#pause');
  if(await pause.count()&&await pause.isVisible()&&await pause.isEnabled()){
    await press(page,pause,mobile);await page.waitForTimeout(100);assert.equal((await state(page,slug)).paused,true,'Pause control did not pause');
    const before=await state(page,slug);await page.waitForTimeout(180);const after=await state(page,slug);
    if(before.time!==undefined)assert.equal(after.time,before.time,'Paused game clock advanced');
    await resumeViaUI(page,slug,mobile);await page.waitForTimeout(100);assert.equal((await state(page,slug)).paused,false,'Resume control did not resume');result.pause='pause/resume verified';
  }else result.pause='No real-time pause exposed (turn-based arena).';
  const settings=page.locator('#settings');
  if(await settings.count()&&await settings.isVisible()){
    await press(page,settings,mobile);await page.waitForTimeout(100);
    const range=page.locator('input[type="range"]:visible').first();await range.waitFor({state:'visible'});
    const old=await range.inputValue();await range.focus();await range.press(Number(old)>0?'ArrowLeft':'ArrowRight');assert.notEqual(await range.inputValue(),old,'Settings volume did not respond');
    if(['boxhead','hardest','burger-tycoon','chicken-invaders','chicken-invaders-original'].includes(slug))assert.equal((await state(page,slug)).paused,true,'Settings allowed active simulation');
    if(slug==='boxhead')await press(page,page.locator('#settings-close'),mobile);
    else if(slug==='hardest')await press(page,page.locator('#settings-dialog button[type="submit"]'),mobile);
    else if(slug==='impossible')await press(page,page.getByRole('button',{name:'Done',exact:true}),mobile);
    else if(slug==='burger-tycoon')await press(page,page.getByRole('button',{name:'Resume operations',exact:true}),mobile);
    else await press(page,page.locator('#flight-close'),mobile);
    await page.waitForTimeout(80);if((await state(page,slug)).paused&&await pause.count())await resumeViaUI(page,slug,mobile);
    result.settings='visible controls, adjustable volume, safe close verified';
  }else{
    const range=page.locator('input[type="range"]:visible').first();
    if(await range.count()){const old=await range.inputValue();await range.focus();await range.press(Number(old)>0?'ArrowLeft':'ArrowRight');assert.notEqual(await range.inputValue(),old);result.settings='Inline adjustable volume verified';}
    else throw Error('No settings or inline volume control exposed');
  }
}
function monitor(page,origin,result){
  page.on('pageerror',e=>result.errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')result.consoleErrors.push(m.text());});
  page.on('request',r=>{const u=new URL(r.url());if(['http:','https:'].includes(u.protocol)&&u.origin!==origin)result.external.push(r.url());});
  page.on('response',r=>{if(r.status()>=400)result.httpErrors.push(`${r.status()} ${r.url()}`);});
  page.on('requestfailed',r=>{if(!r.failure()?.errorText.includes('ERR_ABORTED'))result.failedRequests.push(`${r.url()}: ${r.failure()?.errorText}`);});
}
function assertNetwork(result){for(const k of ['errors','consoleErrors','external','httpErrors','failedRequests'])assert.deepEqual(result[k],[],`${k}: ${result[k].join('; ')}`);}
try{
  assert.ok(expectedCases>0,'FILTER selects no known game/viewport');
  report.manifest=JSON.parse(await readFile(path.join(site,'release.json'),'utf8'));
  assert.deepEqual([...report.manifest.games].sort(),games.map(g=>g[0]).sort(),'Manifest is not the seven-game collection');
  assert.equal(report.manifest.edition,'second-wind','Stale distribution: build the Second Wind edition before running this verifier');
  server=serve(site,{port:0,host:'127.0.0.1',base:mount});await once(server,'listening');
  const origin=`http://127.0.0.1:${server.address().port}`,base=origin+mount;
  browser=await chromium.launch({executablePath:browserPath(),headless:true,args:browserArgs});
  for(const [device,viewport,mobile] of [['desktop',{width:1280,height:900},false],['mobile',{width:390,height:844},true]]){
    const launch={device,errors:[],consoleErrors:[],external:[],httpErrors:[],failedRequests:[]};
    const context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile});const page=await context.newPage();monitor(page,origin,launch);
    try{
      await page.goto(base);await page.locator('.card').first().waitFor();assert.equal(await page.locator('.card').count(),7);
      assert.match(await page.title(),/Second Wind/);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Launcher horizontal overflow');
      const slugs=await page.locator('.card').evaluateAll(a=>a.map(x=>new URL(x.href).pathname.split('/').at(-2)).sort());assert.deepEqual(slugs,games.map(g=>g[0]).sort());
      await capture(page,path.join(output,`launcher-${device}.png`));assertNetwork(launch);launch.pass=true;console.log(`PASS launcher ${device}: seven links, nested path, no external requests/errors/overflow`);
    }catch(e){launch.pass=false;recordFailure(`launcher ${device}`,e);}finally{report.launcher.push(launch);await deadline(context.close(),15000,`Close launcher ${device}`);}
    for(const [slug,title] of games){
      if (!selected(slug, device)) continue;
      console.log(`CHECK ${slug} ${device}`);
      const result={game:slug,title,device,errors:[],consoleErrors:[],external:[],httpErrors:[],failedRequests:[],pass:false};report.cases.push(result);
      const context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile});const page=await context.newPage();page.setDefaultTimeout(12000);monitor(page,origin,result);
      try{
        await page.goto(`${base}${slug}/index.html?debug`);assert.ok((await page.title()).includes(title),`Wrong original title: ${await page.title()}`);
        await page.waitForFunction(()=>window.__maga||window.__hardest,undefined,{polling:50});await page.locator('canvas:visible').first().waitFor();
        assert.ok(await page.locator('canvas:visible').first().evaluate(c=>c.width>0&&c.height>0&&c.getBoundingClientRect().width>0),'Canvas is not ready');
        result.gameplay=await startAndPlay(page,slug,mobile,result);
        const mute=page.locator('#mute,#sound').first();await mute.waitFor();const label=await mute.textContent();await press(page,mute,mobile);await page.waitForTimeout(60);assert.notEqual(await mute.textContent(),label,'Mute did not toggle');await press(page,mute,mobile);await page.waitForTimeout(90);console.log(`PLAY ${slug} ${device}: ${JSON.stringify(result.gameplay)}`);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Gameplay horizontal overflow');
        await capture(page,path.join(output,mobile?`${slug}-mobile.png`:`${slug}.png`),true);
        if(fullPages){try{await capture(page,path.join(output,`${slug}-${device}-page.png`));}catch(e){result.fullPageWarning=e.message;console.warn(`WARN optional page capture ${slug} ${device}: ${e.message}`);}}else result.fullPage='Skipped optional full-page capture to reduce load; FULL_PAGE=1 enables it.';
        await pauseAndSettings(page,slug,mobile,result);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Controls horizontal overflow');
        const back=page.locator('a[aria-label="Return to the arcade"],a[aria-label="Back to arcade"]').first();await back.waitFor();
        const href=await back.getAttribute('href');const dest=new URL(href,page.url());assert.ok(dest.pathname===mount||dest.pathname===mount+'index.html',`Return link escapes nested mount: ${dest.pathname}`);
        if(mobile)await back.tap({noWaitAfter:true});else await back.click({noWaitAfter:true});
        await page.waitForURL(url=>url.pathname===mount||url.pathname===mount+'index.html',{waitUntil:'domcontentloaded',timeout:20000});await page.locator('.card').first().waitFor();assert.equal(await page.locator('.card').count(),7,'Return did not load seven-game launcher');
        result.returnLink=dest.pathname;assertNetwork(result);result.pass=true;console.log(`PASS ${slug} ${device}: start, gameplay, mute, settings, pause, nested return, render/network/layout`);
      }catch(e){recordFailure(`${slug} ${device}`,e);result.failure=e.message;if(!e.message.includes('CDP screenshot'))try{await capture(page,path.join(output,`${slug}-${device}-failure.png`));}catch{}}
      finally{await writeFile(path.join(output,'collection-smoke.json'),JSON.stringify(report,null,2)+'\n');await deadline(context.close(),15000,`Close ${slug} ${device}`);}
    }
  }
}catch(e){recordFailure('collection preflight',e);}
finally{
  if(browser)await deadline(browser.close(),15000,'Close browser').catch(e=>recordFailure('cleanup',e));
  if(server){server.closeAllConnections();await deadline(new Promise(resolve=>server.close(resolve)),5000,'Close server').catch(e=>recordFailure('cleanup',e));}
  report.running=false;report.finished=new Date().toISOString();report.passed=report.failures.length===0&&report.cases.length===expectedCases&&report.cases.every(c=>c.pass);
  await writeFile(path.join(output,'collection-smoke.json'),JSON.stringify(report,null,2)+'\n');
  console.log(`${report.passed?'PASS':'FAIL'} collection smoke: ${report.cases.filter(c=>c.pass).length}/${expectedCases} game/viewports; report ${path.join(output,'collection-smoke.json')}`);
  if(!report.passed)process.exitCode=1;
}
