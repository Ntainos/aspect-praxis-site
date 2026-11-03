import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import sharp from 'sharp';
import {APPLICATION_ENDPOINT,MAX_PAYLOAD_BYTES,applicationBody,validateApplication,termsHaveChanged,changedTermsMessage,sendingFailure,tooLargeMessage} from '../src/lib/application.ts';
const out='artifacts/step-5',origin='http://127.0.0.1:4321';await mkdir(out,{recursive:true});
const source=await readFile('design/keimena.md','utf8'),norm=s=>s.replace(/\s+/g,' ').trim();
// All form fixtures are fictional; the email domain is reserved for tests.
const fixture={officeName:'Συμβολαιογραφείο [●]',notaryName:'Μαρία Κωνσταντίνου',email:'maria@example.test',phone:'+30 (000) 000-0000',city:'Πόλη [●]',message:'Πλασματική δοκιμή [●].',acceptTerms:true,website:''};
const successText='Η αίτησή σας στάλθηκε. Θα επικοινωνήσουμε μαζί σας στο email ή στο τηλέφωνο που δώσατε. Για οτιδήποτε άλλο: info@aspect-praxis.com';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const browserResults=[],mockResults=[];
async function setup(width=390,javaScriptEnabled=true){
 const context=await browser.newContext({viewport:{width,height:900},hasTouch:width===390,javaScriptEnabled});
 const page=await context.newPage(),requests=[],errors=[],calls=[],unexpected=[];let reply=async route=>route.fulfill({status:200,headers:{'content-type':'application/json','access-control-allow-origin':origin},body:'{"ok":true}'});
 // Every external destination is intercepted before it can reach the network.
 await context.route('**/*',async route=>{const req=route.request();if(new URL(req.url()).origin===origin)return route.continue();
  if(req.url()!==APPLICATION_ENDPOINT||req.method()!=='POST'){unexpected.push({url:req.url(),method:req.method()});return route.abort();}
  calls.push({method:req.method(),contentType:req.headers()['content-type'],payload:JSON.parse(req.postData()),bytes:Buffer.byteLength(req.postData(),'utf8')});await reply(route);
 });
 page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));
 assert.equal((await page.goto(`${origin}/aitisi`)).status(),200);await page.evaluate(()=>document.fonts.ready);
 if(javaScriptEnabled)await page.waitForFunction(()=>!document.querySelector('.application-submit').disabled);
 return {context,page,requests,errors,calls,unexpected,setReply(fn){reply=fn;}};
}
async function fill(page,overrides={}){const values={...fixture,...overrides};for(const name of ['officeName','city','notaryName','email','phone','message'])await page.locator(`[name="${name}"]`).fill(values[name]);await page.locator('[name=acceptTerms]').setChecked(values.acceptTerms);return values;}
async function submit(page){await page.locator('.application-submit').click();}
async function feedback(page){await page.locator('#application-errors').waitFor({state:'visible'});}
async function axe(page){const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();assert.deepEqual(result.violations,[]);return result.violations;}
async function finish(t,name,extra={}){
 assert.deepEqual(t.errors,[]);assert.deepEqual(t.unexpected,[]);assert.equal((await t.context.cookies()).length,0);assert.equal(await t.page.evaluate(()=>localStorage.length+sessionStorage.length),0);
 assert(await t.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 mockResults.push({name,simulatedPosts:t.calls.length,actualExternalRequests:0,unexpectedExternalRequests:t.unexpected,errors:t.errors,...extra});await t.context.close();
}
const reference={1440:{intro:{top:76,height:287},content:{top:363,height:977},form:{top:427,height:817},next:{top:427,height:471},footer:{top:1340,height:410}},390:{intro:{top:64,height:321},content:{top:385,height:1826},form:{top:449,height:1156},next:{top:1653,height:494},footer:{top:2211,height:923}}};
for(const width of [1440,768,390]){
 const t=await setup(width),{page}=t;
 assert.equal(await page.locator('html').getAttribute('lang'),'el');assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('h1').innerText(),'Αίτηση για το γραφείο σας.');assert.equal(await page.locator('.breadcrumbs a').getAttribute('href'),'/');
 assert.equal(await page.locator('.application-closing').count(),0);assert.equal(await page.locator('.application-link').getAttribute('aria-hidden'),'true');assert(await page.locator('.application-link').evaluate(e=>e.inert&&getComputedStyle(e).visibility==='hidden'&&e.getBoundingClientRect().width>0));
 assert.equal(await page.locator('.application-terms input').isChecked(),false);
 assert.deepEqual(await page.locator('.application-field input,.application-field textarea,.application-terms input').evaluateAll(es=>es.map(e=>[e.name,e.required])),[['officeName',true],['city',true],['notaryName',true],['email',true],['phone',true],['message',false],['acceptTerms',true]]);
 assert.equal(await page.locator('[name=website]').getAttribute('tabindex'),'-1');assert(await page.locator('[name=website]').evaluate(e=>!e.getClientRects().length&&e.closest('[aria-hidden=true]')));
 for(const name of ['officeName','city','notaryName','email','phone','message','acceptTerms'])assert.equal(await page.locator(`[name=${name}]`).evaluate(e=>e.labels.length),1);
 assert.equal(await page.locator('.application-terms a').getAttribute('href'),'https://app.aspect-praxis.com/oroi');assert.equal(await page.locator('.application-privacy a').getAttribute('href'),'https://app.aspect-praxis.com/aporrito');
 const labels=await page.locator('.application-field label').allTextContents();assert.deepEqual(labels,['Γραφείο','Πόλη','Ονοματεπώνυμο','Email','Τηλέφωνο','Μήνυμα (προαιρετικό)']);
 const texts=await page.locator('main').evaluate(e=>[...e.querySelectorAll('h1,h2,h3,p,label,li')].filter(e=>!e.childElementCount&&e.getClientRects().length).map(e=>e.textContent.trim()));for(const text of texts)assert(norm(source).includes(norm(text)),`Unapproved copy: ${text}`);
 assert.deepEqual(await page.locator('.site-footer a[href^="https://app.aspect-praxis.com"]').evaluateAll(es=>es.map(e=>e.getAttribute('href'))),['https://app.aspect-praxis.com/oroi','https://app.aspect-praxis.com/aporrito','https://app.aspect-praxis.com/cookies','https://app.aspect-praxis.com/prostasia-dedomenon']);
 assert.equal(t.calls.length,0);assert(t.requests.every(u=>new URL(u).origin===origin));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:`${out}/aitisi-${width}.png`,fullPage:true});
 const sections=await page.locator('.internal-intro,.application-content,.application-form-column,.application-next,.site-footer').evaluateAll(es=>es.map(e=>({class:e.className,top:Math.round(e.getBoundingClientRect().y+scrollY),height:Math.round(e.getBoundingClientRect().height)})));
 if(reference[width])for(const [i,key]of [[0,'intro'],[1,'content'],[2,'form'],[3,'next'],[4,'footer']]){const s=sections[i],ref=reference[width][key];Object.assign(s,{reference:ref,deltaTop:s.top-ref.top,deltaHeight:s.height-ref.height});}
 const office=await page.locator('[name=officeName]').boundingBox(),city=await page.locator('[name=city]').boundingBox(),next=await page.locator('.application-next').boundingBox(),form=await page.locator('#office-application').boundingBox();
 if(width===390){assert(city.y>office.y);assert(next.y>form.y+form.height);assert((await page.locator('.application-submit').boundingBox()).width>=350);assert((await page.locator('label.application-terms').boundingBox()).height>=44);}else{assert.equal(city.y,office.y);assert(next.x>form.x+form.width);}
 await page.keyboard.press('Tab');await page.locator('[name=officeName]').focus();assert(await page.locator('[name=officeName]').evaluate(e=>getComputedStyle(e).outlineStyle==='solid'));
 for(const name of ['city','notaryName','email','phone','message','acceptTerms']){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.name),name);}
 await page.keyboard.press('Space');assert(await page.locator('[name=acceptTerms]').isChecked());await page.keyboard.press('Space');assert(!(await page.locator('[name=acceptTerms]').isChecked()));
 await page.evaluate(()=>scrollTo(0,1000));assert.equal(Math.round((await page.locator('.site-header').boundingBox()).y),0);await page.evaluate(()=>scrollTo(0,0));
 if(width<1000){const toggle=page.locator('.menu-toggle'),menu=page.locator('#mobile-navigation');await toggle.focus();await page.keyboard.press('Enter');assert(await menu.isVisible());assert.equal(await toggle.getAttribute('aria-expanded'),'true');await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement.closest('#mobile-navigation')!==null));await axe(page);await page.keyboard.press('Escape');assert(await toggle.evaluate(e=>e===document.activeElement));assert(await menu.isHidden());assert.equal(await toggle.getAttribute('aria-expanded'),'false');await page.keyboard.press('Space');assert(await menu.isVisible());await toggle.click();if(width===390)await toggle.tap();else await toggle.click();await page.keyboard.press('Escape');assert(await menu.locator('a').evaluateAll(es=>es.every(e=>!e.getClientRects().length)));}
 const mail=page.locator('.application-contact a');await mail.scrollIntoViewIfNeeded();assert(await mail.evaluate(e=>{const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return [-21,21].every(offset=>document.elementFromPoint(x,y+offset)?.closest('a')===e);}),'Contact email has a 44px pointer target');await page.evaluate(()=>scrollTo(0,0));
 const violations=await axe(page);
 browserResults.push({width,sections,requests:t.requests,externalRequests:[],cookies:[],errors:t.errors,violations});
 await finish(t,`initial-${width}`);
 if(width!==768){const ref=`design/eikones/aitisi__${width}.png`,cur=`${out}/aitisi-${width}.png`;const a=await sharp(ref).metadata(),b=await sharp(cur).metadata();await sharp({create:{width:width*2,height:Math.max(a.height,b.height),channels:3,background:'white'}}).composite([{input:ref,left:0,top:0},{input:cur,left:width,top:0}]).png().toFile(`${out}/comparison-aitisi-${width}.png`);}
}
// Accessible field errors and confirmed success are checked at both design widths.
for(const width of [1440,390]){
 const t=await setup(width),{page}=t;
 await fill(page,{email:'maria@',acceptTerms:false});await submit(page);await feedback(page);
 assert.equal(t.calls.length,0);assert.equal(await page.locator('[data-summary-title]').innerText(),'Η αίτηση δεν στάλθηκε. Διορθώστε 2 σημεία:');
 assert.deepEqual(await page.locator('[data-error-links] a').allTextContents(),['Email','Αποδοχή Όρων χρήσης']);assert(await page.locator('#application-errors').evaluate(e=>e===document.activeElement));
 for(const name of ['email','acceptTerms']){const e=page.locator(`[name=${name}]`);assert.equal(await e.getAttribute('aria-invalid'),'true');assert((await e.getAttribute('aria-describedby')).includes(`application-${name}-error`));}
 assert.equal(await page.locator('#application-email-error').innerText(),'Γράψτε ολόκληρο το email, π.χ. onoma@domain.gr.');
 await axe(page);await page.screenshot({path:`${out}/validation-errors-${width}.png`,fullPage:true});
 await page.locator('[data-error-links] a').first().click();assert.equal(await page.evaluate(()=>document.activeElement.name),'email');assert((await page.locator('[name=email]').boundingBox()).y>(await page.locator('.site-header').boundingBox()).height);
 await fill(page);await submit(page);await page.locator('#application-success').waitFor({state:'visible'});
 assert.equal(norm(await page.locator('#application-success').innerText()),successText);assert.equal(await page.locator('#application-success a').getAttribute('href'),'mailto:info@aspect-praxis.com');assert(await page.locator('#application-success').evaluate(e=>e===document.activeElement));assert(await page.locator('#office-application').isHidden());
 assert.equal(await page.locator('[name=officeName]').inputValue(),'');assert(!(await page.locator('[name=acceptTerms]').isChecked()));assert.equal(t.calls.length,1);assert.deepEqual(t.calls[0].payload,fixture);assert.equal(t.calls[0].method,'POST');assert.equal(t.calls[0].contentType,'application/json');
 await axe(page);await page.screenshot({path:`${out}/success-${width}.png`,fullPage:true});
 await finish(t,`errors-then-success-${width}`,{jsonKeys:Object.keys(t.calls[0].payload),bytes:t.calls[0].bytes,axeViolations:0});
}
const responses=[
 ['400-Greek',400,{error:'Ελέγξτε τα στοιχεία της αίτησης.'},'Ελέγξτε τα στοιχεία της αίτησης.'],
 ['400-safe-text',400,{error:'Ελέγξτε <img src=x onerror="alert(1)"> τα στοιχεία.'},'Ελέγξτε <img src=x onerror="alert(1)"> τα στοιχεία.'],
 ['400-terms',400,{error:'Η έκδοση των Όρων χρήσης άλλαξε.'},'Ανανεώστε τη σελίδα'],
 ['403',403,{},sendingFailure],['413',413,{},tooLargeMessage],
 ['429',429,{},'Πολλές αιτήσεις· δοκιμάστε ξανά σε λίγο ή γράψτε στο info@aspect-praxis.com'],
 ['network',null,null,sendingFailure],['200-invalid-json',200,'<html>Σφάλμα</html>',sendingFailure],
 ['200-not-confirmed',200,{ok:false},sendingFailure],['200-wrong-type',200,{ok:'true'},sendingFailure],
 ['200-empty',200,{},sendingFailure],['400-invalid-json',400,'<html>Σφάλμα</html>',sendingFailure],
 ['400-wrong-error',400,{error:17},sendingFailure],['500',500,{},sendingFailure],['201',201,{ok:true},sendingFailure],['204',204,'',sendingFailure],['redirect',302,{},sendingFailure]
];
for(const [name,code,body,expected]of responses){
 const t=await setup(),{page}=t;
 t.setReply(route=>code===null?route.abort('failed'):route.fulfill({status:code,headers:{'content-type':'application/json','access-control-allow-origin':origin,...(code===302?{location:'https://example.invalid/unwanted'}:{})},body:typeof body==='string'?body:JSON.stringify(body)}));
 await fill(page);await submit(page);await feedback(page);assert((await page.locator('[data-server-error]').innerText()).includes(expected));assert(await page.locator('#application-success').isHidden());assert.equal(await page.locator('[name=officeName]').inputValue(),fixture.officeName);assert.equal(await page.locator('[name=email]').inputValue(),fixture.email);assert.equal(await page.locator('[name=message]').inputValue(),fixture.message);assert.equal(t.calls.length,1);
 if(name==='400-safe-text')assert.equal(await page.locator('[data-server-error] img').count(),0);
 if(name==='400-terms'){assert(!(await page.locator('[name=acceptTerms]').isChecked()));assert(await page.locator('.application-submit').isDisabled());await page.evaluate(()=>document.querySelector('form').requestSubmit());assert.equal(t.calls.length,1);}
 else assert(await page.locator('.application-submit').isEnabled());
 if(name==='403'){await axe(page);await page.screenshot({path:`${out}/server-error-390.png`,fullPage:true});}
 if(name==='429'){t.setReply(route=>route.fulfill({status:200,headers:{'content-type':'application/json','access-control-allow-origin':origin},body:'{"ok":true}'}));await submit(page);await page.locator('#application-success').waitFor({state:'visible'});assert.equal(t.calls.length,2);}
 await finish(t,name,{responseStatus:code,onlyMockNetworkFailure:code===null});
}
// Empty UI-required fields, optional message, name/phone boundaries and honeypot.
const invalid=[['empty',null,6],['office-short',{officeName:'Α'},1],['office-long',{officeName:'Α'.repeat(201)},1],['notary-short',{notaryName:'Α'},1],['notary-long',{notaryName:'Α'.repeat(201)},1],['city-empty',{city:''},1],['phone-empty',{phone:''},1],['phone-characters',{phone:'123abc'},1],['phone-short',{phone:'1234'},1],['phone-long',{phone:'1'.repeat(41)},1],['email-invalid',{email:'a,b@example.test'},1],['terms-unchecked',{acceptTerms:false},1]];
for(const [name,overrides,count]of invalid){const t=await setup();if(overrides)await fill(t.page,overrides);await submit(t.page);await feedback(t.page);assert.equal(t.calls.length,0);assert.equal(await t.page.locator('[aria-invalid=true]').count(),count);if(name==='empty')await axe(t.page);await finish(t,name,{fieldErrors:count});}
for(const [name,overrides]of [['minimum',{officeName:'ΑΒ',notaryName:'ΑΒ',phone:'12345',message:''}],['maximum',{officeName:'Α'.repeat(200),notaryName:'Β'.repeat(200),phone:'1'.repeat(40)}],['phone-symbols',{phone:'+30 (000) 00.00/00-00'}]]){const t=await setup();await fill(t.page,overrides);await submit(t.page);await t.page.locator('#application-success').waitFor({state:'visible'});assert.equal(t.calls.length,1);await finish(t,name);}
{
 const t=await setup();await fill(t.page);await t.page.locator('[name=website]').evaluate(e=>{e.value='robot';});await submit(t.page);await feedback(t.page);assert.equal(t.calls.length,0);assert.equal(await t.page.locator('[data-server-error]').innerText(),sendingFailure);await finish(t,'honeypot-no-PII-request');
}
function sizedFixture(bytes){const blank={...fixture,message:''};const base=applicationBody(blank).bytes,remaining=bytes-base;return {...blank,message:'α'.repeat(Math.floor(remaining/2))+(remaining%2?'a':'')};}
for(const bytes of [MAX_PAYLOAD_BYTES,MAX_PAYLOAD_BYTES+1]){
 const values=sizedFixture(bytes);assert.equal(applicationBody(values).bytes,bytes);assert(applicationBody(values).body.length<bytes);
 const t=await setup();await fill(t.page,values);await submit(t.page);
 if(bytes<=MAX_PAYLOAD_BYTES){await t.page.locator('#application-success').waitFor({state:'visible'});assert.equal(t.calls[0].bytes,bytes);}else{await feedback(t.page);assert.equal(t.calls.length,0);assert.equal(await t.page.locator('[data-server-error]').innerText(),tooLargeMessage);}
 await finish(t,`UTF8-${bytes}-bytes`,{bodyBytes:bytes});
}
{
 const t=await setup();await fill(t.page,{city:'α'.repeat(9000),message:''});await submit(t.page);await feedback(t.page);assert.equal(t.calls.length,0);assert.equal(await t.page.locator('[data-server-error]').innerText(),tooLargeMessage);await finish(t,'UTF8-oversize-city');
}
{
 const t=await setup();let release;const held=new Promise(resolve=>{release=resolve;});t.setReply(async route=>{await held;await route.fulfill({status:200,headers:{'content-type':'application/json','access-control-allow-origin':origin},body:'{"ok":true}'});});
 await fill(t.page);await t.page.evaluate(()=>{document.querySelector('form').requestSubmit();document.querySelector('form').requestSubmit();});await t.page.waitForFunction(()=>document.querySelector('form').getAttribute('aria-busy')==='true');
 await t.page.waitForResponse(()=>false,{timeout:100}).catch(()=>{});assert.equal(t.calls.length,1);assert(await t.page.locator('.application-submit').isDisabled());assert(await t.page.locator('#application-success').isHidden());assert.equal(await t.page.locator('.application-status').innerText(),'Η αίτησή σας αποστέλλεται…');await axe(t.page);
 release();await t.page.locator('#application-success').waitFor({state:'visible'});assert.equal(t.calls.length,1);await t.page.evaluate(()=>document.querySelector('form').requestSubmit());assert.equal(t.calls.length,1);await finish(t,'duplicate-submit-one-pending-and-after-success');
}
{
 const t=await setup(1440);await fill(t.page);t.setReply(route=>route.fulfill({status:500,headers:{'access-control-allow-origin':origin},body:'Σφάλμα'}));await submit(t.page);await feedback(t.page);await axe(t.page);await t.page.screenshot({path:`${out}/server-error-1440.png`,fullPage:true});await finish(t,'server-error-1440');
}
{
 const t=await setup(390,false);assert(await t.page.locator('.application-submit').isDisabled());assert.equal(t.calls.length,0);assert(await t.page.locator('noscript p').isVisible());await fill(t.page);await t.page.locator('[name=officeName]').press('Enter');assert.equal(t.calls.length,0);await finish(t,'no-JavaScript-no-native-POST');
}
{
 const t=await setup();await t.page.clock.install();let release;const held=new Promise(resolve=>{release=resolve;});t.setReply(async route=>{await held;await route.abort('aborted').catch(()=>{});});
 await fill(t.page);const sent=t.page.waitForRequest(APPLICATION_ENDPOINT);await submit(t.page);await sent;await t.page.clock.fastForward(20_001);await feedback(t.page);assert.equal(await t.page.locator('[data-server-error]').innerText(),sendingFailure);assert(await t.page.locator('.application-submit').isEnabled());assert(await t.page.locator('#application-success').isHidden());release();await finish(t,'request-timeout-recoverable');
}
{
 const t=await setup();await fill(t.page,{officeName:'  '+fixture.officeName+'  ',notaryName:'  '+fixture.notaryName+'  ',city:' '+fixture.city+' ',email:' '+fixture.email+' ',phone:' '+fixture.phone+' ',message:' '+fixture.message+' '});await submit(t.page);await t.page.locator('#application-success').waitFor({state:'visible'});assert.deepEqual(t.calls[0].payload,fixture);await finish(t,'trimmed-JSON-exact-types-no-termsVersion');
}
// Native TypeScript validation tests require no extra dependency on Node 24.
assert.equal(validateApplication(fixture).length,0);assert.equal(validateApplication({...fixture,acceptTerms:'true'}).length,1);assert(termsHaveChanged('Οι ΟΡΟΙ ΧΡΗΣΗΣ άλλαξαν'));assert(termsHaveChanged('Άλλαξε η έκδοση των όρων.'));assert(!termsHaveChanged('Ελέγξτε τα στοιχεία της φόρμας.'));assert(!termsHaveChanged('Τα φορολογικά στοιχεία άλλαξαν.'));assert(termsHaveChanged('Οι Όροι χρήσης ενημερώθηκαν.'));assert(termsHaveChanged('Οι Όροι χρήσης τροποποιήθηκαν.'));
for(const forbidden of ['design','artifacts'])assert(!(await readdir('dist')).includes(forbidden));
await browser.close();await writeFile(`${out}/results.json`,JSON.stringify(browserResults,null,2)+'\n');await writeFile(`${out}/mock-api-results.json`,JSON.stringify({endpoint:APPLICATION_ENDPOINT,allRequestsIntercepted:true,actualExternalRequests:0,fixture:'Exclusively fictional; no request bodies saved in artifacts.',cases:mockResults},null,2)+'\n');
console.log(`PASS: application at 1440/768/390, axe 0, ${mockResults.length} mocked/validation cases, no real external requests.`);
