# Astro 7 — ολοκληρωμένη μετάβαση ασφάλειας

10 Νοεμβρίου 2026 · `security/astro-7-migration` · συνέχεια του `1b2bfb2` · βάση main `a449e16`.

## Αποτέλεσμα

**Η μετάβαση σε Astro 7.4.8 ολοκληρώθηκε. Εξαλείφθηκαν 4 από τις 9 αρχικές ευάλωτες εγγραφές πακέτων. Παραμένουν 5: 1 high και 4 moderate, με 0 critical και 0 low.** Η GHSA-26w7-cxv4-gfx2 δεν υπάρχει πλέον σε ευάλωτη εγκατεστημένη έκδοση. Δεν προστέθηκαν νέες εγγραφές audit.

Καθαρό npm ci, npm ls, static build και όλες οι υπάρχουσες δοκιμές πέρασαν. Axe 0, Lighthouse Accessibility/Best Practices 100/100 και στις 12 εκτελέσεις. **Μηδέν διαφορετικά pixels** στις 12 συγκρίσεις των έξι σελίδων προς Βήμα 6. Ίδια κείμενα, ίδια συμπεριφορά στις δοκιμές, αμετάβλητη CSP και γενικό noindex/nofollow.

Σύσταση: **έτοιμο για review και έγκριση merge της συγκεκριμένης migration από τον ιδιοκτήτη**. Δεν έγινε merge ή deployment και δεν αποτελεί έγκριση δημόσιας λειτουργίας με καθαρό audit. Οι χωριστές εκκρεμότητες Sharp/Sentry παραμένουν ρητά καταγεγραμμένες.

## Ακριβείς αλλαγές

| Πακέτο/αλυσίδα | Πριν | Μετά |
| --- | --- | --- |
| Astro | 5.18.2, δήλωση ^5.16.0 | **7.4.8**, ακριβής δήλωση 7.4.8 |
| Sharp της εφαρμογής/εργαλείων, άμεση devDependency | 0.34.5, δήλωση ^0.34.0 | **0.34.5, ^0.34.0 αμετάβλητα** |
| Sharp που επιλύεται από Astro | 0.34.5 από τη ρίζα | **0.35.5** στο astro/node_modules/sharp |
| Zod μέσω Astro | 3.25.76 | **4.6.7**, το αντίγραφο browser tools επίσης 4.6.7 |
| zod-to-ts | 1.2.0 | Αφαιρέθηκε, δεν απαιτείται από Astro 7 |
| esbuild | 0.27.7 και 0.25.12 | Αφαιρέθηκαν, νέα εργαλειοθήκη Vite/Rolldown |
| Vite / compiler | Vite 6.4.5 / compiler 2.13.1 | Vite 8.3.7 / compiler-rs 0.5.3 |
| Lighthouse | 13.6.0 | 13.6.0 |
| @sentry/node και bundler-plugins | 11.10.0 | 11.10.0 |
| glob / minimatch / path-scurry | 13.0.6 / 10.2.6 / 2.0.2 | Αμετάβλητα |

Το τελικό δέντρο και οι πραγματικές απαιτήσεις είναι στα [tree-after.json](tree-after.json), [selected-tree-after.json](selected-tree-after.json), [metadata Astro](astro-7.4.8-metadata.json), [μεταβολές ανά διαδρομή](dependency-changes.json). Πολλές γραμμές lockfile αφορούν μετακίνηση εξαρτήσεων κάτω από το Astro, όχι ανεξάρτητες αναβαθμίσεις εργαλείων.

Το Node **24.22.1** / npm **11.9.0** ικανοποιεί το δηλωμένο Node >=22.23.4 / npm >=9.6.5 του Astro. Η [native δοκιμή](native-check.json) επιβεβαιώνει φόρτωση και PNG encode και από τα δύο Sharp, με πραγματική επίλυση 0.35.5 μέσα από το Astro. Το npm ls ολοκληρώθηκε χωρίς invalid/missing/peer conflicts.

### Διατήρηση Lighthouse/Sentry

Η αρχική κανονική hoisted εγκατάσταση διατηρούσε τις εκδόσεις Sentry αλλά επαναχρησιμοποιούσε magic-string 1.4.5 του Astro και για το Sentry, εντός του συμβατού range του. Επειδή η εντολή απαιτεί ολόκληρη την αλυσίδα αμετάβλητη, η επίλυση αυτή αντικαταστάθηκε. Το --prefer-dedupe μόνο του δεν αρκούσε.

Το τελικό lockfile παρήχθη κανονικά από το npm, ξεκινώντας από το αρχικό manifest/lockfile, με:

```sh
npm install astro@7.4.8 --save-exact --install-strategy=nested --package-lock-only
npm ci
npm ls --all --json
npm run build
```

