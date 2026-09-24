import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export function browserPath() {
 const root = fileURLToPath(new URL('..', import.meta.url));
 const options = [process.env.CHROMIUM_PATH, path.join(root, 'verification/runtime/chromium/chrome-headless-shell'), path.join(root, 'delivery/records/runtime/chromium/chrome-headless-shell'), '/root/.cache/magga/chrome-headless-shell-linux64/chrome-headless-shell', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
 const found = options.find(p => p && existsSync(p)); if (!found) throw Error('No local Chromium runtime. Set CHROMIUM_PATH to an installed browser.'); return found;
}
export const browserArgs = ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
