import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

export const unchangedPricingSections = ['.site-header', '.internal-intro', '.package-benefits', '.pricing-activation', '.application-closing', '.site-footer'];
export async function capturePricingSections(page) {
  return page.evaluate(selectors => selectors.map(selector => {
    const root = document.querySelector(selector), box = root.getBoundingClientRect();
    const properties = ['font-family','font-size','font-weight','font-style','line-height','letter-spacing','text-align','text-decoration','color','background-color','background-image','display','position','border','border-radius','box-shadow','padding','margin','gap','grid-template-columns','align-items','justify-content','opacity','visibility','transform','overflow'];
    return {
      selector, html: root.outerHTML, x: box.x, y: box.y + scrollY, width: box.width, height: box.height,
      elements: [root, ...root.querySelectorAll('*')].map(e => {
        const r = e.getBoundingClientRect(), style = getComputedStyle(e);
        return { tag: e.tagName, x: r.x - box.x, y: r.y - box.y, width: r.width, height: r.height, styles: Object.fromEntries(properties.map(key => [key, style.getPropertyValue(key)])) };
      }),
    };
  }), unchangedPricingSections);
}
export async function assertPricingVisual(page, current, width) {
  const before = JSON.parse(await readFile(new URL('./fixtures/pricing-before.json', import.meta.url), 'utf8'))[width];
  const after = await capturePricingSections(page);
  const shifts = [];
  for (const [index, section] of after.entries()) {
    const reference = before.sections[index];
    assert.equal(section.html, reference.html, `${width} ${section.selector}: content/attributes`);
    for (const key of ['x','width','height']) assert.equal(section[key], reference[key], `${width} ${section.selector}: ${key}`);
    assert.equal(section.elements.length, reference.elements.length);
    for (const [i, element] of section.elements.entries()) {
      const old = reference.elements[i];
      assert.equal(element.tag, old.tag); assert.deepEqual(element.styles, old.styles, `${width} ${section.selector} ${i}: styles`);
      for (const key of ['x','y','width','height']) assert(Math.abs(element[key] - old[key]) <= 1 / 64, `${width} ${section.selector} ${i}: relative ${key}`);
    }
    const shift = section.y - reference.y;
    if (index < 2) assert.equal(shift, 0); else if (shifts.length > 2) assert.equal(shift, shifts[2].shift);
    shifts.push({ selector: section.selector, beforeY: reference.y, afterY: section.y, shift, unchangedContentStylesAndGeometry: true });
  }
  // Exact pixels above the changed cards. The sections below are translated naturally;
  // compare their content, every descendant's geometry and computed styles instead of
  // treating subpixel rasterization from a fractional vertical shift as a design change.
  const baseline = execFileSync('git', ['show', `9d46764:artifacts/login-link/times-${width}.png`], { maxBuffer: 20 * 1024 * 1024 });
  const crop = input => sharp(input).extract({ left: 0, top: 0, width, height: Math.floor(before.gridY) }).ensureAlpha().raw().toBuffer();
  assert.deepEqual(await crop(current), await crop(baseline), `${width}: header/intro pixels`);
  return { width, baseline: '9d46764:artifacts/login-link', unchangedPrefixPixels: true, shifts };
}
