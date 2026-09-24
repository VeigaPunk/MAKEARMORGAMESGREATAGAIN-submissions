/** Automated observer/controller. Only browser KeyboardEvents and clock ticks
 * leave this closure. Never assigns a game field or calls a simulation method. */
export function installEventPilot() {
 let previous=new Map(),lastTime=0,phase='',virtualMs=0,retries=0,lastMissile=-1000;
 const held=new Set(),log=[];
 const event=(type,code)=>window.dispatchEvent(new KeyboardEvent(type,{code,key:code==='Space'?' ':code,bubbles:true,cancelable:true}));
 const press=code=>{event('keydown',code);event('keyup',code);};
 const keys=wanted=>{for(const k of [...held])if(!wanted.has(k)){event('keyup',k);held.delete(k);}for(const k of wanted)if(!held.has(k)){event('keydown',k);held.add(k);}};
 const advance=ms=>{window.__shmupClock.pump(ms);virtualMs+=ms;};
 const read=()=>{const s=window.__maga.sim;return {mode:s.mode,paused:s.paused,time:s.waveT,chapter:s.chapter,wave:s.waveIdx,total:s.wavesTotal,score:s.score,lives:s.lives,weapon:s.weaponLv,missiles:s.missileN,
  ship:{x:s.ship.x,y:s.ship.y,vx:s.ship.vx,vy:s.ship.vy,alive:s.ship.alive},
  targets:s.boss?[{id:'boss',x:s.boss.x,y:s.boss.y}]:s.chickens.map(c=>({id:`${c.bx}:${c.by}:${c.type}`,x:c.x,y:c.y})),
  boss:s.boss?{name:s.pack.bosses[s.boss.type].name,hp:s.boss.hp,max:s.boss.max,x:s.boss.x}:null,
  eggs:s.eggs.map(e=>({x:e.x,y:e.y,vx:e.vx,vy:e.vy})),birds:s.chickens.map(c=>({x:c.x,y:c.y,dive:c.dive,dvx:c.dvx,dvy:c.dvy})),pickups:s.pickups.map(p=>({x:p.x,y:p.y,kind:p.kind})),lastDeath:s.lastDeath};};
 window.__shmupPilot={
  run(budget=30000,stopAtBoundary=true){
   const until=virtualMs+budget,events=[];let s;
   while(virtualMs<until){
    s=read();const nextPhase=`${s.mode}:${s.chapter}:${s.wave}:${s.boss?'boss':'wave'}`;
    if(nextPhase!==phase){phase=nextPhase;const record={virtualMs,...s,targets:s.targets.length,eggs:s.eggs.length,birds:s.birds.length,pickups:s.pickups.length};events.push(record);log.push(record);if(stopAtBoundary)return {state:s,events,virtualMs,retries};}
    if(s.mode==='win'){keys(new Set());return {state:s,events,virtualMs,retries};}
    if(s.mode==='gameover'){if(++retries>30)throw Error('Exceeded30 legal checkpoint retries');keys(new Set());press('Enter');advance(100);press('KeyC');advance(100);previous.clear();continue;}
    if(s.paused)throw Error('Unexpected game pause');
    if(s.mode!=='play'){advance(100);continue;}
    const dt=s.time>lastTime?Math.max(.025,s.time-lastTime):.1;lastTime=s.time;
    let target=480,targetCost=Infinity;const next=new Map();
    for(const t of s.targets){const old=previous.get(t.id),vx=old===undefined?0:(t.x-old)/dt;next.set(t.id,t.x);const lead=Math.max(30,Math.min(930,t.x+vx*Math.max(0,(s.ship.y-t.y)/560)));const cost=Math.abs(lead-s.ship.x);if(cost<targetCost){targetCost=cost;target=lead;}}previous=next;
    const pickup=s.pickups.filter(p=>p.y>260&&(p.kind==='gift'?s.weapon<2:s.missiles<5)).sort((a,b)=>b.y-a.y)[0];if(pickup)target=pickup.x;
    let bestX=s.ship.x,bestCost=Infinity;
    for(let x=30;x<=930;x+=15){let cost=Math.abs(x-target)*.16+Math.abs(x-s.ship.x)*.07;
     for(const e of s.eggs){const t=(s.ship.y-e.y)/e.vy;if(t<-.1||t>1.7)continue;cost+=Math.max(0,70-Math.abs(x-e.x-e.vx*Math.max(0,t)))*(1.85-Math.max(0,t))*7;}
     for(const b of s.birds){const t=b.dive?(s.ship.y-b.y)/b.dvy:0,bx=b.x+(b.dive?b.dvx*Math.max(0,t):0);if(Math.abs(b.y-s.ship.y)<95||(b.dive&&t>0&&t<1.5))cost+=Math.max(0,90-Math.abs(bx-x))*14;}
     if(cost<bestCost){bestCost=cost;bestX=x;}}
    const dx=bestX-s.ship.x-s.ship.vx*.13,dy=485-s.ship.y-s.ship.vy*.13,wanted=new Set(['Space']);if(dx>10)wanted.add('ArrowRight');else if(dx< -10)wanted.add('ArrowLeft');if(dy>10)wanted.add('ArrowDown');else if(dy< -10)wanted.add('ArrowUp');keys(wanted);
    if(s.boss&&Math.abs(s.boss.x-s.ship.x)<65&&s.missiles>0&&virtualMs-lastMissile>500){press('KeyX');lastMissile=virtualMs;}
    advance(100);
   }
   return {state:read(),events,virtualMs,retries};
  },
  stop(){keys(new Set());},
  get log(){return log;},
 };
}
