// Human-input routes, authored independently from collision. No runtime assist.
export const phraseTapes={
 pulse:[130,730,1330,2090],echo:[180,720,1330,1930],
 steps:[90,330,520,1160,1910,2400],
 crosswind:[190,570,810,1000,1600,2350],
 stair:[120,600,1030,1560,2070,2310,2500],
 skips:[160,760,1360,1960,2460],
 vault:[120,790,1320,1930,2440],
 surge:[90,330,520,990,1230,1420,2110],
};
export function tapeFor(course){return course.phrases.flatMap((p,i)=>phraseTapes[p].map(x=>x+1440+i*2880));}
