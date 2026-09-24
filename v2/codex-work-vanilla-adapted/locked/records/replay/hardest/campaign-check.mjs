/* Offline, clean-save campaign proof through the shipping DOM keyboard handlers.
 * No probe start/input calls, engine mutations, unlock injection, or outcome writes.
 * The sole harness override is a deterministic 60 Hz requestAnimationFrame clock.
 * Each tape comes from the unchanged engine solver, and each completed chamber
 * unlocks the next through the actual clear screen's Continue button.
 */
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const targetURL = process.env.HARDEST_URL || (process.env.SITE_ROOT ? pathToFileURL(resolve(process.env.SITE_ROOT, 'hardest/index.html')).href : new URL('./index.html', import.meta.url).href);
const require = createRequire(import.meta.url);
for (const f of ['./engine.js', './manifest.js', './autopilot.js']) require(f);
for (const f of HARDEST_MANIFEST) require(`./levels/${f}`);
const out = fileURLToPath(new URL('./evidence/', import.meta.url)); mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox','--disable-dev-shm-usage'] });
const records = [], errors = [];
try {
 const page = await browser.newPage({ viewport: { width: 1200, height: 980 } });
 page.on('pageerror', e => errors.push(e.message));
 await page.addInitScript(() => {
   localStorage.clear(); const callbacks = []; let time = 100;
   window.requestAnimationFrame = fn => callbacks.push(fn);
   window.__vaultFrame = () => { time += 1000 / 60; const fn = callbacks.shift(); if (!fn) throw Error('No animation callback'); fn(time); };
 });
 await page.goto(targetURL);
 await page.waitForFunction(() => window.__hardest?.state().levels === 114,undefined,{polling:50});
 await page.evaluate(() => __vaultFrame());
 await page.screenshot({ path: `${out}/atlas-desktop.png`, fullPage: true });
 await page.locator('#settings').click(); await page.locator('#motion').check();
 await page.locator('#volume').fill('35'); await page.locator('#volume').dispatchEvent('input');
 await page.locator('#settings-dialog button').click();
 await page.locator('#play-level').click();
 for (const level of [...HARDEST_LEVELS].sort((a,b)=>a.id-b.id)) {
   const tape = [];
   const proof = HardestAutopilot.solve(level, { onInput: (input, steps) => { assert.equal(steps,4); tape.push(input); } });
   assert.ok(proof.clear, `solver chamber ${level.id}`);
   const result = await page.evaluate(({tape,id}) => {
     const canvas = document.getElementById('c'); let held = [];
     const key = (code,type) => canvas.dispatchEvent(new KeyboardEvent(type,{code,key:code,bubbles:true,cancelable:true}));
     if (__hardest.state().level !== id || __hardest.state().screen !== 'play') throw Error('Campaign progression was bypassed');
     for (const input of tape) {
       const next = [input.x > 0 ? 'ArrowRight' : input.x < 0 ? 'ArrowLeft' : null,input.y > 0 ? 'ArrowDown' : input.y < 0 ? 'ArrowUp' : null].filter(Boolean);
       for (const code of held) if (!next.includes(code)) key(code,'keyup');
       for (const code of next) if (!held.includes(code)) key(code,'keydown');
       held = next; __vaultFrame();
     }
     for (const code of held) key(code,'keyup');
     return __hardest.state();
   }, {tape,id:level.id});
   assert.equal(result.screen,'clear',`DOM input clear ${level.id}`);
   assert.equal(result.status,'clear'); assert.equal(result.deaths,proof.deaths); assert.equal(result.time,proof.time);
   records.push({id:level.id,name:level.name,frames:tape.length,time:result.time,deaths:result.deaths,unlocked:result.unlocked});
   if ([1,31,97,114].includes(level.id)) await page.screenshot({path:`${out}/chamber-${String(level.id).padStart(3,'0')}-clear.png`});
   console.log(`PASS DOM keyboard campaign ${level.id}/114: ${result.time.toFixed(2)}s, ${result.deaths} deaths`);
   await page.locator('#continue').click();
 }
 await page.evaluate(() => __vaultFrame());
 const save = await page.evaluate(() => JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.endsWith('hardest.save.v1')))));
 assert.equal(Object.keys(save.best).length,114); assert.equal(save.unlocked,114); assert.equal(save.volume,.35); assert.equal(save.reducedMotion,true);
 assert.deepEqual(errors,[]);
 await page.screenshot({path:`${out}/atlas-complete.png`,fullPage:true});
 // Actual browser-dispatched input, focus pause, settings, and touch cancellation.
 await page.locator('#level-choice').selectOption('0'); await page.locator('#play-level').click();
 await page.keyboard.down('ArrowRight'); await page.evaluate(() => { for(let i=0;i<10;i++)__vaultFrame(); }); await page.keyboard.up('ArrowRight');
 await page.locator('#settings').click(); assert.equal(await page.evaluate(()=>__hardest.state().screen),'pause');
 const paused=await page.evaluate(()=>__hardest.state().time); await page.evaluate(()=>{for(let i=0;i<10;i++)__vaultFrame();});
 assert.equal(await page.evaluate(()=>__hardest.state().time),paused); await page.locator('#settings-dialog button').click();
 await page.screenshot({path:`${out}/pause-desktop.png`});
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}); mobile.on('pageerror',e=>errors.push(e.message));
 await mobile.goto(targetURL);
 await mobile.waitForFunction(()=>window.__hardest?.state().levels===114,undefined,{polling:50});
 await mobile.screenshot({path:`${out}/atlas-mobile.png`,fullPage:true});
 await mobile.locator('#play-level').click();
 const before=await mobile.evaluate(()=>{const r=document.getElementById('c').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,px:__hardest.engine().player.x};});
 const session=await mobile.context().newCDPSession(mobile);
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:before.x,y:before.y}]});
 await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:before.x+30,y:before.y}]});
 await mobile.waitForTimeout(110); assert.ok(await mobile.evaluate(()=>__hardest.engine().player.x)>before.px);
 await session.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 await mobile.locator('#pause').click(); assert.equal(await mobile.evaluate(()=>__hardest.state().screen),'pause');
 assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await mobile.screenshot({path:`${out}/pause-mobile.png`,fullPage:true});
 assert.deepEqual(errors,[]);
 writeFileSync(`${out}/campaign-results.json`,JSON.stringify({date:new Date().toISOString(),method:'Clean-save, sequential DOM keyboard event replay with 60 Hz deterministic animation clock. Actual Play/Continue controls. No game-state mutation.',levels:records,assertions:{campaignClears:114,saveRecords:114,settingsPersisted:true,pauseFreezes:true,actualKeyboard:true,actualTouchMovement:true,touchCancel:true,noMobileOverflow:true,pageErrors:errors}},null,2)+'\n');
 console.log('PASS: all 114 campaign clears, settings, pause, browser keyboard, touch, layout, and zero page errors.');
} finally { await browser.close(); }
