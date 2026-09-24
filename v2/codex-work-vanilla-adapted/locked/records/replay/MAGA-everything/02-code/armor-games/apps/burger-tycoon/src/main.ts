import { Sfx, load, save } from '@maga/arcade-core';
import { Sim, PANES, managementDefaults, type SimState, type PaneKey } from './sim';
import { createScene } from './scenes.js';

const sim = new Sim(), sfx = new Sfx();
let best = load('burger-tycoon', 'best-time', 0), pane = 0, paused = true, started = false;
let last = performance.now(), saveAt = 0, paintAt = 0, sceneAt = 0, previousBacklash = 0;
let speed = 1, reducedMotion = load('burger-tycoon', 'reduced-motion', matchMedia('(prefers-reduced-motion: reduce)').matches);
const byId = (id: string) => document.getElementById(id)!;
const dashboard = byId('dashboard'), hud = byId('hud'), tabs = byId('tabs'), log = byId('log'), overlay = byId('overlay'), pauseBtn = byId('pause'), mute = byId('mute');
const titles = ['Farmland', 'Feedlot', 'Restaurant', 'Headquarters'];
const subtitles = ['Grow the supply. Count the cost.', 'From pasture to patty.', 'Keep the line moving.', 'Make the numbers look good.'];
const names = [['Plant soy', 'Buy cattle', 'Clear rainforest', 'Lease pasture', 'Restore woodland'], ['Emergency slaughter', 'Use cheap feed', 'Veterinary visit', 'Upgrade processing line'], ['Run a promotion', 'Cut corners', 'Hire crew', 'Paid training'], ['Marketing campaign', 'PR spin', 'Bribe officials', 'Take a bridge loan', 'Repay creditors']];
const costs = [[0, 80, 0, 180, 90], [0, 0, 70, 200], [40, 0, 75, 60], [120, 100, 200, 0, 150]];
const music = [196,0,247,294,330,0,294,247,220,0,262,330,392,330,262,0,175,0,220,262,330,0,294,262,196,247,294,0,220,0,147,0,196,247,294,392,370,330,294,247,220,0,262,330,294,262,220,0,175,220,262,349,330,294,262,220,196,0,247,294,220,147,196,0];

function validRun(value: unknown): value is SimState {
  if (!value || typeof value !== 'object') return false;
  const s = value as SimState;
  const numeric = ['cash', 'rep', 'backlash', 'crops', 'cattle', 'patties', 'demand', 'boardPressure', 'disease', 't', 'lastProfit'] as const;
  return numeric.every(k => typeof s[k] === 'number' && Number.isFinite(s[k]) && s[k] >= 0 && s[k] < 1e9) && s.rep <= 100 && s.backlash <= 100 && s.demand <= 3 && !!s.dirty && ['deforest', 'cheapFeed', 'cutCorners'].every(k => s.dirty[k as keyof SimState['dirty']] === 0 || s.dirty[k as keyof SimState['dirty']] === 1) && s.over === false;
}
const saved = load<unknown>('burger-tycoon', 'run', null), hasSave = validRun(saved);
if (hasSave) {
  const safe = managementDefaults();
  if (saved.management && typeof saved.management === 'object') for (const key of Object.keys(safe) as (keyof typeof safe)[]) {
    const value = saved.management[key];
    if (typeof value === 'number' && Number.isFinite(value) && value >= -100 && value < 1e9) safe[key] = value;
  }
  safe.fields = Math.max(1, Math.min(5, Math.floor(safe.fields))); safe.staff = Math.max(3, Math.min(6, Math.floor(safe.staff))); safe.line = Math.max(0, Math.min(3, Math.floor(safe.line))); safe.morale = Math.max(0, Math.min(100, safe.morale)); safe.loans = Math.max(0, Math.min(3, Math.floor(safe.loans))); safe.debt = Math.max(0, safe.debt);
  sim.s = { ...saved, management: safe, rates: { ...sim.s.rates }, overReason: '' }; sim.log('Operations restored. All four departments are paused.');
} else sim.reset();

