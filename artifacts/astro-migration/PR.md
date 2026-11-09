# Astro 7 migration: απαιτείται έγκριση μεταβατικού Sharp

Η προσομοίωση της μετάβασης Astro 5.18.2 → 7.4.7 προσθέτει Sharp 0.35.5 κάτω από το Astro, ενώ το άμεσο Sharp 0.34.5 παραμένει. Και το 7.4.8 δηλώνει Sharp ^0.35.4. Σύμφωνα με τον ρητό περιορισμό scope, η εγκατάσταση σταμάτησε πριν γίνει αυτή η αλλαγή.

Η παράδοση περιέχει μόνο τεκμηρίωση και αποδεικτικά. Manifest/lockfile, πηγές, design, configuration, tests και headers είναι αμετάβλητα. Δεν αποτελεί επιτυχημένη migration ούτε πρόταση για merge.

Έλεγχοι: καθαρό npm ci, npm ls και build της βάσης πέρασαν. Το audit παραμένει 9 (1 critical, 3 high, 4 moderate, 1 low), με 0 διορθώσεις. Δεν εκτελέστηκαν browser/Lighthouse/οπτικές δοκιμές υποψηφίου, αφού δεν εγκαταστάθηκε Astro 7.

Απαιτείται απόφαση μόνο για την πρόσθετη μεταβατική εξάρτηση Sharp 0.35.5. Το root Sharp και το Sentry παραμένουν εκτός scope. Έπειτα απαιτείται πλήρης επανέλεγχος πριν οποιαδήποτε έγκριση.

[Αναφορά](https://github.com/Ntainos/aspect-praxis-site/blob/security/astro-7-migration/artifacts/astro-migration/REPORT.md) · [Αποτελέσματα](https://github.com/Ntainos/aspect-praxis-site/blob/security/astro-7-migration/artifacts/astro-migration/results.json)

Κανένα merge ή deployment.
