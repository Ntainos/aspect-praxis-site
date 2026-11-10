# Sharp 0.35.5 και απαιτήσεις Node.js

10 Νοεμβρίου 2026 · `security/sharp-upgrade` · βάση τρέχοντος main `cef022aedd8a44b4c70ce14a7c07df417af8a4ea`.

## Αποτέλεσμα

**Η αναβάθμιση του άμεσου Sharp 0.34.5 → 0.35.5 ολοκληρώθηκε και εξάλειψε την τελευταία high εγγραφή. Το audit μειώθηκε από 5 σε 4 εγγραφές, όλες moderate. Δεν υπάρχουν high ή critical.** Το Astro παραμένει 7.4.8 και ολόκληρη η αλυσίδα Lighthouse/Sentry παραμένει στις ίδιες εκδόσεις.

Όλοι οι υποχρεωτικοί έλεγχοι πέρασαν: καθαρή εγκατάσταση, npm ls, static build, υπάρχοντα tests, native PNG, axe 0 και Lighthouse 100/100 στις 12 εκτελέσεις. **Μηδέν νέα διαφορετικά pixels** και στις 12 συγκρίσεις με το Βήμα 6. Δεν άλλαξε κώδικας εφαρμογής ή CSP.

Σύσταση: **έτοιμο για review και έγκριση merge της συγκεκριμένης αλλαγής από τον ιδιοκτήτη**. Δεν έγινε merge ή deployment. Παραμένουν τέσσερα moderate της αλυσίδας Lighthouse/Sentry ως χωριστή εργασία.

## Εκδόσεις και scope

| Στοιχείο | Πριν | Μετά |
| --- | --- | --- |
| Άμεση devDependency Sharp | ^0.34.0 → εγκατεστημένο 0.34.5 | **0.35.5**, ακριβής δήλωση |
| Sharp που χρησιμοποιεί το Astro | 0.35.5 σε nested αντίγραφο | **0.35.5 από τη ρίζα**, κοινό συμβατό αντίγραφο |
| Astro | 7.4.8 | **7.4.8** |
| Lighthouse / @sentry/node / bundler-plugins | 13.6.0 / 11.10.0 / 11.10.0 | Αμετάβλητα |
| glob / minimatch | 13.0.6 / 10.2.6 | Αμετάβλητα |
| Node / npm ελέγχων | 24.22.1 / 11.9.0 | Ίδια |

Η κανονική εγκατάσταση έγινε με `npm install --save-dev --save-exact sharp@0.35.5 --install-strategy=nested`, ακολουθούμενη από **απλό npm ci**. Η επιλογή nested διατηρεί τη διάταξη της ήδη εγκεκριμένης εργαλειοθήκης Astro. Το npm επαναχρησιμοποιεί πλέον τη συμβατή root Sharp και αφαιρεί το δεύτερο αντίγραφο. Δεν χρησιμοποιήθηκε audit fix, --force, --legacy-peer-deps, override ή αλλαγή npm configuration.

[Μεταβολές ανά διαδρομή](dependency-changes.json) · [Δέντρο πριν](tree-before.json) · [Δέντρο μετά](tree-after.json) · [npm ls --all](npm-ls.txt). Οι μεγάλες μετακινήσεις του lockfile αφορούν τις platform-specific/native εξαρτήσεις Sharp και την αφαίρεση διπλοτύπων. Κανένα άλλο πακέτο δεν αναβαθμίστηκε. Όλα τα μη Sharp στοιχεία διατηρούν metadata/integrity, εκτός από τυχόν ταξινόμηση dev/optional: [scope verification](scope-verification.json).

Η [πλήρης αλυσίδα Lighthouse](lighthouse-dependency-closure.json), **126 ονομασίες πακέτων**, έχει τα ίδια σύνολα εκδόσεων πριν/μετά. Δεν υπάρχουν invalid/missing/peer dependency conflicts. Τα src/, components, design/, public/, tests και Astro configuration είναι αμετάβλητα.

