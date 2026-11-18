import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { assertPricingData, assertPricingPage, approvedPrices } from './pricing-assertions.mjs';
import { assertPricingVisual } from './pricing-visual.mjs';
import { APP_URL } from '../src/config/site.ts';

const out = 'artifacts/pricing-packages', origin = 'http://127.0.0.1:4321';
await mkdir(out, { recursive: true });
assertPricingData();
for (const file of ['src/pages/times.astro', 'src/components/pricing/PackageCard.astro']) {
  const source = await readFile(file, 'utf8');
  assert(!/\b\d+(?:[.,]\d+)?\b/.test(source), `${file}: hardcoded commercial number`);
  for (const plan of approvedPrices) assert(!source.includes(plan.name), `${file}: hardcoded package name`);
  assert(!source.includes('SIGNUP_IN_APP'));
}
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
const pricing = [], unchangedPages = [], responsive = [];
try {
  for (const width of [360, 390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width < 1000 });
    const unexpected = [], termsRequests = [], errors = [];
    let mockTerms = false;
    await context.route('**/*', route => {
      const request = route.request();
      if (new URL(request.url()).origin === origin) return route.continue();
      if (mockTerms && request.isNavigationRequest() && request.url() === `${APP_URL}/oroi`) {
        termsRequests.push({ url: request.url(), method: request.method(), mocked: true });
        return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html lang="el"><title>Δοκιμή</title></html>' });
      }
      unexpected.push(request.url()); return route.abort();
    });
    const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
    assert.equal((await page.goto(`${origin}/times`)).status(), 200);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('html').getAttribute('lang'), 'el');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const rendered = await assertPricingPage(page);
    const boxes = await page.locator('.package-card').evaluateAll(es => es.map(e => {
      const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, height: r.height };
    }));
    for (const [i, box] of boxes.entries()) {
      assert(box.x >= 0 && box.right <= width);
      if (i && width < 1000) { assert(box.y > boxes[i - 1].bottom); assert.equal(box.x, boxes[0].x); }
      if (i && width === 1440) { assert.equal(box.y, boxes[0].y); assert(box.x > boxes[i - 1].right); }
    }
    const screenshot = await page.screenshot({ path: `${out}/times-${width}.png`, fullPage: true });
    const visual = await assertPricingVisual(page, screenshot, width);
    const before = execFileSync('git', ['show', `9d46764:artifacts/login-link/times-${width}.png`], { maxBuffer: 20 * 1024 * 1024 });
    const oldMeta = await sharp(before).metadata(), newMeta = await sharp(screenshot).metadata();
    await sharp({ create: { width: width * 2, height: Math.max(oldMeta.height, newMeta.height), channels: 3, background: 'white' } })
      .composite([{ input: before, top: 0, left: 0 }, { input: screenshot, top: 0, left: width }]).png().toFile(`${out}/comparison-times-${width}.png`);
    const violations = (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations;
    assert.deepEqual(violations, []);
    const links = await page.locator('a[href^="/"]').evaluateAll(es => [...new Set(es.map(e => e.getAttribute('href')))]);
    for (const href of links) assert.equal((await context.request.get(origin + href)).status(), 200, href);
    const terms = page.locator('.package-note a');
    for (let i = 0; i < 40 && !await terms.evaluate(e => e === document.activeElement); i++) await page.keyboard.press('Tab');
    assert(await terms.evaluate(e => e === document.activeElement));
    assert(await terms.evaluate(e => { const s = getComputedStyle(e); return s.outlineStyle === 'solid' && parseFloat(s.outlineWidth) >= 3; }));
    const target = await terms.boundingBox(); assert(target.width >= 44 && target.height >= 44);
    await page.screenshot({ path: `${out}/terms-focus-${width}.png` });
    assert.equal((await context.cookies()).length, 0); assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
    mockTerms = true; await page.keyboard.press('Enter'); await page.waitForURL(`${APP_URL}/oroi`);
    assert.deepEqual(termsRequests, [{ url: `${APP_URL}/oroi`, method: 'GET', mocked: true }]);
    assert.deepEqual(unexpected, []); assert.deepEqual(errors, []);
    pricing.push({ width, rendered, boxes, visual, axeViolations: violations, internalLinks: links, termsRequests, keyboardFocus: true, touchTarget: target, externalRequests: unexpected, errors });
    await context.close();

    for (const name of ['index', 'pos-leitourgei', 'eidi', 'dedomena', 'aitisi']) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await context.route('**/*', route => { assert.equal(new URL(route.request().url()).origin, origin); return route.continue(); });
      const page = await context.newPage(); await page.goto(origin + (name === 'index' ? '/' : '/' + name)); await page.evaluate(() => document.fonts.ready);
      const current = await page.screenshot({ path: `${out}/${name}-${width}.png`, fullPage: true });
      const before = execFileSync('git', ['show', `9d46764:artifacts/login-link/${name}-${width}.png`], { maxBuffer: 20 * 1024 * 1024 });
      const a = await sharp(before).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const b = await sharp(current).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      assert.deepEqual(a.info, b.info); assert(a.data.equals(b.data), `${name} ${width}: visual change`);
      unchangedPages.push({ name, width, differentPixels: 0 }); await context.close();
    }
  }
  for (const width of [360, 390, 700, 701, 768, 999, 1000, 1100, 1101, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled: false });
    const page = await context.newPage(); await page.goto(`${origin}/times`); await page.evaluate(() => document.fonts.ready);
    await assertPricingPage(page); assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert(await page.locator('.package-card *').evaluateAll(es => es.every(e => e.scrollWidth <= e.clientWidth || e.clientWidth === 0)));
    responsive.push({ width, allPackagesVisible: true, noJavaScript: true, overflow: false }); await context.close();
  }
  await writeFile(`${out}/results.json`, JSON.stringify({ approvedPrices, pricing, unchangedPages, responsive }, null, 2));
  console.log('PASS: approved pricing/data, 360/390/1440, all mobile cards, axe 0, keyboard/terms mock, 15 pixel-identical other-page screenshots, unchanged sections translated only, 10 no-JavaScript layouts.');
} finally { await browser.close(); }
