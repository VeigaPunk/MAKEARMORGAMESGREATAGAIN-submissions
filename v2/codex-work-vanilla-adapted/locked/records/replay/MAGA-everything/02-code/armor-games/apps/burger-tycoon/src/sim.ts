/**
 * Burger Tycoon — economy simulation (pure logic, no rendering).
 * Ported 1:1 from maga-proto's verified mechanics proof
 * (`prototypes/burger-tycoon.html`, verify PASS 2026-09-22).
 *
 * Causal chain: Farm grows crops -> cattle eat crops & are SLAUGHTERED into
 * patties (cattle consumed) -> Restaurant sells patties for cash -> overhead
 * drains cash -> board punishes low profit. Overspend or stall = bankruptcy;
 * backlash = reputation death. No clean win — the satire is that
 * sustainability is impossible (concept spec §Core loop).
 *
 * Original tuning, not a claim of measured Flash parity. One simulation
 * second is four seconds at normal speed. Existing causal failure paths
 * remain; optional investment trades scarce cash for throughput.
 */

export type PaneKey = 'farm' | 'feed' | 'rest' | 'hq';
export const PANES: { key: PaneKey; title: string }[] = [
  { key: 'farm', title: 'FARMLAND' },
  { key: 'feed', title: 'FEEDLOT' },
  { key: 'rest', title: 'RESTAURANT' },
  { key: 'hq', title: 'HQ' },
];

export interface Rates {
  crop: number; herd: number; patty: number; sell: number;
  profitPerBurger: number; overhead: number;
}

export interface Dirty {
  deforest: number; cheapFeed: number; cutCorners: number;
}

export interface SimState {
  cash: number; rep: number; backlash: number;
  crops: number; cattle: number; patties: number;
  demand: number; boardPressure: number; disease: number;
  over: boolean; overReason: string; t: number;
  rates: Rates; dirty: Dirty; lastProfit: number;
  management: Management;
}

export interface Management {
  fields: number; line: number; staff: number; morale: number;
  debt: number; loans: number; sownAt: number; quarter: number;
  sold: number; revenue: number; landCost: number;
}
export const managementDefaults = (): Management => ({ fields: 1, line: 0, staff: 3, morale: 70, debt: 0, loans: 0, sownAt: -100, quarter: 0, sold: 0, revenue: 0, landCost: 0 });

export interface Action {
  label: string;
  dirty: boolean;
  run: (s: SimState) => void;
}

function initialState(): SimState {
  return {
    cash: 500, rep: 70, backlash: 0,
    crops: 20, cattle: 10, patties: 10,
    demand: 1.0, boardPressure: 0, disease: 0,
    over: false, overReason: '', t: 0,
    rates: { crop: 1.2, herd: 0.3, patty: 0.9, sell: 1.0, profitPerBurger: 5, overhead: 4 },
    dirty: { deforest: 0, cheapFeed: 0, cutCorners: 0 },
    lastProfit: 0,
    management: managementDefaults(),
  };
}

export class Sim {
  s: SimState = initialState();
  /** timestamped event log, newest first (capped) */
  events: string[] = [];

  reset(): void {
    this.s = initialState();
    this.events = [];
    this.log('New run — four panes, one economy.');
  }

  log(m: string): void {
    this.events.unshift(`[${this.s.t.toFixed(0)}s] ${m}`);
    if (this.events.length > 14) this.events.length = 14;
  }

