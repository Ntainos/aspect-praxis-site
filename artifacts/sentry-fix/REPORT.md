# Τελική αποκατάσταση αλυσίδας Lighthouse/Sentry

11 Νοεμβρίου 2026 · `security/sentry-dependency-fix` · βάση main **19080ae9bfb8b303d103060cab9039c69a4e50fc**.

## Αποτέλεσμα

**Διορθώθηκαν και οι τέσσερις moderate εγγραφές. Το πλήρες npm audit είναι καθαρό, με 0 ευάλωτες εγγραφές και exit code 0.** Οι δύο ανεξάρτητες GHSA των glob/minimatch και η μεταβατική διάδοσή τους στα δύο Sentry πακέτα δεν αφορούν πλέον καμία εγκατεστημένη έκδοση.

Όλοι οι έλεγχοι πέρασαν: καθαρό npm ci, npm ls, build, υπάρχοντα tests, test:security, axe 0 και Lighthouse **100/100 και στις 12 πραγματικές εκτελέσεις**. Οι 12 οπτικές συγκρίσεις έχουν **0 διαφορετικά pixels**. Επιπλέον, όλα τα αρχεία του dist είναι ίδια byte προς byte με το build πριν την ενημέρωση.

**Προτείνεται review και έγκριση merge της συγκεκριμένης αλλαγής από τον ιδιοκτήτη.** Δεν απαιτείται πρόσθετη διόρθωση για τα καταγεγραμμένα dependency findings. Δεν έγινε merge ή deployment. Η δημοσίευση και το Draft PR #8 παραμένουν χωριστά.

## Βάση και μέθοδος

