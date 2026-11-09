# Astro 7: εμπόδιο πριν την εγκατάσταση

9 Νοεμβρίου 2026 · βάση main `a449e16ad2155ada18bd426ac06f623d1ceabe69` · branch `security/astro-7-migration`.

## Απόφαση

**Η μετάβαση δεν εγκαταστάθηκε και δεν χαρακτηρίζεται επιτυχημένη.** Το αίτημα αποκλείει αναβάθμιση Sharp και ορίζει: «Σε τέτοια περίπτωση, σταμάτησε και τεκμηρίωσέ το πριν διευρύνεις το scope». Η κανονική επίλυση npm για Astro 7.4.7 προσθέτει Sharp **0.35.5** στο `node_modules/astro/node_modules/sharp`. Η άμεση devDependency Sharp 0.34.5 παραμένει, αλλά η προσθήκη νέου μεταβατικού Sharp διευρύνει το συμφωνημένο scope.

Ελάχιστη απαιτούμενη απόφαση: να επιτραπεί **μόνο το μεταβατικό Sharp 0.35.5 του Astro**, κρατώντας την άμεση devDependency Sharp 0.34.5 και ολόκληρη την αλυσίδα Sentry αμετάβλητες. Η παρούσα αναφορά είναι έτοιμη για έλεγχο αυτής της απόφασης, όχι για συγχώνευση migration ή δημοσίευση.

## Πραγματικές απαιτήσεις συμβατότητας

