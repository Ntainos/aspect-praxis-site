# Έλεγχος ασφάλειας και ασφαλής αποκατάσταση

8 Νοεμβρίου 2026 · βάση τρέχοντος main `a449e16` · branch `security/dependency-audit`.

## Συμπέρασμα

**0 από 9 ευάλωτα πακέτα διορθώθηκαν οριστικά· 9 παραμένουν: 1 critical, 3 high, 4 moderate, 1 low.** Το audit αναπαράχθηκε. Η έρευνα δεν εντόπισε προσβάσιμη διαδρομή εκμετάλλευσης αυτών των advisories μέσω του συγκεκριμένου στατικού site. Αυτό δεν μηδενίζει τους κινδύνους της εργαλειοθήκης ή μελλοντικής χρήσης μη έμπιστων εισόδων.

Δεν εφαρμόζεται καμία αλλαγή dependencies χωρίς την έγκριση που απαιτεί το αίτημα για major/ασύμβατες αναβαθμίσεις. Η δοκιμαστική ενημέρωση Sentry αφαιρούσε 4 moderate, αλλά έφερνε major αλλαγές σε glob/minimatch/path-scurry και αναιρέθηκε. Οι τελικές δοκιμές έγιναν στο αρχικό dependency graph. Δεν έγινε npm audit fix ή --force.

## Αποδεικτικά και μέθοδος

`npm ci`, `npm audit --json`, `npm ls --all --json`, `npm explain` για τα εννέα πακέτα και ανάγνωση registry metadata/πραγματικών dependency ranges. Node v24.22.1, npm 11.9.0, Linux. [Αρχική εγκατάσταση](npm-ci-before.log), [αρχικό audit](audit-before.json), [αρχικό δέντρο](tree-before.json), [πραγματικές διαδρομές](paths-before.txt), [τελική εγκατάσταση](npm-ci-after.log), [τελικό audit](audit-after.json), [τελικό δέντρο](tree-after.json).

Οι «9 ευπάθειες» του npm είναι **9 εγγραφές πακέτων**, με 18 άμεσα advisory αντικείμενα και μεταβατική διάδοση σοβαρότητας. Δεν είναι εννέα διαφορετικά CVE. Παρακάτω καταγράφονται και τα εννέα πακέτα και όλα τα επιμέρους GHSA, χωρίς διπλομέτρηση των μεταβατικών εγγραφών.

## Κίνδυνος ανά πακέτο

