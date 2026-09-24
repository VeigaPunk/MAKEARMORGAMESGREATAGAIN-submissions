/** Native CDP touch smoke plus browser PointerEvents (isTrusted=false) for
 * full-wave replay through production zones; read-only telemetry, offline. */
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {browserPath,browserArgs} from '../../../../../../tooling/browser.mjs';
import {installBrowserClock} from './browser-clock.mjs';
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const server=http.createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://local'),[app,...rest]=url.pathname.split('/').filter(Boolean);
  let root,file;
  if(process.env.SITE_ROOT){root=path.resolve(process.env.SITE_ROOT);file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(file===root)file=path.join(root,'index.html');}
  else {if(!['chicken-invaders','chicken-invaders-original'].includes(app))throw Error();root=path.join(base,'apps',app,'dist');file=path.resolve(root,rest.join('/')||'index.html');}
  if(!file.startsWith(root+path.sep))throw Error();
  if(url.pathname.endsWith('/')&&!file.endsWith('index.html'))file=path.join(file,'index.html');
  res.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.svg':'image/svg+xml','.css':'text/css','.png':'image/png'}[path.extname(file)]??'application/octet-stream'});res.end(await readFile(file));
 }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=process.env.ARCADE_URL??`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:browserPath(),args:browserArgs});
try{for(const app of ['chicken-invaders','chicken-invaders-original'])for(const layout of ['twin','one']){
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});await page.addInitScript(installBrowserClock);const errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>{if(r.request().url().startsWith(origin))return r.continue();external.push(r.request().url());return r.abort();});
 await page.goto(`${origin}/${app}/?debug`);await page.waitForFunction(()=>window.__maga);
 if(layout==='one'){await page.locator('#settings').tap();await page.locator('#flight-touch').selectOption('one');await page.locator('#flight-close').tap();}
 await page.locator('#mute').tap();
 await page.locator('#portrait-launch').tap();await page.waitForFunction(()=>window.__maga.state.mode==='play'&&window.__maga.touch.view.visible);
 const canvas=await page.locator('canvas').boundingBox(),scale=canvas.width/960,cdp=await page.context().newCDPSession(page);
 const pos=(x,y,id)=>({x:canvas.x+x*scale,y:canvas.y+y*scale,id});const fire=await page.evaluate(()=>{const t=window.__maga.touch;return {point:t.fireHome(),diameter:t.fireRadius()*2*document.querySelector('canvas').getBoundingClientRect().width/960};});
 assert.ok(fire.diameter>=44);let points=[pos(220,435,1)];if(layout==='twin')points.push(pos(fire.point.x,fire.point.y,2));await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});
 const nativeBefore=await page.evaluate(()=>window.__maga.state.shipX);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[pos(290,435,1),...(layout==='twin'?[pos(fire.point.x,fire.point.y,2)]:[])]});
 await page.waitForTimeout(350);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const nativeAfter=await page.evaluate(()=>window.__maga.state.shipX);assert.ok(Math.abs(nativeAfter-nativeBefore)>1,'native touch steers ship');
 await page.evaluate(()=>window.__shmupClock.pause());
 const started=Date.now();
 const proof=await page.evaluate(({layout,rect,scale})=>{
  const canvas=document.querySelector('canvas'),s=window.__maga.sim,touch=window.__maga.touch,clock=window.__shmupClock;
  const pointer=(type,x,y,id,target=canvas)=>target.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',isPrimary:id===101,clientX:rect.x+x*scale,clientY:rect.y+y*scale,bubbles:true,cancelable:true,buttons:type==='pointerup'?0:1}));
  const fire=touch.fireHome();pointer('pointerdown',220,435,101);if(layout==='twin')pointer('pointerdown',fire.x,fire.y,102);
  let previous=new Map(),last=s.waveT,virtualMs=0;
  for(;virtualMs<180000&&s.waveIdx===0&&s.mode==='play';virtualMs+=100){
   const dt=Math.max(.04,s.waveT-last);last=s.waveT;let target=480,cost=Infinity,next=new Map();
   for(const b of s.chickens){const id=`${b.bx}:${b.by}`,old=previous.get(id),vx=old===undefined?0:(b.x-old)/dt;next.set(id,b.x);const lead=Math.max(30,Math.min(930,b.x+vx*Math.max(0,(s.ship.y-b.y)/560)));if(Math.abs(lead-s.ship.x)<cost){cost=Math.abs(lead-s.ship.x);target=lead;}}previous=next;
   const pickup=s.pickups.filter(p=>p.y>260).sort((a,b)=>b.y-a.y)[0];if(pickup)target=pickup.x;
   let bestX=s.ship.x,best=Infinity;for(let x=30;x<940;x+=15){let c=Math.abs(x-target)*.16+Math.abs(x-s.ship.x)*.05;for(const e of s.eggs){const time=(s.ship.y-e.y)/e.vy;if(time<0||time>1.6)continue;c+=Math.max(0,70-Math.abs(x-e.x-e.vx*time))*(1.8-time)*7;}if(c<best){best=c;bestX=x;}}
   const ax=Math.max(-1,Math.min(1,(bestX-s.ship.x-s.ship.vx*.12)/25)),ay=Math.max(-1,Math.min(1,(485-s.ship.y-s.ship.vy*.12)/25));
   pointer('pointermove',220+ax*90,435+ay*90,101);clock.pump(100);
  }
  pointer('pointerup',220,435,101,window);if(layout==='twin')pointer('pointerup',fire.x,fire.y,102,window);
  return {virtualMs,result:{wave:s.waveIdx,score:s.score,lives:s.lives,mode:s.mode},release:{drag:touch.drag,fire:touch.fire}};
 },{layout,rect:canvas,scale});
 const {result,release,virtualMs}=proof;assert.ok(result.wave>0,'touch pilot did not clear first wave');assert.deepEqual(release,{drag:null,fire:false});await page.evaluate(()=>window.__shmupClock.resume());
 const dir=path.join(base,'apps',app,'proofs','ship');await mkdir(dir,{recursive:true});const shot=await cdp.send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(dir,`touch-${layout}.png`),Buffer.from(shot.data,'base64'));await writeFile(path.join(dir,`touch-${layout}.json`),JSON.stringify({method:'Native CDP touch steering/fire smoke, followed by browser PointerEvents (isTrusted=false) through production touch zones for complete-wave replay; read-only observation; controlled rAF/performance clock at 20 Hz and production physics at 120 Hz',virtualMs,nativeSmoke:{beforeX:nativeBefore,afterX:nativeAfter},elapsedMs:Date.now()-started,viewport:{width:390,height:844},layout,result,release,fireDiameterCSS:fire.diameter,errors,externalRequests:external},null,2));
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);console.log(app,layout,'wave cleared',result.score,'lives',result.lives);await page.close();
}}finally{await browser.close();await new Promise(r=>server.close(r));}