  /** actions per pane — labels are Burger Tycoon-safe (no McD marks) */
  readonly actions: Record<PaneKey, Action[]> = {
    farm: [
      { label: 'Sow soy field (+15 crops, 6s cooldown)', dirty: false, run: (s) => { if (s.t-s.management.sownAt>=6) { s.crops += 15; s.management.sownAt=s.t; } } },
      { label: 'Buy cattle (+5 head, -$80)', dirty: false, run: (s) => { if (s.cash >= 80) { s.cash -= 80; s.cattle += 5; } } },
      { label: 'DIRTY: Bulldoze rainforest (2.2x crops, +backlash)', dirty: true, run: (s) => { s.dirty.deforest = s.dirty.deforest ? 0 : 1; } },
      { label: 'Lease pasture (-$180, +herd growth, max 5)', dirty: false, run: (s) => { if(s.cash>=180&&s.management.fields<5){s.cash-=180;s.management.fields++;} } },
      { label: 'Restore woodland (-$90, -18 backlash, +2 reputation)', dirty: false, run: (s) => { if(s.cash>=90&&s.backlash>0){s.cash-=90;s.backlash=Math.max(0,s.backlash-18);s.rep=Math.min(100,s.rep+2);} } },
    ],
    feed: [
      { label: 'Emergency slaughter (+4 patties, -2 cattle)', dirty: false, run: (s) => { if (s.cattle >= 2) { s.cattle -= 2; s.patties += 4; } } },
      { label: 'DIRTY: Cheap feed (1.8x patties, disease risk)', dirty: true, run: (s) => { s.dirty.cheapFeed = s.dirty.cheapFeed ? 0 : 1; } },
      { label: 'Veterinary visit (-$70, -12 disease)', dirty: false, run: (s) => { if(s.cash>=70&&s.disease>0){s.cash-=70;s.disease=Math.max(0,s.disease-12);} } },
      { label: 'Upgrade processing line (-$200, +0.3 capacity, max 3)', dirty: false, run: (s) => { if(s.cash>=200&&s.management.line<3){s.cash-=200;s.management.line++;} } },
    ],
    rest: [
      { label: 'Promo push (+0.3 demand, -$40)', dirty: false, run: (s) => { if (s.cash >= 40) { s.cash -= 40; s.demand = Math.min(3, s.demand + 0.3); } } },
      { label: 'DIRTY: Cut corners (1.6x margin, +backlash)', dirty: true, run: (s) => { s.dirty.cutCorners = s.dirty.cutCorners ? 0 : 1; } },
      { label: 'Hire crew (-$75, +0.16 sales capacity, +wages)', dirty: false, run: (s) => { if(s.cash>=75&&s.management.staff<6){s.cash-=75;s.management.staff++;} } },
      { label: 'Paid training (-$60, +25 morale, +2 reputation)', dirty: false, run: (s) => { if(s.cash>=60&&s.management.morale<100){s.cash-=60;s.management.morale=Math.min(100,s.management.morale+25);s.rep=Math.min(100,s.rep+2);} } },
    ],
    hq: [
      { label: 'Marketing campaign (+0.6 demand, -$120)', dirty: false, run: (s) => { if (s.cash >= 120) { s.cash -= 120; s.demand = Math.min(3, s.demand + 0.6); } } },
      { label: 'PR spin (-15 backlash, -$100)', dirty: false, run: (s) => { if (s.cash >= 100) { s.cash -= 100; s.backlash = Math.max(0, s.backlash - 15); } } },
      { label: 'DIRTY: Bribe officials (-25 backlash, -$200, -4 rep)', dirty: true, run: (s) => { if (s.cash >= 200) { s.cash -= 200; s.backlash = Math.max(0, s.backlash - 25); s.rep -= 4; } } },
      { label: 'Take a bridge loan (+$350, $450 debt, max 3)', dirty: false, run: (s) => { if(s.management.loans<3){s.cash+=350;s.management.debt+=450;s.management.loans++;} } },
      { label: 'Repay creditors (-$150, -$150 debt)', dirty: false, run: (s) => { const payment=Math.min(150,s.management.debt);if(payment>0&&s.cash>=payment){s.cash-=payment;s.management.debt-=payment;} } },
    ],
  };

  act(pane: PaneKey, idx: number): string | null {
    const a = this.actions[pane][idx];
    if (!a || this.s.over) return null;
    const before = JSON.stringify(this.s);
    a.run(this.s);
    if (JSON.stringify(this.s) === before) return null;
    this.log(a.label);
    return a.label;
  }

