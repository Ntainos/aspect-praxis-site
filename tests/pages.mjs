import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import sharp from 'sharp';
const out='artifacts/step-3';await mkdir(out,{recursive:true});
const source=await readFile('design/keimena.md','utf8');const norm=s=>s.replace(/\s+/g,' ').trim();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});const results=[];
for(const slug of ['pos-leitourgei','eidi'])for(const width of [1440,768,390]){
 const context=await browser.newContext({viewport:{width,height:900},hasTouch:width===390});const page=await context.newPage();const requests=[],errors=[],failures=[];
 page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failures.push(r.url()));
 assert.equal((await page.goto(`http://127.0.0.1:4321/${slug}`)).status(),200);await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('html').getAttribute('lang'),'el');assert(await page.evaluate(()=>document.fonts.check('17px Geologica')));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.equal(await page.locator('.breadcrumbs a').getAttribute('href'),'/');
 assert.equal(await page.locator('.desktop-nav [aria-current=page]').getAttribute('href'),`/${slug}`);
 const texts=await page.locator('main').evaluate(e=>[...e.querySelectorAll('h1,h2,h3,p,strong')].filter(e=>!e.childElementCount).map(e=>e.textContent.trim()));
 for(const text of texts)assert(norm(source).includes(norm(text)),`Unapproved copy: ${text}`);
 const visible=norm(await page.locator('main').innerText());
 if(slug==='eidi'){
  assert.equal(await page.locator('.deed-category').count(),5);assert.equal(await page.locator('.deed-category li:visible').count(),23);
  const expected=[...source.split('## 3 ·')[1].split('## 4 ·')[0].matchAll(/- (\d\d) (.*)/g)].map(m=>m[1]+m[2]);
  assert.deepEqual(await page.locator('.deed-category li').allTextContents(),expected);
 }else{
  const copy=JSON.parse(await readFile('src/data/workflow.json','utf8'));
  for(const [title,paragraph]of Object.entries(copy)){assert(visible.includes(norm(title)));assert(visible.includes(norm(paragraph)));}
  for(const s of ['Στάλθηκε μόνο: «[●]»','της [●]','στη [●]','Ασυνέπεια: «[●]» στην παράγραφο [●], «[●]» στην παράγραφο [●].'])assert(visible.includes(norm(s)));
  assert.equal(await page.locator('.wf-illustration').count(),3);assert.equal(await page.locator('.wf-illustration button,.wf-illustration input,.wf-illustration a').count(),0);
 }
 const links=await page.locator('main a').evaluateAll(es=>es.map(e=>e.getAttribute('href')));assert(links.every(h=>['/','/dedomena','/eidi','/aitisi','mailto:info@aspect-praxis.com'].includes(h)));
 await page.screenshot({path:`${out}/${slug}-${width}.png`,fullPage:true});
 const sections=await page.locator('.internal-intro,.workflow-step,.workflow-responsibility,.deed-category,.development-card,.application-closing').evaluateAll(es=>es.map(e=>({class:e.className,top:Math.round(e.getBoundingClientRect().y+scrollY),height:Math.round(e.getBoundingClientRect().height)})));
 await page.evaluate(()=>scrollTo(0,1000));assert.equal(Math.round((await page.locator('.site-header').boundingBox()).y),0);await page.evaluate(()=>scrollTo(0,0));
 if(width<1000){const toggle=page.locator('.menu-toggle'),menu=page.locator('#mobile-navigation');await toggle.focus();await page.keyboard.press('Enter');assert(await menu.isVisible());await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement.closest('#mobile-navigation')!==null));await page.keyboard.press('Escape');assert(await menu.isHidden());assert(await toggle.evaluate(e=>e===document.activeElement));await page.keyboard.press('Space');assert(await menu.isVisible());await toggle.click();if(width===390)await toggle.tap();else await toggle.click();assert(await menu.isVisible());await page.keyboard.press('Escape');assert(await menu.locator('a').evaluateAll(es=>es.every(e=>!e.getClientRects().length)));}
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);assert(requests.every(u=>new URL(u).origin==='http://127.0.0.1:4321'));assert.equal((await context.cookies()).length,0);assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
 results.push({slug,width,sections,requests,errors,violations:axe.violations});await context.close();
 if(width!==768){const ref=`design/eikones/${slug}__${width}.png`,current=`${out}/${slug}-${width}.png`;const a=await sharp(ref).metadata(),b=await sharp(current).metadata();await sharp({create:{width:width*2,height:Math.max(a.height,b.height),channels:3,background:'white'}}).composite([{input:ref,left:0,top:0},{input:current,left:width,top:0}]).png().toFile(`${out}/comparison-${slug}-${width}.png`);}
}
assert(!(await readdir('dist')).includes('design'));await browser.close();await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));assert(results.every(r=>!r.violations.length),JSON.stringify(results.map(r=>({slug:r.slug,width:r.width,violations:r.violations})),null,2));console.log('PASS: both pages at 1440/768/390; content, navigation, responsive layout, menu, local requests, axe.');
