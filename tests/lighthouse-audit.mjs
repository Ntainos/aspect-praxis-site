import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='artifacts/step-6';await mkdir(out,{recursive:true});const results=[];
for(const page of ['index','pos-leitourgei','eidi','dedomena','times','aitisi']){
 for(const device of ['desktop','mobile']){
  const path=`${out}/lighthouse-${page}-${device}.json`;
  const args=['node_modules/lighthouse/cli/index.js',`http://127.0.0.1:4321/${page==='index'?'':page}`,'--only-categories=accessibility,best-practices','--chrome-flags=--headless --no-sandbox','--output=json',`--output-path=${path}`,'--quiet'];
  if(device==='desktop')args.push('--preset=desktop');
  await new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{env:{...process.env,CHROME_PATH:process.env.CHROMIUM_PATH||'/usr/bin/chromium'},stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(`Lighthouse exit ${code}`)));});
  const report=JSON.parse(await readFile(path,'utf8'));const scores={page,device,accessibility:report.categories.accessibility.score*100,bestPractices:report.categories['best-practices'].score*100};
  results.push(scores);console.log(scores);assert(scores.accessibility>=95&&scores.bestPractices>=95);assert(!report.runtimeError);
 }
}
await writeFile(`${out}/lighthouse-summary.json`,JSON.stringify(results,null,2));
