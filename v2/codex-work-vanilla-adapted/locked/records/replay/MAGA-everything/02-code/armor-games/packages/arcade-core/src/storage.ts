/**
 * Namespaced localStorage saves — high scores, progress, settings per game.
 * Fails soft (private mode etc.) so games never crash on storage errors.
 */

// A deployment can share an origin with other model/CLI editions. Only the
// mount before a known game folder is part of its namespace; root/Vite and
// file:// development retain the original keys. Folder and index.html URLs
// deliberately resolve to the same mount.
const deploymentBase = typeof location !== 'undefined' && /^https?:$/.test(location.protocol)
  ? location.pathname.match(/^(.*)\/(?:boxhead|impossible|burger-tycoon|chicken-invaders(?:-original)?|swords-and-sandals|hardest)(?:\/(?:index\.html)?)?$/)?.[1] ?? ''
  : '';
const PREFIX = deploymentBase ? `maga:${deploymentBase}:` : 'maga:';

export function save<T>(game: string, key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + game + ':' + key, JSON.stringify(value));
  } catch { /* storage unavailable — non-fatal */ }
}

export function load<T>(game: string, key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + game + ':' + key);
    if (raw === null) return fallback;
    const value: unknown = JSON.parse(raw);
    // Complex saves have title-specific schemas; primitive scores/settings must
    // never become null, objects, or non-finite numbers after a corrupt import.
    if (typeof fallback === 'number' && (typeof value !== 'number' || !Number.isFinite(value) || value < 0)) return fallback;
    if (typeof fallback === 'boolean' && typeof value !== 'boolean') return fallback;
    if (typeof fallback === 'string' && typeof value !== 'string') return fallback;
    return value as T;
  } catch {
    return fallback;
  }
}

export function clear(game: string): void {
  try {
    const pre = PREFIX + game + ':';
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(pre)) localStorage.removeItem(k);
    }
  } catch { /* non-fatal */ }
}