Διαβάστηκαν AGENTS.md, package-lock.json, η [αρχική αναφορά security/dependency-audit](https://github.com/Ntainos/aspect-praxis-site/blob/security/dependency-audit/artifacts/security-audit/REPORT.md), η [αναφορά Astro](../astro-migration/REPORT.md) και η [αναφορά Sharp](../sharp-upgrade/REPORT.md).

Το καθαρό [npm ci πριν](npm-ci-before.log) και το [audit πριν](audit-before.json) αναπαρήγαγαν @sentry/node 11.10.0, @sentry/bundler-plugins 11.10.0, glob 13.0.6 και minimatch 10.2.6. [Πραγματικές διαδρομές πριν](paths-before.txt), [δέντρο πριν](tree-before.json).

Ελέγχθηκαν ξανά τα σημερινά registry metadata και τα advisories. Το Lighthouse 13.6.0 απαιτεί @sentry/node **^11.8.0**. Η παλιά πρόταση 11.11.0 παραμένει εκτός του επηρεαζόμενου εύρους, αλλά η σημερινή κανονική επίλυση επιλέγει **11.12.0**· η minimatch επιλύεται σε **11.0.7**, όχι στην παλιά πρόταση 11.0.5. Οι προηγούμενες προτάσεις δεν εφαρμόστηκαν τυφλά.

Εκτελέστηκε μόνο:

```sh
npm update @sentry/node @sentry/bundler-plugins --install-strategy=nested
npm ci
npm ls --all
npm audit --json
npm run build
```

Η επιλογή nested διατηρεί την απομόνωση της αλυσίδας από την υπάρχουσα εργαλειοθήκη Astro. Δεν προστέθηκε Sentry ως άμεση εξάρτηση· το **package.json παραμένει byte-identical**. Δεν χρησιμοποιήθηκε audit fix, --force, --legacy-peer-deps, override, καταστολή audit ή αλλαγή npm configuration.

## Ακριβείς μεταβολές εκδόσεων

| Πακέτο | Πριν | Μετά |
| --- | --- | --- |
| @isaacs/nonrecursive-glob-match | Δεν υπήρχε | 1.1.0 |
| @sentry/bundler-plugins | 11.10.0 | 11.12.0 |
| @sentry/conventions | 0.29.0 | 0.32.0 |
| @sentry/core | 11.10.0 | 11.12.0 |
| @sentry/node | 11.10.0 | 11.12.0 |
| @sentry/opentelemetry | 11.10.0 | 11.12.0 |
| @sentry/server-runtime-injection | 11.10.0 | 11.12.0 |
| @sentry/server-utils | 11.10.0 | 11.12.0 |
| glob | 13.0.6 | 14.0.4 |
| has-flag | 4.0.0 | Αφαιρέθηκε |
| minimatch | 10.2.6 | 11.0.7 |
| path-scurry | 2.0.2 | 3.0.0 |
| sentry | 0.45.0 | 0.49.0 |
| supports-color | 8.1.1 | Αφαιρέθηκε |

Οι συνοδευτικές ενημερώσεις Sentry core/conventions/opentelemetry/server-utils/runtime-injection και του CLI sentry απαιτούνται από το νέο @sentry/node/bundler-plugins. Το νέο @isaacs/nonrecursive-glob-match ανήκει στη minimatch 11. Τα supports-color/has-flag αφαιρέθηκαν επειδή δεν απαιτούνται πλέον από αυτή την αλυσίδα.

[Μεταβολές εκδόσεων](version-changes.json) · [Μεταβολές ανά διαδρομή lockfile](dependency-changes.json) · [Δέντρο μετά](tree-after.json) · [Διαδρομές μετά](paths-after.txt).

Η [επαλήθευση scope](scope-verification.json) επιβεβαιώνει ότι όλες οι αλλαγές ανήκουν στην παλιά ή νέα μεταβατική αλυσίδα Sentry. Όλα τα πακέτα εκτός αυτής, καθώς και **ολόκληρες οι αλυσίδες Astro και Sharp**, παραμένουν αμετάβλητα. Το Lighthouse παραμένει **13.6.0**, Astro **7.4.8**, Sharp **0.35.5**. Δεν υπάρχουν invalid/missing/peer dependency conflicts.

Σημερινά metadata: [Sentry node](sentry-node-current.json), [bundler](sentry-bundler-current.json), [glob](glob-candidate.json), [minimatch](minimatch-current.json), [path-scurry](path-scurry-candidate.json), [conventions](conventions-current.json), [CLI sentry](sentry-cli-current.json). Τα αρχεία candidate για 11.11.0/minimatch 11.0.5 διατηρούν τη σύγκριση με την προηγούμενη πρόταση, όχι την τελική εγκατάσταση.

## Audit και GHSA

| Σοβαρότητα | Πριν | Μετά |
| --- | ---: | ---: |
| Critical | 0 | 0 |
| High | 0 | 0 |
| Moderate | **4** | **0** |
| Low / info | 0 | 0 |
| Σύνολο εγγραφών πακέτων | **4** | **0** |

[Audit πριν](audit-before.json) · [Audit μετά](audit-after.json) · [Έλεγχος εγκατεστημένων εκδόσεων ανά advisory](advisory-verification.json).

| Advisory | Επηρεαζόμενο εύρος | Τελική εγκατεστημένη έκδοση |
| --- | --- | --- |
| [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) — Glob AbortSignal cancellation bypass / traversal μετά timeout | >=9.0.0 <=14.0.1, διορθωμένο από 14.0.2 | **glob 14.0.4** |
| [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) — minimatch globparts amplification / DoS | >=7.0.0 <11.0.1, διορθωμένο από 11.0.1 | **minimatch 11.0.7** |

Ελέγχθηκαν όλα τα σχετικά εγκατεστημένα αντίγραφα και τα αντίστοιχα lockfile paths: κανένα δεν εμπίπτει στα παραπάνω ranges. Δεν παραμένουν glob 13.0.6 ή minimatch 10.2.6. Τα δύο Sentry ευρήματα ήταν μεταβατικές εγγραφές, όχι δύο επιπλέον ανεξάρτητα GHSA. Δεν υπάρχει νέο ή εναπομένον εύρημα στο πλήρες audit της 11ης Νοεμβρίου.

## Πλήρεις τελικοί έλεγχοι

Περιβάλλον: Node **24.22.1**, npm **11.9.0**, Linux/Chromium. Η [εγκατάσταση ενημέρωσης](update.log), το [απλό npm ci μετά](npm-ci-after.log) και το [npm ls --all](npm-ls.txt) πέρασαν. Η καθαρή εγκατάσταση αναπαρήγαγε το lockfile χωρίς ειδικά flags ή παράκαμψη scripts/peers.

- [Static build](build.log): PASS, επτά HTML σελίδες μαζί με την 404. Δεν προστέθηκε runtime/server adapter ή browser SDK.
- [Regression αποτελέσματα](regression-results.json), [log](regression.log): npm test, test:home, test:pages, test:data-pricing, test:application, test:audit, comparisons.mjs και application-states.mjs — όλα PASS.
- [test:security](security.log), [αποτελέσματα](security-results.json): 21 περιπτώσεις σελίδας/πλάτους, headers/CSP, 12 pixel comparisons, mock fetch και αποκλεισμός native form submission — PASS. Η σκόπιμη αρνητική δοκιμή form-action προκαλεί μόνο την αναμενόμενη CSP παράβαση, με 0 δικτυακά POST.
- [Lighthouse](lighthouse-summary.json), [log](lighthouse.log): **Accessibility 100 / Best Practices 100** για κάθε μία από τις έξι σελίδες σε desktop και mobile. Εκτελέστηκε πράγματι το CLI του αμετάβλητου Lighthouse 13.6.0 με την ενημερωμένη αλυσίδα Sentry. Δεν αρκέστηκε ο έλεγχος σε εγκατάσταση ή import. Τα 12 πλήρη JSON reports βρίσκονται δίπλα στη σύνοψη, χωρίς runtime errors.
- Axe **0** στα 1440/768/390, στα ανοιχτά μενού και στις δοκιμαζόμενες καταστάσεις φόρμας. Πληκτρολόγιο, Escape, focus, aria-expanded, κρυμμένα μη εστιάσιμα στοιχεία, touch targets >=44 px και απουσία οριζόντιας κύλισης — PASS.
- [Mock API](mock-api-results.json): **46 περιπτώσεις** validation/browser, όλες με αναχαίτιση εξωτερικών αιτήσεων και μηδέν πραγματικά POST. [Καταστάσεις φόρμας](application-states.json): οκτώ screenshots validation errors, pending, server error, success στα 1440/390 με axe 0.
- [Σύνδεσμοι](links.json), [404/routes/favicon/fonts](production-checks.json): PASS. Ίδιοι τέσσερις νομικοί προορισμοί, χωρίς επίσκεψη στους εξωτερικούς προορισμούς. Καμία εξωτερική αίτηση φόρτωσης, cookies ή storage στις browser δοκιμές.

Οι browser σουίτες εκτελέστηκαν **χωρίς αλλαγή τους σε προσωρινό αντίγραφο** των πηγών/tests, με το νέο node_modules και το νέο dist. Ο τοπικός HTTP server εφαρμόζει το πραγματικό dist/_headers. Τα ιστορικά artifacts δεν αντικαταστάθηκαν· τα νέα αποτελέσματα αντιγράφηκαν μόνο εδώ.

## Αμετάβλητη παραγωγική έξοδος και ασφάλεια

Τα [SHA-256 πριν](dist-before.json) και [μετά](dist-after.json) είναι ίδια για **κάθε αρχείο** του dist. Επομένως παραμένουν ίδια τα HTML/ορατά κείμενα/[●], CSS, JavaScript μενού/φόρμας, SVG, fonts και _headers. Δεν εισήχθη Sentry SDK, analytics, tracking ή νέα εξωτερική υπηρεσία στο site.

Τα src/, design/, public/, tests, package.json, README και Astro configuration είναι αμετάβλητα. Διατηρούνται output static, τοπική Geologica, API contract/checkbox, CSP και γενικό noindex/nofollow. Δεν δημοσιεύονται design, artifacts, tests, env ή credentials. Τα προστατευμένα branches και το Draft PR #8 δεν τροποποιήθηκαν.

## Screenshots και αποκλίσεις

**Νέες αποκλίσεις: καμία.** Και οι 12 συγκρίσεις με το Βήμα 6 (commit 7efa4f5) έχουν 0 διαφορετικά pixels. Οι ήδη καταγεγραμμένες αποκλίσεις έναντι design παραμένουν όπως στο [Βήμα 6](../step-6/REPORT.md), χωρίς νέα αλλαγή. Στις συγκρίσεις η αναφορά εμφανίζεται αριστερά και το νέο αποτέλεσμα δεξιά.

| Σελίδα | Screenshot 1440 / 390 | Βήμα 6 1440 / 390 | Design 1440 / 390 |
| --- | --- | --- | --- |
| index | [1440](index-1440.png) / [390](index-390.png) | [1440](comparison-index-1440.png) / [390](comparison-index-390.png) | [1440](design-comparison-index-1440.png) / [390](design-comparison-index-390.png) |
| pos-leitourgei | [1440](pos-leitourgei-1440.png) / [390](pos-leitourgei-390.png) | [1440](comparison-pos-leitourgei-1440.png) / [390](comparison-pos-leitourgei-390.png) | [1440](design-comparison-pos-leitourgei-1440.png) / [390](design-comparison-pos-leitourgei-390.png) |
| eidi | [1440](eidi-1440.png) / [390](eidi-390.png) | [1440](comparison-eidi-1440.png) / [390](comparison-eidi-390.png) | [1440](design-comparison-eidi-1440.png) / [390](design-comparison-eidi-390.png) |
| dedomena | [1440](dedomena-1440.png) / [390](dedomena-390.png) | [1440](comparison-dedomena-1440.png) / [390](comparison-dedomena-390.png) | [1440](design-comparison-dedomena-1440.png) / [390](design-comparison-dedomena-390.png) |
| times | [1440](times-1440.png) / [390](times-390.png) | [1440](comparison-times-1440.png) / [390](comparison-times-390.png) | [1440](design-comparison-times-1440.png) / [390](design-comparison-times-390.png) |
| aitisi | [1440](aitisi-1440.png) / [390](aitisi-390.png) | [1440](comparison-aitisi-1440.png) / [390](comparison-aitisi-390.png) | [1440](design-comparison-aitisi-1440.png) / [390](design-comparison-aitisi-390.png) |

## Εκκρεμότητες και παράδοση

**Καμία εναπομένουσα ευπάθεια στο σημερινό npm audit.** Το καθαρό audit είναι αποτέλεσμα για το συγκεκριμένο lockfile και τη σημερινή βάση advisories, όχι εγγύηση απουσίας άγνωστων ευπαθειών. Συνιστάται περιοδικός επανέλεγχος εξαρτήσεων.

Δεν εξετάστηκαν πραγματικό backend/CORS/rate limiting ή πραγματική υποδομή παραγωγής· οι δοκιμές υποβολής ήταν αποκλειστικά mock. Οι χωριστοί έλεγχοι πριν τη δημοσίευση και το Draft PR #8 παραμένουν εκτός scope. Δεν έγινε merge, deployment ή αλλαγή Cloudflare/Access/DNS/λογαριασμών. [Συνολικά αποτελέσματα](results.json).
