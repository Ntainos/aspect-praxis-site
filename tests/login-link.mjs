import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { APP_URL } from '../src/config/site.ts';
import { assertPricingVisual } from './pricing-visual.mjs';

const origin = 'http://127.0.0.1:4321';
const out = 'artifacts/login-link';
const pages = ['index', 'pos-leitourgei', 'eidi', 'dedomena', 'times', 'aitisi'];
const results = [], visual = [], responsive = [];
assert.equal(APP_URL, 'https://app.aspect-praxis.com');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
try {
  for (const name of pages) for (const width of [360, 390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width < 1000 });
    const external = [], activations = [], errors = [];
    let allowMockLogin = false;
    await context.route('**/*', route => {
      const request = route.request();
      if (new URL(request.url()).origin === origin) return route.continue();
      if (allowMockLogin && request.isNavigationRequest() && request.url() === new URL(APP_URL).href) {
        activations.push({ url: request.url(), method: request.method(), mocked: true });
        return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html lang="el"><title>Δοκιμή</title></html>' });
      }
      external.push(request.url());
      return route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    const url = origin + (name === 'index' ? '/' : '/' + name);
    assert.equal((await page.goto(url)).status(), 200);
    await page.evaluate(() => document.fonts.ready);
    const header = page.locator('.site-header');
    const login = header.getByRole('link', { name: 'Σύνδεση', exact: true });
    assert.equal(await login.count(), 1);
    assert(await login.isVisible());
    assert.equal(await login.getAttribute('href'), APP_URL);
    assert(await login.evaluate(e => e.classList.contains('secondary')));
    assert.equal(await page.locator('html').getAttribute('lang'), 'el');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const targets = [];
    for (const control of await header.locator('.brand,.button:visible,.menu-toggle:visible').all()) {
      const box = await control.boundingBox();
      assert(box.width >= 44 && box.height >= 44);
      assert(box.x >= 0 && box.x + box.width <= width);
      assert(await control.evaluate(e => {
        const r = e.getBoundingClientRect();
        return e.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      }));
      targets.push({ label: (await control.innerText()).trim(), ...box });
    }
    const current = await page.screenshot({ path: `${out}/${name}-${width}.png`, fullPage: true });
    if (name === 'index') await page.screenshot({ path: `${out}/header-${width}.png` });
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    assert.deepEqual(axe.violations, []);
    if (name === 'times') {
      visual.push({ name, ...await assertPricingVisual(page, current, width) });
    } else if (width !== 360) {
      // Immutable Step 6 reference: never replace it with the updated screenshots.
      const baseline = execFileSync('git', ['show', `7efa4f5:artifacts/step-6/${name}-${width}.png`], { maxBuffer: 20 * 1024 * 1024 });
      const a = await sharp(baseline).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const b = await sharp(current).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      assert.deepEqual(a.info, b.info);
      const headerHeight = width === 1440 ? 77 : 65;
      assert.equal((await header.boundingBox()).height, headerHeight);
      let headerPixels = 0, bodyPixels = 0;
      for (let i = 0; i < a.data.length; i += 4) if (!a.data.subarray(i, i + 4).equals(b.data.subarray(i, i + 4))) {
        if (i < width * headerHeight * 4) headerPixels++; else bodyPixels++;
      }
      assert(headerPixels > 0); assert.equal(bodyPixels, 0, `${name} ${width}: change outside header`);
      visual.push({ name, width, baseline: '7efa4f5:artifacts/step-6', headerHeight, headerPixels, bodyPixels });
      if (name === 'index') {
        const crop = async input => sharp(input).extract({ left: 0, top: 0, width, height: headerHeight }).toBuffer();
        await sharp({ create: { width, height: headerHeight * 2, channels: 3, background: 'white' } })
          .composite([{ input: await crop(baseline), top: 0, left: 0 }, { input: await crop(current), top: headerHeight, left: 0 }])
          .png().toFile(`${out}/header-comparison-${width}.png`);
      }
    }
    let menuViolations = [];
    if (width < 1000) {
      const toggle = page.locator('.menu-toggle'), menu = page.locator('#mobile-navigation');
      assert(await menu.isHidden()); assert(await page.locator('.application-link').isHidden());
      await toggle.focus(); await page.keyboard.press('Enter');
      assert(await menu.isVisible()); assert(await login.isVisible());
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      for (const control of [toggle, ...await menu.locator('a').all()]) {
        const box = await control.boundingBox(); assert(box.height >= 44 && box.width >= 44);
        assert(box.x >= 0 && box.x + box.width <= width);
      }
      assert.equal(await menu.getByRole('link', { name: 'Κάντε αίτηση' }).getAttribute('href'), '/aitisi');
      await page.keyboard.press('Tab'); assert(await page.evaluate(() => !!document.activeElement.closest('#mobile-navigation')));
      menuViolations = (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations;
      assert.deepEqual(menuViolations, []);
      if (name === 'index') await page.screenshot({ path: `${out}/menu-${width}.png` });
      await page.keyboard.press('Escape'); assert(await menu.isHidden()); assert(await toggle.evaluate(e => e === document.activeElement));
      await toggle.tap(); assert(await menu.isVisible());
      await menu.getByRole('link', { name: 'Τιμές', exact: true }).click();
      await page.waitForURL(origin + '/times'); assert(await page.locator('#mobile-navigation').isHidden());
      await page.goto(url); await page.evaluate(() => document.fonts.ready);
    }
    // Reach the link through the real tab order, then activate it against a local mock.
    let reached = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      if (await login.evaluate(e => e === document.activeElement)) { reached = true; break; }
    }
    assert(reached, `${name} ${width}: login is in keyboard tab order`);
    assert(await login.evaluate(e => {
      const s = getComputedStyle(e);
      return s.outlineStyle === 'solid' && parseFloat(s.outlineWidth) >= 3 && parseFloat(s.outlineOffset) >= 3;
    }));
    if (name === 'index') await page.screenshot({ path: `${out}/focus-${width}.png` });
    assert.equal((await context.cookies()).length, 0);
    assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
    allowMockLogin = true;
    await page.keyboard.press('Enter'); await page.waitForURL(new URL(APP_URL).href);
    await page.goto(url);
    if (width < 1000) await login.tap(); else await login.click();
    await page.waitForURL(new URL(APP_URL).href);
    assert.equal(activations.length, 2);
    assert(activations.every(a => a.method === 'GET'));
    assert.deepEqual(external, []); assert.deepEqual(errors, []);
    results.push({ name, width, href: APP_URL, targets, keyboardFocus: true, keyboardActivation: 'mocked', pointerActivation: 'mocked', axeViolations: axe.violations, menuViolations, externalRequests: external, errors, activations });
    await context.close();
  }
  // Check the CSS transition widths too; the link must also work without scripts.
  for (const width of [360, 390, 600, 601, 768, 999, 1000, 1100, 1101, 1199, 1200, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(origin); await page.evaluate(() => document.fonts.ready);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const login = page.locator('.login-link a'); assert(await login.isVisible()); assert.equal(await login.getAttribute('href'), APP_URL);
    const boxes = await page.locator('.site-header .brand,.desktop-nav a:visible,.login-link a,.application-link a:visible,.menu-toggle:visible').evaluateAll(es => es.map(e => {
      const r = e.getBoundingClientRect(); return { x: r.x, right: r.right, width: r.width, height: r.height };
    }));
    for (const [i, box] of boxes.entries()) {
      assert(box.width > 0 && box.height >= 44 && box.x >= 0 && box.right <= width);
      if (i) assert(boxes[i - 1].right <= box.x);
    }
    responsive.push({ width, noJavaScriptLoginVisible: true, overflow: false, overlappingTargets: false });
    await context.close();
  }
  await writeFile(`${out}/results.json`, JSON.stringify({ results, visual, responsive }, null, 2));
  console.log('PASS: six pages × 360/390/1440; keyboard and pointer activation mocked; axe 0; mobile menus; 10 Step 6 comparisons identical below header; pricing changes confined to packages/notes and section translation; 12 responsive/no-JavaScript checks.');
} finally { await browser.close(); }
