import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import sharp from 'sharp';
const out='artifacts/cloudflare-security',origin='http://127.0.0.1:4321';
await mkdir(out,{recursive:true});
const raw=await readFile('public/_headers','utf8');assert.equal(await readFile('dist/_headers','utf8'),raw);
const lines=raw.trimEnd().split('\n');assert.equal(lines[0],'/*');assert.equal(lines.length,7);assert(lines.every(l=>l.length<=2000));
const headers=Object.fromEntries(lines.slice(1).map(l=>{const m=/^  ([\w-]+): (.+)$/.exec(l);assert(m);return [m[1].toLowerCase(),m[2]];}));
assert.deepEqual(headers,{
 'x-robots-tag':'noindex, nofollow','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin',
 'permissions-policy':'camera=(), microphone=(), geolocation=(), payment=(), usb=()', 'cross-origin-opener-policy':'same-origin',
 'content-security-policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://app.aspect-praxis.com; form-action 'none'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'; manifest-src 'self'"
});
const html=[];async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const path=dir+'/'+e.name;if(e.isDirectory())await walk(path);else if(path.endsWith('.html'))html.push(path);}}await walk('dist');assert.equal(html.length,7);
const scripts=[];for(const path of html){const text=await readFile(path,'utf8');assert(!/\son\w+=/i.test(text));for(const match of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){assert.match(match[1],/src="\/_astro\//);assert.equal(match[2].trim(),'');scripts.push({page:path,attributes:match[1]});}}
for(const dir of ['design','artifacts','odigos'])assert(!(await readdir('dist')).includes(dir));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});const results=[],visual=[],form=[];
try{
for(const name of ['index','pos-leitourgei','eidi','dedomena','times','aitisi','404'])for(const width of [1440,768,390]){
 const context=await browser.newContext({viewport:{width,height:900},hasTouch:width===390});const page=await context.newPage(),errors=[],external=[];
 await context.addInitScript(()=>{window.cspViolations=[];document.addEventListener('securitypolicyviolation',e=>window.cspViolations.push({directive:e.effectiveDirective,blockedURI:e.blockedURI}));});
 await context.route('**/*',route=>{if(new URL(route.request().url()).origin!==origin){external.push(route.request().url());return route.abort();}return route.continue();});
 page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(origin+(name==='index'?'/':name==='404'?'/missing-security-test':'/'+name));
 assert.equal(response.status(),name==='404'?404:200);for(const [k,v]of Object.entries(headers))assert.equal(response.headers()[k],v);
 await page.evaluate(()=>document.fonts.ready);assert(await page.evaluate(()=>document.fonts.check('17px Geologica')));
 assert(await page.locator('img').evaluateAll(es=>es.every(e=>e.complete&&e.naturalWidth>0)));
 assert(await page.evaluate(async()=>{const img=new Image();img.src=document.querySelector('link[rel=icon]').href;await img.decode();return img.naturalWidth>0;}));
 if(name!=='404'&&width!==768){
  const current=await page.screenshot({path:`${out}/${name}-${width}.png`,fullPage:true});
  const baseline=execFileSync('git',['show',`7efa4f5:artifacts/step-6/${name}-${width}.png`],{maxBuffer:20*1024*1024});
  const a=await sharp(baseline).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=await sharp(current).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.deepEqual(a.info,b.info);let different=0;for(let i=0;i<a.data.length;i+=4)if(!a.data.subarray(i,i+4).equals(b.data.subarray(i,i+4)))different++;
  const meta=await sharp(current).metadata();await sharp({create:{width:width*2,height:meta.height,channels:3,background:'white'}}).composite([{input:baseline,left:0,top:0},{input:current,left:width,top:0}]).png().toFile(`${out}/comparison-${name}-${width}.png`);
  visual.push({name,width,differentPixels:different,totalPixels:meta.width*meta.height});assert.equal(different,0,`${name} ${width}: visual regression`);
 }
 if(width<1000){const toggle=page.locator('.menu-toggle'),menu=page.locator('#mobile-navigation');
  await toggle.click();assert(await menu.isVisible());await page.keyboard.press('Escape');assert(await toggle.evaluate(e=>document.activeElement===e));
  await page.keyboard.press('Enter');await page.keyboard.press('Tab');assert(await page.evaluate(()=>!!document.activeElement.closest('#mobile-navigation')));await page.keyboard.press('Escape');
  await page.keyboard.press('Space');assert(await menu.isVisible());await page.keyboard.press('Escape');if(width===390){await toggle.tap();assert(await menu.isVisible());await toggle.tap();}
  assert(await menu.isHidden());assert.equal(await toggle.getAttribute('aria-expanded'),'false');
 }
 const violations=await page.evaluate(()=>window.cspViolations);assert.deepEqual(violations,[]);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 results.push({name,width,cspViolations:violations,errors,externalRequests:external,headersMatch:true});await context.close();
}
for(const ok of [false,true]){
 const context=await browser.newContext();const page=await context.newPage();let calls=0;const unexpected=[];
 await context.addInitScript(()=>{window.cspViolations=[];document.addEventListener('securitypolicyviolation',e=>window.cspViolations.push(e.effectiveDirective));});
 await context.route('**/*',route=>{const req=route.request();if(new URL(req.url()).origin===origin)return route.continue();assert.equal(req.url(),'https://app.aspect-praxis.com/api/public/office-application');assert.equal(req.method(),'POST');calls++;return route.fulfill({status:200,headers:{'content-type':'application/json','access-control-allow-origin':origin},body:JSON.stringify({ok})});});
 await page.goto(origin+'/aitisi');await page.waitForFunction(()=>!document.querySelector('.application-submit').disabled);
 for(const [name,value]of Object.entries({officeName:'Γραφείο [●]',notaryName:'Όνομα [●]',city:'Πόλη [●]',email:'test@example.test',phone:'12345'}))await page.locator(`[name=${name}]`).fill(value);
 await page.locator('[name=acceptTerms]').check();await page.locator('.application-submit').click();await page.locator(ok?'#application-success':'#application-errors').waitFor({state:'visible'});
 assert.equal(calls,1);assert.equal(await page.locator('#application-success').isVisible(),ok);assert.deepEqual(await page.evaluate(()=>window.cspViolations),[]);
 assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);assert.equal((await context.cookies()).length,0);
 form.push({response:{status:200,ok},mockedPosts:calls,success:ok,cspViolations:[],actualExternalPosts:0});await context.close();
}
// Exercise native form submission independently of the JS submit handler.
const context=await browser.newContext();const page=await context.newPage();let nativePosts=0;
await context.addInitScript(()=>{window.cspViolations=[];document.addEventListener('securitypolicyviolation',e=>window.cspViolations.push(e.effectiveDirective));});
await context.route('**/*',route=>{if(route.request().method()==='POST'){nativePosts++;return route.abort();}assert.equal(new URL(route.request().url()).origin,origin);return route.continue();});
await page.goto(origin+'/aitisi');await page.evaluate(()=>HTMLFormElement.prototype.submit.call(document.querySelector('form')));
await page.waitForFunction(()=>window.cspViolations.includes('form-action'));assert.equal(nativePosts,0);assert.deepEqual(await page.evaluate(()=>window.cspViolations),['form-action']);
await context.close();await writeFile(`${out}/security-results.json`,JSON.stringify({headers,cloudflareLimits:{rules:1,longestLine:Math.max(...lines.map(l=>l.length)),maxRules:100,maxLine:2000},html,scripts,pages:results,visual,form,nativeSubmission:{blocked:true,expectedViolation:'form-action',networkPosts:0}},null,2));
console.log('PASS: headers/build, 21 CSP page cases, 12 pixel-identical screenshots, mock fetch and blocked native submission.');
}finally{await browser.close();}
