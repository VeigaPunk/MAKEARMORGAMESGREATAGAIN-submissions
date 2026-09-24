/** Normal-character preview and audio-control smoke test; no save or combat injection. */
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const base = fileURLToPath(new URL('../', import.meta.url));
const evidence = fileURLToPath(new URL('./evidence/', import.meta.url));
const url = process.env.SAS_URL || 'http://127.0.0.1:5178/';
const server = process.env.SAS_URL ? null : spawn(process.execPath, [fileURLToPath(new URL('../../../node_modules/vite/bin/vite.js', import.meta.url)), '--host', '127.0.0.1', '--port', '5178'], { cwd: base, stdio: 'pipe' });
let browser;
try {
  if (server) { let ready = false; for (let i = 0; i < 50; i++) { try { if ((await fetch(url)).ok) { ready = true; break; } } catch {} await new Promise(r => setTimeout(r, 100)); } assert.ok(ready); }
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || ['/usr/bin/chromium', '/root/.cache/magga/chrome-headless-shell-linux64/chrome-headless-shell'].find(existsSync), headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(url + '?debug'); await page.locator('#name').fill('Aster');
  for (const stat of ['strength', 'strength', 'strength', 'agility', 'vitality', 'defense']) await page.getByRole('button', { name: `Increase ${stat}`, exact: true }).click();
  await page.getByRole('button', { name: /Enter the arena/ }).click();
  await page.getByRole('slider', { name: 'Master volume' }).press('End'); assert.equal(await page.locator('#volume').inputValue(), '100');
  await page.reload(); assert.equal(await page.locator('#volume').inputValue(), '100', 'volume persists');
  await page.getByRole('slider', { name: 'Master volume' }).press('Home'); assert.equal(await page.locator('#volume').inputValue(), '0');
  await page.getByRole('slider', { name: 'Master volume' }).press('PageUp'); assert.ok(Number(await page.locator('#volume').inputValue()) > 0, 'zero volume can be recovered with real keyboard input');
  await page.locator('#mute').click(); assert.equal(await page.locator('#mute').getAttribute('aria-pressed'), 'true');
  await page.reload(); assert.equal(await page.locator('#mute').getAttribute('aria-pressed'), 'true');
  await page.locator('#mute').click();
  await page.getByRole('button', { name: /Start first bout/ }).click();
  await page.keyboard.press('5');
  await page.locator('#pause').click();
  assert.equal(await page.locator('#pause-dialog').isVisible(), true);
  const paused = await page.evaluate(() => window.__maga.snapshot);
  await page.keyboard.press('1'); await page.waitForTimeout(650);
  const held = await page.evaluate(() => window.__maga.snapshot);
  assert.equal(held.paused, true); assert.equal(held.combat.round, paused.combat.round); assert.equal(held.combat.hp, paused.combat.hp); assert.equal(held.state.gladiator.hp, paused.state.gladiator.hp);
  await page.screenshot({ path: `${evidence}crown-and-sand-pause.png`, fullPage: true });
  await page.keyboard.press('Escape'); assert.equal(await page.locator('#pause-dialog').isVisible(), false);
  await page.getByRole('button', { name: /⚔ Attack/ }).click(); await page.waitForFunction(() => !window.__maga.snapshot.busy);
  assert.equal((await page.evaluate(() => window.__maga.snapshot)).combat.round, paused.combat.round + 1);
  await page.keyboard.press('Escape'); await page.getByRole('button', { name: /Resume the arena/ }).click();
  assert.equal((await page.evaluate(() => window.__maga.snapshot)).paused, false);
  await page.screenshot({ path: `${evidence}crown-and-sand-preview.png`, fullPage: true });
  await page.locator('#stage').screenshot({ path: `${evidence}crown-and-sand-cover.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: `${evidence}crown-and-sand-phone.png`, fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.setViewportSize({ width: 320, height: 568 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'narrow phone layout');
  assert.deepEqual(errors, []);
  console.log('Aster preview captured through normal creation. Volume 0/100/recovery and persistence, mute persistence, Pause/Resume via toolbar, Escape and button; blocked combat while paused; desktop/phone layout passed.');
} finally { await browser?.close(); server?.kill(); }
