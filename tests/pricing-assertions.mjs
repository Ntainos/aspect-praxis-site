import assert from 'node:assert/strict';
import { pricingPackages, pricingTerms, popularPackageLabel, formatAmount, formatMoney, formatUsers } from '../src/data/pricing.ts';
import { APP_URL } from '../src/config/site.ts';

export const normalize = value => value.replace(/\s+/g, ' ').trim();
export const approvedPrices = [
  { name: 'Βασικό', net: 99, gross: '122,76 €', actions: 10, perAction: '9,90 €', users: '1', extra: 12, features: 'Όχι', popular: false },
  { name: 'Επαγγελματικό', net: 189, gross: '234,36 €', actions: 25, perAction: '7,56 €', users: 'Έως 3', extra: 9, features: 'Ναι', popular: true },
  { name: 'Προνομιακό', net: 590, gross: '731,60 €', actions: 90, perAction: '6,56 €', users: 'Απεριόριστοι', extra: 7, features: 'Ναι', popular: false },
];
export function assertPricingData() {
  assert.deepEqual(pricingTerms, { vatPercent: 24, subscriptionMonths: 12, annualPrepaymentMonths: 12, annualPaidMonths: 10, includedRevisions: 5 });
  assert.equal(popularPackageLabel, 'Η πιο συχνή επιλογή');
  assert.equal(pricingPackages.length, approvedPrices.length);
  for (const [index, plan] of pricingPackages.entries()) {
    const expected = approvedPrices[index];
    assert.equal(plan.name, expected.name); assert.equal(plan.monthlyNet, expected.net);
    assert.equal(plan.actionsPerMonth, expected.actions); assert.equal(plan.extraActionNet, expected.extra);
    assert.equal(formatMoney(plan.monthlyGross), expected.gross);
    assert.equal(formatMoney(plan.costPerAction), expected.perAction);
    assert.equal(formatUsers(plan.concurrentUsers), expected.users);
    assert.equal(plan.concurrentUsers, [1, 3, null][index]);
    assert.equal(plan.newFeaturesInDevelopment ? 'Ναι' : 'Όχι', expected.features);
    assert.equal(plan.popular, expected.popular);
  }
}
export async function assertPricingPage(page) {
  assertPricingData();
  const cards = page.locator('.package-card');
  assert.equal(await cards.count(), pricingPackages.length);
  assert.equal(await page.locator('.package-card:visible').count(), pricingPackages.length);
  const rendered = [];
  for (const [index, plan] of pricingPackages.entries()) {
    const card = cards.nth(index);
    assert.equal(await card.locator('h2').innerText(), plan.name);
    assert.equal(normalize(await card.locator('.package-price').innerText()), `${formatAmount(plan.monthlyNet)} / μήνα χωρίς ΦΠΑ`);
    assert.equal(await card.locator('.package-vat').innerText(), `${formatMoney(plan.monthlyGross)} με ΦΠΑ ${pricingTerms.vatPercent}%`);
    assert(await card.locator('.package-vat').evaluate(e => e.previousElementSibling.classList.contains('package-price')));
    const labels = ['Πράξεις τον μήνα', 'Κόστος ανά πράξη', 'Ταυτόχρονοι χρήστες', 'Επιπλέον πράξη, χωρίς ΦΠΑ', 'Νέες λειτουργίες σε ανάπτυξη'];
    const values = [String(plan.actionsPerMonth), formatMoney(plan.costPerAction), formatUsers(plan.concurrentUsers), formatAmount(plan.extraActionNet), plan.newFeaturesInDevelopment ? 'Ναι' : 'Όχι'];
    assert.deepEqual(await card.locator('dt').allTextContents(), labels);
    assert.deepEqual(await card.locator('dd').allTextContents(), values);
    assert.equal(await card.locator('.package-badge').count(), plan.popular ? 1 : 0);
    assert.equal(await card.evaluate(e => e.classList.contains('package-card-popular')), plan.popular);
    if (plan.popular) assert.equal(await card.locator('.package-badge').innerText(), popularPackageLabel);
    rendered.push({ name: plan.name, price: await card.locator('.package-price').innerText(), vat: await card.locator('.package-vat').innerText(), labels, values });
  }
  assert.deepEqual((await page.locator('.package-note').allTextContents()).map(normalize), [
    `Συνδρομή ${pricingTerms.subscriptionMonths} μηνών με σταθερή τιμή για όλο το διάστημα. Λεπτομέρειες στους Όρους.`,
    `Ετήσια προπληρωμή: ${pricingTerms.annualPrepaymentMonths} μήνες στην τιμή των ${pricingTerms.annualPaidMonths} — ρωτήστε μας.`,
  ]);
  assert.equal(await page.locator('.package-note a').getAttribute('href'), `${APP_URL}/oroi`);
  assert.equal(await page.locator('.package-note a').innerText(), 'Όρους');
  const newText = (await page.locator('.package-grid,.package-notes').allInnerTexts()).join(' ');
  assert(!/[a-z]/i.test(newText)); assert(!/έκπτωση|ιδρυτικά|\[●\]/i.test(newText));
  assert.equal(await page.locator('.package-benefit').nth(1).locator('p').innerText(), `Έως ${pricingTerms.includedRevisions} νέα σχέδια της ίδιας πράξης.`);
  return rendered;
}
