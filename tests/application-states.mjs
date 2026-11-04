import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {APPLICATION_ENDPOINT} from '../src/lib/application.ts';

const origin='http://127.0.0.1:4321',out='artifacts/step-6',results=[];
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try {
 for(const width of [1440,390])for(const state of ['validation-errors','pending','server-error','success']){
  const context=await browser.newContext({viewport:{width,height:900}});
  const page=await context.newPage(),unexpected=[],errors=[];let calls=0,release;
  const held=new Promise(resolve=>{release=resolve;});
  await context.route('**/*',async route=>{
   const req=route.request();if(new URL(req.url()).origin===origin)return route.continue();
   if(req.url()!==APPLICATION_ENDPOINT||req.method()!=='POST'){unexpected.push(req.url());return route.abort();}
   calls++;if(state==='pending')await held;
   return route.fulfill({status:state==='server-error'?403:200,headers:{'content-type':'application/json','access-control-allow-origin':origin},body:state==='server-error'?'{}':'{"ok":true}'});
  });
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+'/aitisi');await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>!document.querySelector('.application-submit').disabled);
  if(state!=='validation-errors'){
   // Fictional fixtures only; no request leaves the intercepted browser context.
   for(const [name,value]of Object.entries({officeName:'Συμβολαιογραφείο [●]',city:'Πόλη [●]',notaryName:'Μαρία Κωνσταντίνου',email:'maria@example.test',phone:'+30 (000) 000-0000',message:'Πλασματική δοκιμή [●].'}))await page.locator(`[name="${name}"]`).fill(value);
   await page.locator('[name=acceptTerms]').check();
  }
  await page.locator('.application-submit').click();
  if(state==='pending')await page.waitForFunction(()=>document.querySelector('form').getAttribute('aria-busy')==='true');
  else await page.locator(state==='success'?'#application-success':'#application-errors').waitFor({state:'visible'});
  const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()).violations;
  assert.deepEqual(violations,[]);assert.deepEqual(unexpected,[]);assert.deepEqual(errors,[]);
  assert.equal(calls,state==='validation-errors'?0:1);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);assert.equal((await context.cookies()).length,0);
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${out}/${state}-${width}.png`,fullPage:true});
  results.push({state,width,mockedPosts:calls,actualExternalRequests:0,axeViolations:violations,errors,overflow:false,storage:0});
  release();if(state==='pending')await page.locator('#application-success').waitFor({state:'visible'});
  await context.close();
 }
 await writeFile(`${out}/application-states.json`,JSON.stringify(results,null,2));
 console.log('PASS: eight application state screenshots; axe 0; simulated API only.');
} finally {await browser.close();}
