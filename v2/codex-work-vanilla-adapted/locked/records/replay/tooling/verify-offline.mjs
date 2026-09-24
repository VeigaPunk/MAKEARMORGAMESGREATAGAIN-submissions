#!/usr/bin/env node
// Complete local release verification. The packaged wrapper supplies its own
// Playwright and Chrome Headless Shell; no install, CDN, build or service is used.
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {serve} from '../arcade/serve.mjs';
import {browserPath} from './browser.mjs';
const site=path.resolve(process.env.SITE_ROOT||'dist'),out=path.resolve(process.env.VERIFICATION_OUT||'verification/latest');
await mkdir(out,{recursive:true});
const server=serve(site,{port:0,base:'/offline/second-wind/'});await new Promise(r=>server.once('listening',r));
const base=`http://127.0.0.1:${server.address().port}/offline/second-wind`;
const browser=browserPath(),env={...process.env,SITE_ROOT:site,CHROMIUM_PATH:browser,PULSEBOUND_BROWSER:browser,ARCADE_URL:base,SAS_URL:base+'/swords-and-sandals/',HARDEST_URL:base+'/hardest/index.html',HOST_SCRIPT:path.join(site,'deadlock-host.mjs'),SCREENSHOT_DIR:path.join(out,'screenshots')};
const workspace='MAGA-everything/02-code/armor-games/';
const tasks=[
 ['rules',['--test','verification/tests/gameplay.test.mjs','verification/tests/storage-isolation.test.mjs','hardest/regression.mjs',workspace+'apps/swords-and-sandals/tests/progression.test.mjs',workspace+'packages/shmup-core/tests/campaign.test.mjs',workspace+'apps/impossible/tests/campaign.test.mjs',workspace+'apps/burger-tycoon/tests/economy.test.mjs',workspace+'apps/boxhead/tests/rules.test.mjs']],
 ['vault-validator',['hardest/validate.mjs']],
 ['copied-release-smoke',['tooling/collection-smoke.mjs']],
 ['runner-realtime-smoke',[workspace+'apps/impossible/tests/browser.mjs','--smoke']],
 ['deadlock-lan',['--test',workspace+'apps/boxhead/tests/lan.test.mjs']],
];
if(process.argv.includes('--browser-only'))tasks.splice(0,2);
if(process.argv.includes('--full'))tasks.push(
 ['vault-campaign',['hardest/campaign-check.mjs']],
 ['vault-trusted-input',['hardest/visual-check.mjs']],
 ['arena-campaign',[workspace+'apps/swords-and-sandals/tests/browser.mjs']],
 ['runner-campaign',[workspace+'apps/impossible/tests/browser.mjs','--deterministic']],
 ['shooters-campaign',[workspace+'packages/shmup-core/tests/legal-input.mjs']],
 ['shooters-touch',[workspace+'packages/shmup-core/tests/touch-input.mjs']],
 ['shooters-failure-retry',[workspace+'packages/shmup-core/tests/failure-input.mjs']],
 ['burger-player',[workspace+'apps/burger-tycoon/tests/player.mjs']],
 ['deadlock-local',['--test',workspace+'apps/boxhead/tests/release.test.mjs']],
 ['deadlock-survival',['--test',workspace+'apps/boxhead/tests/survival.test.mjs']],
);
const results=[];let failed=false;
try{
 for(const[name,args]of tasks){
  console.log(`\nVERIFY ${name}: node ${args.join(' ')}`);const start=Date.now();let log='';
  const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{env,stdio:['ignore','pipe','pipe']});for(const stream of[child.stdout,child.stderr])stream.on('data',data=>{log+=data;process.stdout.write(data);});child.once('error',reject);child.once('exit',resolve);});
  await writeFile(path.join(out,name+'.log'),log);results.push({name,command:'node '+args.join(' '),exitCode:code,seconds:(Date.now()-start)/1000});if(code!==0){failed=true;break;}
 }
}finally{server.close();await writeFile(path.join(out,'results.json'),JSON.stringify({date:new Date().toISOString(),site,browser,full:process.argv.includes('--full'),status:failed?'FAIL':'PASS',results},null,2)+'\n');}
console.log(`\n${failed?'FAIL':'PASS'} offline verification. Evidence: ${out}`);process.exitCode=failed?1:0;
