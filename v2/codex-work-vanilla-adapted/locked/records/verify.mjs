#!/usr/bin/env node
// Run from the locked release without changing it. Requires Node 22.18+ on
// Linux x86_64; all browser and JavaScript tooling is included beside this file.
import {cp,mkdtemp,mkdir,chmod} from 'node:fs/promises';
import {createReadStream,createWriteStream} from 'node:fs';
import {createGunzip} from 'node:zlib';
import {pipeline} from 'node:stream/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const records=fileURLToPath(new URL('.',import.meta.url)),temp=await mkdtemp(path.join(tmpdir(),'second-wind-verification-'));
await cp(path.join(records,'replay'),temp,{recursive:true});
await cp(path.join(records,'runtime/node_modules'),path.join(temp,'node_modules'),{recursive:true});
const browserDirectory=path.join(temp,'chromium');
await cp(path.join(records,'runtime/chromium'),browserDirectory,{recursive:true,filter:file=>!file.endsWith('.gz')});
const browser=path.join(browserDirectory,'chrome-headless-shell');
await pipeline(createReadStream(path.join(records,'runtime/chromium/chrome-headless-shell.gz')),createGunzip(),createWriteStream(browser));
await chmod(browser,0o755);
await mkdir(path.join(temp,'verification/latest'),{recursive:true});
console.log(`Verification workspace: ${temp}\nLocked files remain untouched.`);
const child=spawn(process.execPath,['tooling/verify-offline.mjs',...process.argv.slice(2)],{cwd:temp,env:{...process.env,SITE_ROOT:path.resolve(records,'../site'),CHROMIUM_PATH:browser,PULSEBOUND_BROWSER:browser,VERIFICATION_OUT:path.join(temp,'verification/latest')},stdio:'inherit'});
child.once('exit',code=>{console.log(`Evidence retained at ${temp}/verification/latest`);process.exitCode=code??1;});
