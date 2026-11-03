import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile,readdir} from 'node:fs/promises';
import sharp from 'sharp';
const out='artifacts/step-2';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const results=[];const source=await readFile('design/keimena.md','utf8');
for(const width of [1440,768,390]){
 const context=await browser.newContext({viewport:{width,height:900},hasTouch:width===390});const page=await context.newPage();const requests=[],errors=[];
 page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));
 assert.equal((await page.goto('http://127.0.0.1:4321/')).status(),200);await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('h1').count(),1);assert.equal((await page.locator('h1').innerText()).replace(/\s+/g,' ').trim(),'Συμπληρώνετε μια φόρμα. Παίρνετε σχέδιο πράξης σε Word.');assert.equal(await page.locator('html').getAttribute('lang'),'el');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const expectedTypes=[...source.split('## 1 · Αρχική')[1].split('## 2 ·')[0].matchAll(/- (\d\d) (.*)/g)].map(m=>m[1]+m[2]);
 assert.deepEqual(await page.locator('.deed-types li').allTextContents(),expectedTypes);
 assert.equal((await page.locator('.price-number').textContent()).replace(/\s+/g,' ').trim(),'[●] € / μήνα');
 assert.equal(await page.locator('.deed-types li:visible').count(),width===390?8:23);assert.equal(await page.locator('.security-points li:visible').count(),width===390?3:6);
 assert.equal(await page.locator('.product-chat:visible').count(),width===390?0:1);assert.equal(await page.locator('.price-example:visible').count(),width===390?0:1);
 const copy=await page.locator('.homepage').evaluate(e=>[...e.querySelectorAll('p,h1,h2,h3,li,strong')].filter(e=>e.childElementCount===0).map(e=>e.textContent.trim()));
 const normalize=s=>s.replace(/\s+/g,' ').trim();const approved=normalize(source);
 for(const text of copy)assert(approved.includes(normalize(text)),`Unapproved copy: ${text}`);
 const hrefs=await page.locator('main a').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
 assert(hrefs.every(h=>['/aitisi','/pos-leitourgei','/eidi','/dedomena','/times','mailto:info@aspect-praxis.com'].includes(h)));
 assert(!await page.locator('.homepage').innerText().then(t=>t.includes('ΗΠΑ')));
 await page.screenshot({path:`${out}/index-${width}.png`,fullPage:true});
 const sections=await page.locator('.homepage>section').evaluateAll(es=>es.map(e=>({class:e.className,top:Math.round(e.getBoundingClientRect().top+scrollY),height:Math.round(e.getBoundingClientRect().height)})));
 await page.evaluate(()=>scrollTo(0,1000));assert.equal(Math.round((await page.locator('.site-header').boundingBox()).y),0);await page.evaluate(()=>scrollTo(0,0));
 if(width<1000){const toggle=page.locator('.menu-toggle');await toggle.focus();await page.keyboard.press('Enter');assert.equal(await toggle.getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert(await toggle.evaluate(e=>e===document.activeElement));if(width===390)await toggle.tap();else await toggle.click();await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'false');}
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 assert.deepEqual(errors,[]);assert(requests.every(r=>new URL(r).origin==='http://127.0.0.1:4321'));assert.equal((await context.cookies()).length,0);
 assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
 results.push({width,sections,requests,errors,violations:axe.violations});await context.close();
 if(width!==768){const ref=`design/eikones/index__${width}.png`,current=`${out}/index-${width}.png`;const a=await sharp(ref).metadata(),b=await sharp(current).metadata();await sharp({create:{width:width*2,height:Math.max(a.height,b.height),channels:3,background:'white'}}).composite([{input:ref,left:0,top:0},{input:current,left:width,top:0}]).png().toFile(`${out}/comparison-${width}.png`);}
}
assert(!(await readdir('dist')).includes('design'));await browser.close();await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));
assert(results.every(r=>!r.violations.length),JSON.stringify(results.map(r=>({width:r.width,violations:r.violations})),null,2));
console.log('PASS: homepage 1440/768/390; approved copy, links, responsive counts, menu, local requests, axe.');