Η επίλυση lockfile έγινε σε προσωρινό απομονωμένο φάκελο με τα αρχικά δύο αρχεία και μεταφέρθηκε αυτούσια στο branch. Δεν έγινε χειροκίνητη κατασκευή lockfile ή προσθήκη overrides. Το απλό npm ci αναπαρήγαγε το δέντρο χωρίς επιπλέον flags ή αλλαγή npm configuration. Το Sentry εξακολουθεί να χρησιμοποιεί magic-string 0.30.21, ενώ το Astro χρησιμοποιεί 1.4.5 στο δικό του subtree.

Οι **126 ονομασίες πακέτων** της πλήρους εξάρτησης Lighthouse διατηρούν ακριβώς τα ίδια σύνολα εκδόσεων: [σύγκριση αλυσίδας](lighthouse-dependency-closure.json), [όρια scope](scope-verification.json). Το root Sharp και το root magic-string χαρακτηρίζονται πλέον dev-only στο lockfile, καθώς το Astro έχει δικά του αντίγραφα· οι εκδόσεις και τα integrity τους δεν άλλαξαν. Όλες οι άμεσες devDependencies παραμένουν ίδιες.

### Μοναδική αλλαγή πηγαίου κώδικα

Στο `src/styles/application-closing.css`:

```css
/* Πριν */ .closing-email a{color:white}
/* Μετά */ .application-closing .closing-email a{color:white}
```

Το Astro 7 παράγει διαφορετική σειρά CSS chunks. Η παλιά δήλωση είχε ίση ειδικότητα με `.dark a` και έχανε στη νέα σειρά, αλλάζοντας το email του κοινού κλεισίματος από λευκό σε γκρι. Ο αρχικός αυστηρός έλεγχος σταμάτησε στη /pos-leitourgei 1440 με **1252 διαφορετικά pixels**, όλα στην περιοχή του email: [αρχική αποτυχία](security-initial-failure.log). Η επιπλέον ειδικότητα επαναφέρει το προϋπάρχον εγκεκριμένο λευκό, χωρίς νέα τιμή χρώματος ή αλλαγή διάταξης. Ο τελικός έλεγχος επιβεβαίωσε μηδέν διαφορετικά pixels παντού.

Δεν αλλάζουν components, εγκεκριμένα κείμενα, design/, public/, API contract, tests ή astro.config.mjs. Διατηρούνται output static, prefetch false και assetsInlineLimit 0. Η JavaScript παραμένει σε τοπικά εξωτερικά αρχεία για τη script-src self, μόνο μενού/φόρμα. Δεν προστέθηκε adapter, server runtime ή Cloudflare configuration.

## Audit και επαλήθευση διορθώσεων

| Σοβαρότητα | Πριν | Μετά |
| --- | ---: | ---: |
| Critical | 1 | **0** |
| High | 3 | **1** |
| Moderate | 4 | **4** |
| Low | 1 | **0** |
| Σύνολο εγγραφών πακέτων | 9 | **5** |

[Audit πριν](audit-before.json) · [Audit μετά](audit-after.json) · [Έλεγχος κάθε advisory έναντι πραγματικών εγκατεστημένων εκδόσεων](advisory-verification.json).

Οι αριθμοί npm είναι εγγραφές πακέτων και περιλαμβάνουν μεταβατική διάδοση σοβαρότητας, όχι μοναδικά CVE. Εξαλείφθηκαν οι εγγραφές **astro, esbuild, zod, zod-to-ts**. Από τα 18 άμεσα advisory αντικείμενα της αρχικής αναφοράς, 13 δεν αντιστοιχούν πλέον σε ευάλωτο εγκατεστημένο πακέτο· τα 5 υπόλοιπα αφορούν Sharp/glob/minimatch. Δεν αλλάχθηκε ρύθμιση audit, δεν χρησιμοποιήθηκε audit fix, --force, --legacy-peer-deps ή override.

| Διορθωμένη αλυσίδα | Τεκμηρίωση |
| --- | --- |
| Astro AVIF RCE **GHSA-26w7-cxv4-gfx2** | Επηρεάζεται <7.2.8. Η μοναδική εγκατεστημένη Astro είναι 7.4.8 και επιλύει Sharp 0.35.5. |
| Astro XSS και λοιπά 10 advisories | Όλα τα 11 άμεσα Astro advisories ελέγχθηκαν με τα αντίστοιχα semver ranges. Κανένα δεν περιλαμβάνει 7.4.8. Οι GHSA και τα ranges διατηρούνται αναλυτικά στο advisory-verification.json. |
| Zod **GHSA-mrhx-c7xc-m3w5** | Επηρεάζεται <4.6.6. Όλα τα εγκατεστημένα αντίγραφα είναι 4.6.7· καμία Zod 3. |
| zod-to-ts | Η παλιά μεταβατική εγγραφή από Zod αφαιρέθηκε μαζί με το πακέτο, χωρίς παράκαμψη peer dependency. |
| esbuild **GHSA-g7r4-m6w7-qqqr** | Δεν υπάρχει εγκατεστημένο esbuild, ούτε παλιό nested αντίγραφο. Η νέα εργαλειοθήκη χρησιμοποιεί Rolldown. |