| Πακέτο / εγκατεστημένη έκδοση | Σοβαρότητα / εύρος npm | Πεδίο | Εκμεταλλευσιμότητα εδώ / υπόλοιπο | Ασφαλής έκδοση / απόφαση |
| --- | --- | --- | --- | --- |
| `@sentry/bundler-plugins@11.10.0` | moderate · `<=11.10.0` | Μόνο Lighthouse development/testing μέσω @sentry/node. | Μεταβατικό εύρημα glob/minimatch, όχι ανεξάρτητο advisory. Δεν έχει εγκατασταθεί ως plugin της εφαρμογής. | 11.11.0· απαιτεί glob ^14.0.3 και μεταβατικές major αλλαγές. Υπό έγκριση. |
| `@sentry/node@11.10.0` | moderate · `11.0.0-alpha.0 - 11.10.0` | Μόνο Lighthouse development/testing. | Μεταβατικό εύρημα bundler-plugins/glob/minimatch. Δεν είναι analytics ή browser SDK του site και δεν περιλαμβάνεται στα scripts παραγωγής. | 11.11.0· minor στο άμεσο πακέτο αλλά εισάγει μεταβατικές major αλλαγές. Υπό έγκριση. |
| `astro@5.18.2` | critical · `<=7.3.1` | Κατασκευή/dev· δηλωμένο production dependency, αλλά όχι Node runtime στη στατική δημοσίευση. | Δεν βρέθηκε διαδρομή εκμετάλλευσης στη συγκεκριμένη έξοδο: δεν υπάρχουν SSR/server islands, image endpoint, AVIF εισόδου, hydrated islands, transitions, MDX/JSX ή μη έμπιστα spread/slot/define:vars. Παραμένει κίνδυνος εργαλείου με μελλοντικά μη έμπιστα δεδομένα/ενεργοποίηση αυτών των δυνατοτήτων. | 7.4.7 ως συνολικός υποψήφιος του audit· major 5→7, απαιτεί έγκριση και χωριστή migration/validation. |
| `esbuild@0.27.7` | low · `0.27.3 - 0.28.0` | Κατασκευή/dev μέσω Astro. | Η αναφερόμενη αυθαίρετη ανάγνωση απαιτεί development server σε Windows. Εδώ Linux, static build, χωρίς esbuild server στην παραγωγή. Κίνδυνος σε εκτεθειμένο Windows dev server. Η δεύτερη έκδοση 0.25.12 μέσω Vite δεν εμπίπτει στο συγκεκριμένο εύρος. | 0.28.1· εκτός ^0.27.3, pre-1.0 ασύμβατη γραμμή. Όχι αναγκαστικό override χωρίς έγκριση. |
| `glob@13.0.6` | moderate · `9.0.0 - 14.0.1` | Μόνο development/testing: Lighthouse → @sentry/node → @sentry/bundler-plugins. | Παράκαμψη ακύρωσης/συνέχιση filesystem traversal μετά timeout με μη έμπιστα patterns/δέντρα. Δεν φορτώνεται στη σελίδα. Παραμένει τοπικό κόστος CPU/I/O και μεταβατικό minimatch DoS. | ≥14.0.2· δοκιμαστικός υποψήφιος 14.0.4 μέσω Sentry 11.11.0, με major μετάβαση 13→14. |
| `minimatch@10.2.6` | moderate · `7.0.0 - 11.0.0` | Μόνο development/testing μέσω glob της παραπάνω διαδρομής. | Amplification/DoS από μη έμπιστα glob patterns. Δεν υπάρχει είσοδος επισκέπτη προς αυτό το πακέτο στο site. Παραμένει κίνδυνος σε τοπικά εργαλεία με επιτιθέμενα patterns. | ≥11.0.1· υποψήφιος 11.0.5 μέσω νέου glob, major 10→11. |
| `sharp@0.34.5` | high · `<=0.35.5-rc.1` | Κατασκευή εικόνων Astro και τοπικές συγκρίσεις/tests. | Μη έμπιστες εικόνες μπορούν να εκθέσουν native parsers/libvips/libheif/librsvg. Εδώ εγκεκριμένα τοπικά SVG/PNG, χωρίς upload/image endpoint στη στατική έξοδο. Ο κίνδυνος κατασκευής παραμένει για εισαγωγή κακόβουλων εικόνων. | 0.35.5 για όλα τα καταγεγραμμένα advisories· εκτός ^0.34.0 και δηλώνεται breaking από npm. Απαιτεί έγκριση, native και οπτικό έλεγχο. |
| `zod@3.25.76` | high · `<4.6.6` | Κατασκευή/σχήματα Astro, όχι validation της δημόσιας φόρμας. | Η υπερβολικά μεγάλη συλλογή μπορεί να εξαντλήσει μνήμη σε validation. Η φόρμα χρησιμοποιεί δικό της validator και όριο UTF-8, όχι Zod. Παραμένει κίνδυνος εργαλείου αν δοθούν μη έμπιστα μεγάλα σύνολα. Η χωριστή 4.6.7 των browser tools είναι εκτός εύρους. | 4.6.6 ή νεότερη· major 3→4, ασύμβατη με peer ^3 του zod-to-ts. Μέρος συντονισμένης αναβάθμισης Astro. |
| `zod-to-ts@1.2.0` | high · `<=1.2.0` | Κατασκευή/type generation μέσω Astro. | Μεταβατική σηματοδότηση από zod, όχι ανεξάρτητο advisory. Ίδιος κίνδυνος εξάντλησης μνήμης στην εργαλειοθήκη, χωρίς δημόσιο endpoint. | Συμβατή μετάβαση σε toolchain με Zod ≥4.6.6· όχι override του peer ^3. |

## Επιμέρους advisories

Τα όρια παρακάτω προέρχονται από το ληφθέν audit. Για μεταβατικά ευρήματα ισχύει η αντίστοιχη γραμμή πακέτου παραπάνω.

