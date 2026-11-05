import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const origin='http://127.0.0.1:4321',out='artifacts/prelaunch/publication-draft';
const expected=JSON.parse(await readFile('tests/fixtures/publication-metadata.json','utf8'));
assert.equal(expected.length,6);assert.equal(new Set(expected.map(x=>x.path)).size,6);
const header=await readFile('public/_headers','utf8');
assert.equal(await readFile('dist/_headers','utf8'),header);
assert.equal(header,execFileSync('git',['show','3b6155a:public/_headers'],{encoding:'utf8'}));
assert(header.includes('X-Robots-Tag: noindex, nofollow'));
for(const path of ['robots.txt','sitemap.xml','odigos'])assert(!(await readdir('dist')).includes(path));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const results=[];
try{
 const context=await browser.newContext();await context.route('**/*',route=>{assert.equal(new URL(route.request().url()).origin,origin);return route.continue();});
 const page=await context.newPage();
 for(const row of expected){
  const response=await page.goto(origin+row.path);assert.equal(response.status(),200);
  assert.equal(response.headers()['x-robots-tag'],'noindex, nofollow');
  assert.equal(await page.locator('title').count(),1);assert.equal(await page.title(),row.title);
  assert.equal(await page.locator('meta[name=description]').count(),1);assert.equal(await page.locator('meta[name=description]').getAttribute('content'),row.description);
  assert.equal(await page.locator('link[rel=canonical],meta[property^="og:"],script[type="application/ld+json"],meta[name="google-site-verification"]').count(),0);
  assert.equal(await page.locator('h1').count(),1);
  results.push({...row,status:200,descriptionCount:1,noindex:true});
 }
 for(const path of ['/404.html','/unknown-publication-draft','/odigos']){
  const response=await page.goto(origin+path);assert.equal(response.status(),path==='/404.html'?200:404);
  assert.equal(await page.locator('meta[name=description]').count(),0);assert.equal(await page.locator('meta[name=robots]').getAttribute('content'),'noindex, nofollow');
  assert.equal(await page.locator('h1').innerText(),'Η σελίδα δεν βρέθηκε.');assert.equal(await page.locator('main a').getAttribute('href'),'/');
 }
 await writeFile(`${out}/metadata-results.json`,JSON.stringify({pages:results,notFound:true,headersUnchanged:true,inactiveSeoAbsent:true},null,2));
 console.log('PASS: six exact unique metadata pairs, unchanged noindex/CSP, Greek 404, inactive SEO absent.');
}finally{await browser.close();}