## Επαλήθευση advisories

Η πηγή των ranges είναι το φρέσκο npm audit πριν την αλλαγή, σε συνδυασμό με τα [metadata Sharp 0.35.5](sharp-metadata.json). Κάθε range συγκρίθηκε με όλες τις εκδόσεις Sharp του τελικού lockfile/εγκατεστημένου δέντρου: [αποτελέσματα](advisory-verification.json).

| Advisory | Επηρεαζόμενες εκδόσεις | Πρώτη εκτός εύρους | Τελικό αποτέλεσμα |
| --- | --- | --- | --- |
| [GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj) — libvips, CVE-2026-33327/33328/35590/35591 | <0.35.0 | 0.35.0 | Διορθώθηκε στο 0.35.5 |
| [GHSA-rgj7-g3m4-5g8c](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c) — libheif | <0.35.4 | 0.35.4 | Διορθώθηκε στο 0.35.5 |
| [GHSA-wq5f-xc86-pv6w](https://github.com/advisories/GHSA-wq5f-xc86-pv6w) — librsvg, CVE-2026-96889 | <0.35.5 | 0.35.5 | Διορθώθηκε στο 0.35.5 |

Δεν υπάρχει πλέον Sharp 0.34.5 ή άλλο ευάλωτο αντίγραφο στο εγκατεστημένο repository tree. Το Astro επιλύει το ίδιο root Sharp 0.35.5. Η παλιά έκδοση χρησιμοποιήθηκε μόνο σε απομονωμένο προσωρινό baseline για τη native σύγκριση και δεν περιλαμβάνεται στο τελικό dependency tree ή στο repository.

| Σοβαρότητα | Πριν | Μετά |
| --- | ---: | ---: |
| Critical | 0 | 0 |
| High | 1 | **0** |
| Moderate | 4 | 4 |
| Low / info | 0 | 0 |
| Σύνολο εγγραφών πακέτων | **5** | **4** |

[Audit πριν](audit-before.json) · [Audit μετά](audit-after.json). Εξαλείφθηκε μία εγγραφή πακέτου με τρία άμεσα advisories. Δεν εισήχθη νέα εγγραφή, ούτε αποκρύφτηκε εύρημα με ρύθμιση audit.

## README

Άλλαξε μόνο η τεχνική πρόταση «Το Astro υποστηρίζει Node.js 22.12+.» σε **«Το Astro 7.4.8 απαιτεί Node.js ≥22.23.4.»**. Διατηρήθηκε η απαίτηση **Node.js 24 για το σύνολο των tests**, που χρησιμοποιούν εγγενή υποστήριξη TypeScript. Η απαίτηση Astro επαληθεύτηκε από το εγκατεστημένο package: [engines](astro-engines.json). Κανένα άλλο περιεχόμενο README δεν άλλαξε.

## Native Sharp

Ο [αναπαραγώγιμος έλεγχος](native-check.mjs) φορτώνει native Sharp, δημιουργεί συνθετικό PNG και εκτελεί resize/περιστροφή/αναστροφή. Επεξεργάζεται επίσης crop της εγκεκριμένης εικόνας index__390.png χωρίς να την τροποποιεί. Συγκρίνει κάθε αποκωδικοποιημένο RGBA byte με την έξοδο Sharp 0.34.5 και με τη Sharp που επιλύει το Astro.

[Πριν](native-before.json) · [Μετά](native-after.json): **0 διαφορετικά pixels και στις δύο περιπτώσεις**, ίδιες διαστάσεις/κανάλια, επιτυχής φόρτωση και encode/decode. Τα αρχεία PNG έχουν διαφορετικά encoded SHA-256 μεταξύ εκδόσεων, αλλά **ίδια decoded SHA-256**. Η διαφορά κωδικοποίησης δεν αποτελεί οπτική διαφορά.

Η αρχική σύγκριση ολόκληρου του metadata object έδειξε ότι το Sharp 0.35 προσθέτει το πεδίο hasAlpha. Ο νέος native έλεγχος συγκρίνει ρητά διαστάσεις/κανάλια/depth/size και όλα τα pixels, αντί να θεωρεί το πρόσθετο metadata αλλαγή εικόνας. Δεν τροποποιήθηκε ούτε χαλαρώθηκε κανένα υπάρχον test του repository.

Τα native-before/after PNG αποθηκεύονται εδώ. Για αναπαραγωγή του before με ξεχωριστή εγκατάσταση Sharp 0.34.5, ορίστε SHARP_BASELINE_ROOT στον προσωρινό φάκελό της· το after χρησιμοποιεί κανονικά τις εξαρτήσεις του repository.

## Πλήρεις έλεγχοι

- [npm ci](npm-ci.log), [npm ls --all](npm-ls.txt), [build](build.log): PASS, Node 24.22.1. Επτά στατικά HTML μαζί με την 404, χωρίς adapter/server runtime. Τα native install hooks ολοκληρώθηκαν κανονικά.
- [Regression αποτελέσματα](regression-results.json), [πλήρες log](regression.log): npm test, test:home, test:pages, test:data-pricing, test:application, test:audit, comparisons.mjs και application-states.mjs — όλα PASS.
- [test:security](security.log), [JSON](security-results.json): 21 περιπτώσεις σελίδας/πλάτους, headers/CSP, 12 pixel comparisons, mock fetch και αποκλεισμός native form submission — PASS. Η form-action παραβίαση είναι η αναμενόμενη αρνητική δοκιμή, με 0 δικτυακά POST.
- [Φόρμα](mock-api-results.json): 46 περιπτώσεις validation/mock, χωρίς πραγματικές εξωτερικές αιτήσεις. [Καταστάσεις φόρμας](application-states.json): οκτώ screenshots 1440/390 για validation errors, pending, server error, success, με axe 0.
- Axe **0** στα 1440/768/390, στις ανοιχτές καταστάσεις μενού και στις δοκιμαζόμενες καταστάσεις φόρμας. Πληκτρολόγιο/Escape/εστίαση/aria-expanded, κρυμμένα μη εστιάσιμα στοιχεία, στόχοι αφής >=44 px και απουσία οριζόντιας κύλισης — PASS.
- [Lighthouse](lighthouse-summary.json), [log](lighthouse.log): **100 Accessibility / 100 Best Practices**, έξι σελίδες × desktop/mobile. Πλήρη JSON reports στον ίδιο φάκελο.
- [Links](links.json), [404/routes/favicon/fonts](production-checks.json): PASS, ίδιοι τέσσερις νομικοί προορισμοί. Καμία εξωτερική αίτηση φόρτωσης, cookies ή storage στις browser δοκιμές.
- CSP, γενικό noindex/nofollow και public/_headers byte-identical με τη βάση. Το dist περιέχει μόνο το site, τοπικούς πόρους και την άδεια fonts· δεν δημοσιεύει design/src/tests/artifacts/env. Το API contract και τα [●] δεν άλλαξαν.

Οι υπάρχουσες σουίτες εκτελέστηκαν **χωρίς μεταβολή τους σε προσωρινό αντίγραφο των πηγών/tests**, με τις νέες εξαρτήσεις και το νέο dist. Ο HTTP server εφαρμόζει τα πραγματικά headers του build. Τα νέα αποτελέσματα αντιγράφηκαν μόνο στο artifacts/sharp-upgrade· τα ιστορικά artifacts δεν αντικαταστάθηκαν. Το test:security διαβάζει το αρχικό baseline Βήματος 6 από Git commit 7efa4f5.

## Screenshots και αποκλίσεις

**Λίστα νέων αποκλίσεων: καμία.** Και οι 12 συγκρίσεις προς Βήμα 6 έχουν 0 διαφορετικά pixels. Οι προϋπάρχουσες αποκλίσεις έναντι των εγκεκριμένων εικόνων παραμένουν όπως τεκμηριώθηκαν στο [Βήμα 6](../step-6/REPORT.md), χωρίς νέα αλλαγή. Στις συγκρίσεις η αναφορά είναι αριστερά και το νέο αποτέλεσμα δεξιά.

| Σελίδα | Screenshot 1440 / 390 | Βήμα 6 1440 / 390 | Design 1440 / 390 |
| --- | --- | --- | --- |
| index | [1440](index-1440.png) / [390](index-390.png) | [1440](comparison-index-1440.png) / [390](comparison-index-390.png) | [1440](design-comparison-index-1440.png) / [390](design-comparison-index-390.png) |
| pos-leitourgei | [1440](pos-leitourgei-1440.png) / [390](pos-leitourgei-390.png) | [1440](comparison-pos-leitourgei-1440.png) / [390](comparison-pos-leitourgei-390.png) | [1440](design-comparison-pos-leitourgei-1440.png) / [390](design-comparison-pos-leitourgei-390.png) |
| eidi | [1440](eidi-1440.png) / [390](eidi-390.png) | [1440](comparison-eidi-1440.png) / [390](comparison-eidi-390.png) | [1440](design-comparison-eidi-1440.png) / [390](design-comparison-eidi-390.png) |
| dedomena | [1440](dedomena-1440.png) / [390](dedomena-390.png) | [1440](comparison-dedomena-1440.png) / [390](comparison-dedomena-390.png) | [1440](design-comparison-dedomena-1440.png) / [390](design-comparison-dedomena-390.png) |
| times | [1440](times-1440.png) / [390](times-390.png) | [1440](comparison-times-1440.png) / [390](comparison-times-390.png) | [1440](design-comparison-times-1440.png) / [390](design-comparison-times-390.png) |
| aitisi | [1440](aitisi-1440.png) / [390](aitisi-390.png) | [1440](comparison-aitisi-1440.png) / [390](comparison-aitisi-390.png) | [1440](design-comparison-aitisi-1440.png) / [390](design-comparison-aitisi-390.png) |

## Υπόλοιπες ευπάθειες και επόμενη ενέργεια

| Πακέτο | Έκδοση | Σοβαρότητα / επίδραση |
| --- | --- | --- |
| @sentry/node | 11.10.0 | moderate, μεταβατική εγγραφή Lighthouse |
| @sentry/bundler-plugins | 11.10.0 | moderate, μεταβατική εγγραφή glob/minimatch |
| glob | 13.0.6 | moderate, GHSA-3g3m-2fjr-6pw4, traversal μετά ακύρωση με μη έμπιστα patterns/δέντρα |
| minimatch | 10.2.6 | moderate, GHSA-g3hv-75wg-m249, globparts amplification/DoS |

Αφορούν την τοπική εργαλειοθήκη Lighthouse, όχι SDK ή analytics στη δημόσια έξοδο. Δεν βρέθηκε δημόσια διαδρομή εισόδου επισκέπτη προς αυτά, αλλά παραμένει κίνδυνος εργαλείων με μη έμπιστα δεδομένα. Προτείνεται χωριστή, εγκεκριμένη ενημέρωση της αλυσίδας Sentry με νέο audit και πλήρη επανέλεγχο. Η [αρχική αναφορά ασφάλειας](https://github.com/Ntainos/aspect-praxis-site/blob/security/dependency-audit/artifacts/security-audit/REPORT.md) τεκμηριώνει υποψήφιο Sentry 11.11.0 και τις μεταβατικές major αλλαγές glob/minimatch/path-scurry. Δεν εφαρμόστηκαν εδώ.

Οι έλεγχοι είναι τοπικοί. Δεν εξετάστηκαν πραγματικό API/CORS/rate limiting ή πραγματική υποδομή Cloudflare. Δεν έγινε merge, deployment ή αλλαγή Cloudflare/Access/DNS/hosting. Τα main, cf-placeholder και feat/publication-seo-draft παραμένουν ανέπαφα. [Συνολικά αποτελέσματα](results.json).
