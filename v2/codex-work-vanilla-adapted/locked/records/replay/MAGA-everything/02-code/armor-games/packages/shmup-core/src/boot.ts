import { Application } from 'pixi.js';
import { Input, Sfx, letterboxOffset, viewport, load, save } from '@maga/arcade-core';
import type { ContentPack } from './packs';
import { DT, STAGE_H, STAGE_W, ShmupSim, type SimEvent } from './sim';
import { ShmupRenderer } from './render';
import { ShmupTouch } from './touch';

/**
 * Shared app bootstrap for the shmup skeleton — everything a pack app needs:
 * Pixi Application (webgl, fixed stage), proportional letterbox, unified input,
 * touch zones, synth SFX, music bed, 120Hz fixed-step loop, ?debug hook.
 * Apps call `bootShmup(PACKS.x, '<storage-ns>')` and are done.
 */

function playEvent(sfx: Sfx, e: SimEvent, pack: ContentPack): void {
  switch (e) {
    case 'shoot': sfx.blip({wave:pack.id === 'cluck' ? 'triangle' : 'sine',freq:pack.id === 'cluck' ? 720 : 1100,freqEnd:280,duration:0.055,volume:0.11}); break;
    case 'missile': sfx.blip({ wave: 'sawtooth', freq: 180, freqEnd: 900, duration: 0.25 }); break;
    case 'hit': sfx.preset('hit'); break;
    case 'death': sfx.preset('death'); break;
    case 'pickup': sfx.blip({wave:'triangle',freq:pack.id === 'cluck' ? 587 : 660,freqEnd:1320,duration:0.18,volume:0.6}); break;
    case 'ui': sfx.preset('ui'); break;
    case 'bossSpawn': sfx.blip({ wave: 'sawtooth', freq: 90, freqEnd: 220, duration: 0.6, volume: 0.8 }); break;
    case 'bossDown': sfx.blip({ wave: 'triangle', freq: 220, freqEnd: 880, duration: 0.5 }); break;
    case 'chapterClear': sfx.blip({ wave: 'triangle', freq: 440, freqEnd: 880, duration: 0.35 }); break;
    case 'gameOver': sfx.blip({ wave: 'sawtooth', freq: 320, freqEnd: 40, duration: 0.7, volume: 0.8 }); break;
    case 'win': sfx.blip({ wave: 'triangle', freq: 330, freqEnd: 1320, duration: 0.6 }); break;
  }
}

export interface ShmupHandles {
  app: Application;
  sim: ShmupSim;
  input: Input;
  touch: ShmupTouch;
  renderer: ShmupRenderer;
  sfx: Sfx;
}

