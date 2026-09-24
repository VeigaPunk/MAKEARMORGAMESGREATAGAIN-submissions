import { Application } from 'pixi.js';
import { Input, Sfx, letterboxOffset, viewport } from '@maga/arcade-core';
import { Game } from './game';
import { TouchControls } from './touch';
import { Lan } from './lan';
import { loadBindings } from './settings';
import { WEAPONS } from './world';
import { save, type Action } from '@maga/arcade-core';

/**
 * Deadlock Rooms bootstrap.
 * Fixed logical stage, proportional letterboxed scaling, unified input, synth SFX.
 */

const STAGE_W = 640;
const STAGE_H = 400;
// badge height is measured live (it wraps on narrow screens — RT-3)
const badgeEl = document.querySelector<HTMLElement>('.badge');

const app = new Application();
await app.init({
  width: STAGE_W,
  height: STAGE_H,
  background: 0x0a0a0f,
  antialias: false,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  // retro 2D: WebGL everywhere, never hang on WebGPU/Dawn edge cases
  preference: 'webgl',
});
document.body.appendChild(app.canvas);
app.canvas.tabIndex = 0;

const input = new Input();
const sfx = new Sfx();
// Mute lives in page chrome, outside the stage,
// so it stays reachable on every screen including menus.
const muteBtn = document.getElementById('mute');
if (muteBtn) {
  const paint = () => { muteBtn.textContent = sfx.muted ? 'SOUND OFF' : 'SOUND ON'; };
  muteBtn.addEventListener('click', () => { sfx.muted = !sfx.muted; paint(); app.canvas.focus({ preventScroll: true }); });
  paint();
}

let cachedScale = 1;
// getBoundingClientRect() already includes the CSS translate() letterbox
// offset — divide by scale only. Subtracting cachedOffset here would
// double-count it and shift every pointer/touch position off-target.
const toLogical = (cx: number, cy: number) => ({
  x: cx / cachedScale,
  y: cy / cachedScale,
});

// TouchControls registers its canvas pointer handlers BEFORE Input.attach:
// zone-claimed touches call stopImmediatePropagation so Input never sees
// them as aim/tap/drag (D-15).
const touch = new TouchControls(STAGE_W, STAGE_H, app.canvas, toLogical);
input.attach(app.canvas, toLogical);

const game = new Game(app, input, sfx, touch);
const lan = new Lan(game,input,touch);
document.getElementById('pause')?.addEventListener('click', () => { if(!lan.pause())game.togglePause(); app.canvas.focus({ preventScroll: true }); });
window.addEventListener('blur', () => {if(game.status()==='playing'&&!lan.pause(true))game.pauseForFocus();});
document.addEventListener('visibilitychange', () => { if (document.hidden&&game.status()==='playing'&&!lan.pause(true)) game.pauseForFocus(); });


// PROOF/debug hook: open with ?debug to expose state for automated acceptance
if (new URLSearchParams(location.search).has('debug')) {
  (window as unknown as { __maga: unknown }).__maga = { game, input, touch };
}

function layout(): void {
  const vp = viewport();
  const badgeH = badgeEl?.offsetHeight ?? 0;
  if (muteBtn) muteBtn.style.top = '8px';
  const pauseBtn = document.getElementById('pause');
  if (pauseBtn) pauseBtn.style.top = '8px';
  const avail = { width: vp.width, height: vp.height - badgeH };
  const s = Math.min(avail.width / STAGE_W, avail.height / STAGE_H, 4);
  const off = letterboxOffset(STAGE_W, STAGE_H, s, avail);
  cachedScale = s;
  touch.setScale(s);
  const cvs = app.canvas as HTMLCanvasElement;
  cvs.style.width = `${STAGE_W * s}px`;
  cvs.style.height = `${STAGE_H * s}px`;
  // single positioning mechanism: fixed canvas + explicit left/top.
  // (flex-centering + translate double-counted the offset — D1/D3 defect)
  cvs.style.left = `${off.x}px`;
  cvs.style.top = `${off.y + badgeH}px`;
}
window.addEventListener('resize', layout);
layout();

app.ticker.add((ticker) => {
  game.tick(ticker.deltaMS / 1000);
  lan.tick(ticker.deltaMS / 1000);
  const mobile=document.getElementById('mobile-status')!;const summary=game.mobileSummary();if(mobile.textContent!==summary)mobile.textContent=summary;
});

