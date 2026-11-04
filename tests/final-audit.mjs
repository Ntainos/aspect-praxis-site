import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import sharp from 'sharp';
const out='artifacts/step-6',origin='http://127.0.0.1:4321';
const pages=['index','pos-leitourgei','eidi','dedomena','times','aitisi'];
const legal=['oroi','aporrito','cookies','prostasia-dedomenon'].map(s=>'https://app.aspect-praxis.com/'+s);
const results=[],links=new Map(),requests=[];
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
for(const name of [...pages,'404'])for(const width of [1440,768,390]){
 const context=await browser.newContext({viewport:{width,height:900},hasTouch:width===390});
 const external=[],errors=[],failed=[];await context.route('**/*',route=>{if(new URL(route.request().url()).origin!==origin){external.push(route.request().url());return route.abort();}return route.continue();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));page.on('request',r=>requests.push(r.url()));
 const path=name==='index'?'/':name==='404'?'/unknown-step-6':`/${name}`;
 assert.equal((await page.goto(origin+path)).status(),name==='404'?404:200);await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('html').getAttribute('lang'),'el');assert.equal(await page.locator('h1').count(),1);
 assert(await page.evaluate(()=>document.fonts.check('17px Geologica')));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name} ${width}: overflow`);
 assert.equal(await page.locator('link[rel=icon]').getAttribute('href'),'/logo/praxis-mark-small-under24.svg');
 const measurements=await page.locator('main section,.workflow-responsibility,.development-card,.site-footer,.application-form,.next-steps').evaluateAll(es=>es.map(e=>({tag:e.tagName,class:e.className,id:e.id,y:Math.round(e.getBoundingClientRect().top+scrollY),height:Math.round(e.getBoundingClientRect().height)})));
 await page.screenshot({path:`${out}/${name}-${width}.png`,fullPage:true});
 const hrefs=await page.locator('a[href]').evaluateAll(es=>es.map(e=>({href:e.getAttribute('href'),label:e.textContent.trim()})));
 for(const a of hrefs){const url=new URL(a.href,origin+path);links.set(url.href,{href:url.href,label:a.label,kind:url.protocol==='mailto:'?'email':url.origin===origin?'internal':'external'});if(url.hash&&url.pathname===path)assert.equal(await page.locator(`[id="${decodeURIComponent(url.hash.slice(1))}"]`).count(),1);}
 assert.deepEqual(await page.locator('.site-footer a').evaluateAll(es=>es.map(e=>e.href).filter(h=>h.startsWith('https://app.aspect-praxis.com/'))),legal);
 // Keyboard focus is actually rendered, not just declared in CSS.
 await page.keyboard.press('Tab');assert(await page.evaluate(()=>{const e=document.activeElement,s=getComputedStyle(e);return e.tagName==='A'&&parseFloat(s.outlineWidth)>=3&&s.outlineStyle!=='none';}));
 await page.evaluate(()=>scrollTo(0,700));assert.equal(Math.round((await page.locator('.site-header').boundingBox()).y),0);await page.evaluate(()=>scrollTo(0,0));
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();assert.deepEqual(axe.violations,[],`${name} ${width}: axe`);
 let menuViolations=[];
 if(width<1000){const toggle=page.locator('.menu-toggle'),menu=page.locator('#mobile-navigation');
  assert((await toggle.boundingBox()).height>=44);await toggle.focus();await page.keyboard.press('Enter');assert.equal(await toggle.getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Tab');assert(await page.evaluate(()=>!!document.activeElement.closest('#mobile-navigation')));
  assert(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineWidth==='3px'));
  for(const a of await menu.locator('a:visible').all())assert((await a.boundingBox()).height>=44);
  menuViolations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()).violations;assert.deepEqual(menuViolations,[]);
  if(width===390)await page.screenshot({path:`${out}/menu-${name}-390.png`});
  await page.keyboard.press('Escape');assert(await menu.isHidden());assert(await toggle.evaluate(e=>e===document.activeElement));assert.equal(await toggle.getAttribute('aria-expanded'),'false');
  assert(await menu.locator('a').evaluateAll(es=>es.every(e=>!e.getClientRects().length)));
  await page.keyboard.press('Space');assert(await menu.isVisible());await page.keyboard.press('Escape');if(width===390)await toggle.tap();else await toggle.click();assert(await menu.isVisible());await toggle.click();
 }
 for(const a of await page.locator('.button:visible,.site-footer a:visible').all())assert((await a.boundingBox()).height>=44);
 assert.deepEqual(external,[]);assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.equal((await context.cookies()).length,0);assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
 if(name==='aitisi'){assert(await page.locator('.application-link').evaluate(e=>getComputedStyle(e).visibility==='hidden'));assert.equal(await page.locator('[name=acceptTerms]').isChecked(),false);}
 if(name==='404'){assert.match(await page.locator('h1').innerText(),/δεν βρέθηκε/);assert.equal(await page.locator('main a').getAttribute('href'),'/');assert.match(await page.locator('meta[name=robots]').getAttribute('content'),/noindex/);}
 results.push({name,width,status:name==='404'?404:200,sections:measurements,axeViolations:axe.violations,menuViolations,externalRequests:external,errors,failed,overflow:false,keyboardFocus:true,touchTargets:true,storage:0});await context.close();
 if(pages.includes(name)&&width!==768){
  const ref=`design/eikones/${name}__${width}.png`,current=`${out}/${name}-${width}.png`,a=await sharp(ref).metadata(),b=await sharp(current).metadata(),height=Math.max(a.height,b.height);
  await sharp({create:{width:width*2,height,channels:3,background:'white'}}).composite([{input:ref,left:0,top:0},{input:current,left:width,top:0}]).png().toFile(`${out}/comparison-${name}-${width}.png`);
  const pad=async file=>sharp({create:{width,height,channels:3,background:'white'}}).composite([{input:file,left:0,top:0}]).raw().toBuffer();
  const aa=await pad(ref),bb=await pad(current),overlay=Buffer.alloc(aa.length);for(let i=0;i<aa.length;i++)overlay[i]=Math.round((aa[i]+bb[i])/2);
  await sharp(overlay,{raw:{width,height,channels:3}}).png().toFile(`${out}/overlay-${name}-${width}.png`);
 }
}
const request=await browser.newContext();const linkResults=[];
for(const l of links.values()){
 if(l.kind==='internal'){const u=new URL(l.href);const response=await request.request.get(u.origin+u.pathname);assert.equal(response.status(),200,l.href);if(u.hash){const p=await request.newPage();await p.goto(u.origin+u.pathname);assert.equal(await p.locator(`[id="${decodeURIComponent(u.hash.slice(1))}"]`).count(),1);await p.close();}linkResults.push({...l,status:200,anchorExists:!!u.hash||undefined});}
 else if(l.kind==='external'){assert(legal.includes(l.href),l.href);linkResults.push({...l,approvedDestination:true,networkRequested:false});}
 else {assert.equal(l.href,'mailto:info@aspect-praxis.com');linkResults.push({...l,valid:true});}
}
const notFound=[];for(const path of ['/odigos','/odigos/','/odigos/index.html','/unknown-step-6','/nested/unknown-step-6']){const response=await request.request.get(origin+path);assert.equal(response.status(),404);assert((await response.text()).includes('Η σελίδα δεν βρέθηκε.'));notFound.push({path,status:404,customGreekPage:true});}
const dist=await readdir('dist');for(const name of ['odigos','design','artifacts'])assert(!dist.includes(name));assert(dist.includes('404.html'));assert.equal(dist.filter(f=>f.endsWith('.html')).length,2);
const svg=await readFile('dist/logo/praxis-mark-small-under24.svg');assert.deepEqual(svg,await readFile('design/logo/praxis-mark-small-under24.svg'));
const faviconPage=await request.newPage();await faviconPage.goto(origin+'/');const favicon=await faviconPage.evaluate(async()=>{const url=document.querySelector('link[rel=icon]').href;const r=await fetch(url);const img=new Image();img.src=url;await img.decode();return {url,status:r.status,type:r.headers.get('content-type'),width:img.naturalWidth,height:img.naturalHeight};});assert.equal(favicon.status,200);assert(favicon.width>0&&favicon.height>0);await request.close();
await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));await writeFile(`${out}/links.json`,JSON.stringify(linkResults,null,2));await writeFile(`${out}/production-checks.json`,JSON.stringify({dist,notFound,favicon,approvedFaviconBytes:true,externalInitialRequests:0,requests:[...new Set(requests)]},null,2));
console.log(`PASS: ${results.length} page/viewport checks; axe 0; all local links/anchors; approved external destinations; 404; no guide; favicon; no external loading requests.`);
}finally{await browser.close();}
