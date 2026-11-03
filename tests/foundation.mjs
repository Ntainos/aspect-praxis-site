import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile, readdir } from 'node:fs/promises';
const out = 'artifacts/step-1';
await mkdir(out, {recursive:true});
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
const results=[];
for(const width of [1440,768,390]){
 const context=await browser.newContext({viewport:{width,height:900},hasTouch:width===390});
 const page=await context.newPage();const requests=[];const errors=[];
 page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto('http://127.0.0.1:4321/odigos');assert.equal(response.status(),200);
 await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('html').getAttribute('lang'),'el');
 assert.match(await page.locator('meta[name=robots]').getAttribute('content'),/noindex/);
 assert.equal(await page.locator('#terms').isChecked(),false);
 assert.equal(await page.locator('form').count(),0);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert(await page.evaluate(()=>document.fonts.check('17px Geologica')));
 await page.screenshot({path:`${out}/odigos-${width}.png`,fullPage:true});
 await page.evaluate(()=>scrollTo(0,800));assert.equal(Math.round((await page.locator('.site-header').boundingBox()).y),0);await page.evaluate(()=>scrollTo(0,0));
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 if(width<1000){
  const toggle=page.locator('.menu-toggle'); const menu=page.locator('#mobile-navigation');
  await toggle.focus();await page.keyboard.press('Enter');assert.equal(await toggle.getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Πώς λειτουργεί');
  await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert(await toggle.evaluate(e=>e===document.activeElement));
  await page.keyboard.press('Space');assert(await menu.isVisible());await page.keyboard.press('Escape');
  if(width===390) await toggle.tap();else await toggle.click();
  assert(await menu.isVisible());
  if(width===390)await page.screenshot({path:`${out}/menu-390.png`,fullPage:true});
  await toggle.click();assert(await menu.isHidden());
  const hiddenFocus=await menu.evaluate(e=>[...e.querySelectorAll('a')].every(a=>a.getClientRects().length===0));assert(hiddenFocus);
  await toggle.click();await page.setViewportSize({width:1200,height:900});assert(await menu.isHidden());await page.setViewportSize({width,height:900});
 }
 assert.deepEqual(errors,[]);assert(requests.every(url=>new URL(url).origin==='http://127.0.0.1:4321'));
 assert.equal((await context.cookies()).length,0);
 assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
 results.push({width,axeViolations:axe.violations,requests,checks:'layout, sticky, font, noindex, no storage, no external requests, keyboard/touch/click menu where visible'});
 await context.close();
}
assert(!(await readdir('dist')).includes('design'));
await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));await browser.close();
assert(results.every(r=>r.axeViolations.length===0),JSON.stringify(results.map(r=>({width:r.width,violations:r.axeViolations})),null,2));
console.log('PASS: 1440, 768, 390; zero WCAG A/AA axe violations.');
