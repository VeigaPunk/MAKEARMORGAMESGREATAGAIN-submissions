/** Actual Chromium input verification. Optional --deterministic advances rAF
 * through Playwright Clock. No dispatched DOM events, debug setters, game
 * methods, position/state writes, or synthetic completion. */
import {chromium} from '@playwright/test';import {createHash} from 'node:crypto';import http from 'node:http';import path from 'node:path';import {readFile,mkdir,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
import {COURSES} from '../src/runner.ts';import {tapeFor} from './tapes.mjs';
const app=path.resolve(import.meta.dirname,'..'),out=path.join(app,'evidence'),siteRoot=process.env.SITE_ROOT?path.resolve(process.env.SITE_ROOT):path.join(app,'dist');await mkdir(out,{recursive:true});
const server=http.createServer(async(req,res)=>{try{let filename=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(filename.endsWith('/'))filename+='index.html';const file=path.resolve(siteRoot,'.'+filename);if(!file.startsWith(siteRoot+path.sep))throw Error('path');const bytes=await readFile(file);res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(bytes);}catch{res.writeHead(404);res.end('missing');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const executablePath=process.env.PULSEBOUND_BROWSER||'/root/.cache/magga/chrome-headless-shell-linux64/chrome-headless-shell';
const browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const deterministic=process.argv.includes('--deterministic');
const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.ARCADE_URL?process.env.ARCADE_URL.replace(/\/$/,'')+'/impossible':`http://127.0.0.1:${server.address().port}${process.env.SITE_ROOT?'/impossible':''}`;
const report={target:process.env.SITE_ROOT??process.env.ARCADE_URL??'app/dist',date:new Date().toISOString(),browser:await browser.version(),input:deterministic?'Playwright keyboard.press; ordinary rAF advanced by Playwright Clock. No game-state mutation; debug reads only.':'Playwright keyboard.press and pointer/touch input, wall-clock requestAnimationFrame; debug reads only',courses:[],checks:{},errors};
async function touchSmoke(){
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});mobile.on('pageerror',e=>errors.push(e.message));
 await mobile.goto(base+'/?debug');await mobile.screenshot({path:path.join(out,'title-phone.png')});await mobile.getByRole('button',{name:'Start run',exact:true}).tap();
 await mobile.getByRole('button',{name:'Jump',exact:true}).tap();await mobile.waitForFunction(()=>window.__maga.y<396,null,{timeout:3000});
 assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);report.checks.touchJump=true;report.checks.phoneFits=true;
 await mobile.screenshot({path:path.join(out,'touch-play.png')});await mobile.close();
}
try{
 if(deterministic)await page.clock.install({time:new Date('2026-09-23T12:00:00Z')});
 await page.goto(base+'/?debug');await page.screenshot({path:path.join(out,'title-desktop.png')});
 report.assets=[];for(const src of await page.locator('script[src]').evaluateAll(nodes=>nodes.map(node=>node.src))){const response=await page.request.get(src);report.assets.push({path:new URL(src).pathname,sha256:createHash('sha256').update(await response.body()).digest('hex')});}
 if(process.argv.includes('--smoke')){
  await page.getByRole('button',{name:'Start run',exact:true}).click();await page.keyboard.press('Space');await page.waitForTimeout(100);
  assert.ok(await page.evaluate(()=>__maga.y<396));await page.keyboard.press('Escape');await page.waitForTimeout(60);
  const x=await page.evaluate(()=>__maga.x);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>__maga.x),x);
  await page.getByRole('button',{name:'Resume',exact:true}).click();await page.waitForTimeout(100);assert.ok(await page.evaluate(()=>__maga.x)>x);
  const audio=await page.evaluate(()=>({audio:__maga.audio,time:__maga.runner.time}));assert.equal(audio.audio.state,'running');assert.equal(audio.audio.playing,true);assert.ok(Math.abs(audio.audio.position-audio.time)<.12);
  assert.deepEqual(errors,[]);report.checks={title:true,realKeyboardJump:true,pause:true,resume:true,noPageErrors:true,musicTransport:true,audioPhaseErrorMs:Math.round(Math.abs(audio.audio.position-audio.time)*1000)};
  await page.getByRole('button',{name:'Settings',exact:true}).click();const offset=page.getByRole('slider',{name:'Audio offset',exact:true});await offset.focus();await page.keyboard.press('Home');
  await page.getByRole('button',{name:'Done',exact:true}).click();await page.getByRole('button',{name:'Restart run',exact:true}).click();await page.waitForTimeout(300);
  const calibrated=await page.evaluate(()=>__maga.audio.position-__maga.runner.time);assert.ok(Math.abs(calibrated+.15)<.1);report.checks.negativeAudioOffsetApplied=true;report.checks.calibratedPhaseMs=Math.round(calibrated*1000);
  await touchSmoke();await page.screenshot({path:path.join(out,'release-smoke.png')});await writeFile(path.join(out,'smoke-report.json'),JSON.stringify(report,null,2)+'\n');console.log('SMOKE PASS',report.target);
  await browser.close();await new Promise(r=>server.close(r));process.exit(0);
 }
 if(deterministic)await page.clock.pauseAt(new Date('2026-09-23T12:01:00Z'));
 assert.equal(await page.getByRole('button').filter({hasText:'LOCKED'}).count(),4);
 await page.getByRole('button',{name:'Start run',exact:true}).click();
 for(let course=0;course<COURSES.length;course++){
  const tape=tapeFor(COURSES[course]);let n=0,lastAttempt=1,presses=0,nextLog=20,screenSaved=false,phaseMax=0;const start=Date.now();
  while(true){
   const state=await page.evaluate(()=>({r:window.__maga.runner,screen:window.__maga.screen,audio:window.__maga.audio}));
   if(state.screen==='clear'){
    assert.equal(state.r.courseIndex,course);assert.equal(state.r.state,'clear');
    const result={name:COURSES[course].name,duration:COURSES[course].end/360,wallSeconds:(Date.now()-start)/1000,deaths:state.r.deaths,attempts:state.r.attempt,keyPresses:presses,finalX:state.r.x,maxObservedAudioPhaseErrorMs:deterministic?null:Math.round(phaseMax*1000)};
    report.courses.push(result);console.log('CLEAR',JSON.stringify(result));await page.screenshot({path:path.join(out,`course-${course+1}-clear.png`)});break;
   }
   assert.equal(state.screen,'play','unexpected pause/menu');
   if(state.r.attempt!==lastAttempt){n=0;lastAttempt=state.r.attempt;console.log('RETRY',course+1,lastAttempt);}
   assert.ok(lastAttempt<15,'route did not complete in 14 attempts');
   if(state.r.state==='running'&&state.r.x>=tape[n]-10){await page.keyboard.press('Space');n++;presses++;}
   if(state.r.time>=nextLog){console.log('PLAY',course+1,Math.floor(state.r.time),'seconds',n,'presses');nextLog+=20;}
   if(state.r.time>10&&state.audio.playing)phaseMax=Math.max(phaseMax,Math.abs(state.audio.position-state.r.time));
   if(!screenSaved&&state.r.time>Math.min(30,COURSES[course].end/720)){await page.screenshot({path:path.join(out,`course-${course+1}-play.png`)});screenSaved=true;}
   if(Date.now()-start>COURSES[course].end/360*1000*15)throw Error('campaign timeout');
   if(deterministic){const target=tape[n]??COURSES[course].end;await page.clock.runFor(Math.max(16,Math.min(2000,Math.floor((target-state.r.x-12)/360*1000))));}else await page.waitForTimeout(8);
  }
  if(course<COURSES.length-1)await page.getByRole('button',{name:'Next course',exact:true}).click();
 }
 if(deterministic)await page.clock.resume();
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('maga:pulsebound:records'))),[1,1,1,1,1]);
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('maga:pulsebound:unlocked'))),5);
 await page.reload();await page.getByRole('button',{name:/01 First Light/}).click();
 assert.equal(await page.getByRole('button').filter({hasText:'LOCKED'}).count(),0);report.checks.reloadUnlocks=true;
 await page.getByRole('button',{name:'Practice with checkpoints'}).click();
 await page.keyboard.press('Space');await page.waitForTimeout(80);assert.ok(await page.evaluate(()=>__maga.y<396));report.checks.shortKeyPress=true;
 await page.keyboard.press('Escape');await page.waitForTimeout(60);const paused=await page.evaluate(()=>__maga.x);await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>__maga.x),paused);report.checks.pauseFrozen=true;
 await page.getByRole('button',{name:'Resume',exact:true}).click();await page.waitForTimeout(100);assert.ok(await page.evaluate(()=>__maga.x)>paused);report.checks.resume=true;
 await page.waitForTimeout(5000);assert.ok(await page.evaluate(()=>__maga.runner.checkpoint)>0);assert.ok(await page.evaluate(()=>__maga.runner.deaths)>0);report.checks.practiceRespawn=true;
 await page.keyboard.press('Escape');await page.waitForTimeout(30);await page.getByRole('button',{name:'Settings',exact:true}).last().click();
 const offset=page.getByRole('slider',{name:'Audio offset',exact:true});await offset.focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowRight');
 const offsetValue=await offset.inputValue();await page.reload();await page.getByRole('button',{name:'Settings',exact:true}).click();assert.equal(await page.getByRole('slider',{name:'Audio offset',exact:true}).inputValue(),offsetValue);report.checks.negativeAudioOffsetPersists=true;
 await touchSmoke();
 assert.deepEqual(errors,[]);report.checks.noPageErrors=true;
 await writeFile(path.join(out,'browser-report.json'),JSON.stringify(report,null,2)+'\n');console.log('PASS',JSON.stringify(report.checks));
}catch(error){await page.screenshot({path:path.join(out,'failure.png')});report.failure=String(error);await writeFile(path.join(out,process.argv.includes('--smoke')?'smoke-report.json':'browser-report.json'),JSON.stringify(report,null,2)+'\n');throw error;}
finally{await browser.close();await new Promise(r=>server.close(r));}