Διαβάστηκαν AGENTS.md, design/README.md, η [προηγούμενη αναφορά](https://github.com/Ntainos/aspect-praxis-site/blob/security/dependency-audit/artifacts/security-audit/REPORT.md), manifest/lockfile, astro.config.mjs και οι υπάρχουσες σουίτες.

- [Astro 7.4.7 metadata](astro-7.4.7-metadata.json): Node >=22.23.4, npm >=9.6.5. Το διαθέσιμο Node 24.22.1 / npm 11.9.0 καλύπτει τα δηλωμένα όρια, χωρίς αυτό να αποδεικνύει λειτουργική συμβατότητα.
- `dependencies.zod: ^4.6.7`, Vite ^8.3.5, Rolldown ^1.2.16, νέος compiler-rs. Δεν δηλώνεται εξάρτηση zod-to-ts ή esbuild στο Astro 7.4.7.
- **`optionalDependencies.sharp: ^0.35.4`**: το 0.34.5 δεν ικανοποιεί το εύρος. Το npm εγκαθιστά optional dependencies εξ ορισμού. Η [προσομοίωση](install-dry-run.json) επιβεβαιώνει το επιπλέον 0.35.5 και τα native πακέτα του, χωρίς αλλαγή manifest, lockfile ή εγκατεστημένου δέντρου.
- Εξετάστηκε και το [Astro 7.4.8](astro-7.4.8-metadata.json), η νεότερη διαθέσιμη έκδοση της ίδιας σειράς κατά τον έλεγχο: δηλώνει επίσης Sharp ^0.35.4.
- Το Sharp είναι **προαιρετικό**, επομένως δεν υποστηρίζεται ότι είναι λογικά αναπόφευκτο για κάθε δυνατή εγκατάσταση Astro. Είναι όμως μέρος της κανονικής επίλυσης `npm install`/`npm ci` που ζητήθηκε. Δεν παρακάμφθηκε με overrides, χειροκίνητη αλλοίωση lockfile ή καθολικό `--omit=optional`, που θα άλλαζε επίσης την εγκατάσταση άλλων native εξαρτήσεων.
- Η προσομοίωση αφαιρεί τα παλιά esbuild και zod-to-ts και επιλέγει Zod 4.6.7. Δεν αλλάζει Sentry. Αυτά είναι προβλέψεις resolver, **όχι εφαρμοσμένες διορθώσεις**.
- Το `output: 'static'`, `prefetch: false` και `vite.build.assetsInlineLimit: 0` παραμένουν αμετάβλητα. Δεν αξιολογήθηκε ακόμη αν η νέα εργαλειοθήκη απαιτεί προσαρμογή για εξωτερικά scripts/CSP.

## Εντολές και έλεγχοι

1. Καθαρό `npm ci`: PASS ([log](npm-ci-before.log)), χωρίς αλλαγή πολιτικής scripts. Το μόνο warning ήταν unmaintained tsconfck 3.1.6.
2. `npm ls --all --json`: PASS ([δέντρο βάσης](tree-before.json)).
3. `npm audit --json`: 9 ευάλωτες εγγραφές πακέτων ([πριν](audit-before.json)).
4. `npm install astro@7.4.7 --save-exact --dry-run --json`: PASS ως προσομοίωση μόνο ([raw log](install-dry-run.log), [εξαγόμενο JSON](install-dry-run.json)). Δεν εκτελέστηκαν install hooks νέων πακέτων. Το npm τύπωσε γραμμές μεταβολών πριν το JSON· διατηρείται το raw output και χωριστά το JSON.
5. `npm run build`: PASS **με Astro 5.18.2**, όχι με Astro 7 ([log](build-baseline.log)).
6. Νέο audit και έλεγχος εγκατεστημένου δέντρου: ίδια 9 ευρήματα ([μετά](audit-after.json), [επιλεγμένα πακέτα](selected-tree-after.json)).
7. Manifest, lockfile, configuration, src/, public/, design/ και tests/ παραμένουν byte-identical ως προς main. Δεν έγιναν αλλαγές ασφαλείας, εμφάνισης ή λειτουργιών.

**Δεν εκτελέστηκαν οι πλήρεις browser σουίτες, Lighthouse, axe ή νέες συγκρίσεις/screenshot ως έλεγχος Astro 7**, επειδή δεν εγκαταστάθηκε ο υποψήφιος. Δεν επαναχρησιμοποιούνται παλιά PASS ως τεκμήρια migration. Οι [συγκρίσεις του Βήματος 6](../step-6/REPORT.md) παραμένουν ιστορική βάση. Μετά την απαιτούμενη απόφαση πρέπει να γίνουν όλα τα tests, test:security, οι 12 συγκρίσεις 1440/390 προς Βήμα 6 και design, και έλεγχοι 768 px, 404/routes/links/fonts/images, menu, mock φόρμας, CSP, μηδενικών εξωτερικών αιτήσεων, axe 0 και Lighthouse >=95. Δεν έγιναν πραγματικές υποβολές API.

## Ασφάλεια πριν → μετά

**0 από 9 εγγραφές πακέτων εξαλείφθηκαν. Παραμένουν 9: 1 critical, 3 high, 4 moderate, 1 low.** Καμία νέα ευπάθεια από εγκατάσταση migration, καθώς αυτή δεν έγινε. Δεν έγινε audit νέου εγκατεστημένου Astro 7 και δεν συνάγεται καθαρό audit από metadata.

| Πακέτο | Εγκατεστημένες εκδόσεις | Σοβαρότητα |
| --- | --- | --- |
| `@sentry/bundler-plugins` | 11.10.0 | moderate |
| `@sentry/node` | 11.10.0 | moderate |
| `astro` | 5.18.2 | critical |
| `esbuild` | 0.25.12, 0.27.7 | low |
| `glob` | 13.0.6 | moderate |
| `minimatch` | 10.2.6 | moderate |
| `sharp` | 0.34.5 | high |
| `zod` | 3.25.76, 4.6.7 | high |
| `zod-to-ts` | 1.2.0 | high |

- **Critical GHSA-26w7-cxv4-gfx2 παραμένει στο Astro 5.18.2**. Το επηρεαζόμενο εύρος του audit είναι <7.2.8, άρα 7.4.7/7.4.8 είναι εκτός. Δεν υπάρχει δημόσιο image optimization endpoint ή μη έμπιστο AVIF εδώ, αλλά παραμένει κίνδυνος εργαλείου εάν εισαχθούν μη έμπιστες εικόνες.
- Τα **11 άμεσα Astro advisories**, συμπεριλαμβανομένων όλων των XSS, καταγράφονται στο audit. Τα εύρη τους τελειώνουν το αργότερο πριν το 7.3.2. Το υποψήφιο 7.4.7 είναι εκτός των καταγεγραμμένων ορίων. Αυτό δεν υποκαθιστά audit του τελικού δέντρου ή regression έλεγχο.
- **Zod GHSA-mrhx-c7xc-m3w5**: το 3.25.76 παραμένει, μαζί με τη μεταβατική εγγραφή zod-to-ts. Η προβλεπόμενη 4.6.7 είναι εκτός <4.6.6, αλλά δεν εγκαταστάθηκε. Δεν χρησιμοποιείται στη δημόσια φόρμα· κίνδυνος build validation με μη έμπιστα μεγάλα σύνολα.
- **esbuild GHSA-g7r4-m6w7-qqqr**: παραμένει 0.27.7 στο επηρεαζόμενο >=0.27.3 <0.28.1. Η χωριστή 0.25.12 δεν εμπίπτει σε αυτό το εύρος. Αφορά εκτεθειμένο development server σε Windows, όχι τη στατική Linux έξοδο. Η προσομοίωση αφαιρεί και τις δύο εκδόσεις, χωρίς να εφαρμοστεί.
- **Sharp 0.34.5, high**: παραμένουν GHSA-f88m-g3jw-g9cj, GHSA-rgj7-g3m4-5g8c, GHSA-wq5f-xc86-pv6w για native parsers. Χρησιμοποιούνται εγκεκριμένες τοπικές εικόνες, χωρίς upload στο site. Η έγκριση μόνο του πρόσθετου Sharp 0.35.5 δεν θα διορθώσει το root dev Sharp 0.34.5· αυτό παραμένει ξεχωριστή εργασία.
- **Τέσσερις moderate εγγραφές Sentry/glob/minimatch** παραμένουν: μεταβατική αλυσίδα του Lighthouse, GHSA-3g3m-2fjr-6pw4 και GHSA-g3hv-75wg-m249. Κίνδυνος τοπικού traversal/DoS με μη έμπιστα patterns. Δεν είναι SDK ή tracking του website. Δεν προτείνεται αλλαγή τους σε αυτό το branch.

Δεν εντοπίζεται από τον προηγούμενο έλεγχο δημόσια προσβάσιμος δρόμος εκμετάλλευσης αυτών των advisories στη συγκεκριμένη στατική έξοδο. Αυτό δεν συνιστά εγγύηση ασφάλειας. Τα μη διορθωμένα πακέτα και οι περιορισμοί παραμένουν ρητά ορατά στο audit.

## Όρια παράδοσης

Αλλάζουν μόνο τα αποδεικτικά στο `artifacts/astro-migration/`. Δεν άλλαξαν main, cf-placeholder, feat/publication-seo-draft. Δεν έγινε merge, deployment ή πρόσβαση Cloudflare/Access/DNS. Δεν προστέθηκαν μυστικά, υπηρεσίες, runtime JavaScript ή αλλαγές CSP/noindex. [Μηχανικά αναγνώσιμα αποτελέσματα](results.json).

**Σύσταση: απαιτείται απόφαση scope πριν την υλοποίηση.** Η migration δεν είναι έτοιμη για έγκριση συγχώνευσης. Μετά από έγκριση του συγκεκριμένου μεταβατικού Sharp, η εγκατάσταση και οι πλήρεις επαληθεύσεις μπορούν να συνεχιστούν στο ίδιο branch.

## Pull Request

Η δημιουργία Draft PR επέστρεψε `Forbidden` από το GitHub GraphQL API. Δεν επιχειρήθηκε παράκαμψη. [Χειροκίνητη δημιουργία προς main](https://github.com/Ntainos/aspect-praxis-site/compare/main...security/astro-7-migration?expand=1), με την περιγραφή του PR.md. Παραμένει αίτημα απόφασης scope, χωρίς merge.