### Εκκρεμότητες που παραμένουν

| Πακέτο | Έκδοση / σοβαρότητα | Πραγματική επίδραση εδώ |
| --- | --- | --- |
| **sharp** άμεσο dev | **0.34.5 / high** | GHSA-f88m-g3jw-g9cj (libvips), GHSA-rgj7-g3m4-5g8c (libheif), GHSA-wq5f-xc86-pv6w (librsvg). Παραμένει ευάλωτο στους native parsers για μη έμπιστες εικόνες. Εδώ χρησιμοποιείται για ελεγχόμενα τοπικά screenshots/συγκρίσεις, χωρίς δημόσιο upload ή endpoint εικόνων. Η προσθήκη ασφαλούς Sharp στο Astro **δεν διορθώνει το root Sharp**. |
| @sentry/node | 11.10.0 / moderate | Μεταβατικό εύρημα, μόνο εργαλεία Lighthouse. |
| @sentry/bundler-plugins | 11.10.0 / moderate | Μεταβατικό glob/minimatch, δεν είναι plugin του website. |
| glob | 13.0.6 / moderate | GHSA-3g3m-2fjr-6pw4: συνέχιση traversal μετά ακύρωση με μη έμπιστα patterns/δέντρα. |
| minimatch | 10.2.6 / moderate | GHSA-g3hv-75wg-m249: globparts amplification/DoS. Τοπικός κίνδυνος εργαλείων με μη έμπιστες εισόδους. |

