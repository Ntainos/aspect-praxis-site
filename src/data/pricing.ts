export const pricingTerms = {
  vatPercent: 24,
  subscriptionMonths: 12,
  annualPrepaymentMonths: 12,
  annualPaidMonths: 10,
  includedRevisions: 5,
} as const;

export const popularPackageLabel = 'Η πιο συχνή επιλογή';

const packages = [
  { name: 'Βασικό', monthlyNet: 99, actionsPerMonth: 10, concurrentUsers: 1, extraActionNet: 12, newFeaturesInDevelopment: false, popular: false },
  { name: 'Επαγγελματικό', monthlyNet: 189, actionsPerMonth: 25, concurrentUsers: 3, extraActionNet: 9, newFeaturesInDevelopment: true, popular: true },
  { name: 'Προνομιακό', monthlyNet: 590, actionsPerMonth: 90, concurrentUsers: null, extraActionNet: 7, newFeaturesInDevelopment: true, popular: false },
] as const;

// Round integer cents, including the per-action quotient, only at the final step.
export const pricingPackages = packages.map(plan => ({
  ...plan,
  monthlyGross: Math.round(plan.monthlyNet * (100 + pricingTerms.vatPercent)) / 100,
  costPerAction: Math.round(plan.monthlyNet * 100 / plan.actionsPerMonth) / 100,
}));

export type PricingPackage = typeof pricingPackages[number];

const amountFormat = new Intl.NumberFormat('el-GR', { maximumFractionDigits: 2 });
const moneyFormat = new Intl.NumberFormat('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const formatAmount = (amount: number) => `${amountFormat.format(amount)} €`;
export const formatMoney = (amount: number) => `${moneyFormat.format(amount)} €`;
export const formatUsers = (users: number | null) => users === null ? 'Απεριόριστοι' : users === 1 ? String(users) : `Έως ${users}`;