| Πακέτο | Advisory / περιγραφή | Σοβαρότητα | Επηρεαζόμενες εκδόσεις |
| --- | --- | --- | --- |
| astro | [GHSA-j687-52p2-xcff](https://github.com/advisories/GHSA-j687-52p2-xcff) — Astro: XSS in define:vars via incomplete </script> tag sanitization | moderate | `<6.1.6` |
| astro | [GHSA-xr5h-phrj-8vxv](https://github.com/advisories/GHSA-xr5h-phrj-8vxv) — Astro: Server island encrypted parameters vulnerable to cross-component replay | low | `<6.1.10` |
| astro | [GHSA-jrpj-wcv7-9fh9](https://github.com/advisories/GHSA-jrpj-wcv7-9fh9) — Astro: XSS via Unescaped Attribute Names in Spread Props | moderate | `<6.4.6` |
| astro | [GHSA-f48w-9m4c-m7f5](https://github.com/advisories/GHSA-f48w-9m4c-m7f5) — Astro: XSS via unescaped spread attribute names in renderHTMLElement (incomplete fix for CVE-2026-54298) | moderate | `<7.0.6` |
| astro | [GHSA-7pw4-f3q4-r2p2](https://github.com/advisories/GHSA-7pw4-f3q4-r2p2) — Astro: Cross-site scripting via unescaped transition:* directive values on hydrated islands | low | `>=3.10.0 <7.0.4` |
| astro | [GHSA-4g3v-8h47-v7g6](https://github.com/advisories/GHSA-4g3v-8h47-v7g6) — Astro: Reflected XSS via unescaped View Transition animation properties | moderate | `>=2.9.0 <=7.0.9` |
| astro | [GHSA-2pvr-wf23-7pc7](https://github.com/advisories/GHSA-2pvr-wf23-7pc7) — Astro: Host header SSRF in prerendered error page fetch | high | `<6.4.6` |
| astro | [GHSA-8hv8-536x-4wqp](https://github.com/advisories/GHSA-8hv8-536x-4wqp) — Astro: Reflected XSS via unescaped slot name | high | `<6.3.3` |
| astro | [GHSA-26w7-cxv4-gfx2](https://github.com/advisories/GHSA-26w7-cxv4-gfx2) — Astro: Remote code execution through AVIF image optimization | critical | `<7.2.8` |
| astro | [GHSA-376h-93r7-7g6f](https://github.com/advisories/GHSA-376h-93r7-7g6f) — Astro: Authorization bypass from missing path-segment boundary check when stripping the configured base | moderate | `<=7.2.3` |
| astro | [GHSA-98hj-9722-w3j8](https://github.com/advisories/GHSA-98hj-9722-w3j8) — Astro: Reflected/Stored XSS via unescaped <script>/<style> tag content in JSX/MDX rendering | moderate | `<7.3.2` |
| esbuild | [GHSA-g7r4-m6w7-qqqr](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr) — esbuild allows arbitrary file read when running the development server on Windows | low | `>=0.27.3 <0.28.1` |
| glob | [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) — Glob: AbortSignal cancellation bypass allows post-timeout filesystem traversal | moderate | `>=9.0.0 <=14.0.1` |
| minimatch | [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) — minimatch has potential denial of service via globparts amplification | moderate | `>=7.0.0 <11.0.1` |
| sharp | [GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj) — sharp inherited vulnerabilities in libvips: CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591 | high | `<0.35.0` |
| sharp | [GHSA-rgj7-g3m4-5g8c](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c) — sharp: Vulnerabilities in libheif: GHSA-g89c-p67h-r497 and GHSA-2jg2-4ch7-h545 | high | `<0.35.4` |
| sharp | [GHSA-wq5f-xc86-pv6w](https://github.com/advisories/GHSA-wq5f-xc86-pv6w) — sharp : Vulnerability in librsvg dependency CVE-2026-96889 | high | `<0.35.5` |
| zod | [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) — Zod can exhaust memory while validating oversized constrained collections | high | `<4.6.6` |

Για τα Astro XSS, το attack surface είναι αντίστοιχα define:vars, spread attribute names (περιλαμβανομένου incomplete fix CVE-2026-54298), transition directives/animation properties, μη έμπιστο slot name ή script/style περιεχόμενο JSX/MDX. Κανένα από αυτά δεν δέχεται μη έμπιστη είσοδο εδώ και τα σχετικά features δεν χρησιμοποιούνται. Τα server island replay, Host-header SSRF και base path authorization bypass απαιτούν server-side εκτέλεση που δεν παράγεται από αυτό το static build. Το AVIF RCE αφορά image optimization, όχι την απλή διάθεση των εγκεκριμένων SVG/fonts. Οι αντίστοιχοι κίνδυνοι επανεξετάζονται πριν ενεργοποιηθεί οποιαδήποτε τέτοια δυνατότητα.

## Πρόταση διόρθωσης προς έγκριση

1. **Απομονωμένη ενημέρωση αλυσίδας Lighthouse/Sentry:** @sentry/node και bundler-plugins 11.10.0 → 11.11.0. Η επίλυση φέρνει glob 13.0.6 → 14.0.4, minimatch 10.2.6 → 11.0.5, path-scurry 2.0.2 → 3.0.0 και τις εξαρτήσεις Sentry που καταγράφονται στο [dependency-changes.json](dependency-changes.json). Το [δοκιμαστικό audit](audit-candidate.json) δείχνει 5 αντί 9 εγγραφές. Η εγκατάσταση και το build πέρασαν, αλλά **δεν δηλώνεται πλήρης regression έλεγχος του υποψηφίου**. Η αλλαγή αναιρέθηκε πριν από την τελική σουίτα λόγω των μεταβατικών major upgrades. Το [προτεινόμενο patch](proposed-sentry-update.patch) είναι μόνο τεκμήριο προς έγκριση και δεν εφαρμόζεται από το build.
2. **Χωριστή migration Astro 5.18.2 → 7.4.7:** υποψήφιος που προτείνει το audit, με Zod ^4.6.7 και διαφορετική εργαλειοθήκη. Δεν εγκαταστάθηκε ούτε ελέγχθηκε ως συμβατός. Απαιτεί αξιολόγηση migration/configuration/compiler, στατικής εξόδου, CSP και pixel-identical συγκρίσεων. Δεν παρακάμπτουμε το peer ^3 του zod-to-ts με override.
3. **Sharp 0.34.5 → 0.35.5:** δεν εγκαταστάθηκε. Pre-1.0 αλλαγή εκτός ^0.34.0, με αλλαγές native parsers· χρειάζεται έγκριση και έλεγχο εικόνων/συγκρίσεων. Το esbuild ≥0.28.1 επίσης δεν επιβάλλεται κάτω από Astro που απαιτεί ^0.27.3. Επανεπίλυση και νέο audit μετά την εγκεκριμένη migration ώστε να μη μείνουν παλιά nested αντίγραφα.

Τα [astro-candidate.json](astro-candidate.json), [sharp-candidate.json](sharp-candidate.json), [esbuild-candidate.json](esbuild-candidate.json), [zod-candidate.json](zod-candidate.json) είναι πληροφορίες registry, όχι απόδειξη συμβατότητας. Η μεταβατική major μετάβαση δεν θεωρήθηκε αυτόματα επιτρεπτή επειδή ο γονέας Sentry αλλάζει minor.

## Install scripts και supply chain

Στο περιβάλλον αυτό τα δύο npm ci δεν αναπαρήγαγαν warnings για blocked install scripts esbuild/sharp. Καταγράφηκε warning ότι το tsconfck@3.1.6 είναι unmaintained. `ignore-scripts=false`, χωρίς ρύθμιση allow-scripts· δεν τροποποιήθηκε η πολιτική εγκατάστασης. Δεν συμπεραίνουμε τι συνέβη στο διαφορετικό περιβάλλον του ιδιοκτήτη.

Το esbuild έχει `postinstall: node install.js`: επιλέγει platform binary, ελέγχει έκδοση και περιέχει fallback λήψη από το npm registry αν λείπει το optional binary. Το sharp έχει `install: node install/check.js || npm run build`: ελέγχει native libvips και μπορεί να κάνει τοπικό build. Είναι αναμενόμενα native install hooks, όχι αυτά καθαυτά advisory· εκτελούν κώδικα και αποτελούν όριο εμπιστοσύνης supply chain. Εξετάστηκαν τα hooks, χωρίς γενικό ισχυρισμό πλήρους ελέγχου κάθε μεταβατικού πακέτου. [Native smoke check](native-install-check.json): esbuild transform και sharp PNG encode πέρασαν. Το lockfile με resolved/integrity παραμένει ίδιο· χρήση npm ci για αναπαραγωγή, όχι τυφλές ενημερώσεις ή καθολική άδεια scripts για άγνωστα πακέτα.

## Έλεγχος εφαρμογής

- **XSS/HTML/DOM:** το API error αντιμετωπίζεται ως μη έμπιστο κείμενο με createTextNode/textContent και σταθερό mailto. Δεν βρέθηκαν innerHTML/outerHTML/insertAdjacentHTML/set:html/eval ή δυναμική εκτέλεση. Το υπάρχον mock `400-safe-text` δοκιμάζει `<img ... onerror>` και επιβεβαιώνει ότι δεν δημιουργείται στοιχείο img.
- **Φόρμα:** ασφαλής attach πριν ενεργοποιηθεί το submit, honeypot πριν κατασκευή payload, επικύρωση, 16384 bytes UTF-8, pending/completed guard, μόνο 200/ok:true επιτυχία, timeout AbortController. fetch με credentials omit, no-store, redirect error, no-referrer. Καμία πραγματική υποβολή. Το client validation/honeypot δεν αντικαθιστά server validation/rate limiting/νομική διατήρηση· το backend δεν εξετάστηκε.
- **Headers:** αμετάβλητη αυστηρή CSP, form-action none, frame-ancestors none, noindex/nofollow για /* και λοιπά εγκεκριμένα headers. Δεν προστέθηκαν εξαιρέσεις script-src ή CORS. Η αρνητική native submit παράγει την αναμενόμενη form-action παράβαση και μηδέν δικτυακά POST.
- **Πόροι/δεδομένα:** τοπικά fonts/logo/scripts, χωρίς analytics ή browser SDK Sentry. Μηδενικές εξωτερικές αιτήσεις σε φόρτωση και storage/cookies στις browser δοκιμές. Δεν βρέθηκε application console logging στοιχείων. Τα fixtures είναι τα υπάρχοντα εγκεκριμένα πλασματικά στοιχεία και example.test.
- **Στατική έξοδος:** έξι HTML σελίδες και 404, CSS/JS/SVG/TTF, _headers και η νόμιμη άδεια fonts/OFL.txt. Δεν δημοσιεύονται design/artifacts/src/node_modules/.git, env files ή sourcemaps. Η αναφορά [source-review.json](source-review.json) περιέχει λίστα εξόδου και αποτελέσματα σάρωσης γνωστών private-key/GitHub-token/AWS-key patterns στα tracked text αρχεία. Δεν εμφανίζονται πιθανές τιμές μυστικών. Δεν αποτελεί πλήρη forensic έλεγχο ιστορικού Git ή εγγύηση ότι κάθε μορφή secret είναι ανιχνεύσιμη.
- **Σύνδεσμοι:** σταθερά εγκεκριμένα HTTPS legal URLs και mailto, χωρίς target=_blank ή user-controlled href. Δεν έγινε επίσκεψη/penetration testing στην εφαρμογή.

## Δοκιμές και εικόνες

Οι τελικές δοκιμές γίνονται **μετά την αναίρεση του υποψηφίου**, στο αμετάβλητο dependency graph: [build](build.log), [regression](regression-results.json), [log](regression.log), [mock API](mock-api-results.json), [CSP/οπτικές συγκρίσεις](security-results.json), [Lighthouse](lighthouse-summary.json). Δεν αλλάχθηκε ή απενεργοποιήθηκε υπάρχον test. Τα ιστορικά artifacts διατηρούνται και τα νέα αποθηκεύονται εδώ.

| Σελίδα | Προς Βήμα 6 1440 | Προς Βήμα 6 390 | Προς design 1440 | Προς design 390 |
| --- | --- | --- | --- | --- |
| index | [εικόνα](comparison-index-1440.png) | [εικόνα](comparison-index-390.png) | [εικόνα](design-comparison-index-1440.png) | [εικόνα](design-comparison-index-390.png) |
| pos-leitourgei | [εικόνα](comparison-pos-leitourgei-1440.png) | [εικόνα](comparison-pos-leitourgei-390.png) | [εικόνα](design-comparison-pos-leitourgei-1440.png) | [εικόνα](design-comparison-pos-leitourgei-390.png) |
| eidi | [εικόνα](comparison-eidi-1440.png) | [εικόνα](comparison-eidi-390.png) | [εικόνα](design-comparison-eidi-1440.png) | [εικόνα](design-comparison-eidi-390.png) |
| dedomena | [εικόνα](comparison-dedomena-1440.png) | [εικόνα](comparison-dedomena-390.png) | [εικόνα](design-comparison-dedomena-1440.png) | [εικόνα](design-comparison-dedomena-390.png) |
| times | [εικόνα](comparison-times-1440.png) | [εικόνα](comparison-times-390.png) | [εικόνα](design-comparison-times-1440.png) | [εικόνα](design-comparison-times-390.png) |
| aitisi | [εικόνα](comparison-aitisi-1440.png) | [εικόνα](comparison-aitisi-390.png) | [εικόνα](design-comparison-aitisi-1440.png) | [εικόνα](design-comparison-aitisi-390.png) |

Οι παλιές αποκλίσεις από το εγκεκριμένο design παραμένουν όπως τεκμηριώθηκαν στο [Βήμα 6](../step-6/REPORT.md). Δεν εγκρίνεται νέα οπτική απόκλιση.

## Σύσταση πριν τη δημόσια λειτουργία

Προτείνεται αποδοχή της αναφοράς ως τεκμηρίωσης, **όχι έγκριση δημόσιας λειτουργίας ούτε ισχυρισμός καθαρού audit**. Απαιτείται απόφαση για τις τρεις παραπάνω απομονωμένες εργασίες αναβάθμισης, πλήρης έλεγχος των εγκεκριμένων αλλαγών και νέο audit πριν τη δημοσίευση. Μέχρι τότε να μη χρησιμοποιούνται μη έμπιστα image/content inputs και να μην εκτίθενται development servers. Παραμένουν επίσης οι έλεγχοι πραγματικού API/CORS, νομικών/email, υποδομής/backup και πραγματικών headers/cookies παραγωγής.

Το main, cf-placeholder και feat/publication-seo-draft δεν αλλάζουν. Δεν έγινε merge, deployment ή αλλαγή Cloudflare/Access/DNS/production branch. Δεν άλλαξαν πηγές εφαρμογής, design, ορατά κείμενα, [●], headers ή dependency manifest/lockfile. Η εφαρμογή του προτεινόμενου patch απαιτεί ρητή έγκριση για τις major μεταβατικές αλλαγές.

## Τελικές επαληθεύσεις

PASS: npm ci, npm ls, Astro static build, και οι εννέα εντολές της ομάδας regression (όλα τα υπάρχοντα tests, συγκρίσεις, καταστάσεις φόρμας, test:security). Axe 0 σε 1440/768/390 και στα ελεγχόμενα ανοιχτά μενού/καταστάσεις. Lighthouse Accessibility 100 / Best Practices 100 και στις 12 εκτελέσεις. 46 σενάρια φόρμας με mock API. Μηδέν διαφορετικά pixels σε όλες τις 12 συγκρίσεις προς Βήμα 6. Τα package.json/package-lock.json, src/, public/, design/ και τα ιστορικά artifacts είναι ίδια με τη βάση.

Οι προειδοποιήσεις npm audit δεν αντιμετωπίστηκαν ως αποτυχία build ούτε ως απόδειξη δημόσιας εκμεταλλευσιμότητας. Το audit παραμένει μη καθαρό με τις 9 εγγραφές που αναλύονται παραπάνω. Η προτεινόμενη ενημέρωση δεν εφαρμόστηκε τελικά και δεν πρέπει να αναφερθεί ως διορθωμένη ευπάθεια.

## Παράδοση Pull Request

Το commit της αναφοράς ανέβηκε στο `security/dependency-audit`. Η δημιουργία/ανάγνωση Pull Request μέσω GitHub GraphQL επέστρεψε `Forbidden`. Δεν έγινε παράκαμψη δικαιωμάτων. Ο ιδιοκτήτης μπορεί να ανοίξει [Pull Request χειροκίνητα προς main](https://github.com/Ntainos/aspect-praxis-site/compare/main...security/dependency-audit?expand=1), χρησιμοποιώντας το παρόν PR.md ως περιγραφή. Δεν έγινε merge ή deployment.
