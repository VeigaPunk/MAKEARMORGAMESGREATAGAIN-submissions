import { COURSES } from './courses';
/** Five original arrangements, rendered locally. A seekable buffer makes retry,
 * practice, pause and focus restoration share the exact simulation transport. */
export class Score {
 private ctx:AudioContext|null=null;
 private master:GainNode|null=null;
 private source:AudioBufferSourceNode|null=null;
 private buffer:AudioBuffer|null=null;
 private course=-1;
 private anchor=0;
 private offset=0;
 volume=.6; muted=false;
 private render(index:number):AudioBuffer{
  const ctx=this.ctx!,course=COURSES[index],rate=22050;
  const buffer=ctx.createBuffer(1,Math.ceil((course.end/360+2)*rate),rate),data=buffer.getChannelData(0);
  const note=(midi:number)=>440*2**((midi-69)/12);
  const tone=(at:number,duration:number,midi:number,gain:number,kind:'bass'|'lead'|'pad')=>{
   const start=Math.floor(at*rate),length=Math.floor(duration*rate),freq=note(midi);
   for(let i=0;i<length&&start+i<data.length;i++){
    const t=i/rate,u=i/length,attack=Math.min(1,t/.012),release=Math.min(1,(1-u)*12);
    const phase=t*freq*Math.PI*2;
    const wave=kind==='bass'?Math.sin(phase)*.75+Math.sin(phase*2)*.18:kind==='lead'?Math.sin(phase)+Math.sin(phase*2)*.23+Math.sin(phase*3)*.08:Math.sin(phase)+Math.sin(phase*1.003)*.3;
    data[start+i]+=wave*gain*attack*release*(kind==='pad'?.75:Math.exp(-u*2.3));
   }
  };
  const drum=(at:number,kind:'kick'|'snare'|'hat',gain:number)=>{
   const start=Math.floor(at*rate),length=Math.floor((kind==='hat'?.07:.19)*rate);let seed=0x1234+start;
   for(let i=0;i<length&&start+i<data.length;i++){
    const t=i/rate;seed=(Math.imul(seed,1664525)+1013904223)|0;
    const noise=(seed>>>0)/2147483648-1;
    const wave=kind==='kick'?Math.sin(2*Math.PI*(45*t+55*.028*(1-Math.exp(-t/.028)))):kind==='snare'?noise*.7+Math.sin(t*2*Math.PI*185)*.3:noise;
    data[start+i]+=wave*gain*Math.exp(-t*(kind==='hat'?65:kind==='snare'?24:26));
   }
  };
  const melodies=[
   [0,7,12,7,3,7,10,7,0,7,15,12,10,7,3,7],
   [0,12,7,10,2,7,14,10,0,7,12,19,14,10,7,2],
   [0,4,7,12,16,12,7,4,2,7,11,14,19,14,11,7],
   [0,0,7,10,12,7,3,7,0,12,15,10,7,3,10,7],
   [0,7,10,14,12,7,3,10,2,9,12,17,14,10,7,2],
  ];
  const progressions=[[0,-5,-2,-7],[0,-2,-5,-7],[0,-3,-5,-7],[0,-5,-7,-2],[0,-7,-5,-2]];
  const beats=Math.ceil(course.end/180);
  for(let beat=0;beat<beats;beat++){
   const at=beat*.5,bar=Math.floor(beat/4),phrase=Math.floor(Math.max(0,beat-8)/16);
   const root=course.key+progressions[index][Math.floor(bar/2)%4];
   const section=Math.min(4,Math.floor(phrase/course.phrases.length*5));
   if(beat%4===0){tone(at,1.95,root+12,.026,'pad');tone(at,1.95,root+19,.021,'pad');tone(at,1.95,root+(index===2?28:27),.019,'pad');}
   tone(at,.38,root+(beat%4===3?7:0),.11,'bass');
   drum(at,'kick',beat%2===0?.22:.10);
   if(beat%4===1||beat%4===3)drum(at,'snare',.055);
   if(beat>=8){drum(at,'hat',.022);drum(at+.25,'hat',.015);}
   if(beat>=8){
    const mi=(beat+Math.floor(phrase/4)*4)%16;
    tone(at,.32,root+24+melodies[index][mi],section===2?.055:.07,'lead');
    if(section===1||section>=3)tone(at+.25,.20,root+24+melodies[index][(mi+5)%16],.032,'lead');
   }
   if(beat%16===15){drum(at+.25,'snare',.033);if(section>=3)drum(at+.375,'snare',.025);}
  }
  for(let i=0;i<data.length;i++)data[i]=Math.tanh(data[i]*1.4)*.8;
  return buffer;
 }
 unlock():void{
  if(!this.ctx){try{this.ctx=new AudioContext();this.master=this.ctx.createGain();this.master.connect(this.ctx.destination);}catch{return;}}
  if(this.ctx.state==='suspended')void this.ctx.resume().catch(()=>{});
 }
 play(index:number,time:number,offsetMs=0):void{
  this.unlock();if(!this.ctx||!this.master)return;
  this.stop();if(this.course!==index||!this.buffer){this.course=index;this.buffer=this.render(index);}
  this.offset=offsetMs/1000;
  const requested=time+this.offset,position=Math.max(0,requested),delay=Math.max(0,-requested);
  this.source=this.ctx.createBufferSource();this.source.buffer=this.buffer;this.source.connect(this.master);
  this.anchor=this.ctx.currentTime-requested;this.source.start(this.ctx.currentTime+delay,Math.min(position,this.buffer.duration-.01));this.applyVolume();
 }
 stop():void{if(this.source){try{this.source.stop();}catch{}this.source.disconnect();this.source=null;}}
 applyVolume():void{if(this.master&&this.ctx)this.master.gain.setTargetAtTime(this.muted?0:this.volume,this.ctx.currentTime,.015);}
 sync(index:number,time:number,offsetMs:number):void{
  if(!this.source||this.course!==index||this.offset!==offsetMs/1000){this.play(index,time,offsetMs);return;}
  if(this.ctx&&Math.abs(this.ctx.currentTime-this.anchor-(time+this.offset))>.08)this.play(index,time,offsetMs);
 }
 get status(){return {available:!!this.ctx,state:this.ctx?.state??'uninitialized',playing:!!this.source,course:this.course,position:this.ctx?this.ctx.currentTime-this.anchor:0};}
}
