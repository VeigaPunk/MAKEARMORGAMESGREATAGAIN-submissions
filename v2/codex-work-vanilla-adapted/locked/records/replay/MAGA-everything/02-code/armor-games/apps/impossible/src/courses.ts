/** Original charts: each phrase is four 4/4 bars at 120 BPM (2,880 px).
 * Fixed authored phrase order gives musical recall; there is no random generation. */
export type Obstacle = [type: 'gap' | 'spike' | 'block', x: number, w: number, h?: number];
export interface Course {
 name: string; subtitle: string; obstacles: Obstacle[]; end: number; checkpoints: number[];
 sky: string; horizon: string; accent: string; key: number; phrases: string[]; sections: string[];
}
const s=(x:number,n=1):Obstacle[]=>Array.from({length:n},(_,i)=>['spike',x+i*40,40]);
const g=(x:number,w=170):Obstacle=>['gap',x,w];
const b=(x:number,h=90,w=100):Obstacle=>['block',x,w,h];
export const PHRASES:Record<string,Obstacle[]>={
 pulse:[...s(240),...s(840),...s(1440,2),g(2160,130)],
 echo:[g(240),b(840,110,90),...s(1440,2),...s(2040)],
 steps:[...s(240),b(440),...s(640),...s(1240,3),g(1960,200),b(2520,70,120)],
 crosswind:[g(240,200),...s(720),b(920),...s(1120),...s(1680,3),g(2400,200)],
 stair:[b(240,110,90),b(720,70,120),...s(1140),g(1620),...s(2220),b(2420),...s(2620)],
 skips:[...s(240,3),...s(840,3),...s(1440,3),...s(2040,3),b(2580,70,120)],
 vault:[b(240,70,120),g(840,200),b(1440,110,90),g(1980,200),...s(2520,3)],
 surge:[...s(240),b(440),...s(640),...s(1140),b(1340),...s(1540),g(2160,200)],
};
function chart(name:string,subtitle:string,phrases:string[],sky:string,horizon:string,accent:string,key:number,sections:string[]):Course{
 const lead=1440,span=2880;
 return {name,subtitle,phrases,sky,horizon,accent,key,sections,
  obstacles:phrases.flatMap((p,i)=>PHRASES[p].map(([t,x,w,h])=>[t,x+lead+i*span,w,h] as Obstacle)),
  end:lead+phrases.length*span,
  checkpoints:phrases.map((_,i)=>lead+i*span-180).filter((_,i)=>i%2===0),
 };
}
export const COURSES:Course[]=[
 chart('First Light','Find your footing',
 ['pulse','pulse','echo','pulse','echo','vault','pulse','echo','steps','pulse','vault','steps'],
 '#f5efdf','#c9bea6','#d98722',48,['Wake','Call','Response','Lift','Daybreak']),
 chart('Blue Shift','Trust the landing',
 ['echo','vault','echo','steps','stair','echo','crosswind','vault','steps','stair','crosswind','echo','surge'],
 '#e2eef0','#8ca8bd','#2875b7',50,['Signal','Drift','Orbit','Afterimage','Arrival']),
 chart('Glasswork','A clear head, a steady hand',
 ['skips','echo','stair','vault','steps','skips','surge','stair','crosswind','vault','surge','skips','stair','crosswind'],
 '#e7eee4','#a4b8a0','#397e63',53,['Facet','Refraction','Prism','Fracture','Clarity']),
 chart('Emberline','Commit to the rhythm',
 ['steps','surge','crosswind','skips','stair','vault','surge','crosswind','steps','stair','skips','surge','vault','crosswind','stair'],
 '#f3e1db','#c69587','#b75232',45,['Spark','Fuel','Ignition','Flare','Afterglow']),
 chart('Event Horizon','Bring it all together',
 ['crosswind','stair','surge','skips','vault','surge','stair','crosswind','steps','skips','surge','crosswind','stair','vault','surge','skips','crosswind'],
 '#eae3f2','#aaa0c2','#7153aa',47,['Threshold','Gravity','Freefall','Singularity','Beyond']),
];
export const LEVEL=COURSES[0].obstacles,LEVEL_END=COURSES[0].end,CHECKPOINTS=COURSES[0].checkpoints;