export async function bootShmup(pack: ContentPack, game: string): Promise<ShmupHandles> {
  const badgeEl = document.querySelector<HTMLElement>('.badge');
  const muteBtn = document.getElementById('mute');

  const app = new Application();
  await app.init({
    width: STAGE_W,
    height: STAGE_H,
    background: pack.bg0,
    antialias: true,
    resolution: Math.min(2, Math.max(1, window.devicePixelRatio || 1)),
    autoDensity: true,
    // retro 2D: WebGL everywhere, never hang on WebGPU/Dawn edge cases
    preference: 'webgl',
  });
  document.body.appendChild(app.canvas);
  app.canvas.tabIndex = 0;

  const input = new Input();
  const sfx = new Sfx();
  if (muteBtn) {
    const paint = () => { muteBtn.textContent = sfx.muted ? 'SOUND OFF' : 'SOUND ON'; };
    muteBtn.addEventListener('click', () => { sfx.muted = !sfx.muted; paint(); app.canvas.focus({ preventScroll: true }); });
    paint();
  }

  let cachedScale = 1;
  // getBoundingClientRect() already includes the CSS letterbox offset —
  // divide by scale only (D-09: subtracting it double-counts the offset).
  const toLogical = (cx: number, cy: number) => ({ x: cx / cachedScale, y: cy / cachedScale });

  // ShmupTouch registers canvas pointer handlers BEFORE Input.attach:
  // zone-claimed touches call stopImmediatePropagation so Input never sees
  // them as taps (D-15).
  const touch = new ShmupTouch(STAGE_W, STAGE_H, app.canvas, toLogical);
  input.attach(app.canvas, toLogical);

  const sim = new ShmupSim(pack, game);
  const settings = load<{ music?: boolean; reducedMotion?: boolean; touch?: string }>(game, 'settings', {}) || {};
  let musicEnabled = settings.music !== false;
  sim.reducedMotion = settings.reducedMotion === true;
  touch.layout = settings.touch === 'one' ? 'one' : 'twin';
  const persistSettings = () => save(game, 'settings', { music: musicEnabled, reducedMotion: sim.reducedMotion, touch: touch.layout });
  const dialog = document.createElement('dialog');
  dialog.className = 'flight-settings';
  dialog.innerHTML = `<form method="dialog"><header><small>FLIGHT DECK</small><h1>Make yourself at home.</h1></header>
    <label class="setting-row" for="flight-volume">Master volume <input id="flight-volume" type="range" min="0" max="100" value="${sfx.volume*100}" aria-label="Master volume"></label>
    <label class="setting-row"><span>Sector music</span><input id="flight-music" type="checkbox" ${musicEnabled?'checked':''}></label>
    <label class="setting-row"><span>Reduced motion</span><input id="flight-motion" type="checkbox" ${sim.reducedMotion?'checked':''}></label>
    <label class="setting-row" for="flight-touch">Touch controls <select id="flight-touch"><option value="twin">Twin thumbs</option><option value="one">One thumb + autofire</option></select></label>
    <p>Move with WASD or arrows. Hold Space, Z or left mouse to fire. X, Shift or right mouse launches a missile. P or Esc pauses.</p>
    <p>Twin thumbs: steer on the left, hold FIRE on the right. One thumb: drag anywhere in the flight lane to steer and shoot. Lift your finger to stop.</p>
    <div class="settings-actions"><button id="flight-hangar" type="button">Save &amp; hangar</button><button id="flight-close" value="close">BACK TO FLIGHT</button></div>
    <small>Your flight resumes at the start of the last wave. Settings and records save on this device.</small></form>`;
  document.body.appendChild(dialog);
  (dialog.querySelector('#flight-touch') as HTMLSelectElement).value = touch.layout;
  let priorPause = false;
  document.getElementById('settings')?.addEventListener('click', () => { priorPause = sim.paused; sim.paused = true; input.reset(); dialog.showModal(); });
  dialog.addEventListener('keydown', e => { if (e.key === 'Escape') e.stopPropagation(); });
  dialog.addEventListener('close', () => { sim.paused = priorPause; input.reset(); app.canvas.focus({ preventScroll: true }); });
  dialog.querySelector('#flight-volume')?.addEventListener('input', e => { sfx.volume = Number((e.target as HTMLInputElement).value)/100; });
  dialog.querySelector('#flight-music')?.addEventListener('change', e => { musicEnabled = (e.target as HTMLInputElement).checked; persistSettings(); });
  dialog.querySelector('#flight-motion')?.addEventListener('change', e => { sim.reducedMotion = (e.target as HTMLInputElement).checked; persistSettings(); });
  dialog.querySelector('#flight-touch')?.addEventListener('change', e => { touch.layout = (e.target as HTMLSelectElement).value === 'one' ? 'one' : 'twin'; persistSettings(); });
  dialog.querySelector('#flight-hangar')?.addEventListener('click', () => { sim.mode = 'title'; priorPause = false; dialog.close(); });
  const mobile = document.createElement('aside');
  mobile.className = 'portrait-flight';
  mobile.innerHTML = `<div id="portrait-status" aria-live="off"></div><div class="portrait-actions"><button id="portrait-launch">LAUNCH FLIGHT</button><button id="portrait-continue">CONTINUE</button></div><p id="portrait-help"></p>`;
  document.body.appendChild(mobile);
  const mobileStatus = mobile.querySelector<HTMLElement>('#portrait-status')!;
  const mobileHelp = mobile.querySelector<HTMLElement>('#portrait-help')!;
  const mobileLaunch = mobile.querySelector<HTMLButtonElement>('#portrait-launch')!;
  const mobileContinue = mobile.querySelector<HTMLButtonElement>('#portrait-continue')!;
  mobileLaunch.addEventListener('click', () => { if (sim.mode === 'gameover' || sim.mode === 'win') sim.confirmEnd(); sim.startGame(sim.titleSel); app.canvas.focus(); });
  mobileContinue.addEventListener('click', () => { sim.resumeGame(); app.canvas.focus(); });
  const renderer = new ShmupRenderer(sim);
  app.stage.addChild(renderer.view, touch.view);
  app.canvas.addEventListener('contextmenu', e => e.preventDefault());
  app.canvas.addEventListener('pointerdown', e => { if (e.button === 2) { e.preventDefault(); sim.fireMissile(); } });
  const pauseOnBlur = () => { if (sim.mode === 'play' || sim.mode === 'clear') sim.paused = true; };
  window.addEventListener('blur', pauseOnBlur);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseOnBlur(); });
  document.getElementById('pause')?.addEventListener('click', () => { sim.togglePause(); app.canvas.focus({ preventScroll: true }); });

  // keybinds beyond arcade-core defaults (proto: Z fire, X/Shift missile,
  // R/Enter end-screen confirm, 1/2 chapter select)
  input.setKeymaps({
    p1: {
      KeyZ: 'fire',
      KeyX: 'action', ShiftLeft: 'action', ShiftRight: 'action',
      KeyR: 'action',
      Digit1: 'slot1', Digit2: 'slot2', KeyC: 'slot3',
    },
  });

  // PROOF/debug hook: open with ?debug to expose state for automated acceptance
  if (new URLSearchParams(location.search).has('debug')) {
    (window as unknown as { __maga: unknown }).__maga = {
      sim, input, touch, renderer, app,
      get state() { return sim.snapshot(); },
    };
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
    // single positioning mechanism: fixed canvas + explicit left/top (D-12)
    cvs.style.left = `${off.x}px`;
    cvs.style.top = `${off.y + badgeH}px`;
  }
  window.addEventListener('resize', layout);
  layout();

  let musicOn = false;
  let musicChapter = 0;
  let acc = 0;
  app.ticker.add((ticker) => {
    // ---- flow input (per render frame; edge-triggered) ----
    if (dialog.open) { input.reset(); }
    else if (sim.mode === 'title') {
      if (input.wasPressed('slot1')) sim.selectChapter(Math.max(1, sim.titleSel - 1));
      if (input.wasPressed('slot2')) sim.selectChapter(Math.min(sim.unlocked, sim.titleSel + 1));
      if (input.wasPressed('slot3')) sim.resumeGame();
      if (input.wasPressed('fire') || input.wasPressed('action')) sim.startGame(sim.titleSel);
      if (input.pointer.tapped) sim.titleClick(input.pointer.x, input.pointer.y);
    } else if (sim.mode === 'gameover' || sim.mode === 'win') {
      if (input.wasPressed('fire') || input.wasPressed('action') || input.pointer.tapped) sim.confirmEnd();
    } else if (sim.mode === 'play' || sim.mode === 'clear') {
      if (input.wasPressed('pause') || (sim.paused && input.pointer.tapped)) sim.togglePause();
    }
    touch.setActive(sim.mode === 'play' && !sim.paused);

    // ---- combat input ----
    const axis = input.moveAxis(sim.ship.x, sim.ship.y, 40, false); // touch handled by zones (D-15)
    if (touch.drag) { axis.x = touch.drag.x; axis.y = touch.drag.y; }
    sim.moveAxis.x = axis.x; sim.moveAxis.y = axis.y;
    // LMB fires (fine pointer); touch fire comes from the FIRE zone or drag autofire
    const pointerFire = input.pointer.active && input.pointer.seen && !matchMedia('(pointer: coarse)').matches;
    sim.setFire(input.isDown('fire') || touch.fire || pointerFire || touch.autoFire);
    if (input.wasPressed('action') || touch.takeMissile()) sim.fireMissile();

    // ---- fixed-step sim ----
    acc += Math.min(0.1, ticker.deltaMS / 1000);
    while (acc >= DT) { sim.step(DT); acc -= DT; }

    // ---- music bed follows mode ----
    const wantMusic = sim.mode === 'play' && !sim.paused && musicEnabled;
    if (wantMusic && (!musicOn || musicChapter !== sim.chapter)) { sfx.startMusic(sim.sector.music,pack.id === 'cluck' ? 155 : 175,{volume:0.16}); musicOn = true; musicChapter = sim.chapter; }
    if (!wantMusic && musicOn) { sfx.stopMusic(); musicOn = false; }

    // ---- drain events → SFX ----
    for (const e of sim.events) playEvent(sfx, e, pack);
    sim.events.length = 0;

    const pauseButton = document.getElementById('pause');
    if (pauseButton) pauseButton.textContent = sim.paused ? 'RESUME' : 'PAUSE';
    const onMenu = sim.mode === 'title' || sim.mode === 'gameover' || sim.mode === 'win';
    mobileLaunch.hidden = !onMenu;
    mobileContinue.hidden = sim.mode !== 'title' || !sim.checkpoint;
    mobileStatus.textContent = onMenu ? pack.title : `${sim.sector.name} · ${sim.boss ? 'COMMANDER' : `WAVE ${sim.waveIdx+1}/${sim.wavesTotal}`}\nSCORE ${sim.score}   ♥ ${sim.lives}   MISSILES ${sim.missileN}`;
    mobileHelp.textContent = touch.layout === 'one' ? 'DRAG TO STEER + AUTO FIRE · TAP M FOR MISSILE' : 'LEFT THUMB STEERS · RIGHT THUMB HOLDS FIRE';
    touch.tick();
    renderer.draw();
    input.endFrame();
  });

  return { app, sim, input, touch, renderer, sfx };
}