const settings=document.getElementById('settings-dialog') as HTMLDialogElement;
const armory=document.getElementById('armory-dialog') as HTMLDialogElement;
const closeSettings=()=>{settings.close();app.canvas.focus({preventScroll:true});};
document.getElementById('settings')!.onclick=()=>{if(!lan.pause(true))game.pauseForFocus();settings.showModal();};
document.getElementById('settings-close')!.onclick=closeSettings;
document.getElementById('resume')!.onclick=()=>{closeSettings();if(game.status()==='paused'&&!lan.pause())game.togglePause();};
document.getElementById('exit-game')!.onclick=()=>{closeSettings();if(game.networkRole)lan.leave();else game.menuExit();};
document.getElementById('weapon')!.onclick=()=>{game.cycleWeapon();app.canvas.focus({preventScroll:true});};
const volume=document.getElementById('volume') as HTMLInputElement;volume.value=String(sfx.volume);volume.oninput=()=>{sfx.volume=Number(volume.value);};
document.getElementById('fullscreen')!.onclick=()=>{if(document.fullscreenElement)void document.exitFullscreen();else void document.documentElement.requestFullscreen().catch(()=>{document.getElementById('settings-message')!.textContent='Fullscreen is unavailable in this browser window.';});};
document.getElementById('armory')!.onclick=()=>armory.showModal();document.getElementById('armory-close')!.onclick=()=>armory.close();
document.getElementById('armory-list')!.innerHTML=WEAPONS.map((w,i)=>`<div class="weapon-card"><small>${i+1} / ${w.at===1?'STARTING EQUIPMENT':'STREAK ×'+w.at}</small><br><b>${w.name}</b><p>${w.detail}</p></div>`).join('');
let keys=loadBindings();let binding:{player:'p1'|'p2';action:Action;button:HTMLButtonElement}|null=null;
const bindings=document.getElementById('key-bindings')!;
for(const player of ['p1','p2'] as const)for(const action of (player==='p1'?['up','down','left','right','fire']:['up','down','left','right','fireUp','fireLeft','fireDown','fireRight']) as Action[]){
 const button=document.createElement('button');const draw=()=>{button.textContent=`${player.toUpperCase()} ${action.toUpperCase()}  ${Object.entries(keys[player]??{}).find(([,a])=>a===action)?.[0]??'DEFAULT'}`;};draw();button.onclick=()=>{binding={player,action,button};button.textContent='PRESS A KEY…';};button.dataset.player=player;button.dataset.action=action;bindings.append(button);
}
window.addEventListener('keydown',e=>{if(!binding)return;e.preventDefault();e.stopImmediatePropagation();const {player,action,button}=binding;binding=null;if(e.code==='Escape'){button.textContent=`${player.toUpperCase()} ${action.toUpperCase()} DEFAULT`;return;}keys[player]??={};for(const [code,a] of Object.entries(keys[player]!))if(a===action)delete keys[player]![code];keys[player]![e.code]=action;input.setKeymaps(keys);save('boxhead','keymaps',keys);button.textContent=`${player.toUpperCase()} ${action.toUpperCase()} ${e.code}`;document.getElementById('settings-message')!.textContent='Binding saved. Standard keys remain active; avoid assigning a key used by the other player.';},true);
document.getElementById('reset-keys')!.onclick=()=>{keys={p1:{},p2:{}};input.setKeymaps(keys);save('boxhead','keymaps',keys);for(const b of bindings.querySelectorAll('button'))b.textContent=`${b.dataset.player!.toUpperCase()} ${b.dataset.action!.toUpperCase()} DEFAULT`;};

window.addEventListener('keydown',e=>{if(game.networkRole&&e.code==='KeyM'&&['paused','dead','victory'].includes(game.status())){e.preventDefault();e.stopImmediatePropagation();lan.leave();}},true);
// Escape closes only the topmost dialog. It must not also resume a paused match.
window.addEventListener('keydown',e=>{
  if(e.code!=='Escape'||!document.querySelector('dialog[open]'))return;
  e.preventDefault();e.stopImmediatePropagation();
  if(armory.open)armory.close();else if(settings.open)closeSettings();else (document.getElementById('lan-dialog') as HTMLDialogElement).close();
},true);