const cards = PANES.map((p, i) => {
  const card = document.createElement('section'); card.className = 'operation'; card.dataset.pane = String(i);
  const heading = document.createElement('div'); heading.className = 'operation-heading';
  const num = document.createElement('span'); num.className = 'number'; num.textContent = `0${i + 1}`;
  const title = document.createElement('h2'); title.textContent = titles[i];
  const subtitle = document.createElement('p'); subtitle.textContent = subtitles[i]; heading.append(num, title, subtitle);
  const canvas = document.createElement('canvas'); canvas.width = 656; canvas.height = 300; canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', `${titles[i]} animated operation. All resources and actions are listed below.`);
  const metrics = document.createElement('div'); metrics.className = 'metrics';
  const status = document.createElement('p'); status.className = 'operation-status';
  const actions = document.createElement('div'); actions.className = 'operation-actions';
  const buttons = sim.actions[p.key].map((a, j) => {
    const b = document.createElement('button'); b.className = a.dirty ? 'dirty' : ''; b.dataset.action = `${p.key}-${j}`;
    const name = document.createElement('strong'); name.textContent = names[i][j];
    const detail = document.createElement('small'); detail.textContent = a.label.match(/\((.*)\)/)?.[1] ?? a.label;
    b.append(name, detail); b.onclick = () => { if (paused || sim.s.over) return; const result = sim.act(p.key, j); if (result) { sfx.preset('ui'); toast(result); persist(); paint(); } else toast('That action is unavailable. Check its cost and the department status.'); }; actions.append(b); return b;
  });
  card.append(heading, canvas, metrics, status, actions); dashboard.append(card);
  const tab = document.createElement('button'); tab.textContent = `${i + 1} ${titles[i]}`; tab.onclick = () => setPane(i); tabs.append(tab);
  return { card, canvas, draw: createScene(canvas.getContext('2d')!), metrics, status, buttons, key: p.key };
});
function setPane(i: number): void { pane = i; cards.forEach((c, n) => c.card.classList.toggle('selected', n === i)); [...tabs.children].forEach((b, n) => { b.classList.toggle('selected', n === i); b.setAttribute('aria-pressed', String(n === i)); }); }
function toast(message: string): void { byId('toast').textContent = message; }
function persist(): void { save('burger-tycoon', 'run', sim.s.over ? null : sim.s); save('burger-tycoon', 'best-time', best); }
function sound(): void { mute.textContent = sfx.muted ? 'Sound off' : 'Sound on'; mute.setAttribute('aria-pressed', String(sfx.muted)); }
mute.onclick = () => { sfx.muted = !sfx.muted; sound(); }; sound();
function begin(fresh = false): void { if (fresh) { sim.reset(); previousBacklash = 0; } started = true; paused = false; overlay.hidden = true; pauseBtn.textContent = 'Pause'; last = performance.now(); sfx.startMusic(music, 260, { wave: 'sine', volume: .17, duration: .23 }); paint(); }
function panel(title: string, copy: string, buttons: { label: string; fn: () => void }[]): HTMLElement {
  overlay.hidden = false; overlay.replaceChildren(); const box = document.createElement('section'); box.className = 'dialog'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', title);
  const eyebrow = document.createElement('p'); eyebrow.className = 'eyebrow'; eyebrow.textContent = 'BURGER TYCOON / QUARTERLY REPORT';
  const h = document.createElement('h1'); h.textContent = title; const p = document.createElement('p'); p.textContent = copy; box.append(eyebrow, h, p);
  for (const action of buttons) { const b = document.createElement('button'); b.textContent = action.label; b.onclick = action.fn; box.append(b); }
  overlay.append(box); box.querySelector('button')?.focus(); return box;
}
function pause(): void { if (!started || sim.s.over) return; paused = true; sfx.stopMusic(); persist(); pauseBtn.textContent = 'Resume'; panel('Meeting adjourned.', 'All four departments are paused. Your company is saved. The board can wait.', [{ label: 'Resume operations', fn: () => begin() }, { label: 'Settings & field guide', fn: settings }, { label: 'Start a new company', fn: confirmRestart }]); paint(); }
function confirmRestart(): void { panel('Close this company?', 'Starting again replaces this run. Your survival record is kept.', [{ label: 'Keep this company', fn: () => begin() }, { label: 'Start fresh', fn: () => begin(true) }]); }
function settings(): void {
  paused = true; sfx.stopMusic();
  const box = panel('The operating manual.', 'Crops feed the herd. Processing consumes cattle. The restaurant turns patties into cash. Higher demand is useless without stock. Shortcuts buy time, then send the bill to someone else.', [{ label: started ? 'Resume operations' : 'Back to title', fn: () => started ? begin() : titleScreen() }]);
  const controls = document.createElement('div'); controls.className = 'settings-controls';
  const volume = document.createElement('label'); volume.textContent = 'Master volume'; const range = document.createElement('input'); range.type = 'range'; range.min = '0'; range.max = '100'; range.value = String(Math.round(sfx.volume * 100)); range.setAttribute('aria-label', 'Master volume'); range.oninput = () => { sfx.volume = Number(range.value) / 100; }; volume.append(range);
  const motion = document.createElement('button'); const motionLabel = () => { motion.textContent = `Scene animation: ${reducedMotion ? 'reduced' : 'full'}`; motion.setAttribute('aria-pressed', String(reducedMotion)); }; motionLabel(); motion.onclick = () => { reducedMotion = !reducedMotion; save('burger-tycoon', 'reduced-motion', reducedMotion); motionLabel(); };
  const guide = document.createElement('ul'); guide.innerHTML = '<li><b>Normal pace:</b> one quarter takes four minutes. Use 2× or 4× to speed the entire economy up.</li><li><b>Priorities:</b> keep cattle above 3 and a cash reserve above $100. Crop sowing has a cooldown.</li><li><b>Danger:</b> disease outbreaks at 20. Backlash above 60 damages reputation; above 85 it accelerates.</li><li><b>Investment:</b> pasture grows the herd; processing needs cattle; crew increases sales and wages. Low morale slows service.</li><li><b>Keyboard:</b> 1–4 select operations. Escape pauses. Tab moves between controls.</li><li>There is no clean victory. Survive, observe the consequences, and try a different policy.</li>';
  controls.append(volume, motion, guide); box.insertBefore(controls, box.querySelector('button'));
}
pauseBtn.onclick = () => { if (paused && started) begin(); else pause(); };
byId('settings').onclick = settings;
byId('speed').onclick = () => { speed = speed === 4 ? 1 : speed * 2; byId('speed').textContent = `${speed}× pace`; toast(`Simulation pace ${speed}×. Every department changes at the same speed.`); };
window.addEventListener('keydown', e => { if (e.target instanceof HTMLElement && (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable)) return; if (/^[1-4]$/.test(e.key)) setPane(Number(e.key) - 1); if (e.key === 'Escape') { if (paused && started && !sim.s.over) begin(); else pause(); } });
document.addEventListener('visibilitychange', () => { if (document.hidden && !paused) pause(); }); window.addEventListener('pagehide', persist);
window.addEventListener('blur', () => { if (!paused) pause(); });
const metric = (label: string, value: number, max: number, color: string) => `<label>${label}<b>${value.toFixed(0)}</b><progress aria-label="${label}" max="${max}" value="${value}" style="accent-color:${color}"></progress></label>`;
const duration = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
function paint(): void {
  const s = sim.s, m = s.management, overhead = s.rates.overhead + (m.staff - 3) * .3 + (m.debt > 0 ? .35 : 0), net = (s.lastProfit - overhead) / 4;
  hud.innerHTML = `<span>CASH<b>$${s.cash.toFixed(0)}</b></span><span>REPUTATION<b>${s.rep.toFixed(0)}%</b></span><span>NET / SEC<b class="${net < 0 ? 'loss' : ''}">${net >= 0 ? '+' : ''}$${net.toFixed(1)}</b></span><span>COMPANY AGE<b>${duration(s.t * 4)}</b></span><span>BEST<b>${duration(best * 4)}</b></span>`;
  byId('quarter').textContent = `Q${m.quarter + 1} · ${Math.floor(m.sold)} burgers served · next dividend in ${Math.ceil((60 - s.t % 60) * 4)}s`;
  cards[0].metrics.innerHTML = metric('Crops', s.crops, 100, '#648842') + metric('Cattle', s.cattle, 50, '#98613d');
  cards[1].metrics.innerHTML = metric('Patties', s.patties, 60, '#a96542') + metric('Disease / 20', s.disease, 20, '#a44031');
  cards[2].metrics.innerHTML = metric('Demand ×10', s.demand * 10, 30, '#357b7b') + metric('Crew morale', m.morale, 100, '#63883d');
  cards[3].metrics.innerHTML = metric('Backlash / 100', s.backlash, 100, '#a44031') + metric('Board pressure', s.boardPressure, 100, '#a47731');
  cards[0].status.textContent = `${m.fields}/5 pastures · ${s.cattle < 3 ? 'LOW HERD — processing will stall.' : 'Crops → cattle. Keep the herd supplied.'}`;
  cards[1].status.textContent = `Line ${m.line + 1}/4 · ${s.disease > 12 ? 'OUTBREAK RISK — switch feed or call a vet.' : 'Cattle → patties. Slaughter consumes the herd.'}`;
  cards[2].status.textContent = `${m.staff}/6 crew · ${s.patties < 2 ? 'LOW STOCK — demand cannot create supply.' : m.morale < 40 ? 'LOW MORALE — service slows by 35%.' : 'Patties → cash. Growth also increases wages.'}`;
  cards[3].status.textContent = `Debt $${m.debt.toFixed(0)} · ${s.backlash > 60 ? 'PUBLIC BACKLASH — reputation is falling.' : 'Board dividends rise every quarter.'}`;
  const unavailable = (i: number, j: number) => (i === 0 && j === 0 && s.t - m.sownAt < 6) || (i === 0 && j === 3 && m.fields >= 5) || (i === 0 && j === 4 && s.backlash <= 0) || (i === 1 && j === 0 && s.cattle < 2) || (i === 1 && j === 2 && s.disease <= 0) || (i === 1 && j === 3 && m.line >= 3) || (i === 2 && j === 0 && s.demand >= 3) || (i === 2 && j === 2 && m.staff >= 6) || (i === 2 && j === 3 && m.morale >= 100) || (i === 3 && j === 0 && s.demand >= 3) || (i === 3 && j === 1 && s.backlash <= 0) || (i === 3 && j === 3 && m.loans >= 3) || (i === 3 && j === 4 && m.debt <= 0);
  cards.forEach((c, i) => c.buttons.forEach((b, j) => { b.disabled = paused || s.over || s.cash < (i === 3 && j === 4 ? Math.min(150, m.debt) : costs[i][j]) || unavailable(i, j); const flag = i === 0 && j === 2 ? 'deforest' : i === 1 && j === 1 ? 'cheapFeed' : i === 2 && j === 1 ? 'cutCorners' : null; if (flag) { const on = !!s.dirty[flag]; b.setAttribute('aria-pressed', String(on)); b.classList.toggle('engaged', on); b.querySelector('strong')!.textContent = `${names[i][j]} · ${on ? 'ON' : 'OFF'}`; } }));
  log.replaceChildren(...sim.events.slice(0, 6).map(event => { const li = document.createElement('li'); li.textContent = event; return li; }));
}
function frame(now: number): void {
  const dt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now;
  if (!paused && !sim.s.over) {
    sim.tick(dt * .25 * speed); best = Math.max(best, sim.s.t);
    if (sim.s.backlash > 60 && previousBacklash <= 60) { sfx.preset('hit'); toast('Public backlash exceeds 60. Reputation is falling.'); } previousBacklash = sim.s.backlash;
    if (sim.s.over) { persist(); sfx.stopMusic(); sfx.preset('death'); panel(sim.s.cash <= 0 ? 'The board has spoken.' : 'The public has spoken.', `${sim.s.overReason}. Company age ${duration(sim.s.t * 4)}; ${Math.floor(sim.s.management.sold)} burgers served. Every shortcut has a cost.`, [{ label: 'Build another company', fn: () => begin(true) }]); }
    if (now - saveAt > 2000) { persist(); saveAt = now; }
  }
  if (now - paintAt > 150) { paint(); paintAt = now; }
  if (now - sceneAt >= (reducedMotion ? 150 : 33)) { cards.forEach((c, i) => { if (innerWidth > 720 || pane === i) c.draw(reducedMotion ? { ...sim.s, t: 0 } : sim.s, i, c.canvas.width, c.canvas.height); }); sceneAt = now; } requestAnimationFrame(frame);
}
function titleScreen(): void { panel('Profit is only half the story.', 'Four departments. One fragile economy. Build the supply chain, manage workers, finance expansion, and face the cost of every shortcut. Your company saves automatically.', [{ label: hasSave && !started ? 'Continue company' : 'Open for business', fn: () => begin() }, { label: 'Settings & field guide', fn: settings }, ...(hasSave && !started ? [{ label: 'Start a new company', fn: confirmRestart }] : [])]); }
setPane(0); paint(); titleScreen(); requestAnimationFrame(frame);
if (new URLSearchParams(location.search).has('debug')) Object.assign(window, { __maga: { sim, setPane, begin, pause, get paused() { return paused; }, validRun } });
