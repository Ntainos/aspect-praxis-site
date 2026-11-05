# Προετοιμασία SEO και εκκρεμοτήτων δημοσίευσης

Το site χρειάζεται έγκριση μεταδεδομένων και συγκεντρωμένη καταγραφή εκκρεμοτήτων πριν από τη δημόσια λειτουργία. Αυτό το PR προσθέτει μόνο τρία έγγραφα στο artifacts/prelaunch/, από τη βάση main `a449e16`, χωρίς ενεργή αλλαγή SEO ή εφαρμογής.

- [Προτάσεις SEO](SEO_PROPOSALS.md): έξι ακριβείς σημερινοί τίτλοι, διατήρησή τους, αυτούσιες περιγραφές 16–128 χαρακτήρων με πηγές/στήριξη και σημεία έγκρισης. Μελλοντικός σχεδιασμός canonical, sitemap, robots, ελληνικού Open Graph, Search Console και noindex για pages.dev.
- [Εκκρεμότητες δημοσίευσης](BLOCKERS.md): σειρά επιβεβαίωσης εταιρείας, νομικών, API/CORS, email, πακέτων/[●], πραγματικών ισχυρισμών ασφάλειας, DNS/email records και παραγωγικών headers/cookies, με υπεύθυνο και ζητούμενο τεκμήριο.

**Απαιτείται έγκριση ιδιοκτήτη και Claude πριν από οποιαδήποτε ενεργή εφαρμογή SEO.** Το γενικό `X-Robots-Tag: noindex, nofollow` παραμένει ανέπαφο και ενεργό μέχρι έγκριση δημόσιας δημοσίευσης. Δεν δημιουργήθηκε εικόνα Open Graph.

## Έλεγχος αμετάβλητης εφαρμογής

Το diff περιορίζεται στα τρία Markdown αυτού του φακέλου. Τα src/, public/, design/, tests, dependencies και οι ρυθμίσεις build είναι ίδια με τη βάση. Το υπάρχον site και η εμφάνισή του δεν αλλάζουν. Δεν απαιτείται επανάληψη build/browser tests για έγγραφα που δεν περιλαμβάνονται στη στατική έξοδο. Ελέγχθηκαν αυτούσιες περιγραφές/μήκη, ακριβείς τίτλοι από πηγές Layout/σελίδων και οι τοπικοί σύνδεσμοι τεκμηρίωσης. Δεν δηλώνονται νέα αποτελέσματα Lighthouse ή νέος έλεγχος παραγωγής.

Δεν έγινε merge, deployment, Cloudflare/DNS/domain/email setup ή αλλαγή production branch. Το cf-placeholder δεν τροποποιήθηκε. Οι υφιστάμενες οπτικές αποκλίσεις δεν επανεκτιμήθηκαν ούτε παρουσιάζονται ως διορθωμένες· παραμένει η [αναφορά Βήματος 6](../step-6/REPORT.md).

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

## Κατάσταση παράδοσης

Το commit τεκμηρίωσης `e6dec2a` ανέβηκε στο branch. Η κανονική προσπάθεια δημιουργίας PR επέστρεψε `Post "https://api.github.com/graphql": Forbidden`. Δεν επιχειρήθηκε παράκαμψη. [Χειροκίνητη δημιουργία PR προς main](https://github.com/Ntainos/aspect-praxis-site/compare/main...docs/prelaunch-seo-review?expand=1).
