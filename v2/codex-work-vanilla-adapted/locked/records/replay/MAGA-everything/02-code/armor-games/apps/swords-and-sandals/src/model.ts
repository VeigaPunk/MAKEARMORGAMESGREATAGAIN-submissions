/** Pure arena rules. RNG is supplied so progression can be replayed without bypassing combat. */
export const STATS = ['strength', 'agility', 'vitality', 'defense'] as const;
export type Stat = typeof STATS[number];
export const LOOKS = ['Scarlet', 'Azure', 'Gold'] as const;
export type Look = typeof LOOKS[number];
export interface Gladiator {
  name: string; look: Look; stats: Record<Stat, number>; hp: number; maxHp: number;
  gold: number; xp: number; level: number; weapon: number; armor: number; potions: number;
}
export interface SaveData { gladiator: Gladiator; defeated: number; owned: string[] }
export const tournaments = ['The Sand Pit', 'The Bronze Circuit', 'The Imperial Games', 'The Moonlit Crucible', 'The Crown Ascendant', 'The Saltwater Crown', 'The Verdant Trial', 'The Ashen Oath', 'The Clockwork Lists', 'The Festival of Masks', 'The Winter Colosseum', 'The Sapphire Covenant', 'The Iron Orchard', 'The Hollow Mountain', 'The Gilded Tempest', 'The Starfall Games', 'The Amber Rebellion', 'The Silent Citadel', 'The Dawn Concord', 'The Arena Eternal'];
export type ChampionTrait = 'bulwark' | 'mender' | 'berserker' | 'hexer' | 'relentless';
export interface Opponent { name: string; hp: number; strength: number; defense: number; reward: number; rhythm: number; burst: number; style: string; trait?: ChampionTrait }

