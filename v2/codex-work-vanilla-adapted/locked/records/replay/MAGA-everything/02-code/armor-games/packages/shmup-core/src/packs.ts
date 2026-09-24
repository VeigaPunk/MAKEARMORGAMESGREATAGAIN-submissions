/** Original content packs on one shared engine. The stable `replica` key now
 * selects Starfall Flock's authored solar expedition; `cluck` selects the courier
 * adventure. No original commercial sprites, names, wave scripts or music ship. */
export interface EnemyType {
  name: string;
  color: number;
  headColor: number;
  speed: number; // intentional per-role formation-speed multiplier
  hp: number; // durability
  score: number;
}

export interface BossType { name: string; color: number; headColor: number; hp: number; fan: number; burst: number; tempo: number; drift: number }

export interface WaveDef {
  name: string;
  pattern: 'straight' | 'swoop' | 'dive' | 'orbit' | 'pincer' | 'serpentine';
  rows: number; cols: number; hp: number; eggEvery: number;
}
export interface SectorDef { name: string; subtitle: string; planet: number; waves: WaveDef[]; music: number[] }
const wave = (name: string, pattern: WaveDef['pattern'], rows: number, cols: number, hp = 2, eggEvery = 2.2): WaveDef => ({ name, pattern, rows, cols, hp, eggEvery });

export interface ContentPack {
  id: 'replica' | 'cluck';
  title: string;
  sub: string;
  weapons: string[];
  gift: string;
  food: string;
  enemyTypes: [EnemyType, EnemyType, EnemyType];
  bosses: BossType[];
  ship: number;
  foe: number;
  foe2: number;
  egg: number;
  bg0: number;
  bg1: number;
  accent: number;
  jokes: string[] | null;
  sectors: SectorDef[];
  art: { title: string; ship: string; enemies: string[]; bosses: string[] };
}

