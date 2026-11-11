# Sharp 0.35.5 και επαληθευμένες απαιτήσεις Node.js

Η άμεση devDependency Sharp αναβαθμίζεται από 0.34.5 σε 0.35.5 και εξαλείφει την τελευταία high εγγραφή: GHSA-f88m-g3jw-g9cj, GHSA-rgj7-g3m4-5g8c και GHSA-wq5f-xc86-pv6w. Το audit μειώνεται από 5 σε 4 εγγραφές, όλες moderate στην αμετάβλητη αλυσίδα Lighthouse/Sentry.

Το Astro παραμένει 7.4.8 και χρησιμοποιεί πλέον το κοινό ασφαλές root Sharp 0.35.5. Δεν υπάρχουν άλλα αντίγραφα Sharp ή dependency conflicts. Το README διορθώνει μόνο την απαίτηση Astro σε Node.js ≥22.23.4, διατηρώντας Node.js 24 για όλα τα tests. Πηγές εφαρμογής, design, tests, API contract και headers/CSP/noindex παραμένουν αμετάβλητα.

Validation: απλό npm ci, npm ls --all, static build και όλες οι υπάρχουσες σουίτες PASS· native PNG processing με 0 διαφορετικά decoded pixels πριν/μετά· axe 0· Lighthouse 100/100 σε 12 εκτελέσεις· 46 mock περιπτώσεις φόρμας και 8 screenshots καταστάσεων· 12 συγκρίσεις προς Βήμα 6 με 0 διαφορετικά pixels και νέες συγκρίσεις προς design. Καμία πραγματική υποβολή API. Τα προηγούμενα artifacts διατηρούνται.

[Αναφορά και συγκρίσεις](https://github.com/Ntainos/aspect-praxis-site/blob/security/sharp-upgrade/artifacts/sharp-upgrade/REPORT.md) · [Αποτελέσματα](https://github.com/Ntainos/aspect-praxis-site/blob/security/sharp-upgrade/artifacts/sharp-upgrade/results.json)

Προτείνεται review/έγκριση merge της συγκεκριμένης αλλαγής. Τα 4 moderate απαιτούν χωριστή ενημέρωση Sentry. Δεν έγινε merge ή deployment.

## Pull Request

Η δημιουργία PR μετά το push επέστρεψε `Forbidden` από το GitHub GraphQL API. Δεν έγινε παράκαμψη δικαιωμάτων. [Χειροκίνητη δημιουργία προς main](https://github.com/Ntainos/aspect-praxis-site/compare/main...security/sharp-upgrade?expand=1), με την περιγραφή του PR.md. Δεν έγινε merge ή deployment.
