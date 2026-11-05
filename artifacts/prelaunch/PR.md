# Draft: Εγκεκριμένα metadata και εκκρεμότητες δημοσίευσης

**Το PR δεν εγκρίνει ούτε ενεργοποιεί δημόσια δημοσίευση**. Να παραμείνει Draft, χωρίς merge.

Βάση: docs/prelaunch-seo-review στο `3b6155a`, στόχος main στο `a449e16`. Περιλαμβάνει τα τρία αρχεία τεκμηρίωσης του προηγούμενου branch.

Εφαρμόζονται μόνο τα έξι ρητά εγκεκριμένα title/description με προαιρετικό SEO prop στο κοινό Layout. Τα ορατά κείμενα, H1, CSS, εικονογραφήσεις, φόρμα, API, headers και noindex δεν αλλάζουν. Ενημερώνονται οι εγκεκριμένες πηγές και οι εκκρεμότητες του Claude.

- [Τελικά metadata και πηγές](SEO_PROPOSALS.md)
- [Εκκρεμότητες](BLOCKERS.md)
- [Πλήρης αναφορά και νέα αποτελέσματα](PUBLICATION_DRAFT_REPORT.md)

Δεν προστίθενται canonical/sitemap/robots/Open Graph/JSON-LD/Search Console/analytics/cookie banner. Το cf-placeholder, Cloudflare Access, production branch, DNS και main δεν τροποποιούνται.

Όλοι οι έλεγχοι και οι νέες οπτικές συγκρίσεις βρίσκονται στο publication-draft/. Οι δοκιμές φόρμας χρησιμοποιούν αποκλειστικά mock API. Τα αποτελέσματα είναι τοπικά και δεν πιστοποιούν παραγωγική λειτουργία.

## Υφιστάμενα οπτικά τεκμήρια

Στις συγκρίσεις του Βήματος 6 η εγκεκριμένη εικόνα είναι αριστερά και η τότε υλοποίηση δεξιά. Οι παρακάτω σύνδεσμοι δίνουν και την αντίστοιχη πρωτότυπη αναφορά. Δεν δημιουργήθηκαν νέες εικόνες επειδή δεν έγιναν οπτικές αλλαγές.

| Σελίδα | Σύγκριση 1440 | Αναφορά 1440 | Σύγκριση 390 | Αναφορά 390 |
| --- | --- | --- | --- | --- |
| Αρχική | [εικόνα](../step-6/comparison-index-1440.png) | [σχέδιο](../../design/eikones/index__1440.png) | [εικόνα](../step-6/comparison-index-390.png) | [σχέδιο](../../design/eikones/index__390.png) |
| Πώς λειτουργεί | [εικόνα](../step-6/comparison-pos-leitourgei-1440.png) | [σχέδιο](../../design/eikones/pos-leitourgei__1440.png) | [εικόνα](../step-6/comparison-pos-leitourgei-390.png) | [σχέδιο](../../design/eikones/pos-leitourgei__390.png) |
| Είδη πράξεων | [εικόνα](../step-6/comparison-eidi-1440.png) | [σχέδιο](../../design/eikones/eidi__1440.png) | [εικόνα](../step-6/comparison-eidi-390.png) | [σχέδιο](../../design/eikones/eidi__390.png) |
| Ασφάλεια και δεδομένα | [εικόνα](../step-6/comparison-dedomena-1440.png) | [σχέδιο](../../design/eikones/dedomena__1440.png) | [εικόνα](../step-6/comparison-dedomena-390.png) | [σχέδιο](../../design/eikones/dedomena__390.png) |
| Τιμές | [εικόνα](../step-6/comparison-times-1440.png) | [σχέδιο](../../design/eikones/times__1440.png) | [εικόνα](../step-6/comparison-times-390.png) | [σχέδιο](../../design/eikones/times__390.png) |
| Αίτηση | [εικόνα](../step-6/comparison-aitisi-1440.png) | [σχέδιο](../../design/eikones/aitisi__1440.png) | [εικόνα](../step-6/comparison-aitisi-390.png) | [σχέδιο](../../design/eikones/aitisi__390.png) |

## Νέα αποτελέσματα

PASS: production build, έξι ακριβή μοναδικά ζεύγη title/description, σωστή ελληνική 404, ίδιο γενικό noindex/CSP, όλες οι υπάρχουσες σουίτες. Axe 0, Lighthouse Accessibility / Best Practices 100/100 και στις 12 εκτελέσεις. Μηδέν διαφορετικά ορατά pixels σε 12 συγκρίσεις προς Βήμα 6. Αποκλειστικά mock API, χωρίς πραγματική εξωτερική POST. [Αναλυτικά αποτελέσματα και συγκρίσεις](PUBLICATION_DRAFT_REPORT.md).

## Κατάσταση Draft PR

Το commit υλοποίησης `5ef078a` ανέβηκε επιτυχώς. Η κανονική προσπάθεια `gh pr create --draft` προς main επέστρεψε `Post "https://api.github.com/graphql": Forbidden`. Δεν επιχειρήθηκε παράκαμψη και δεν δημιουργήθηκε PR από το εργαλείο.

[Χειροκίνητη δημιουργία](https://github.com/Ntainos/aspect-praxis-site/compare/main...feat/publication-seo-draft?expand=1): πρέπει να επιλεγεί **Create draft pull request**, με την έτοιμη περιγραφή στο artifacts/prelaunch/PR.md. Να παραμείνει Draft, χωρίς merge. Το PR δεν εγκρίνει ούτε ενεργοποιεί δημόσια δημοσίευση.