export const PACKS: Record<ContentPack['id'], ContentPack> = {
  replica: {
    id: 'replica',
    title: 'STARFALL FLOCK',
    sub: 'Small ship. Big flock. Save the starlight.',
    weapons: ['COMET NEEDLE', 'TWIN NOVA', 'PRISM FAN'],
    gift: 'STAR CACHE',
    food: 'FLIGHT RATION',
    enemyTypes: [
      { name: 'EMBERWING', color: 0xffd43b, headColor: 0xff8787, speed: 1, hp: 2, score: 100 },
      { name: 'COMET SCOUT', color: 0x9be7ff, headColor: 0x4dabf7, speed: 1.18, hp: 1, score: 125 },
      { name: 'PRISM GUARD', color: 0xe2b7ff, headColor: 0xb16ee0, speed: 0.88, hp: 3, score: 175 },
    ],
    bosses: [
      { name: 'THE EMBER ADMIRAL', color: 0xffd43b, headColor: 0xff8787, hp: 110, fan: 1, burst: 12, tempo: 2.4, drift: 0.7 },
      { name: 'QUEEN OF THE PRISM', color: 0xe2b7ff, headColor: 0xb16ee0, hp: 170, fan: 2, burst: 16, tempo: 2.1, drift: 0.8 },
    ],
    ship: 0x4dabf7,
    foe: 0xffd43b,
    foe2: 0xff8787,
    egg: 0xfff3bf,
    bg0: 0x0b0018,
    bg1: 0x1a0b2e,
    accent: 0xffc575,
    jokes: ['Flight log: somebody nested in the observatory.', 'Flight log: the stars are not birdseed.'],
    art: { title: 'title-starfall', ship: 'ship-stargazer', enemies: ['enemy-emberwing', 'enemy-scout', 'enemy-prism'], bosses: ['boss-admiral', 'boss-queen'] },
    sectors: [
      { name: 'EMBER APPROACH', subtitle: 'The observatory has gone quiet.', planet: 0x70427e,
        music: [262,0,330,392,0,330,294,0,262,0,330,440,392,0,330,0,349,0,440,523,0,440,392,0,330,294,262,0,196,0,0,0],
        waves: [wave('First feathers','straight',2,5),wave('Solar slipstream','swoop',1,8),wave('Comet riders','dive',2,5),wave('Halo patrol','orbit',2,5),wave('Twin crescents','pincer',2,6),wave('Starlight slalom','serpentine',2,5),wave('Ember procession','straight',3,5,2,1.9),wave('Nightfall wings','swoop',2,7,2,1.8),wave('Guardians descend','dive',3,5,2,1.7),wave('Admiral escort','pincer',3,6,3,1.7)] },
      { name: 'PRISM CITADEL', subtitle: 'Bring the last lighthouse home.', planet: 0x3562a2,
        music: [294,0,370,440,494,0,440,370,330,0,392,494,523,0,494,392,370,0,440,554,587,0,554,440,392,370,330,294,220,0,0,0],
        waves: [wave('Crystal sentries','orbit',2,6,3,1.9),wave('Aurora ribbon','serpentine',2,6,3,1.8),wave('Crossing comets','pincer',3,5,3,1.8),wave('Quiet constellation','straight',3,6,3,1.7),wave('Glasswing ballet','swoop',2,8,3,1.7),wave('Falling stars','dive',3,6,3,1.6),wave('Crown orbit','orbit',3,6,3,1.6),wave('Prismatic current','serpentine',3,6,3,1.5),wave('Royal interception','pincer',3,7,3,1.5),wave('Last light','dive',3,7,3,1.4)] },
    ],
  },
  cluck: {
    id: 'cluck',
    title: 'CLUCK HORIZON',
    sub: 'Special delivery. Hostile airspace.',
    weapons: ['SOUP LASER', 'SPATULA SPREAD', 'WHISK BARRAGE'],
    gift: 'CRATE',
    food: 'RATIONS',
    enemyTypes: [
      { name: 'FLOCKBIRD', color: 0xffa94d, headColor: 0xffe066, speed: 1, hp: 2, score: 100 },
      { name: 'FLOCKBIRD GLIDER', color: 0xffe066, headColor: 0xffa94d, speed: 1.15, hp: 2, score: 125 },
      { name: 'FLOCKBIRD BRUISER', color: 0xffe677, headColor: 0xffc92a, speed: 0.85, hp: 3, score: 175 },
    ],
    bosses: [
      { name: 'MOTHER GOOSE', color: 0xffa94d, headColor: 0xffe066, hp: 105, fan: 2, burst: 10, tempo: 2.7, drift: 0.6 },
      { name: 'ROOSTER REGENT', color: 0xffe677, headColor: 0xffc92a, hp: 160, fan: 2, burst: 18, tempo: 2.1, drift: 0.85 },
    ],
    ship: 0x20c997,
    foe: 0xffa94d,
    foe2: 0xffe066,
    egg: 0xffe8cc,
    bg0: 0x001a1a,
    bg1: 0x00332b,
    accent: 0x20c997,
    jokes: [
      'Courier log: the flock took my route. Rude.',
      'Courier log: eggs again. Sending them the invoice.',
    ],
    art: { title: 'title-cluck-horizon', ship: 'ship-courier', enemies: ['enemy-flockbird', 'enemy-glider', 'enemy-bruiser'], bosses: ['boss-mother-goose', 'boss-rooster-regent'] },
    sectors: [
      { name: 'THE BREAKFAST BELT', subtitle: 'Your package is out for survival.', planet: 0x187967,
        music: [294,0,370,0,440,370,294,0,494,0,440,370,330,0,220,0,294,370,440,494,440,0,370,0,330,294,247,220,294,0,0,0],
        waves: [wave('Early birds','straight',2,5),wave('Rush-hour roost','pincer',2,5),wave('Side-order swoop','swoop',1,9),wave('Roundabout regulars','orbit',2,5),wave('Express delivery','dive',2,6),wave('The noodle route','serpentine',2,6),wave('Crate expectations','straight',3,5,2,1.9),wave('Return to sender','pincer',2,7,2,1.8),wave('Soup turbulence','swoop',2,7,2,1.8),wave('Goose crossing','orbit',3,5,3,1.7)] },
      { name: 'ROYAL ROOST EXPRESS', subtitle: 'No signature. No surrender.', planet: 0x80542d,
        music: [330,0,392,494,0,392,330,0,587,0,494,440,392,0,247,0,330,392,494,587,659,587,494,0,440,392,330,294,247,0,0,0],
        waves: [wave('Morning commuters','serpentine',2,6,3,1.9),wave('Royal roadworks','straight',3,5,3,1.9),wave('Priority poultry','dive',2,7,3,1.8),wave('Spatula spiral','orbit',3,5,3,1.8),wave('Double booked','pincer',3,6,3,1.7),wave('Gravy gravity','swoop',2,8,3,1.7),wave('The whisk express','serpentine',3,6,3,1.6),wave('Palace patrol','dive',3,6,3,1.6),wave('Crown interchange','orbit',3,7,3,1.5),wave('Final delivery','pincer',3,7,3,1.5)] },
    ],
  },
};