Δεν υπάρχει Sentry/analytics SDK στη δημοσιεύσιμη έξοδο. Οι πέντε εκκρεμότητες είναι εκτός της παρούσας έγκρισης και χρειάζονται χωριστή εργασία. Τα ασφαλή όρια των advisories και οι πιθανές διορθώσεις τεκμηριώνονται στην [αρχική αναφορά](https://github.com/Ntainos/aspect-praxis-site/blob/security/dependency-audit/artifacts/security-audit/REPORT.md). Η απουσία δημόσιου runtime για αυτά δεν μηδενίζει τον κίνδυνο build/dev.

## Πλήρεις τελικοί έλεγχοι

Οι παρακάτω έλεγχοι έγιναν μετά την τελική επίλυση, το καθαρό npm ci και τη CSS διόρθωση:

- [npm ci](npm-ci-after.log): PASS, 332 πακέτα, χωρίς παράκαμψη scripts ή peers.
- [npm ls](tree-after.json): PASS χωρίς dependency conflicts.
- [Static build](build.log): PASS, επτά HTML σελίδες μαζί με την 404, Node 24.22.1. Κατάλληλη στατική έξοδος dist για Pages, χωρίς server adapter.
- [Όλες οι σουίτες](regression-results.json), [πλήρες log](regression.log): npm test, test:home, test:pages, test:data-pricing, test:application, test:audit, comparisons.mjs, application-states.mjs — PASS.
- [test:security](security.log), [αποτελέσματα](security-results.json): 21 περιπτώσεις σελίδας/πλάτους, CSP/headers, 12 οπτικές συγκρίσεις, mock fetch και αποκλεισμένη native υποβολή — PASS. Η μοναδική αναμενόμενη παραβίαση CSP είναι η σκόπιμη αρνητική δοκιμή form-action, με μηδέν δικτυακά POST.
- [Mock API](mock-api-results.json): 46 validation/browser cases. Όλες οι εξωτερικές υποβολές αναχαιτίστηκαν. Ελέγχθηκαν success, errors, 400/429, ασφαλές κείμενο, honeypot, UTF-8 όριο, διπλές υποβολές, timeout και ανάκαμψη. Καμία πραγματική υποβολή API.
- Axe **0** σε 1440/768/390, ανοιχτά μενού και τις δοκιμαζόμενες καταστάσεις φόρμας. Έλεγχοι πληκτρολογίου, Escape, εστίασης, aria-expanded, κρυμμένων μη εστιάσιμων στοιχείων, touch targets >=44 px και απουσίας οριζόντιας κύλισης — PASS.
- [Lighthouse](lighthouse-summary.json), [log](lighthouse.log): **100 Accessibility / 100 Best Practices**, έξι σελίδες × desktop/mobile. Πλήρη JSON reports δίπλα στη σύνοψη.
- [Links](links.json), [404/routes/favicon/fonts](production-checks.json): PASS. Οι τέσσερις νομικοί προορισμοί παραμένουν εγκεκριμένοι και δεν έγιναν αιτήσεις στους εξωτερικούς προορισμούς.
- [Κείμενα](text-comparison.json): ίδιοι κανονικοποιημένοι κόμβοι κειμένου και στα επτά HTML έναντι του Astro 5 baseline. [Στατικός έλεγχος](static-review.json): τοπικά scripts, headers byte-identical, μόνο επιτρεπόμενα αρχεία στο dist, χωρίς design/src/artifacts/env/sourcemaps. Περιορισμένη σάρωση γνωστών secret patterns, όχι πλήρης έλεγχος ιστορικού.

Οι έλεγχοι έγιναν σε τοπικό HTTP server που εφαρμόζει το πραγματικό dist/_headers. Δεν ελέγχθηκαν πραγματικό Cloudflare account/production headers ή backend/CORS/rate limiting. Οι σχετικοί έλεγχοι πριν τη δημόσια λειτουργία παραμένουν χωριστοί· δεν έγινε deployment.

## Screenshots και συγκρίσεις

Στις συγκρίσεις Βήματος 6: αριστερά το baseline από commit 7efa4f5, δεξιά το τελικό Astro 7. Στις συγκρίσεις design: αριστερά η εγκεκριμένη εικόνα, δεξιά το τελικό αποτέλεσμα. Οι παλιές αποκλίσεις έναντι design παραμένουν όπως στο [Βήμα 6](../step-6/REPORT.md), με **καμία νέα οπτική απόκλιση**.

| Σελίδα | Screenshot 1440 / 390 | Βήμα 6 1440 / 390 | Design 1440 / 390 |
| --- | --- | --- | --- |
| index | [1440](index-1440.png) / [390](index-390.png) | [1440](comparison-index-1440.png) / [390](comparison-index-390.png) | [1440](design-comparison-index-1440.png) / [390](design-comparison-index-390.png) |
| pos-leitourgei | [1440](pos-leitourgei-1440.png) / [390](pos-leitourgei-390.png) | [1440](comparison-pos-leitourgei-1440.png) / [390](comparison-pos-leitourgei-390.png) | [1440](design-comparison-pos-leitourgei-1440.png) / [390](design-comparison-pos-leitourgei-390.png) |
| eidi | [1440](eidi-1440.png) / [390](eidi-390.png) | [1440](comparison-eidi-1440.png) / [390](comparison-eidi-390.png) | [1440](design-comparison-eidi-1440.png) / [390](design-comparison-eidi-390.png) |
| dedomena | [1440](dedomena-1440.png) / [390](dedomena-390.png) | [1440](comparison-dedomena-1440.png) / [390](comparison-dedomena-390.png) | [1440](design-comparison-dedomena-1440.png) / [390](design-comparison-dedomena-390.png) |
| times | [1440](times-1440.png) / [390](times-390.png) | [1440](comparison-times-1440.png) / [390](comparison-times-390.png) | [1440](design-comparison-times-1440.png) / [390](design-comparison-times-390.png) |
| aitisi | [1440](aitisi-1440.png) / [390](aitisi-390.png) | [1440](comparison-aitisi-1440.png) / [390](comparison-aitisi-390.png) | [1440](design-comparison-aitisi-1440.png) / [390](design-comparison-aitisi-390.png) |

## Παράδοση και περιορισμοί

[Συνολικά αποτελέσματα](results.json). Τα αρχικά dry-run/metadata του προηγούμενου σταδίου παραμένουν ιστορικά αποδεικτικά· δεν περιγράφουν την τελική εγκατάσταση. Η προηγούμενη παύση λύθηκε με τη ρητή έγκριση του ιδιοκτήτη στις 10 Νοεμβρίου για το μεταβατικό Sharp 0.35.5.

Δεν έγινε αλλαγή στα main, cf-placeholder ή feat/publication-seo-draft, ούτε merge, deployment ή αλλαγή Cloudflare/Access/DNS. Τα ιστορικά screenshots και reports προηγούμενων βημάτων διατηρούνται· τα νέα αποδεικτικά βρίσκονται μόνο εδώ. Για μελλοντική ενημέρωση lockfile χρειάζεται επανέλεγχος της αλυσίδας Lighthouse/Sentry, επειδή μια νέα hoisted επίλυση μπορεί να μοιραστεί συμβατές νεότερες εξαρτήσεις του Astro.

## Pull Request

Η δημιουργία PR μετά το push της ολοκληρωμένης migration επέστρεψε `Forbidden` από το GitHub GraphQL API. Δεν έγινε παράκαμψη δικαιωμάτων. [Χειροκίνητη δημιουργία PR προς main](https://github.com/Ntainos/aspect-praxis-site/compare/main...security/astro-7-migration?expand=1), με την περιγραφή του PR.md. Δεν έγινε merge ή deployment.
