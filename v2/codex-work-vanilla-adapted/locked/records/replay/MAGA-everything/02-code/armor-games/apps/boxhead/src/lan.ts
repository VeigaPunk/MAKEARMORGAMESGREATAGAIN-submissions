import type { Game } from './game';
import type { Input } from '@maga/arcade-core';
import type { TouchControls } from './touch';
import { ROOMS } from './world';

/** LAN transport: browser-hosted authority, two clients, authenticated local relay. */
export class Lan {
  private stream:EventSource|null=null;
  private token='';private code='';private ready=false;private lastFrame=0;private clock=0;private busy=false;private pendingPause=false;private pendingRetry=false;private desiredPause=false;private awaitingStart=false;
  private dialog=document.getElementById('lan-dialog') as HTMLDialogElement;
  private status=document.getElementById('lan-status')!;
  private lamp=document.getElementById('network-state')!;
  constructor(private game:Game,private input:Input,private touch:TouchControls){
    const rooms=document.getElementById('lan-room') as HTMLSelectElement;
    ROOMS.forEach((r,i)=>rooms.add(new Option(r.name,String(i))));
    document.getElementById('lan')!.onclick=()=>{if(!this.pause(true))game.pauseForFocus();this.dialog.showModal();};
    document.getElementById('lan-close')!.onclick=()=>{this.dialog.close();};
    document.getElementById('lan-create')!.onclick=()=>void this.connect(true);
    document.getElementById('lan-join')!.onclick=()=>void this.connect(false);
    document.getElementById('lan-leave')!.onclick=()=>this.leave();
    document.getElementById('lan-start')!.onclick=()=>{
      if(!this.ready||game.networkRole!=='host')return;
      game.startNetwork((document.getElementById('lan-mode') as HTMLSelectElement).value==='deathmatch'?'deathmatch':'coop',Number(rooms.value));
      this.dialog.close();document.querySelector('canvas')?.focus();void this.send({type:'frame',frame:game.capture()});
    };
    window.addEventListener('beforeunload',()=>{if(this.token)navigator.sendBeacon('/__lan/leave',new Blob([JSON.stringify({token:this.token,code:this.code})],{type:'application/json'}));});
  }
  private async request(path:string,data:unknown){
    const response=await fetch('/__lan/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(4000)});
    const body=await response.json();if(!response.ok)throw new Error(body.error??'Connection failed');return body;
  }
  private async connect(host:boolean){
    if(this.token)this.leave();
    this.status.textContent='Connecting…';
    try{
      const r=await this.request(host?'create':'join',{code:(document.getElementById('lan-code') as HTMLInputElement).value.trim().toUpperCase()});
      this.token=r.token;this.code=r.code;this.awaitingStart=!host;this.game.networkRole=host?'host':'guest';this.game.networkBlocked=true;this.lastFrame=performance.now();
      this.status.textContent=`ROOM ${r.code} · ${host?'You are P1. Share this code and this page address.':'You are P2. Waiting for host to start.'}`;
      this.stream=new EventSource(`/__lan/events?code=${r.code}&token=${r.token}`);
      this.stream.onmessage=e=>{const m=JSON.parse(e.data);this.lastFrame=performance.now();
        if(m.type==='presence'){this.ready=m.count===2;this.game.networkBlocked=!this.ready;(document.getElementById('lan-start') as HTMLButtonElement).disabled=!host||!this.ready;this.lamp.textContent=this.ready?`LAN ${this.code} · P${host?1:2}`:`LAN ${this.code} · WAITING`;if(!this.ready)this.input.reset();}
        if(m.type==='frame'&&!host){this.game.networkBlocked=false;this.game.applyFrame(m.frame);if(this.ready&&this.awaitingStart&&['playing','paused'].includes(m.frame.state)){this.awaitingStart=false;this.dialog.close();document.querySelector('canvas')?.focus();}}
        if(m.type==='input'&&host){if(this.ready){this.game.networkBlocked=false;this.lamp.textContent=`LAN ${this.code} · P1`;}this.game.remote={axis:m.axis,aim:m.aim,fire:m.fire,weapon:m.weapon,at:performance.now()};if(m.pause){if(m.desiredPause)this.game.pauseForFocus();else this.game.togglePause();}if(m.retry&&(this.game.status()==='dead'||this.game.status()==='victory'))document.getElementById('lan-start')?.click();}
        if(m.type==='closed'){this.leave();this.status.textContent='The other player left. Create or join a new room.';this.dialog.showModal();}
      };
      this.stream.onerror=()=>{this.ready=false;this.game.networkBlocked=true;this.input.reset();this.touch.setActive(false);this.lamp.textContent='LAN · RECONNECTING';};
    }catch(error){this.status.textContent=`${(error as Error).message}. Start the bundled LAN host, then open its address on both devices.`;}
  }
  private async send(payload:Record<string,unknown>){
    if(this.busy)return;this.busy=true;
    try{await this.request('send',{code:this.code,token:this.token,...payload});}catch{this.game.networkBlocked=true;this.lamp.textContent='LAN · CONNECTION LOST';}finally{this.busy=false;}
  }
  public pause(desired=false):boolean {if(this.game.networkRole==='guest'){if(!desired||this.game.status()==='playing'){this.pendingPause=true;this.desiredPause=desired;}return true;}return false;}
  public tick(dt:number):void {
    if(!this.token)return;
    this.clock+=dt;
    if(performance.now()-this.lastFrame>5000&&this.game.networkRole==='guest'){this.game.networkBlocked=true;this.lamp.textContent='LAN · WAITING FOR HOST';}
    if(this.game.networkRole==='host'&&this.game.remote&&performance.now()-this.game.remote.at>2500){this.game.networkBlocked=true;this.lamp.textContent='LAN · WAITING FOR PLAYER TWO';}
    if(!this.ready)return;
    if(this.game.networkRole==='guest'){
      const end=this.game.status()==='dead'||this.game.status()==='victory';
      if(end&&this.input.pointer.tapped&&Math.abs(this.input.pointer.x-320)<64&&Math.abs(this.input.pointer.y-356)<20){this.leave();this.input.endFrame();return;}
      const pause=this.input.wasPressed('pause')||(this.game.status()==='paused'&&(this.input.wasPressed('fire')||this.input.pointer.tapped));const retry=(this.game.status()==='dead'||this.game.status()==='victory')&&(this.input.wasPressed('fire')||this.input.pointer.tapped);
      this.pendingPause ||= pause;this.pendingRetry ||= retry;
      if(!this.busy&&(this.clock>=1/30||this.pendingPause||this.pendingRetry)){const axis=this.touch.stick??this.input.moveAxis(0,0,0,false);const weapon=this.game.consumeWeaponPress();void this.send({type:'input',axis,aim:this.game.remoteAim(),fire:this.input.isDown('fire')||this.touch.fire,weapon:weapon?weapon-1:-1,pause:this.pendingPause,desiredPause:this.desiredPause,retry:this.pendingRetry});this.pendingPause=false;this.desiredPause=false;this.pendingRetry=false;this.clock=0;}
      this.input.endFrame();
    }else if(this.clock>=1/20&&['playing','paused','dead','victory'].includes(this.game.status())){void this.send({type:'frame',frame:this.game.capture()});this.clock=0;}
  }
  public leave():void {
    if(this.token)void this.request('leave',{token:this.token,code:this.code}).catch(()=>{});
    this.stream?.close();this.stream=null;this.token='';this.ready=false;this.game.networkRole=null;this.game.networkBlocked=false;this.game.remote=null;this.lamp.textContent='';this.game.menuExit();this.status.textContent='Create a room or enter a room code.';(document.getElementById('lan-start') as HTMLButtonElement).disabled=true;
  }
}
