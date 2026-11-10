# Astro 7.4.8: διόρθωση critical και διατήρηση εμφάνισης/CSP

Η μετάβαση Astro 5.18.2 → 7.4.8 εξαλείφει τις εγγραφές Astro, esbuild, Zod και zod-to-ts, συμπεριλαμβανομένης της critical GHSA-26w7-cxv4-gfx2. Το audit μειώνεται από 9 σε 5: 0 critical, 1 high, 4 moderate, 0 low. Παραμένουν ρητά το root Sharp 0.34.5 και η αλυσίδα Sentry.

Το Astro επιλύει το εγκεκριμένο μεταβατικό Sharp 0.35.5. Η άμεση δήλωση sharp ^0.34.0 και οι 126 ονομασίες πακέτων της αλυσίδας Lighthouse διατηρούν τις ίδιες εκδόσεις. Το lockfile δημιουργήθηκε με την κανονική npm επιλογή install-strategy=nested και επαληθεύτηκε με απλό npm ci, χωρίς overrides ή παράκαμψη peers.

Η μοναδική αλλαγή πηγών αυξάνει την ειδικότητα του selector .closing-email a μέσα στο .application-closing: διατηρεί το εγκεκριμένο λευκό email ανεξάρτητα από τη νέα σειρά CSS chunks. Configuration, design, κείμενα, components, API contract, tests και public/_headers είναι αμετάβλητα.

Validation: καθαρό npm ci, npm ls και static build σε Node 24.22.1· όλες οι υπάρχουσες σουίτες και test:security PASS· 46 mock περιπτώσεις φόρμας χωρίς πραγματικά POST· axe 0· Lighthouse 100/100 σε 12 εκτελέσεις· μηδέν διαφορετικά pixels σε 12 συγκρίσεις προς Βήμα 6. Νέες συγκρίσεις προς design περιλαμβάνονται στην αναφορά. Η αυστηρή CSP και το γενικό noindex/nofollow παραμένουν ίδια.

[Πλήρης αναφορά](https://github.com/Ntainos/aspect-praxis-site/blob/security/astro-7-migration/artifacts/astro-migration/REPORT.md) · [Αποτελέσματα](https://github.com/Ntainos/aspect-praxis-site/blob/security/astro-7-migration/artifacts/astro-migration/results.json)

Προτείνεται review/έγκριση merge της συγκεκριμένης migration. Οι εκκρεμότητες Sharp/Sentry και οι έλεγχοι πραγματικής υποδομής/API απαιτούν χωριστή εργασία πριν δημόσια λειτουργία. Δεν έγινε merge ή deployment.

## Pull Request

Η δημιουργία PR μετά το push της ολοκληρωμένης migration επέστρεψε `Forbidden` από το GitHub GraphQL API. Δεν έγινε παράκαμψη δικαιωμάτων. [Χειροκίνητη δημιουργία PR προς main](https://github.com/Ntainos/aspect-praxis-site/compare/main...security/astro-7-migration?expand=1), με την περιγραφή του PR.md. Δεν έγινε merge ή deployment.
