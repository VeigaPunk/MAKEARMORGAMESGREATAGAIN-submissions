import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function memoryStorage() {
  const values = new Map();
  return {
    get length() { return values.size; },
    key: index => [...values.keys()][index] ?? null,
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
}
const storageUrl = new URL('../../MAGA-everything/02-code/armor-games/packages/arcade-core/src/storage.ts', import.meta.url);
let importId = 0;
async function sharedAt(url) {
  if (url) globalThis.location = new URL(url);
  else delete globalThis.location;
  // Each browser page evaluates its own module once at its own deployment URL.
  return import(`${storageUrl.href}?storage-isolation=${importId++}`);
}

test('all six games and shared settings are isolated between sibling deployment mounts', async () => {
  const previousLocation = Object.getOwnPropertyDescriptor(globalThis, 'location');
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const store = memoryStorage();
  Object.defineProperty(globalThis, 'localStorage', { value: store, configurable: true });
  try {
    const games = ['boxhead', 'impossible', 'burger-tycoon', 'chicken-invaders', 'chicken-invaders-original', 'swords-and-sandals'];
    for (const game of games) {
      const root = await sharedAt(`https://ds4cc.com/${game}/`);
      const codex = await sharedAt(`https://ds4cc.com/magga/codex/${game}/`);
      const sibling = await sharedAt(`https://ds4cc.com/magga/other/${game}/index.html?debug#play`);
      root.save(game, 'progress', { wins: 9 });
      assert.equal(codex.load(game, 'progress', null), null, 'new edition cannot import root progress');
      codex.save(game, 'progress', { wins: 3 });
      assert.equal(sibling.load(game, 'progress', null), null, 'new edition cannot import sibling progress');
      sibling.save(game, 'progress', { wins: 7 });
      assert.deepEqual(root.load(game, 'progress', null), { wins: 9 });
      assert.deepEqual(codex.load(game, 'progress', null), { wins: 3 });
      const codexIndex = await sharedAt(`https://ds4cc.com/magga/codex/${game}/index.html`);
      assert.deepEqual(codexIndex.load(game, 'progress', null), { wins: 3 }, 'folder and index.html share progress');
      const codexNoSlash = await sharedAt(`https://ds4cc.com/magga/codex/${game}`);
      assert.deepEqual(codexNoSlash.load(game, 'progress', null), { wins: 3 });
      codex.save('arcade', 'muted', true);
      assert.equal(codexIndex.load('arcade', 'muted', false), true, 'sound is shared within an edition');
      assert.equal(sibling.load('arcade', 'muted', false), false, 'sound does not leak across editions');
      codex.clear(game);
      assert.equal(codex.load(game, 'progress', null), null);
      assert.deepEqual(sibling.load(game, 'progress', null), { wins: 7 }, 'clear cannot erase another edition');
      assert.deepEqual(root.load(game, 'progress', null), { wins: 9 }, 'clear cannot erase legacy data');
      assert.equal(codex.load('arcade', 'muted', false), true, 'clear is still scoped to the requested game');
    }
    for (const url of [null, 'http://localhost:5173/', 'http://localhost:5173/index.html', 'https://ds4cc.com/boxhead/index.html', 'file:///home/developer/boxhead/index.html']) {
      const legacy = await sharedAt(url);
      legacy.save('boxhead', 'highscore', 123);
      assert.equal(store.getItem('maga:boxhead:highscore'), '123', `legacy key is unchanged for ${url}`);
      assert.deepEqual(legacy.load('boxhead', 'progress', null), { wins: 9 });
    }
  } finally {
    if (previousLocation) Object.defineProperty(globalThis, 'location', previousLocation); else delete globalThis.location;
    if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage); else delete globalThis.localStorage;
  }
});

const hardestSources = ['save.js', 'game.js'].map(file => readFileSync(new URL(`../../hardest/${file}`, import.meta.url), 'utf8'));
function bootHardest(url, store) {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      handlers: {}, style: {}, dataset: {},
      getContext: () => ({}), focus() {},
      addEventListener(name, fn) { this.handlers[name] = fn; },
    });
    return elements.get(id);
  }
  const sandbox = {
    localStorage: store,
    document: { getElementById: element, addEventListener() {} },
    addEventListener() {}, requestAnimationFrame() {}, matchMedia: () => ({ matches: false }),
    HardestEngine: {}, HARDEST_MANIFEST: ['one', 'two', 'three'],
    HARDEST_LEVELS: [{ id: 1 }, { id: 2 }, { id: 3 }],
  };
  if (url) sandbox.location = new URL(url);
  const context = vm.createContext(sandbox);
  for (const source of hardestSources) vm.runInContext(source, context);
  return { state: () => context.__hardest.state(), mute: () => element('sound').handlers.click() };
}

test('Hardest boots and persists independently under each edition, including folder/index URL parity', () => {
  const store = memoryStorage();
  store.setItem('hardest.save.v1', JSON.stringify({ unlocked: 3, best: {}, deaths: 12, mute: false }));
  const root = bootHardest('https://ds4cc.com/hardest/', store);
  assert.equal(root.state().unlocked, 3);
  const codex = bootHardest('https://ds4cc.com/magga/codex/hardest/', store);
  const sibling = bootHardest('https://ds4cc.com/magga/other/hardest/index.html', store);
  assert.equal(codex.state().unlocked, 1);
  assert.equal(sibling.state().unlocked, 1);
  codex.mute();
  assert.equal(JSON.parse(store.getItem('maga:/magga/codex:hardest.save.v1')).mute, true);
  assert.equal(JSON.parse(store.getItem('maga:/magga/other:hardest.save.v1')).mute, false);
  assert.equal(JSON.parse(store.getItem('hardest.save.v1')).mute, false);
  bootHardest('https://ds4cc.com/magga/codex/hardest/index.html', store);
  assert.equal(JSON.parse(store.getItem('maga:/magga/codex:hardest.save.v1')).mute, true, 'index boot retains folder save');
  for (const url of [null, 'https://ds4cc.com/hardest', 'http://localhost:8080/hardest/index.html', 'file:///home/developer/hardest/index.html']) {
    assert.equal(bootHardest(url, store).state().unlocked, 3, `legacy progress survives ${url}`);
  }
});
