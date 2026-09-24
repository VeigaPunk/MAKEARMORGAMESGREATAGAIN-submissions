/* Final responsive review plus a trusted-browser-keyboard chamber clear and
 * reload persistence. Offline; no game state/progress injection. */
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const targetURL = process.env.HARDEST_URL || (process.env.SITE_ROOT ? pathToFileURL(resolve(process.env.SITE_ROOT, 'hardest/index.html')).href : new URL('./index.html', import.meta.url).href);
const require=createRequire(import.meta.url); require('./engine.js');require('./autopilot.js');require('./levels/01-first-steps.js');
const tape=[];const proof=HardestAutopilot.solve(HARDEST_LEVELS[0],{onInput:input=>tape.push(input)});
const out=fileURLToPath(new URL('./evidence/',import.meta.url));mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[];
try {
 for(const [kind,options] of [['desktop',{viewport:{width:1200,height:980}}],['mobile',{viewport:{width:390,height:844},isMobile:true,hasTouch:true}]]) {
  const p=await browser.newPage(options);p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{const callbacks=[];let time=100;window.requestAnimationFrame=fn=>callbacks.push(fn);window.__vaultFrame=()=>{time+=1000/60;callbacks.shift()(time);};});
  const url=targetURL;
  await p.goto(url);await p.waitForFunction(()=>window.__hardest?.state().levels===114,undefined,{polling:50});await p.evaluate(()=>__vaultFrame());
  await p.screenshot({path:`${out}/final-atlas-${kind}.png`,fullPage:true});
  await p.locator('#play-level').click();
  const groups=[];
  for(const input of tape) {
   const keys=[input.x>0?'ArrowRight':input.x<0?'ArrowLeft':null,input.y>0?'ArrowDown':input.y<0?'ArrowUp':null].filter(Boolean);
   const last=groups.at(-1);if(last&&String(last.keys)===String(keys))last.frames++;else groups.push({keys,frames:1});
  }
  let held=[];
  for(const [index,{keys,frames}] of groups.entries()) {
   for(const key of held)if(!keys.includes(key))await p.keyboard.up(key);
   for(const key of keys)if(!held.includes(key))await p.keyboard.down(key);
   held=keys;await p.evaluate(n=>{for(let i=0;i<n;i++)__vaultFrame();},frames);
   if(index===Math.floor(groups.length/2))await p.screenshot({path:`${out}/final-play-${kind}.png`,fullPage:true});
  }
  for(const key of held)await p.keyboard.up(key);
  const state=await p.evaluate(()=>__hardest.state());assert.equal(state.screen,'clear');assert.equal(state.deaths,proof.deaths);assert.equal(state.time,proof.time);
  await p.screenshot({path:`${out}/final-clear-${kind}.png`,fullPage:true});
  await p.locator('#continue').click();await p.evaluate(()=>__vaultFrame());
  await p.locator('#settings').click();await p.locator('#volume').fill('20');await p.locator('#volume').dispatchEvent('input');await p.locator('#motion').check();
  await p.screenshot({path:`${out}/final-settings-${kind}.png`,fullPage:true});assert.equal(await p.evaluate(()=>__hardest.state().screen),'pause');
  await p.locator('#settings-dialog button').click();await p.evaluate(()=>__vaultFrame());
  await p.screenshot({path:`${out}/final-pause-${kind}.png`,fullPage:true});
  await p.reload();await p.waitForFunction(()=>window.__hardest?.state().levels===114,undefined,{polling:50});await p.evaluate(()=>__vaultFrame());
  assert.equal(await p.evaluate(()=>__hardest.state().unlocked),2);
  await p.locator('#settings').click();assert.equal(await p.locator('#volume').inputValue(),'20');assert.equal(await p.locator('#motion').isChecked(),true);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  console.log(`PASS ${kind}: trusted browser keyboard clear, exact engine time/deaths, reload unlock/settings persistence, pause, responsive screenshots`);
  await p.close();
 }
 assert.deepEqual(errors,[]);
 writeFileSync(`${out}/visual-results.json`,JSON.stringify({date:new Date().toISOString(),trustedKeyboardClears:2,level:1,time:proof.time,deaths:proof.deaths,viewports:['1200x980','390x844'],reloadUnlockAndSettings:true,pageErrors:errors},null,2)+'\n');
} finally { await browser.close(); }
