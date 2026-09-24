/** Browser scheduler only. Production animation callbacks still execute at
 * 20 Hz and the unchanged game runs its own 120 Hz fixed-step/collisions. */
export function installBrowserClock() {
 const nativeRAF=window.requestAnimationFrame.bind(window), nativeNow=performance.now.bind(performance);
 let time=nativeNow(),anchor=time,wall=time,automatic=true,id=0;const pending=new Map();
 Object.defineProperty(performance,'now',{configurable:true,value:()=>time});
 window.requestAnimationFrame=callback=>{pending.set(++id,callback);return id;};
 window.cancelAnimationFrame=key=>pending.delete(key);
 const flush=()=>{const callbacks=[...pending.values()];pending.clear();for(const callback of callbacks)callback(time);};
 // Keep a native presentation heartbeat while gameplay time is paused. Without
 // it Chromium can defer compositor/input acknowledgements indefinitely.
 const frame=()=>{if(automatic){time=anchor+nativeNow()-wall;flush();}nativeRAF(frame);};
 nativeRAF(frame);
 window.__shmupClock={
  pause(){automatic=false;},
  pump(ms){const count=Math.ceil(ms/50),step=ms/count;for(let i=0;i<count;i++){time+=step;flush();}},
  resume(){if(automatic)return;automatic=true;anchor=time;wall=nativeNow();},
  get time(){return time;},
 };
}
