/** Offline real-input completion gate. Observation hooks are read-only; progression uses buttons/keys/taps. */
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { opponents } from '../src/model.ts';
const app = fileURLToPath(new URL('../', import.meta.url));
const evidence = fileURLToPath(new URL('./evidence/', import.meta.url));
mkdirSync(evidence, { recursive: true });
const url = process.env.SAS_URL || 'http://127.0.0.1:5178/';
const server = process.env.SAS_URL ? null : spawn(process.execPath, [fileURLToPath(new URL('../../../node_modules/vite/bin/vite.js', import.meta.url)), '--host', '127.0.0.1', '--port', '5178'], { cwd: app, stdio: 'pipe' });
const report = { title: 'Crown & Sand', created: new Date().toISOString(), url, inputOnly: true, runs: [] };
let browser;
try {
  if (server) {
    let ready = false;
    for (let i = 0; i < 50; i++) { try { const r = await fetch(url); if (r.ok) { ready = true; break; } } catch {} await new Promise(r => setTimeout(r, 100)); }
    assert.ok(ready, 'local Vite server must start in the same execution context');
  }
  const fallback = ['/usr/bin/chromium', '/root/.cache/magga/chrome-headless-shell-linux64/chrome-headless-shell'].find(existsSync);
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || fallback, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  await Promise.all((process.env.SAS_DEVICE === 'desktop' ? [false] : process.env.SAS_DEVICE === 'mobile' ? [true] : [false, true]).map(async mobile => {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 }, isMobile: mobile, hasTouch: mobile, reducedMotion: mobile ? 'reduce' : 'no-preference' });
    const page = await context.newPage(); const errors = [], external = [], moves = new Set();
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if (new URL(r.url()).origin !== new URL(url).origin && !r.url().startsWith('data:')) external.push(r.url()); });
    await page.goto(url + '?debug');
    const click = async locator => mobile ? locator.tap() : locator.click();
    const snapshot = async () => { await page.waitForFunction(() => window.__maga); return page.evaluate(() => window.__maga.snapshot); };
    const ready = () => page.waitForFunction(() => !window.__maga.snapshot.busy);
    const prefix = mobile ? 'mobile' : 'desktop';
    await page.locator('#name').fill(mobile ? 'Moon of the Arena' : '<b>Crown</b>');
    for (const stat of ['strength', 'strength', 'strength', 'agility', 'vitality', 'defense']) await click(page.getByRole('button', { name: `Increase ${stat}`, exact: true }));
    await page.screenshot({ path: `${evidence}${prefix}-create.png`, fullPage: true });
    await click(page.getByRole('button', { name: /Enter the arena/ }));
    assert.equal(await page.locator('#player-name b').count(), 0, 'typed markup is rendered literally');
    if (!mobile) {
      await click(page.getByRole('button', { name: /Start first bout/ }));
      await page.keyboard.press('5'); await ready(); moves.add('keyboard javelin');
      await click(page.getByRole('button', { name: /Leave the bout/ }));
      assert.equal((await snapshot()).state.defeated, 0); assert.equal((await snapshot()).state.gladiator.gold, 0);
      await page.reload(); assert.equal((await snapshot()).mode, 'hub');
    }
    let attempts = 0, turns = 0, purchases = 0;
    while ((await snapshot()).state.defeated < opponents.length) {
      assert.ok(++attempts < opponents.length + 30, 'campaign has a bounded retry budget');
      const before = (await snapshot()).state.defeated;
      if (before) {
        await click(page.getByRole('button', { name: /Smithy & armory/ }));
        while (await page.getByRole('button', { name: /Buy & equip/ }).count()) { await click(page.getByRole('button', { name: /Buy & equip/ }).first()); purchases++; }
        await click(page.getByRole('button', { name: /Return to the hub/ }));
      }
      await click(page.getByRole('button', { name: before ? /Next opponent/ : /Start first bout/ }));
      if (!before || before === 12 || before === 76) await page.screenshot({ path: `${evidence}${prefix}-${before === 76 ? 'eternal' : before === 12 ? 'moonlit' : 'combat'}.png`, fullPage: true });
      if (mobile && !before) {
        for (const button of await page.locator('#actions button').all()) { const box = await button.boundingBox(); assert.ok(box.width >= 48 && box.height >= 48, 'combat touch targets meet 48px'); }
      }
      let boutTurns = 0;
      while ((await snapshot()).mode === 'arena') {
        await ready(); const snap = await snapshot(); if (snap.mode !== 'arena') break;
        assert.ok(boutTurns++ < 100, 'bout must finish'); turns++;
        const g = snap.state.gladiator, c = snap.combat;
        let action = g.hp <= g.maxHp - 26 && g.potions > 0 ? /Potion \(/ : c.cooldown === 0 ? /Shield breaker/ : /⚔ Attack/;
        if (c.round === 0 && c.ammo) action = /Javelin \(/;
        else if (c.round === 1 && g.level === 2 && c.focus > 0 && g.hp < g.maxHp) action = /Moon ward/;
        else if (c.focus >= 2 && g.level >= 3) action = /Sunfire/;
        else if (g.level >= 2 && c.focus > 0 && g.hp <= g.maxHp - 20 && !g.potions) action = /Moon ward/;
        else if (!before && c.round === 2) action = /◈ Guard/;
        const button = page.getByRole('button', { name: action }); moves.add((await button.innerText()).split('\n')[0]);
        await click(button);
      }
      const won = (await snapshot()).state.defeated;
      assert.ok(won === before || won === before + 1);
      if (won > before && won % 4 === 0) console.log(`[${prefix}] Tournament ${won / 4}/${opponents.length / 4} cleared after ${turns} turns.`);
      await page.reload(); await page.waitForFunction(() => window.__maga);
      assert.equal((await snapshot()).state.defeated, won, 'progress survives every bout reload');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'no horizontal overflow');
    }
    const champion = await snapshot(); assert.equal(champion.mode, 'complete');
    assert.equal(champion.state.gladiator.xp, opponents.length * 22); assert.ok(purchases >= 38);
    await page.screenshot({ path: `${evidence}${prefix}-champion.png`, fullPage: true });
    await click(page.getByRole('button', { name: /New gladiator/ }));
    await click(page.getByRole('button', { name: /^2\. New gladiator/ }));
    await page.locator('#name').fill('Second Path');
    for (let i = 0; i < 6; i++) await click(page.getByRole('button', { name: 'Increase defense', exact: true }));
    await click(page.getByRole('button', { name: /Enter the arena/ })); await page.reload();
    assert.equal((await snapshot()).activeSlot, 1); assert.equal((await snapshot()).state.defeated, 0);
    if (!mobile) {
      await click(page.getByRole('button', { name: /Start first bout/ }));
      for (let i = 0; (await snapshot()).mode === 'arena'; i++) {
        assert.ok(i < 80); await ready(); if ((await snapshot()).mode !== 'arena') break;
        await click(page.getByRole('button', { name: /◈ Guard/ }));
      }
      assert.equal((await snapshot()).state.defeated, 0); assert.equal((await snapshot()).state.gladiator.gold, 0);
      assert.equal((await snapshot()).state.gladiator.hp, (await snapshot()).state.gladiator.maxHp);
      await page.reload(); assert.equal((await snapshot()).mode, 'hub');
    }
    await click(page.locator('#roster')); await click(page.getByRole('button', { name: /^1\./ }));
    assert.equal((await snapshot()).state.defeated, opponents.length, 'first champion survives second-slot creation');
    await click(page.getByRole('button', { name: /Retire this champion/ }));
    await click(page.getByRole('button', { name: /Create new gladiator/ })); await page.reload();
    assert.equal((await snapshot()).mode, 'create', 'retirement persists through reload');
    assert.deepEqual(errors, []); assert.deepEqual(external, []);
    const result = { device: prefix, victories: opponents.length, turns, attempts, purchases, moves: [...moves], errors, externalRequests: external.length, saveSlots: 'pass', retirement: 'pass', defeatRecovery: mobile ? 'rules-tested' : 'real-input-pass', screenshots: [`${prefix}-create.png`, `${prefix}-combat.png`, `${prefix}-moonlit.png`, `${prefix}-eternal.png`, `${prefix}-champion.png`] };
    report.runs.push(result); console.log(JSON.stringify(result)); await context.close();
  }));
  report.status = 'passed';
} catch (error) { report.status = 'failed'; report.error = String(error); throw error; }
finally { writeFileSync(`${evidence}browser-report.json`, JSON.stringify(report, null, 2)); await browser?.close(); server?.kill(); }