// Full expedition: eleven stops and 110 encounters (nine formations + commander
// at every stop). Original scripts; the source's exact scripts remain unavailable.
const SOLAR_ROUTE: [string,string,number,string,string[]][] = [
 ['PLUTO · FROSTWATCH','The outer lighthouse has gone quiet.',0x705794,'THE FROST ADMIRAL',['Snowflight','Cold orbit','Ice needle convoy','Outer watch','Frozen crescents','Comet slalom','Night patrol','Rime dancers','Last sentries']],
 ['NEPTUNE · BLUE CURRENT','Ride the deepest current home.',0x345bba,'THE TIDAL ORACLE',['Blue sentries','Aurora ribbon','Crossing currents','Deep constellation','Glasswing ballet','Falling tides','Crown of foam','Azure guard','Tidal interception']],
 ['URANUS · TILTED SKY','Nothing flies straight out here.',0x428f99,'THE AXIS KEEPER',['Sideways dawn','Tilted patrol','Mirror moons','Polar crossing','Ribbon of ice','Upside-down escort','The long eclipse','Axial dance','Keeper guards']],
 ['SATURN · RINGROAD','A thousand rings. One way through.',0x9a8151,'THE RING MARSHAL',['Ring entry','Cassini crossing','Golden spokes','Shepherd moons','Braided wings','Halo express','Outer procession','Dust ballet','Marshal escort']],
 ['JUPITER · RED TEMPEST','Stay clear of the red eye.',0x95644a,'THE STORM BARON',['Cloud runners','Amber currents','Storm warning','Eye of the flock','Lightning parade','Thunder dives','Great red circle','Vortex escort','Tempest guard']],
 ['ASTEROIDS · DRIFTWORKS','The shortcut has a few obstacles.',0x6b657c,'THE IRON ROOST',['Stone skippers','Drift traffic','Mineral convoy','Rocky orbit','Ore interception','Gravel dance','Broken crescents','Last prospectors','Iron sentries']],
 ['MARS · COPPER DAWN','Wake the sleeping relay.',0xa84f41,'THE COPPER WARDEN',['Dust dawn','Crater crossing','Red horizon','Phobos patrol','Copper canyon','Dune divers','Relay runners','Scarlet spiral','Warden escort']],
 ['EARTH · BLUE HOMECOMING','Home is worth the detour.',0x337f87,'THE SKY SENTINEL',['Homeward wings','Ocean current','Night-side convoy','Moonlit patrol','Equator crossing','Cloud nine','Daybreak divers','Blue marble guard','Sentinel watch']],
 ['VENUS · GILDED VEIL','Golden clouds hide sharp beaks.',0xa98840,'THE GOLDEN EMPRESS',['Veil entry','Amber wings','Gilded crossing','Bright procession','Sulfur spiral','Cloudfall','Evening star','Dawn star guard','Imperial escort']],
 ['MERCURY · QUICK SILVER','Blink and the horizon changes.',0x858196,'THE SILVER COMET',['Swift sentries','Silver ribbon','Terminator line','Crater ballet','Quick interception','Sunward dive','Molten orbit','Radiant current','Comet escort']],
 ['SUN · STARHEART','Keep the last light burning.',0xb2643d,'THE STARHEART SOVEREIGN',['First flare','Corona patrol','Prominence crossing','Solar wind','Helios procession','Brightest dive','Crown of fire','Last constellation','The final flock']],
];
const prototypeSectors = PACKS.replica.sectors;
PACKS.replica.sectors = SOLAR_ROUTE.map(([name,subtitle,planet,,names],sector) => ({
 name, subtitle, planet,
 music: prototypeSectors[sector % 2].music.map(n=>n ? Math.round(n * [1,1.05946,1.12246,1.1892,1.25992][sector%5]) : 0),
 waves: names.map((name,w) => wave(name,(['straight','swoop','dive','orbit','pincer','serpentine'] as WaveDef['pattern'][])[(w + Math.floor(sector/2))%6],w < 3 ? 2 : 3,sector < 2 ? 5 : w > 6 ? 6 : 5,sector === 0 ? 2 : 3,Math.max(1.5,2.35-sector*.055-w*.035))),
}));
PACKS.replica.bosses = SOLAR_ROUTE.map(([, ,planet,name],i) => ({name,color:planet,headColor:0xffd89b,hp:110+i*10,fan:i<3?1:2,burst:12+2*Math.floor(i/4),tempo:Math.max(1.9,2.6-i*.06),drift:.6+(i%4)*.08}));
PACKS.replica.art.bosses = SOLAR_ROUTE.map((_,i)=>`boss-solar-${i+1}`);
PACKS.replica.jokes = SOLAR_ROUTE.map(([,subtitle])=>`Flight log: ${subtitle}`);
