import { Input, Sfx, load, save } from '@maga/arcade-core';
import { Runner, DT, COURSES } from './runner';
import { Scene } from './scene';
import { Score } from './score';
const cv=document.querySelector<HTMLCanvasElement>('canvas')!,ctx=cv.getContext('2d')!;
const overlay=document.getElementById('overlay')!,r=new Runner(),scene=new Scene(),input=new Input(),sfx=new Sfx(),score=new Score();
input.attach(cv,(x,y)=>({x:x*960/cv.clientWidth,y:y*540/cv.clientHeight}));
input.setKeymaps({p1:{KeyZ:'fire',KeyR:'action'}});
type Screen='title'|'play'|'pause'|'clear'|'settings';
let screen:Screen='title',settingsFrom:Screen='title',acc=0,last=performance.now(),pendingJump=-1;
const safeNumber=(key:string,fallback:number,min:number,max:number)=>{const raw=load<unknown>('pulsebound',key,null);return typeof raw==='number'&&Number.isFinite(raw)?Math.max(min,Math.min(max,raw)):fallback;};
let selectedCourse=Math.floor(safeNumber('selected',0,0,COURSES.length-1));
let unlocked=Math.floor(safeNumber('unlocked',1,1,COURSES.length));
selectedCourse=Math.min(selectedCourse,unlocked-1);r.courseIndex=selectedCourse;
function numbers(key:string,max=1):number[]{const value=load<unknown>('pulsebound',key,[]);return COURSES.map((_,i)=>Array.isArray(value)&&typeof value[i]==='number'&&Number.isFinite(value[i])?Math.max(0,Math.min(max,value[i])):0);}
const records=numbers('records'),practiceRecords=numbers('practice-records'),medals=numbers('medals',3).map(Math.floor);
const settings={music:safeNumber('music',.65,0,1),effects:safeNumber('effects',.5,0,1),inputDelay:safeNumber('input-delay',0,0,100),audioOffset:safeNumber('audio-offset',0,-150,150),motion:load('pulsebound','motion',!matchMedia('(prefers-reduced-motion: reduce)').matches)};
let best=records[selectedCourse],practiceBest=practiceRecords[selectedCourse];
const mute=document.getElementById('mute')!,pause=document.getElementById('pause')!;
function audioSettings():void{score.volume=settings.music;score.muted=sfx.muted;score.applyVolume();sfx.volume=settings.effects;scene.reducedMotion=!settings.motion;mute.textContent=sfx.muted?'Sound off':'Sound on';mute.setAttribute('aria-pressed',String(sfx.muted));}
mute.onclick=()=>{sfx.muted=!sfx.muted;audioSettings();if(screen==='play')cv.focus();};audioSettings();
pause.onclick=()=>{if(screen==='play')show('pause');else if(screen==='pause')resume();};
document.getElementById('settings')!.onclick=()=>openSettings();
document.getElementById('jump')!.addEventListener('pointerdown',e=>{e.preventDefault();if(screen==='play')pendingJump=r.time+settings.inputDelay/1000;});
function button(label:string,action:()=>void,secondary=false):HTMLButtonElement{const b=document.createElement('button');b.textContent=label;b.className=secondary?'secondary':'';b.onclick=action;return b;}
function focusStage():void{input.reset();last=performance.now();acc=0;pendingJump=-1;cv.focus();pause.textContent='Pause';pause.removeAttribute('disabled');}
function start(practice:boolean):void{
 r.courseIndex=selectedCourse;best=records[selectedCourse];practiceBest=practiceRecords[selectedCourse];r.practice=practice;r.reset(true);
 save('pulsebound','selected',selectedCourse);screen='play';document.body.dataset.screen='play';overlay.hidden=true;score.play(selectedCourse,0,settings.audioOffset);focusStage();
}
function resume():void{screen='play';document.body.dataset.screen='play';overlay.hidden=true;score.play(selectedCourse,r.time,settings.audioOffset);focusStage();}
function openSettings():void{if(screen==='settings')return;settingsFrom=screen==='play'?'pause':screen;show('settings');}
function settingRange(panel:HTMLElement,label:string,key:'music'|'effects'|'inputDelay'|'audioOffset',min:number,max:number,step:number,suffix:string):void{
 const row=document.createElement('label');row.className='setting';const span=document.createElement('span'),range=document.createElement('input'),value=document.createElement('output');
 span.textContent=label;range.type='range';range.min=String(min);range.max=String(max);range.step=String(step);range.value=String(settings[key]);range.setAttribute('aria-label',label);
 const paint=()=>{value.textContent=`${key==='music'||key==='effects'?Math.round(settings[key]*100):settings[key]}${suffix}`;};paint();
 range.oninput=()=>{settings[key]=Number(range.value);save('pulsebound',({'music':'music','effects':'effects','inputDelay':'input-delay','audioOffset':'audio-offset'})[key],settings[key]);audioSettings();paint();};
 row.append(span,range,value);panel.append(row);
}
function show(next:Exclude<Screen,'play'>):void{
 screen=next;document.body.dataset.screen=next;score.stop();input.reset();pendingJump=-1;overlay.hidden=false;overlay.replaceChildren();pause.textContent=next==='pause'?'Resume':'Pause';pause.toggleAttribute('disabled',next!=='pause');
 const panel=document.createElement('section');panel.className=`panel ${next}`;
 const eyebrow=document.createElement('p');eyebrow.className='eyebrow';eyebrow.textContent=next==='clear'?(r.practice?'PRACTICE / CHECKPOINT ASSISTED':selectedCourse===COURSES.length-1?'CAMPAIGN COMPLETE / FIVE OF FIVE':'COURSE COMPLETE / '+r.course.name.toUpperCase()):'ONE BUTTON. A THOUSAND SECOND CHANCES.';
 const title=document.createElement('h1');title.textContent=next==='title'?'Pulsebound':next==='pause'?'Take a breath.':next==='settings'?'Make it yours.':r.practice?'Practice complete.':selectedCourse===COURSES.length-1?'Beyond impossible.':'In the pocket.';
 const copy=document.createElement('p');copy.className='description';copy.textContent=next==='title'?'Five journeys through rhythm and resolve. Find the pulse. Trust the jump. Go again.':next==='pause'?`${r.course.name} · ${Math.floor(r.x/r.course.end*100)}% · Your run is waiting.`:next==='settings'?'Your timing, your sound. Changes save automatically.':`${!r.practice&&selectedCourse===COURSES.length-1?'All five courses complete. ':''}${r.attempt} attempts · ${r.deaths} deaths · ${r.practice?'Normal medals stay separate.':r.deaths===0?'GOLD — a flawless run.':r.deaths<=5?'SILVER — five deaths or fewer.':'BRONZE — the finish is yours.'}`;
 panel.append(eyebrow,title,copy);
 if(next==='title'){
  const courses=document.createElement('div');courses.className='courses';
  COURSES.forEach((course,i)=>{
   const b=button('',()=>{selectedCourse=i;r.courseIndex=i;best=records[i];practiceBest=practiceRecords[i];show('title');},true);
   b.className='course';b.disabled=i>=unlocked;b.setAttribute('aria-pressed',String(selectedCourse===i));
   const number=document.createElement('span');number.className='number';number.textContent=String(i+1).padStart(2,'0');
   const info=document.createElement('span'),name=document.createElement('strong'),sub=document.createElement('small'),status=document.createElement('span');
   name.textContent=course.name;sub.textContent=`${Math.floor(course.end/360/60)}:${String(course.end/360%60).padStart(2,'0')} · ${course.subtitle}`;info.append(name,sub);
   status.className='course-status';status.textContent=i>=unlocked?'LOCKED':medals[i]?['','BRONZE','SILVER','GOLD'][medals[i]]:records[i]>0?`${Math.floor(records[i]*100)}%`:'READY';
   b.append(number,info,status);courses.append(b);
  });panel.append(courses);
 }
 if(next==='settings'){
  const controls=document.createElement('div');controls.className='settings-grid';
  settingRange(controls,'Music','music',0,1,.05,'%');settingRange(controls,'Effects','effects',0,1,.05,'%');
  settingRange(controls,'Input delay','inputDelay',0,100,5,' ms');settingRange(controls,'Audio offset','audioOffset',-150,150,5,' ms');
  const motion=button(`Motion effects: ${settings.motion?'on':'reduced'}`,()=>{settings.motion=!settings.motion;save('pulsebound','motion',settings.motion);audioSettings();show('settings');},true);controls.append(motion);
  const hint=document.createElement('small');hint.textContent='Input delay intentionally delays a press; 0 ms is the fastest response. Positive audio offset advances the music. Keyboard, mouse and touch all use the same fixed jump.';controls.append(hint);panel.append(controls);
 }
 const actions=document.createElement('div');actions.className='actions';
 if(next==='settings')actions.append(button('Done',()=>settingsFrom==='pause'?show('pause'):show(settingsFrom==='clear'?'clear':'title')));
 else if(next==='pause')actions.append(button('Resume',resume),button('Restart run',()=>start(r.practice),true),button('Settings',openSettings,true));
 else{
  actions.append(button(next==='clear'?'Run again':'Start run',()=>start(false)),button('Practice with checkpoints',()=>start(true),true));
  if(next==='clear'&&!r.practice&&selectedCourse<COURSES.length-1)actions.append(button('Next course',()=>{selectedCourse++;start(false);}));
 }
 if(next!=='title'&&next!=='settings')actions.append(button('Course select',()=>show('title'),true));
 const help=document.createElement('small');help.className='help';help.textContent='SPACE / UP / Z / TAP to jump · R retry · ESC pause';
 panel.append(actions,help);overlay.append(panel);panel.querySelector('button')?.focus();
}
window.addEventListener('keydown',e=>{if(e.target instanceof HTMLElement&&/BUTTON|INPUT/.test(e.target.tagName))return;if(e.code==='Enter'&&screen==='title')start(false);});
window.addEventListener('blur',()=>{if(screen==='play')show('pause');});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&screen==='play')show('pause');});
function update():void{
 if(pendingJump>=0&&r.time>=pendingJump){r.jump();pendingJump=-1;}
 const oldAttempt=r.attempt,event=r.step(DT);
 if(r.attempt!==oldAttempt){pendingJump=-1;score.play(selectedCourse,r.time,settings.audioOffset);}
 if(event==='jump')sfx.blip({wave:'triangle',freq:480,freqEnd:620,duration:.035,volume:.08});
 if(event==='death'){scene.burst(r);score.stop();sfx.blip({wave:'sawtooth',freq:170,freqEnd:35,duration:.12,volume:.30});}
 const progress=Math.min(1,r.x/r.course.end);
 if(r.practice)practiceBest=Math.max(practiceBest,progress);else best=Math.max(best,progress);
 if(event==='death'||event==='clear'){
  const scores=r.practice?practiceRecords:records;scores[selectedCourse]=r.practice?practiceBest:best;save('pulsebound',r.practice?'practice-records':'records',scores);
  if(event==='clear'&&!r.practice){unlocked=Math.min(COURSES.length,Math.max(unlocked,selectedCourse+2));save('pulsebound','unlocked',unlocked);medals[selectedCourse]=Math.max(medals[selectedCourse],r.deaths===0?3:r.deaths<=5?2:1);save('pulsebound','medals',medals);}
 }
 if(event==='clear'){sfx.preset('pickup');show('clear');}
}
function frame(now:number):void{
 const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;
 if(input.wasPressed('pause')){if(screen==='play')show('pause');else if(screen==='pause')resume();else if(screen==='settings')show(settingsFrom==='pause'?'pause':'title');}
 if(screen==='play'){
  if(input.wasPressed('fire')||input.wasPressed('up')||input.pointer.pressed)pendingJump=r.time+settings.inputDelay/1000;
  if(input.wasPressed('action')){r.reset();pendingJump=-1;score.play(selectedCourse,r.time,settings.audioOffset);}
  acc+=dt;while(acc>=DT&&screen==='play'){update();acc-=DT;}
  if(r.state==='running')score.sync(selectedCourse,r.time,settings.audioOffset);
 }else acc=0;
 input.endFrame();scene.draw(ctx,r,screen==='play'?dt:0,r.practice?practiceBest:best);requestAnimationFrame(frame);
}
show('title');requestAnimationFrame(frame);
// Read-only diagnostics; verification must use the real UI and input path.
if(new URLSearchParams(location.search).has('debug'))Object.defineProperty(window,'__maga',{value:Object.freeze({
 get runner(){return Object.freeze({x:r.x,y:r.y,vy:r.vy,state:r.state,attempt:r.attempt,deaths:r.deaths,practice:r.practice,checkpoint:r.checkpoint,time:r.time,courseIndex:r.courseIndex,grounded:r.grounded});},
 get state(){return r.state;},get screen(){return screen;},get x(){return r.x;},get y(){return r.y;},get progress(){return r.x/r.course.end;},get paused(){return screen==='pause';},get audio(){return score.status;},get settings(){return {...settings};},
})});