export const opponents: Opponent[] = [
  { name: 'Tin Can Tim', hp: 34, strength: 5, defense: 1, reward: 28, rhythm: 3, burst: 4, style: 'A clumsy club fighter. Watch for his overhead swing.' },
  { name: 'Baron Bonk', hp: 48, strength: 7, defense: 3, reward: 42, rhythm: 3, burst: 4, style: 'A showman with a sharp sword and a predictable wind-up.' },
  { name: 'The Sand Snorter', hp: 62, strength: 9, defense: 4, reward: 58, rhythm: 3, burst: 4, style: 'A sturdy shield bearer. Break through with heavy strikes.' },
  { name: 'Emperor’s Champion', hp: 78, strength: 11, defense: 5, reward: 80, rhythm: 3, burst: 4, style: 'The Sand Pit title holder. His gilded axe means business.' },
  { name: 'Cassia Quickblade', hp: 90, strength: 12, defense: 5, reward: 95, rhythm: 2, burst: 3, style: 'Fast flurries every second turn. Stay light on your feet.' },
  { name: 'Gaius Ironwall', hp: 102, strength: 13, defense: 6, reward: 115, rhythm: 4, burst: 7, style: 'Patient and armored. A crushing fourth-turn counter.' },
  { name: 'Darius the Anvil', hp: 116, strength: 15, defense: 7, reward: 135, rhythm: 3, burst: 5, style: 'A hammering veteran. Good armor will earn its keep.' },
  { name: 'The Bronze Minotaur', hp: 130, strength: 17, defense: 8, reward: 160, rhythm: 4, burst: 8, style: 'The Bronze Circuit champion. Brace for his fourth-turn charge.' },
  { name: 'Vesper of the Dunes', hp: 146, strength: 18, defense: 9, reward: 190, rhythm: 2, burst: 3, style: 'A relentless duelist. Her flurries arrive every other turn.' },
  { name: 'The Ivory Sentinel', hp: 162, strength: 20, defense: 10, reward: 225, rhythm: 4, burst: 8, style: 'Imperial armor and perfect patience. Prepare for the counter.' },
  { name: 'Praetor Bloodsun', hp: 180, strength: 22, defense: 11, reward: 270, rhythm: 3, burst: 6, style: 'The emperor’s final guardian. There is no room for rusty gear.' },
  { name: 'Aurex, the Sun Regent', hp: 208, strength: 22, defense: 12, reward: 340, rhythm: 3, burst: 6, style: 'The sun regent guards the road beyond the capital. Brace for his third-turn sun strike.' },
  { name: 'Neris, the Moon Archer', hp: 226, strength: 24, defense: 13, reward: 380, rhythm: 2, burst: 4, style: 'A crescent blade and a quick second-turn flurry. Javelins pierce her guard.' },
  { name: 'Thorn of the Salt Flats', hp: 242, strength: 25, defense: 14, reward: 420, rhythm: 4, burst: 9, style: 'Four measured steps precede his salt-hammer strike. Guard to gather focus.' },
  { name: 'Moth, the Silent Blade', hp: 260, strength: 27, defense: 15, reward: 470, rhythm: 3, burst: 7, style: 'A patient shadow with a third-turn lunge. Save a ward for the worst reply.' },
  { name: 'Selene, Crucible Keeper', hp: 278, strength: 28, defense: 16, reward: 520, rhythm: 4, burst: 10, style: 'The moonlit champion. Her fourth-turn eclipse punishes reckless attacks.' },
  { name: 'Brasswing the Unbowed', hp: 296, strength: 29, defense: 17, reward: 580, rhythm: 2, burst: 4, style: 'The first crown finalist never stops pressing. Armor and focus buy breathing room.' },
  { name: 'The Glass Oracle', hp: 316, strength: 30, defense: 18, reward: 640, rhythm: 3, burst: 8, style: 'A mirrored shield conceals a heavy third-turn strike. Sunfire ignores armor.' },
  { name: 'Orin, the Last Banner', hp: 338, strength: 32, defense: 19, reward: 720, rhythm: 4, burst: 10, style: 'The last standard bearer holds the gate. His fourth-turn banner strike is thunderous.' },
  { name: 'The Crownless King', hp: 364, strength: 33, defense: 20, reward: 900, rhythm: 3, burst: 8, style: 'The final sovereign fights for the arena itself. Read his third-turn crown strike and claim your place.' },
];
export const chapterStories = [
  'A wooden gate. A roaring crowd. Every legend begins with a name nobody knows.',
  'The pit has learned your name. The bronze guild invites you to face its finest.',
  'Banners fill the capital. Win the imperial games and earn the road to the crown.',
  'Beyond the capital, moonlit champions test those who would wear the laurel.',
  'The capital stands behind you. Win its crown and carry your banner to the fifteen distant arenas.',
];
export const items = [
  { name: 'Bent Bronze Sword', kind: 'weapon' as const, price: 22, gate: 1, bonus: 3 },
  { name: 'Lucky Sandals', kind: 'armor' as const, price: 38, gate: 2, bonus: 3 },
  { name: 'Imperial Buckler', kind: 'armor' as const, price: 65, gate: 2, bonus: 5 },
  { name: 'Legionnaire’s Edge', kind: 'weapon' as const, price: 95, gate: 3, bonus: 6 },
  { name: 'Bronze Legion Plate', kind: 'armor' as const, price: 145, gate: 4, bonus: 8 },
  { name: 'Minotaur’s Cleaver', kind: 'weapon' as const, price: 190, gate: 4, bonus: 10 },
  { name: 'Sunforged Aegis', kind: 'armor' as const, price: 270, gate: 5, bonus: 12 },
  { name: 'The Emperor’s Verdict', kind: 'weapon' as const, price: 300, gate: 6, bonus: 15 },
  { name: 'Moonsteel Mantle', kind: 'armor' as const, price: 420, gate: 7, bonus: 16 },
  { name: 'Crescent of the Crucible', kind: 'weapon' as const, price: 460, gate: 8, bonus: 20 },
  { name: 'Fivefold Crownplate', kind: 'armor' as const, price: 580, gate: 9, bonus: 22 },
  { name: 'Oath of the Arena', kind: 'weapon' as const, price: 650, gate: 10, bonus: 27 },
];
// Fifteen further authored circuits complete the twenty-champion campaign.
// Progression numbers are original balance data, never asserted as historical reference formulas.
const distantCircuits: { story: string; names: [string, string, string, string]; armor: string; weapon: string; trait: ChampionTrait; rhythm: number }[] = [
  { story: 'The tide fills a ring carved from white salt. The harbor champion awaits beneath a crown of shells.', names: ['Kelpcoat Finn', 'Mara of the Quays', 'Breakwater Brann', 'Admiral Pearl'], armor: 'Breakwater Mail', weapon: 'Tidecaller', trait: 'bulwark', rhythm: 3 },
  { story: 'Roots split the old arena stones. The grove will recognize only a patient, living champion.', names: ['Briar Bess', 'Rowan Reedblade', 'Elder Mossback', 'The Verdant Hart'], armor: 'Rootbound Guard', weapon: 'Thornwake', trait: 'mender', rhythm: 4 },
  { story: 'No sun reaches the forge-ring. Its champion has kept an oath alive in the embers.', names: ['Cinder Noll', 'Sootwing Vera', 'Blacksmith Roan', 'The Ashen Marshal'], armor: 'Cinderplate', weapon: 'Ember Oath', trait: 'berserker', rhythm: 3 },
  { story: 'Bronze gears turn under the benches. Every crowd cheer follows a clockwork drum.', names: ['Rivet Pip', 'Pendulum Pell', 'Copper Iris', 'Master Horologe'], armor: 'Clockwork Cuirass', weapon: 'Second Hand', trait: 'hexer', rhythm: 4 },
  { story: 'A thousand masks conceal the crowd. A challenger must earn the right to show their true face.', names: ['Laughing Lark', 'The Scarlet Mime', 'Velvet Voss', 'Lady Masquerade'], armor: 'Masquerade Mantle', weapon: 'Reveler’s Edge', trait: 'relentless', rhythm: 2 },
  { story: 'The northern arena glitters with frost. Beneath its ice, an old champion refuses to yield.', names: ['Frostcap Fenn', 'White Bear Rook', 'Niva Northwind', 'Jarl of the Long Night'], armor: 'Winterward', weapon: 'Frostbreaker', trait: 'bulwark', rhythm: 5 },
  { story: 'Blue banners promise an honest contest. The covenant keeper will test every promise you make.', names: ['Cobalt Cala', 'Riverblade Renn', 'The Azure Warden', 'Sapphira the Steadfast'], armor: 'Covenant Plate', weapon: 'Blue Vow', trait: 'mender', rhythm: 3 },
  { story: 'Farmers forged their tools into armor. Here, the harvest champion stands for a hundred villages.', names: ['Sickle Sid', 'Rustling Fern', 'The Iron Reaper', 'Juniper Steelroot'], armor: 'Harvest Harness', weapon: 'Orchard Reaver', trait: 'berserker', rhythm: 4 },
  { story: 'A stone crowd listens from the dark. The mountain remembers every footstep in its ring.', names: ['Pebble Penn', 'Echo of Slate', 'Boulder Bera', 'The Hollow King'], armor: 'Deepstone Shell', weapon: 'Mountain Echo', trait: 'hexer', rhythm: 3 },
  { story: 'A storm gathers over golden pennants. Thunder will keep time for the next four bouts.', names: ['Raincoat Rell', 'Kestrel Volt', 'The Bronze Thunder', 'Tempest Aurelia'], armor: 'Stormgilt Plate', weapon: 'Lightning Promise', trait: 'relentless', rhythm: 3 },
  { story: 'Fallen stars shine in the sand. The observatory champion guards the oldest path to the laurel.', names: ['Comet Corin', 'Astral Mera', 'The Falling Star', 'Magister Nightglass'], armor: 'Meteor Mantle', weapon: 'Starfall', trait: 'bulwark', rhythm: 4 },
  { story: 'The amber city has no emperor. Its champion fights so that every citizen may enter the games.', names: ['Amber Ada', 'Copper Jack', 'The Free Standard', 'Captain Sunwren'], armor: 'Rebel’s Aegis', weapon: 'Liberty Blade', trait: 'mender', rhythm: 5 },
  { story: 'The citadel asks for silence before steel. Its final defender has never heard a crowd cheer.', names: ['Hush of Ash', 'Stillwater Sera', 'The Muted Bell', 'Warden Everquiet'], armor: 'Citadel Carapace', weapon: 'Silent Answer', trait: 'berserker', rhythm: 2 },
  { story: 'All nineteen roads meet beneath the dawn. Win the concord and the eternal gates will open.', names: ['Firstlight Faye', 'Beacon of Brass', 'Dawnkeeper Osric', 'The Concordant Flame'], armor: 'Dawn Concord Mail', weapon: 'Daybreak Oath', trait: 'hexer', rhythm: 5 },
  { story: 'The champions of every arena fill the stands. The last laurel belongs to the fighter who carries them all.', names: ['The Twentyfold Herald', 'Banner of Every Dawn', 'The Last Challenger', 'Lyra, Crown of the Free'], armor: 'Twentyfold Regalia', weapon: 'The People’s Crown', trait: 'relentless', rhythm: 4 },
];
const traitText: Record<ChampionTrait, string> = {
  bulwark: 'Bulwark: normal weapon strikes lose 4 damage; shield breaker, javelins and Sunfire bypass it.',
  mender: 'Mender: once below 40% health, restores 12% health instead of attacking.',
  berserker: 'Berserker: below 35% health, every reply gains 4 damage.',
  hexer: 'Hexer: heavy strikes also drain 1 focus. Spend it before the wind-up lands.',
  relentless: 'Relentless: every non-heavy reply gains 2 damage. There is no quiet round.',
};
distantCircuits.forEach((circuit, chapter) => {
  chapterStories.push(circuit.story);
  circuit.names.forEach((name, slot) => {
    const step = chapter * 4 + slot + 1, champion = slot === 3;
    opponents.push({ name, hp: 364 + step * 13, strength: 33 + Math.ceil(step * 1.08), defense: 20 + Math.floor(step * .55), reward: 960 + step * 38, rhythm: champion ? circuit.rhythm : [3, 4, 2][slot], burst: champion ? 8 + chapter % 4 : 4 + slot, style: champion ? `Tournament champion. ${traitText[circuit.trait]} Heavy strike every ${circuit.rhythm} turns.` : `A ${['measured duelist', 'patient shield bearer', 'swift arena veteran'][slot]} of ${tournaments[chapter + 5]}. Heavy strikes arrive every ${[3, 4, 2][slot]} turns.`, ...(champion ? { trait: circuit.trait } : {}) });
  });
  const gate = 12 + chapter * 2;
  items.push({ name: circuit.armor, kind: 'armor', price: 850 + chapter * 125, gate, bonus: 26 + chapter * 3 });
  items.push({ name: circuit.weapon, kind: 'weapon', price: 980 + chapter * 140, gate, bonus: 32 + chapter * 4 });
});
export const isHeavyTurn = (opponent: typeof opponents[number], round: number) => round % opponent.rhythm === 0;
export interface Combat { opponent: typeof opponents[number]; hp: number; round: number; cooldown: number; ammo: number; focus: number; mended: boolean; finished: boolean }
export type Action = 'attack' | 'special' | 'potion' | 'guard' | 'javelin' | 'sunfire' | 'ward';
export interface TurnResult { messages: string[]; outcome: 'playing' | 'victory' | 'defeat'; damage: number; enemyDamage: number; healed: number }
export const maxHealth = (g: Gladiator) => 36 + g.stats.vitality * 5 + (g.level - 1) * 6;
export function freshSave(): SaveData {
  const gladiator: Gladiator = { name: '', look: 'Scarlet', stats: { strength: 2, agility: 2, vitality: 2, defense: 2 }, hp: 46, maxHp: 46, gold: 0, xp: 0, level: 1, weapon: 0, armor: 0, potions: 2 };
  return { gladiator, defeated: 0, owned: [] };
}
export function recover(g: Gladiator) { g.maxHp = maxHealth(g); g.hp = g.maxHp; g.potions = 2; }
const integer = (x: unknown, min: number, max: number): x is number => Number.isSafeInteger(x) && Number(x) >= min && Number(x) <= max;
/** Reject corrupt payloads before any value reaches rendering. Old valid slot saves migrate. */
export function readSave(value: unknown): SaveData | null {
  if (!value || typeof value !== 'object') return null;
  const s = value as SaveData, g = s.gladiator;
  if (!g || typeof g !== 'object' || !integer(s.defeated, 0, opponents.length) || typeof g.name !== 'string' || g.name.length > 24 || !LOOKS.includes(g.look)) return null;
  if (!g.stats || !STATS.every(k => integer(g.stats[k], 2, 8)) || STATS.reduce((sum, k) => sum + g.stats[k], 0) !== 14) return null;
  if (!(['hp', 'maxHp', 'gold', 'xp', 'level', 'weapon', 'armor', 'potions'] as const).every(k => integer(g[k], 0, k === 'gold' ? 1000000 : 10000))) return null;
  if (g.level !== 1 + Math.floor(g.xp / 40) || g.xp !== s.defeated * 22 || g.potions > 2 || g.hp > g.maxHp) return null;
  if (s.owned !== undefined && (!Array.isArray(s.owned) || s.owned.some(x => !items.some(it => it.name === x)) || new Set(s.owned).size !== s.owned.length)) return null;
  const owned = s.owned?.slice() ?? items.filter(it => g[it.kind] >= it.bonus).map(it => it.name);
  const result: SaveData = { defeated: s.defeated, owned, gladiator: { ...g, stats: { ...g.stats } } };
  // Recompute equipment and health from supported data; never trust arbitrary saved bonuses.
  for (const kind of ['weapon', 'armor'] as const) result.gladiator[kind] = Math.max(0, ...items.filter(it => it.kind === kind && owned.includes(it.name)).map(it => it.bonus));
  recover(result.gladiator);
  return result;
}
export function buy(s: SaveData, index: number): boolean {
  const it = items[index], g = s.gladiator;
  if (!it || s.owned.includes(it.name) || g.gold < it.price || g.level < it.gate || g[it.kind] >= it.bonus) return false;
  g.gold -= it.price; s.owned.push(it.name); g[it.kind] = it.bonus;
  return true;
}
export function startCombat(s: SaveData): Combat | null {
  const opponent = opponents[s.defeated];
  if (!opponent) return null;
  recover(s.gladiator);
  return { opponent, hp: opponent.hp, round: 0, cooldown: 0, ammo: 3, focus: 2, mended: false, finished: false };
}
export function playTurn(s: SaveData, c: Combat, action: Action, random = Math.random): TurnResult {
  const g = s.gladiator, messages: string[] = [];
  const result: TurnResult = { messages, outcome: 'playing', damage: 0, enemyDamage: 0, healed: 0 };
  if (!['attack', 'special', 'potion', 'guard', 'javelin', 'sunfire', 'ward'].includes(action) || c.finished || c.hp <= 0 || (action === 'javelin' && c.ammo < 1) || (action === 'sunfire' && (g.level < 3 || c.focus < 2)) || (action === 'ward' && (g.level < 2 || c.focus < 1 || g.hp === g.maxHp)) || (action === 'special' && c.cooldown > 0) || (action === 'potion' && (g.potions < 1 || g.hp === g.maxHp))) return result;
  c.round++;
  c.cooldown = Math.max(0, c.cooldown - 1);
  let guard = action === 'guard' ? 8 : 0;
  if (action === 'javelin' || action === 'sunfire') {
    if (action === 'javelin') {
      c.ammo--; result.damage = Math.max(1, 7 + g.stats.agility + (g.level - 1) * 2 - Math.floor(c.opponent.defense / 2));
      messages.push(`Javelin hits for ${result.damage}. ${c.ammo} remain this bout.`);
    } else {
      c.focus -= 2; result.damage = 10 + g.stats.strength + (g.level - 1) * 2;
      messages.push(`Sunfire bypasses armor for ${result.damage}.`);
    }
    c.hp = Math.max(0, c.hp - result.damage);
  } else if (action === 'ward') {
    c.focus--; result.healed = Math.min(g.maxHp - g.hp, 12 + g.level * 2); g.hp += result.healed; guard = 6;
    messages.push(`Moon ward restores ${result.healed} HP and blocks 6 damage.`);
  } else if (action === 'potion') {
    g.potions--; result.healed = Math.min(g.maxHp - g.hp, 26); g.hp += result.healed; guard = 3;
    messages.push('Potion restores up to 26 HP. You brace for the reply.');
  } else if (action === 'guard') { c.focus = Math.min(3, c.focus + 1); messages.push('You raise your guard. Incoming damage reduced by 8. +1 focus.'); }
  else {
    const special = action === 'special';
    if (special) { c.cooldown = 2; guard = 2; }
    const chance = Math.min(.97, (special ? .76 : .84) + g.stats.agility * .02);
    if (random() < chance) {
      const crit = random() < .08 + g.stats.agility * .01;
      result.damage = Math.max(1, (special ? 10 : 5) + g.stats.strength + g.weapon + (g.level - 1) * 2 + (crit ? 5 : 0) - c.opponent.defense - (!special && c.opponent.trait === 'bulwark' ? 4 : 0));
      c.hp = Math.max(0, c.hp - result.damage);
      messages.push(`${crit ? 'Critical hit! ' : ''}${special ? 'Shield breaker' : 'Attack'} deals ${result.damage} damage.`);
    } else messages.push('Your strike misses. Keep your guard up.');
  }
  if (c.hp === 0) {
    c.finished = true; s.defeated++; g.gold += c.opponent.reward; g.xp += 22;
    const oldLevel = g.level; g.level = 1 + Math.floor(g.xp / 40); recover(g);
    messages.push(`Victory over ${c.opponent.name}! +${c.opponent.reward} gold · +22 XP.`);
    if (g.level > oldLevel) messages.push(`Level ${g.level}! +6 maximum HP and +2 attack damage.`);
    result.outcome = 'victory'; return result;
  }
  if (c.opponent.trait === 'mender' && !c.mended && c.hp < c.opponent.hp * .4) {
    c.mended = true; const healing = Math.ceil(c.opponent.hp * .12); c.hp = Math.min(c.opponent.hp, c.hp + healing);
    messages.push(`${c.opponent.name} mends ${healing} HP instead of attacking. The remedy is spent.`); return result;
  }
  const heavy = isHeavyTurn(c.opponent, c.round);
  const traitDamage = c.opponent.trait === 'berserker' && c.hp < c.opponent.hp * .35 ? 4 : c.opponent.trait === 'relentless' && !heavy ? 2 : 0;
  if (heavy && c.opponent.trait === 'hexer' && c.focus > 0) { c.focus--; messages.push('The hexed strike drains 1 focus.'); }
  const damage = Math.max(1, c.opponent.strength + traitDamage + Math.floor(random() * 3) + (heavy ? c.opponent.burst : 0) - g.stats.defense - g.armor - guard);
  result.enemyDamage = damage; g.hp = Math.max(0, g.hp - damage);
  messages.push(`${c.opponent.name}${heavy ? ' unleashes a heavy strike' : ' replies'} for ${damage}.`);
  if (g.hp === 0) {
    c.finished = true; recover(g); result.outcome = 'defeat';
    messages.push('Defeat. The healer restores your health and two potions. Retry without losing gold.');
  }
  return result;
}
