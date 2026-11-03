import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import sharp from 'sharp';
const out='artifacts/step-4';await mkdir(out,{recursive:true});
const source=await readFile('design/keimena.md','utf8');
const norm=s=>s.replace(/\s+/g,' ').trim();
const measures=JSON.parse(await readFile('src/data/security.json','utf8'));
const origin='http://127.0.0.1:4321';
const sharedScripts=[...(await readFile('dist/index.html','utf8')).matchAll(/<script[^>]*>[\s\S]*?<\/script>/g)].map(m=>m[0]);
for(const slug of ['dedomena','times'])assert.deepEqual([...(await readFile(`dist/${slug}/index.html`,'utf8')).matchAll(/<script[^>]*>[\s\S]*?<\/script>/g)].map(m=>m[0]),sharedScripts,'Only the existing mobile-menu JavaScript is allowed.');
// Section boundaries measured from the original reference PNGs, without rescaling.
const reference={dedomena:{1440:[{top:76,height:287},{top:363,height:1307},{top:1670,height:1140},{top:2810,height:484}],390:[{top:64,height:294},{top:358,height:2308},{top:2666,height:1880},{top:4546,height:782}]},times:{1440:[{top:76,height:228},{top:304,height:814},{top:1118,height:484}],390:[{top:64,height:256},{top:320,height:952},{top:1272,height:783}]}};
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const results=[];
for(const slug of ['dedomena','times'])for(const width of [1440,768,390]){
 const context=await browser.newContext({viewport:{width,height:900},hasTouch:width===390});const page=await context.newPage();const requests=[],errors=[],failures=[];
 page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failures.push(r.url()));
 assert.equal((await page.goto(`${origin}/${slug}`)).status(),200);await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('html').getAttribute('lang'),'el');assert(await page.evaluate(()=>document.fonts.check('17px Geologica')));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.equal(await page.locator('.breadcrumbs a').getAttribute('href'),'/');
 assert.equal(await page.locator('.desktop-nav [aria-current=page]').getAttribute('href'),`/${slug}`);
 assert.equal(await page.locator('#mobile-navigation [aria-current=page]').getAttribute('href'),`/${slug}`);
 const texts=await page.locator('main').evaluate(e=>[...e.querySelectorAll('h1,h2,h3,p,strong,small,dt,dd,figcaption')].filter(e=>!e.childElementCount).map(e=>e.textContent.trim()));
 for(const text of texts)assert(norm(source).includes(norm(text)),`Unapproved copy: ${text}`);
 const main=norm(await page.locator('main').innerText());
 const links=await page.locator('main a').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
 assert(links.every(h=>['/','/aitisi','#metra','mailto:info@aspect-praxis.com','https://app.aspect-praxis.com/prostasia-dedomenon'].includes(h)));
 assert.deepEqual(await page.locator('.site-footer a[href^="https://app.aspect-praxis.com"]').evaluateAll(es=>es.map(e=>[e.textContent.trim(),e.getAttribute('href')])),[['Όροι χρήσης','https://app.aspect-praxis.com/oroi'],['Πολιτική απορρήτου','https://app.aspect-praxis.com/aporrito'],['Πολιτική cookies','https://app.aspect-praxis.com/cookies'],['Σύμβαση επεξεργασίας δεδομένων','https://app.aspect-praxis.com/prostasia-dedomenon']]);
 if(slug==='dedomena'){
  assert.equal(await page.locator('.security-measure:visible').count(),10);
  assert.deepEqual(await page.locator('.security-measure dt').allTextContents(),measures.map(m=>m.label));
  for(const [i,measure]of measures.entries()){
   const label=page.locator('.security-measure').nth(i);
   assert.equal(norm(await label.locator('dd').innerText()),`${measure.heading} ${measure.description}`);
   assert(norm(source).includes(norm(`${measure.heading} ${measure.description}`)));
  }
  assert.equal(await page.locator('.security-measure a').getAttribute('href'),'https://app.aspect-praxis.com/prostasia-dedomenon');
  assert.equal(await page.locator('.journey-figure button,.journey-figure input,.journey-figure a,.pseudonym-example button,.pseudonym-example input,.pseudonym-example a').count(),0);
  assert.equal(await page.locator('.pseudonym-card').count(),3);
  assert(main.includes('…εμφανίστηκε η Μαρία Κωνσταντίνου…'));assert(main.includes('…εμφανίστηκε Πρόσωπο Α…'));
  assert(main.includes('[●] μόνο αυτή η λέξη'));
  // The EU storage and outside-EU provider remain separate, ordered regions.
  const office=await page.locator('.journey-office').boundingBox(),eu=await page.locator('.journey-eu').boundingBox(),provider=await page.locator('.journey-provider').boundingBox();
  if(width<1000){assert(office.y+office.height<eu.y);assert(eu.y+eu.height<provider.y);}else{assert(office.x+office.width<eu.x);assert(eu.x+eu.width<provider.x);}
  await page.locator('a[href="#metra"]').click();
  assert.equal(new URL(page.url()).hash,'#metra');
  const header=await page.locator('.site-header').boundingBox(),target=await page.locator('#measures-title').boundingBox();assert(target.y>=header.y+header.height);
 }else{
  assert.equal(await page.locator('.package-card').count(),3);assert.equal(await page.locator('.package-card:visible').count(),width===390?1:3);
  for(const card of await page.locator('.package-card').all()){
   assert.equal(await card.locator('h2').innerText(),'Πακέτο [●]');assert.equal(norm(await card.locator('.package-price').innerText()),'[●] € / μήνα');
   assert.deepEqual(await card.locator('dl>div').allTextContents(),['Πράξεις τον μήνα[●]','Χρήστες έως[●]']);
  }
  assert.equal(await page.locator('.package-note').innerText(),'Ενδεικτική δομή. Ονόματα, πλήθος και ποσά των πακέτων: [●].');
  assert.deepEqual(await page.locator('.package-benefit h3').allTextContents(),['Πληρωμή με κάρτα','Διορθώσεις χωρίς χρέωση','Τι μετρά ως πράξη']);
  assert.equal(await page.locator('.package-benefit').last().locator('p').innerText(),'Μια πράξη μετρά μόνο όταν βγει .docx ή κείμενο. Όσο το Praxis σας δείχνει τι χρειάζεται ακόμη, δεν μετρά.');
 }
 await page.evaluate(()=>scrollTo(0,0));
 await page.screenshot({path:`${out}/${slug}-${width}.png`,fullPage:true});
 const selector='.internal-intro,.security-journey,.security-measures,.pricing-content,.application-closing';
 const sections=await page.locator(selector).evaluateAll(es=>es.map(e=>({class:e.className,top:Math.round(e.getBoundingClientRect().top+scrollY),height:Math.round(e.getBoundingClientRect().height)})));
 if(reference[slug][width])sections.forEach((section,i)=>{const ref=reference[slug][width][i];Object.assign(section,{reference:ref,deltaTop:section.top-ref.top,deltaHeight:section.height-ref.height});});
 const details=await page.locator('.journey-diagram,.journey-office,.journey-eu,.journey-provider,.pseudonym-example,.security-measure,.package-grid,.package-benefits,.pricing-activation').evaluateAll(es=>es.map(e=>({class:e.className,top:Math.round(e.getBoundingClientRect().top+scrollY),height:Math.round(e.getBoundingClientRect().height)})));
 await page.evaluate(()=>scrollTo(0,1000));assert.equal(Math.round((await page.locator('.site-header').boundingBox()).y),0);await page.evaluate(()=>scrollTo(0,0));
 if(width<1000){
  const toggle=page.locator('.menu-toggle'),menu=page.locator('#mobile-navigation');
  await page.keyboard.press('Tab');await toggle.focus();assert(await toggle.evaluate(e=>getComputedStyle(e).outlineStyle==='solid'));
  await page.keyboard.press('Enter');assert(await menu.isVisible());assert.equal(await toggle.getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement.closest('#mobile-navigation')!==null));
  await page.keyboard.press('Escape');assert(await menu.isHidden());assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert(await toggle.evaluate(e=>e===document.activeElement));
  await page.keyboard.press('Space');assert(await menu.isVisible());
  const openAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();assert.deepEqual(openAxe.violations,[]);
  await toggle.click();if(width===390)await toggle.tap();else await toggle.click();assert(await menu.isVisible());await page.keyboard.press('Escape');assert(await menu.locator('a').evaluateAll(es=>es.every(e=>!e.getClientRects().length)));
  assert(await page.locator('.menu-toggle,.application-link .button,main .button').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().height>=44)));
 }
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);assert(requests.every(u=>new URL(u).origin===origin));assert.equal((await context.cookies()).length,0);assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
 results.push({slug,width,sections,details,requests,externalRequests:requests.filter(u=>new URL(u).origin!==origin),cookies:await context.cookies(),errors,failures,violations:axe.violations});await context.close();
 if(width!==768){const ref=`design/eikones/${slug}__${width}.png`,current=`${out}/${slug}-${width}.png`;const a=await sharp(ref).metadata(),b=await sharp(current).metadata();await sharp({create:{width:width*2,height:Math.max(a.height,b.height),channels:3,background:'white'}}).composite([{input:ref,left:0,top:0},{input:current,left:width,top:0}]).png().toFile(`${out}/comparison-${slug}-${width}.png`);}
}
for(const forbidden of ['design','artifacts'])assert(!(await readdir('dist')).includes(forbidden));
// Step 5 now supplies /aitisi; its behavior is covered by test:application.
await browser.close();await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));assert(results.every(r=>!r.violations.length),JSON.stringify(results.map(r=>({slug:r.slug,width:r.width,violations:r.violations})),null,2));console.log('PASS: security and pricing at 1440/768/390; approved copy, measures, cards, anchor, navigation, menu, local requests, axe.');
