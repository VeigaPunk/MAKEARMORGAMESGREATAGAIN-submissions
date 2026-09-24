import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { serve } from '../../../../../../arcade/serve.mjs';
import { browserPath, browserArgs } from '../../../../../../tooling/browser.mjs';
const evidence = new URL('../evidence/', import.meta.url); await mkdir(evidence, { recursive: true });
const server = serve(process.env.SITE_ROOT || 'dist', { port: 0, base: '/proof/second-wind/' });
await new Promise(r => server.once('listening', r));
const base = `http://127.0.0.1:${server.address().port}/proof/second-wind/burger-tycoon/`;
const browsers = [];
const trace = [], errors = [], assets = [];
const report = status => ({date:new Date().toISOString(),siteRoot:process.env.SITE_ROOT||'dist',status,clock:'native browser wall clock throughout; desktop and touch in separate browsers; real pointer/touch/keyboard events, no clock overrides or company-state writes',errors,assets,trace});
let writes=Promise.resolve();
const persist = status => {const contents=JSON.stringify(report(status),null,2)+'\n';writes=writes.then(()=>writeFile(new URL('player-results.json',evidence),contents));return writes;};
try {
 await Promise.all([false, true].map(async touch => {
  const mode = touch ? 'touch' : 'desktop';
  const browser = await chromium.launch({ executablePath: browserPath(), headless: true, args: browserArgs });browsers.push(browser);
  const page = await browser.newPage({ viewport: touch ? { width: 390, height: 844 } : { width: 1440, height: 960 }, isMobile: touch, hasTouch: touch });
  const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setFocusEmulationEnabled',{enabled:true});
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  page.on('framenavigated', f => { if(f===page.mainFrame())console.log(mode,'navigation',f.url()); });
  await page.goto(base + '?debug');
  if(!touch)for(const src of await page.locator('script[src]').evaluateAll(nodes=>nodes.map(n=>n.src))){const response=await page.request.get(src);assets.push({path:new URL(src).pathname,sha256:createHash('sha256').update(await response.body()).digest('hex')});}
  const snapshot = async () => page.evaluate(() => {
   const m=window.__maga;if(!m)return {url:location.href,missing:true};const s=m.sim.s;
   return {url:location.href,t:s.t,companyAgeSeconds:s.t*4,paused:m.paused,over:s.over,reason:s.overReason,cash:s.cash,rep:s.rep,backlash:s.backlash,cattle:s.cattle,crops:s.crops,patties:s.patties,morale:s.management.morale,quarter:s.management.quarter,dirty:{...s.dirty},events:[...m.sim.events]};
  });
  // Hit-test each genuine pointer or touchscreen event against the visible button.
  const press = async target => {
   await target.waitFor({state:'visible',timeout:5000});
   // Scroll visible containers with real wheel input before hit testing.
   for(let attempt=0;attempt<5;attempt++){
    const box=await target.evaluate(button=>{const r=button.getBoundingClientRect();let host=null;for(let p=button.parentElement;p&&p!==document.body;p=p.parentElement){if(/auto|scroll/.test(getComputedStyle(p).overflowY)&&p.scrollHeight>p.clientHeight+2){host=p;break;}}const h=host?.getBoundingClientRect()??{left:0,right:innerWidth,top:0,bottom:innerHeight};return {top:r.top,bottom:r.bottom,center:(r.top+r.bottom)/2,left:Math.max(0,h.left),right:Math.min(innerWidth,h.right),viewTop:Math.max(0,h.top),viewBottom:Math.min(innerHeight,h.bottom)};});
    if(box.top>=box.viewTop+3&&box.bottom<=box.viewBottom-3)break;
    const y=(box.viewTop+box.viewBottom)/2;await page.mouse.move((box.left+box.right)/2,y);await page.mouse.wheel(0,box.center-y);await page.waitForTimeout(70);
   }
   const hit=await target.evaluate(button=>{const r=button.getBoundingClientRect(),at=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {correct:!!at&&(at===button||button.contains(at)),button:button.textContent,hit:at?.outerHTML.slice(0,180),disabled:button.disabled};});
   assert.equal(hit.disabled,false,`disabled input: ${hit.button}`);
   assert.equal(hit.correct,true,`input blocked: ${JSON.stringify(hit)}`);
   const rect=await target.boundingBox();assert.ok(rect,'button has no layout box');const x=rect.x+rect.width/2,y=rect.y+rect.height/2;
   if(touch)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y);
   assert.equal(new URL(page.url()).pathname,new URL(base).pathname,'button unexpectedly navigated away');
  };
  const named = name => press(page.getByRole('button',{name,exact:true}));
  const pane = async n => {if(touch)await named(`${n} ${['Farmland','Feedlot','Restaurant','Headquarters'][n-1]}`);};
  const action = async selector => {
   const before=await snapshot();assert.equal(before.over,false,`company already collapsed: ${JSON.stringify(before)}`);assert.equal(before.paused,false,'company unexpectedly paused');
   await press(page.locator(selector));const after=await snapshot();trace.push({input:mode,action:selector,before,after});await persist('RUNNING');
  };
  const waitUntil = async target => {const deadline=Date.now()+120000;let state=await snapshot();while(state.t<target&&!state.over){assert.ok(Date.now()<deadline,`native clock failed to advance: ${JSON.stringify(state)}`);if(state.paused){trace.push({test:`${mode} native auto-pause`,...state});console.log(mode,'resuming native auto-pause',state.t);await named('Resume operations');}await page.waitForTimeout(1000);state=await snapshot();}return state;};
  await named('Open for business');await named('Sound on');await named('Settings');await named('Scene animation: full');await named('Resume operations');
  // Clean five-minute policy: invest in herd growth, sow on the documented
  // cooldown and replenish cattle from actual observed stock/reserves.
  await pane(1);await action('[data-action="farm-3"]');await action('[data-action="farm-0"]');
  const nativeStartedAt=Date.now(),initialT=(await snapshot()).t;
  for(let n=0;n<10;n++){
   let state=await waitUntil(initialT+7.5*(n+1));trace.push({test:`${mode} managed checkpoint`,step:n+1,...state});
   console.log(mode,'managed',30*(n+1),'company seconds',JSON.stringify({t:state.t,cash:Math.round(state.cash),cattle:+state.cattle.toFixed(2),rep:state.rep,backlash:state.backlash,over:state.over,url:state.url}));
   assert.equal(state.over,false,`unexpected failure: ${JSON.stringify(state)}`);
   assert.ok(state.t>=initialT+7.5*(n+1),'normal pace must advance at least 7.5 simulation seconds per checkpoint');
   await action('[data-action="farm-0"]');
   if(state.cattle<4&&state.cash>=180)await action('[data-action="farm-1"]');
  }
  const survived=await snapshot();assert.ok(survived.t>=74.9);assert.equal(survived.over,false);assert.ok(survived.quarter>=1);assert.ok(survived.events.some(e=>e.includes('QUARTER 1')));trace.push({test:`${mode} five minutes survived`,nativeElapsedMs:Date.now()-nativeStartedAt,...survived});await persist('RUNNING');
  await page.keyboard.press('Escape');const frozen=(await snapshot()).t;await page.waitForTimeout(3000);assert.equal((await snapshot()).t,frozen);
  await named('Settings & field guide');
  const slider=page.getByRole('slider',{name:'Master volume'});await slider.focus();await slider.press('Home');await slider.press('ArrowRight');assert.equal(await slider.inputValue(),'1');
  await named('Scene animation: reduced');await named('Scene animation: full');await named('Resume operations');
  await named('Sound off');await named('Sound on');assert.equal(await page.getByRole('button',{name:'Sound off',exact:true}).getAttribute('aria-pressed'),'true');
  console.log(mode,'reload begins');await page.reload({timeout:15000});console.log(mode,'reload loaded');await named('Continue company');console.log(mode,'continue pressed');assert.ok((await snapshot()).t>=74.9);
  await named('Settings');assert.equal(await page.getByRole('slider',{name:'Master volume'}).inputValue(),'1');assert.equal(await page.getByRole('button',{name:'Scene animation: reduced',exact:true}).getAttribute('aria-pressed'),'true');await named('Resume operations');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  trace.push({test:`${mode} pause/settings/save/reload`,...await snapshot()});console.log(mode,'save/reload/settings PASS');
  // Deliberately accept every dirty shortcut via its normal toggle, then let
  // the public 4× speed control expose disease and reputation consequences.
  await pane(1);await action('[data-action="farm-2"]');await pane(2);await action('[data-action="feed-1"]');await pane(3);await action('[data-action="rest-1"]');
  await named('1× pace');await named('2× pace');
  let failed;
  for(let n=0;n<18;n++){await page.waitForTimeout(5000);failed=await snapshot();trace.push({test:`${mode} native-clock dirty consequence`,step:n,...failed});console.log(mode,'native consequence',JSON.stringify({t:+failed.t.toFixed(2),rep:+failed.rep.toFixed(2),cash:Math.round(failed.cash),over:failed.over}));if(failed.over)break;}
  assert.equal(failed.over,true,'dirty policy did not reach a natural failure');assert.match(failed.reason,/REPUTATION COLLAPSE/);assert.ok(failed.cash>0,'failure should be public backlash, not bankruptcy');
  await page.getByRole('heading',{name:'The public has spoken.',exact:true}).waitFor();console.log(mode,'natural backlash collapse PASS',JSON.stringify({t:failed.t,cash:failed.cash,reason:failed.reason}));
  await named('Build another company');const fresh=await snapshot();assert.equal(fresh.over,false);assert.ok(fresh.t>=0&&fresh.t<.5);assert.ok(fresh.cash>=499&&fresh.cash<501);trace.push({test:`${mode} retry`,...fresh});
  await page.close();await browser.close();
 }));
 assert.deepEqual(errors,[]);await persist('PASS');
 console.log('PASS Burger Tycoon: desktop + touch five-minute loops, settings, pause, save/reload, collapse/retry and nested path; no errors.');
}catch(error){trace.push({test:'failure',error:String(error)});await persist('FAIL');throw error;}
finally{await Promise.all(browsers.map(browser=>browser.close()));server.close();}
