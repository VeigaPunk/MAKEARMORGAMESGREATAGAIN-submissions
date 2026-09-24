import { load, save } from '@maga/arcade-core';
import { STATS, LOOKS, opponents, tournaments, chapterStories, isHeavyTurn, items, freshSave, readSave, recover, buy, startCombat, playTurn } from './model';
import type { Action, Combat, Stat } from './model';
import { createArena } from './art';
import { ArenaAudio } from './audio';

type Mode = 'create' | 'hub' | 'arena' | 'shop' | 'complete' | 'slots';
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id)! as T;
const chrome = $('chrome'), actions = $('actions'), logEl = $('log');
const savedSlot = load('swords-and-sandals', 'active-slot', 0);
let activeSlot = Number.isInteger(savedSlot) && savedSlot >= 0 && savedSlot < 10 ? savedSlot : 0;
const slotKey = (index: number) => index === 0 ? 'slot' : `slot-${index}`;
const rawSave = load<unknown>('swords-and-sandals', slotKey(activeSlot), null);
let data = readSave(rawSave), notice = rawSave && !data ? 'Your saved gladiator could not be read. Create a new challenger to begin again.' : '';
let state = data ?? freshSave(), mode: Mode = data ? state.defeated === opponents.length ? 'complete' : 'hub' : 'create';
let combat: Combat | null = null, points = data ? 0 : 6, busy = false, impact = -1000, damage = 0, lastAction = '', enemyDamage = 0, healed = 0, generation = 0;
let paused = false;
let lastMusicMode = false, showFullCatalog = false, returnFocus: string | null = null;
const sfx = new ArenaAudio(), paint = createArena($<HTMLCanvasElement>('stage'));
const logLines: string[] = [];
const descriptions: Record<Stat, string> = { strength: 'Damage with every strike', agility: 'Accuracy and critical hits', vitality: 'Maximum health', defense: 'Reduces incoming damage' };
function log(message: string) {
  logLines.unshift(message); logLines.length = Math.min(logLines.length, 10);
  logEl.replaceChildren(...logLines.map(line => { const p = document.createElement('p'); p.textContent = line; return p; }));
}
function persist() {
  save('swords-and-sandals', slotKey(activeSlot), state); save('swords-and-sandals', 'active-slot', activeSlot);
  $('save-status').textContent = JSON.stringify(load('swords-and-sandals', slotKey(activeSlot), null)) === JSON.stringify(state) ? `Saved · Gladiator ${activeSlot + 1}` : 'Saving unavailable · keep this tab open';
}
function text(tag: string, content: string, className = '') { const el = document.createElement(tag); el.textContent = content; el.className = className; return el; }
function button(label: string, hint: string, fn: () => void, disabled = false, parent = actions) {
  const b = document.createElement('button'); b.type = 'button'; b.disabled = disabled || busy || paused;
  b.append(text('strong', label)); if (hint) b.append(text('small', hint));
  b.onclick = () => { if (busy || paused) return; sfx.unlock(); sfx.blip({ wave: 'triangle', freq: 480, freqEnd: 650, duration: .035, volume: .12 }); fn(); }; parent.append(b); return b;
}
function heading(kicker: string, title: string, description: string) { chrome.append(text('p', kicker, 'eyebrow'), text('h2', title), text('p', description, 'description')); }
function render() {
  const focusId = document.activeElement?.getAttribute('data-focus') ?? (!busy ? returnFocus : null);
  actions.setAttribute('aria-busy', String(busy));
  const g = state.gladiator;
  if (lastMusicMode !== (mode === 'arena')) { lastMusicMode = mode === 'arena'; if (!paused) sfx.music(lastMusicMode); }
  document.body.dataset.mode = mode;
  $('player-name').textContent = g.name || 'Your challenger'; $('player-level').textContent = `LEVEL ${g.level}`;
  $('gold').textContent = `${g.gold} GOLD`; $('xp').textContent = `${g.xp} XP`;
  $('player-hp').textContent = `${g.hp} / ${g.maxHp}`;
  $<HTMLProgressElement>('health').max = g.maxHp; $<HTMLProgressElement>('health').value = g.hp;
  const enemy = combat && mode === 'arena' ? combat.opponent : opponents[Math.min(state.defeated, opponents.length - 1)];
  $('enemy-name').textContent = mode === 'complete' ? 'The laurel is yours' : enemy.name;
  $('enemy-hp').textContent = mode === 'arena' && combat ? `${combat.hp} / ${enemy.hp}` : `${enemy.hp} HP`;
  $<HTMLProgressElement>('enemy-health').max = enemy.hp; $<HTMLProgressElement>('enemy-health').value = combat && mode === 'arena' ? combat.hp : enemy.hp;
  $('enemy-status').textContent = mode === 'arena' && combat ? isHeavyTurn(combat.opponent, combat.round + 1) ? 'HEAVY STRIKE INCOMING' : `ROUND ${combat.round + 1} · NORMAL STRIKE` : state.defeated === opponents.length ? 'ARENA CONQUERED' : `BOUT ${state.defeated + 1} OF ${opponents.length}`;
  $('enemy-status').classList.toggle('danger', mode === 'arena' && !!combat && isHeavyTurn(combat.opponent, combat.round + 1));
  $('notice').textContent = notice; $('notice').hidden = !notice;
  $<HTMLInputElement>('volume').value = String(Math.round(sfx.volume * 100)); $('volume-value').textContent = `${Math.round(sfx.volume * 100)}%`;
  $('mute').textContent = sfx.muted ? 'Sound off' : 'Sound on'; $('mute').setAttribute('aria-pressed', String(sfx.muted));
  $('roster').toggleAttribute('disabled', mode === 'arena' || busy);
  $('roster').textContent = `Gladiators · ${activeSlot + 1}/10`;
  const tier = Math.min(tournaments.length - 1, Math.floor(state.defeated / 4));
  $('tournament').textContent = `${tournaments[tier]} · ${Math.min(state.defeated, opponents.length)} / ${opponents.length} victories`;
  const ladder = $('ladder'); ladder.replaceChildren();
  opponents.forEach((o, i) => { if (Math.floor(i / 4) !== tier) return; const el = text('span', `${i < state.defeated ? '✓' : String(i + 1).padStart(2, '0')} ${o.name}`, i < state.defeated ? 'cleared' : i === state.defeated ? 'current' : ''); ladder.append(el); });
  chrome.replaceChildren(); actions.replaceChildren();
  if (mode === 'create') renderCreate();
  else if (mode === 'hub') renderHub();
  else if (mode === 'arena') renderCombat();
  else if (mode === 'shop') renderShop();
  else if (mode === 'slots') renderSlots();
  else {
    heading('THE TWENTYFOLD LAUREL', 'Champion of the arena', `${g.name}, you conquered twenty tournaments and all eighty challengers. The arenas have found their sovereign. Your victories and equipment are saved.`);
    chrome.append(text('p', `${state.defeated} victories · ${g.gold} gold · Level ${g.level}`, 'result'));
    button('View your gladiator', 'Equipment and arena record', () => { mode = 'hub'; render(); });
    button('New gladiator', 'Choose another character slot', () => { mode = 'slots'; render(); });
    button('Retire this champion', 'Start over in this slot', confirmNew);
  }
  if (focusId && !busy) {
    const focused = document.querySelector<HTMLButtonElement>(`[data-focus="${focusId}"]`);
    (focused && !focused.disabled ? focused : actions.querySelector<HTMLButtonElement>('button:not(:disabled)'))?.focus({ preventScroll: true });
    returnFocus = null;
  }
}
function renderCreate() {
  const g = state.gladiator;
  heading('A NAME FOR THE CROWD', 'Forge your gladiator', 'Spend six points to shape your fighting style. Every build can conquer the arena.');
  const label = text('label', 'Gladiator name'); label.setAttribute('for', 'name'); chrome.append(label);
  const input = document.createElement('input'); input.id = 'name'; input.maxLength = 24; input.placeholder = 'Maximus'; input.value = g.name; input.autocomplete = 'off';
  input.oninput = () => { g.name = input.value; $('player-name').textContent = g.name || 'Your challenger'; }; chrome.append(input);
  const looks = document.createElement('div'); looks.className = 'looks';
  LOOKS.forEach(look => { const b = button(look, '', () => { g.look = look; render(); }, false, looks); b.dataset.look = look; b.setAttribute('aria-pressed', String(g.look === look)); }); chrome.append(looks);
  chrome.append(text('p', `${points} skill point${points === 1 ? '' : 's'} remaining`, 'points'));
  STATS.forEach(stat => {
    const row = document.createElement('div'); row.className = 'stat-row';
    const label = document.createElement('span'); label.append(text('strong', stat[0].toUpperCase() + stat.slice(1)), text('small', descriptions[stat]));
    row.append(label);
    const minus = button('−', '', () => { g.stats[stat]--; points++; recover(g); render(); }, g.stats[stat] <= 2, row); minus.setAttribute('aria-label', `Decrease ${stat}`); minus.dataset.focus = `decrease-${stat}`;
    row.append(text('b', String(g.stats[stat])));
    const plus = button('+', '', () => { g.stats[stat]++; points--; recover(g); render(); }, points === 0, row); plus.setAttribute('aria-label', `Increase ${stat}`); plus.dataset.focus = `increase-${stat}`;
    chrome.append(row);
  });
  button('Enter the arena', points ? 'Allocate your remaining points' : 'Your legend starts here', () => { g.name = g.name.trim() || 'Maximus'; recover(g); mode = 'hub'; notice = ''; persist(); log('The gates open. Your first opponent awaits.'); render(); }, points > 0);
}
function renderHub() {
  const g = state.gladiator;
  heading(state.defeated === opponents.length ? 'THE HALL OF CHAMPIONS' : 'BETWEEN THE BOUTS', state.defeated === opponents.length ? 'A legend in the sand' : 'Ready for the next challenger?', 'The healer restores your health and two potions before every bout. Visit the smith to turn your winnings into an advantage.');
  chrome.append(text('p', chapterStories[Math.min(tournaments.length - 1, Math.floor(state.defeated / 4))], 'chapter-story'));
  const gear = document.createElement('div'); gear.className = 'gear';
  gear.append(text('span', `⚔ Weapon +${g.weapon}`), text('span', `◈ Armor +${g.armor}`), text('span', `✚ Potions ${g.potions} · 3 javelins per bout`)); chrome.append(gear);
  if (state.defeated < opponents.length) {
    const o = opponents[state.defeated]; chrome.append(text('p', `NEXT · ${o.name}`, 'next-opponent'), text('p', o.style, 'description'), text('p', `Win ${o.reward} gold and 22 XP.`, 'description'));
    button(state.defeated ? 'Next opponent' : 'Start first bout', 'Enter the colosseum', () => { combat = startCombat(state); if (!combat) return; mode = 'arena'; notice = ''; log(`The crowd chants for ${combat.opponent.name}.`); render(); });
  } else button('Champion’s laurel', 'View your victory', () => { mode = 'complete'; render(); });
  button('Smithy & armory', 'Purchase permanent upgrades', () => { mode = 'shop'; render(); });
}
function renderCombat() {
  if (!combat) return;
  heading('CHOOSE YOUR NEXT MOVE', combat.round ? `Round ${combat.round + 1}` : 'The crowd is waiting', combat.opponent.style);
  const heavy = isHeavyTurn(combat.opponent, combat.round + 1);
  const trait = combat.opponent.trait;
  const phase = trait === 'bulwark' ? ' Bulwark blocks 4 from ordinary attacks.' : trait === 'mender' ? combat.mended ? ' Remedy spent.' : ' One remedy triggers below 40% enemy HP.' : trait === 'berserker' ? combat.hp < combat.opponent.hp * .35 ? ' ENRAGED: replies gain 4 damage.' : ' Enrages below 35% enemy HP.' : trait === 'hexer' ? ' Heavy strikes drain 1 focus.' : trait === 'relentless' ? ' Normal replies deal 2 extra damage.' : '';
  chrome.append(text('p', busy ? 'Steel meets steel…' : `${heavy ? 'Heavy strike incoming. Guard blocks 8 damage.' : 'Normal strike incoming.'}${phase}`, 'intent'));
  button('⚔ Attack', '1 · Reliable strike', () => act('attack'));
  button('✦ Shield breaker', combat.cooldown ? `Ready in ${combat.cooldown} turns` : '2 · Heavy strike + brace', () => act('special'), combat.cooldown > 0);
  button(`✚ Potion (${state.gladiator.potions})`, '3 · Restore 26 HP + brace', () => act('potion'), !state.gladiator.potions || state.gladiator.hp === state.gladiator.maxHp);
  button('◈ Guard', '4 · Block 8 damage · +1 focus', () => act('guard'));
  chrome.append(text('p', `JAVELINS ${combat.ammo} / 3  ·  FOCUS ${combat.focus} / 3`, 'resources'));
  button(`➶ Javelin (${combat.ammo})`, '5 · Guaranteed hit · half armor', () => act('javelin'), combat.ammo < 1);
  button('☀ Sunfire', state.gladiator.level < 3 ? 'Unlocks at level 3' : '6 · 2 focus · ignores armor', () => act('sunfire'), state.gladiator.level < 3 || combat.focus < 2);
  button('☽ Moon ward', state.gladiator.level < 2 ? 'Unlocks at level 2' : '7 · 1 focus · heal + block 6', () => act('ward'), state.gladiator.level < 2 || combat.focus < 1 || state.gladiator.hp === state.gladiator.maxHp);
  button('Leave the bout', 'Return safely · no rewards', () => { generation++; combat = null; recover(state.gladiator); mode = 'hub'; notice = 'You yielded the bout. Your record and gold are unchanged.'; persist(); render(); });
  Array.from(actions.children).forEach((el, i) => (el as HTMLElement).dataset.focus = `combat-${i}`);
}
function renderShop() {
  heading('THE SMITHY & ARMORY', 'A sharper edge. A stronger shield.', 'Purchases equip immediately and remain yours. Armor upgrades replace one another.');
  button(showFullCatalog ? 'Show available upgrades' : 'Show whole catalog', `${items.length} permanent items`, () => { showFullCatalog = !showFullCatalog; render(); });
  items.forEach((it, i) => {
    const owned = state.owned.includes(it.name), better = state.gladiator[it.kind] >= it.bonus;
    if (!showFullCatalog && (owned || better || it.gate > state.gladiator.level + 2)) return;
    const card = document.createElement('div'); card.className = 'shop-item';
    card.append(text('span', it.kind === 'weapon' ? '⚔' : '◈', 'item-icon'), text('h3', it.name), text('p', `+${it.bonus} ${it.kind === 'weapon' ? 'attack damage' : 'damage reduction'}`));
    const caption = owned ? 'Owned' : better ? 'Better gear equipped' : state.gladiator.level < it.gate ? `Unlocks at level ${it.gate}` : state.gladiator.gold < it.price ? `Need ${it.price - state.gladiator.gold} more gold` : 'Buy & equip';
    button(caption, `${it.price} gold · Level ${it.gate}`, () => { if (buy(state, i)) { notice = `${it.name} equipped.`; log(notice); persist(); sfx.cue('buy'); render(); } }, owned || better || state.gladiator.level < it.gate || state.gladiator.gold < it.price, card);
    chrome.append(card);
  });
  button('Return to the hub', 'Your next bout awaits', () => { mode = 'hub'; render(); });
}
function renderSlots() {
  heading('THE GLADIATOR LEDGER', 'Ten paths to the crown', 'Each slot keeps an independent campaign. Select an empty place to forge a new challenger.');
  for (let i = 0; i < 10; i++) {
    const saved = readSave(load('swords-and-sandals', slotKey(i), null));
    button(saved ? `${i + 1}. ${saved.gladiator.name}` : `${i + 1}. New gladiator`, saved ? `${saved.defeated}/${opponents.length} wins · Level ${saved.gladiator.level} · ${saved.gladiator.gold} gold${i === activeSlot ? ' · Current' : ''}` : 'Empty character slot', () => {
      generation++; activeSlot = i; save('swords-and-sandals', 'active-slot', i);
      state = saved ?? freshSave(); combat = null; points = saved ? 0 : 6; mode = saved ? saved.defeated === opponents.length ? 'complete' : 'hub' : 'create'; notice = ''; logLines.length = 0; logEl.replaceChildren(); render();
    });
  }
}
function confirmNew() {
  chrome.replaceChildren(); actions.replaceChildren();
  heading('A NEW LEGEND', 'Retire this gladiator?', 'This replaces only the current slot. Other gladiators remain in your ledger.');
  button('Keep my champion', '', render);
  button('Create new gladiator', '', () => { generation++; save('swords-and-sandals', slotKey(activeSlot), null); state = freshSave(); combat = null; points = 6; mode = 'create'; notice = ''; logLines.length = 0; logEl.replaceChildren(); render(); });
}
function act(action: Action) {
  if (mode !== 'arena' || !combat || busy || paused) return;
  returnFocus = document.activeElement?.getAttribute('data-focus') ?? null;
  const result = playTurn(state, combat, action);
  if (!result.messages.length) return;
  result.messages.forEach(log); damage = result.damage; enemyDamage = result.enemyDamage; healed = result.healed; lastAction = action; impact = performance.now(); busy = true;
  sfx.unlock(); sfx.cue(action === 'potion' || action === 'ward' ? 'heal' : action === 'sunfire' ? 'magic' : action === 'guard' ? 'guard' : result.damage ? 'steel' : 'miss');
  render();
  const currentGeneration = generation;
  window.setTimeout(() => {
    if (currentGeneration !== generation) return;
    busy = false;
    if (result.outcome !== 'playing') {
      notice = result.messages.join(' ');
      if (result.outcome === 'victory' && state.defeated < opponents.length && state.defeated % 4 === 0) notice += ` Tournament won! Welcome to ${tournaments[Math.floor(state.defeated / 4)]}.`;
      mode = state.defeated === opponents.length ? 'complete' : 'hub';
      persist(); if (!paused) sfx.cue(result.outcome === 'victory' ? 'win' : 'loss');
    }
    render();
  }, 420);
}
function pauseGame() {
  if (paused) return; paused = true; sfx.suspend();
  $<HTMLDialogElement>('pause-dialog').showModal();
}
function resumeGame() {
  if (!paused) return; paused = false; $<HTMLDialogElement>('pause-dialog').close(); sfx.music(mode === 'arena'); render();
}
$('pause').onclick = pauseGame; $('resume').onclick = resumeGame;
$('pause-dialog').addEventListener('cancel', e => { e.preventDefault(); resumeGame(); });
$('volume').oninput = () => { sfx.volume = Number($<HTMLInputElement>('volume').value) / 100; $('volume-value').textContent = `${Math.round(sfx.volume * 100)}%`; sfx.unlock(); };
$('roster').onclick = () => { if (mode === 'arena' || busy) return; mode = 'slots'; render(); };
$('mute').onclick = () => { sfx.unlock(); sfx.muted = !sfx.muted; render(); };
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !e.repeat) { e.preventDefault(); paused ? resumeGame() : pauseGame(); return; }
  if (paused || e.repeat || (e.target as HTMLElement).matches('input,textarea,select,[contenteditable]')) return;
  const action = ({ '1': 'attack', '2': 'special', '3': 'potion', '4': 'guard', '5': 'javelin', '6': 'sunfire', '7': 'ward' } as Record<string, Action>)[e.key];
  if (action && mode === 'arena') { e.preventDefault(); act(action); }
});
function frame(now: number) { if (!paused) paint({ gladiator: state.gladiator, opponent: mode === 'arena' && combat ? opponents.indexOf(combat.opponent) : Math.min(state.defeated, opponents.length - 1), fighting: mode === 'arena', champion: mode === 'complete', now, impact, damage, enemyDamage, healed, action: lastAction }); requestAnimationFrame(frame); }
if (new URLSearchParams(location.search).has('debug')) Object.defineProperty(window, '__maga', { value: {
  get mode() { return mode; }, get screen() { return mode; }, get gladiatorStats() { return { ...state.gladiator.stats }; },
  get hp() { return state.gladiator.hp; }, get gold() { return state.gladiator.gold; }, get xp() { return state.gladiator.xp; }, get level() { return state.gladiator.level; },
  get opponent() { return state.defeated; }, get opponentHp() { return combat?.hp ?? 0; }, get shop() { return items.map(x => ({ ...x })); },
  get snapshot() { return structuredClone({ state, combat, mode, busy, activeSlot, paused }); }, get savePresent() { return load('swords-and-sandals', slotKey(activeSlot), null) !== null; },
} });
document.addEventListener('visibilitychange', () => { if (document.hidden) sfx.suspend(); else if (!paused) sfx.music(mode === 'arena'); });
log(data ? `Welcome back, ${state.gladiator.name}. ${state.defeated} victories are recorded in the arena ledger.` : 'A new challenger approaches the gates. Choose your name and fighting style.');
render(); requestAnimationFrame(frame);