  tick(dt: number): void {
    const s = this.s;
    if (s.over || !Number.isFinite(dt) || dt <= 0) return;
    s.t += dt;
    const d = s.dirty, m=s.management;
    // FARMLAND: crops grow (deforest multiplies); herd grows while crops feed it
    const cropRate = (s.rates.crop + (m.fields-1)*.18) * (d.deforest ? 2.2 : 1);
    s.crops += cropRate * dt;
    if (s.crops > 1 && s.cattle > 0) {
      const herd=s.rates.herd+(m.fields-1)*.06;
      const graze = Math.min(s.crops, herd * dt * 2);
      s.crops -= graze; s.cattle += herd * dt;
    }
    // FEEDLOT: slaughter cattle -> patties (CATTLE CONSUMED); needs crop feed too
    const capacity = (s.rates.patty+m.line*.3) * (d.cheapFeed ? 1.8 : 1);
    const pattyRate = Math.min(s.cattle * 0.5, s.crops * 0.5, capacity);
    if (pattyRate > 0) {
      s.patties += pattyRate * dt;
      s.cattle -= pattyRate * 0.5 * dt;
      s.crops -= pattyRate * 0.5 * dt;
    }
    if (d.cheapFeed) s.disease += 0.6 * dt;
    if (s.disease > 20) { s.disease = 0; s.cattle *= 0.5; s.rep -= 12; s.backlash += 15; this.log('DISEASE OUTBREAK: herd culled, rep -12'); }
    // RESTAURANT: patties -> cash at demand-limited rate
    m.morale=Math.min(100,Math.max(0,m.morale+(d.cutCorners?-.22:.08)*dt));
    const moraleFactor=m.morale<40?.65:1;
    const sellRate = Math.min(s.patties, (s.rates.sell+(m.staff-3)*.16) * s.demand * (d.cutCorners ? 1.5 : 1)*moraleFactor);
    if (sellRate > 0) {
      s.patties -= sellRate * dt;
      const margin = s.rates.profitPerBurger * (d.cutCorners ? 1.6 : 1);
      const earn = sellRate * margin * dt;
      s.cash += earn; s.lastProfit = earn / dt;
      m.sold+=sellRate*dt;m.revenue+=earn;
    } else s.lastProfit = 0;
    // OVERHEAD: wages + rent always drain — the real loss pressure
    s.cash -= (s.rates.overhead+(m.staff-3)*.3+(m.debt>0?.35:0))*dt;
    // HQ: board pressure — rises fast when profit stalls; interventions cost cash
    const stall = s.lastProfit <= s.rates.overhead ? 1.4 : 0.4;
    s.boardPressure += stall * dt * (s.lastProfit > s.rates.overhead * 2 ? -1 : 1);
    s.boardPressure = Math.max(0, s.boardPressure);
    if (s.boardPressure > 100) { s.cash -= 60; s.boardPressure = 40; this.log('BOARD INTERVENTION: emergency loan cost -$60'); }
    // backlash dynamics
    let bl = 0;
    if (d.deforest) bl += 1.2; if (d.cheapFeed) bl += 0.8; if (d.cutCorners) bl += 1.0;
    s.backlash += (bl - 0.35) * dt; s.backlash = Math.max(0, Math.min(100, s.backlash));
    if (s.backlash > 60) s.rep -= 1.5 * dt;
    if (s.backlash > 85) s.rep -= 3 * dt;
    const quarter=Math.floor(s.t/60);
    if(quarter>m.quarter){m.quarter=quarter;const tax=20+quarter*5;s.cash-=tax;this.log(`QUARTER ${quarter}: board dividend -$${tax}. Growth is never enough.`);}
    s.rep = Math.max(0, Math.min(100, s.rep));
    if (s.rep <= 0) return this.gameOver('REPUTATION COLLAPSE — activists shut you down');
    if (s.cash <= 0) { s.cash = 0; return this.gameOver('BANKRUPT — overhead + board ate the company'); }
  }

  private gameOver(why: string): void {
    this.s.over = true;
    this.s.overReason = why;
    this.log('GAME OVER: ' + why);
  }
}
