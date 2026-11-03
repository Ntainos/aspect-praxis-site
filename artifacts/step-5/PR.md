# Βήμα 5: Σελίδα αίτησης και ασφαλής υποβολή

Προστίθεται η έκτη δημόσια σελίδα `/aitisi`, με την εγκεκριμένη εισαγωγή, φόρμα και πλαίσιο «Τι γίνεται μετά». Το κουμπί Αίτηση της μπάρας διατηρεί την κενή θέση του. Δεν υπάρχει ApplicationClosing. Τα κοινά components, οι προηγούμενες σελίδες, το εγκεκριμένο footer και το `design/` παραμένουν ανέπαφα.

Η φόρμα χρησιμοποιεί μικρό τοπικό script, χωρίς νέα εξάρτηση. Ελέγχει υποχρεωτικά πεδία, μήκη 2–200 / 5–40, email, αποδοχή Όρων και πραγματικό μέγεθος UTF-8 του JSON έως 16384 bytes. Τα phone / city απαιτούνται μόνο στη συγκεκριμένη ορατή φόρμα, όπως ζητήθηκε· παραμένουν προαιρετικά στο συμβόλαιο του server. Όλα τα `[●]` διατηρούνται.

Στέλνει μόνο τα οκτώ συμβατικά κλειδιά στο προβλεπόμενο endpoint, με boolean acceptTerms και κενό website. Δεν επινοείται termsVersion. Το κρυφό honeypot εμποδίζει την αποστολή πριν κατασκευαστεί payload προσωπικών στοιχείων. Δεν αποθηκεύονται στοιχεία σε cookies, storage, logs ή analytics.

Υπάρχουν σύνοψη και συνδεδεμένα σφάλματα πεδίων, ορατή εστίαση, live regions, pending state, ένα μόνο εκκρεμές αίτημα και timeout 20 δευτερολέπτων. Επιτυχία εμφανίζεται μόνο μετά από 200 με boolean `ok:true`, κατόπιν καθαρίζεται και αντικαθίσταται η φόρμα. Τα στοιχεία παραμένουν σε αποτυχία. Τα μηνύματα API εισάγονται ως κείμενο. Αλλαγή Όρων απαιτεί νέα φόρτωση και δεν διατηρεί παλαιά συναίνεση. Χωρίς JavaScript δεν πραγματοποιείται εγγενές POST.

## Έλεγχοι

- `npm run build`, `npm run test:application`, `npm test`, `npm run test:home`, `npm run test:pages`, `npm run test:data-pricing`: επιτυχία.
- **46 σενάρια** φόρμας / προσομοιωμένου API, με **28 αναχαιτισμένα POST και 0 πραγματικές εξωτερικές κλήσεις**.
- Καλύπτονται 200, 400, αλλαγή Όρων, 403, 413, 429, δίκτυο, timeout, άκυρες / απρόσμενες απαντήσεις, redirect, μη επιλεγμένοι Όροι, άκυρο email, κενά πεδία, τηλέφωνο, όρια μήκους, 16384/16385 bytes UTF-8, honeypot, διπλή υποβολή, επανυποβολή και ακριβές JSON χωρίς termsVersion.
- Browser tests στα **1440 / 768 / 390**, axe **0**, Lighthouse Accessibility **100**, Best Practices **100** σε κινητό και υπολογιστή.
- Keyboard / checkbox / menu / focus / sticky header / aria-expanded: επιτυχία. Μηδενικά cookies, storage, απρόσμενες εξωτερικές αιτήσεις και JavaScript errors. Καμία οριζόντια κύλιση.
- Τα **33 προηγούμενα PNG είναι ακριβώς ίδια σε bytes** με το main `13c581e`.
- Από το test του Βήματος 4 αφαιρέθηκε μόνο η παρωχημένη απαίτηση απουσίας `/aitisi`. Όλοι οι υπόλοιποι έλεγχοι διατηρήθηκαν.
- `design/` και artifacts απουσιάζουν από το `dist/`.

## Στιγμιότυπα και συγκρίσεις

- Αρχική φόρμα: [1440](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-5-application/artifacts/step-5/aitisi-1440.png), [768](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-5-application/artifacts/step-5/aitisi-768.png), [390](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-5-application/artifacts/step-5/aitisi-390.png).
- Σύγκριση, αναφορά αριστερά / υλοποίηση δεξιά, ίδια κλίμακα χωρίς παραμόρφωση: [1440](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-5-application/artifacts/step-5/comparison-aitisi-1440.png), [390](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-5-application/artifacts/step-5/comparison-aitisi-390.png).
- Λάθη: [1440](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-5-application/artifacts/step-5/validation-errors-1440.png), [390](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-5-application/artifacts/step-5/validation-errors-390.png).
- Επιτυχία με mock: [1440](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-5-application/artifacts/step-5/success-1440.png), [390](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-5-application/artifacts/step-5/success-390.png).
- Σφάλμα server με mock: [1440](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-5-application/artifacts/step-5/server-error-1440.png), [390](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-5-application/artifacts/step-5/server-error-390.png).

## Μετρήσεις

Αρχή / ύψος σε CSS px, μετά τη φόρτωση Geologica. Τα όρια φόρμας του PNG είναι εκτίμηση του πλαισίου περιεχομένου μαζί με τη σημείωση απορρήτου. Στρογγυλοποίηση ανεξάρτητα.

| Πλάτος | Ενότητα | Αναφορά αρχή / ύψος | Υλοποίηση αρχή / ύψος |
|---|---|---:|---:|
| 1440 | Εισαγωγή | 76 / 287 | 77 / 286 |
| 1440 | Κύρια ενότητα | 363 / 977 | 363 / 972 |
| 1440 | Φόρμα | 427 / ≈817 | 427 / 812 |
| 1440 | Τι γίνεται μετά | 427 / 471 | 427 / 471 |
| 1440 | Footer | 1340 / 410 | 1335 / 448 |
| 390 | Εισαγωγή | 64 / 321 | 65 / 320 |
| 390 | Κύρια ενότητα | 385 / 1826 | 385 / 1828 |
| 390 | Φόρμα | 449 / ≈1156 | 449 / 1155 |
| 390 | Τι γίνεται μετά | 1653 / 494 | 1652 / 497 |
| 390 | Footer | 2211 / 923 | 2212 / 1152 |

Οι μετρήσεις στα 768 px, όλα τα τεχνικά αποτελέσματα, τα Lighthouse JSON και τα hashes των προηγούμενων εικόνων βρίσκονται στο [REPORT.md](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-5-application/artifacts/step-5/REPORT.md). Τα αναλυτικά σενάρια βρίσκονται στο [mock-api-results.json](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-5-application/artifacts/step-5/mock-api-results.json).

## Διαφορές και εκκρεμότητες

- Έναρξη footer: −5 px στα 1440, +1 px στα 390. Μικρές διαφορές εσωτερικών κενών / αναδιπλώσεων. Το πλαίσιο δεξιά είναι ίδιο στον υπολογιστή· στο κινητό αρχίζει 1 px νωρίτερα και είναι 3 px ψηλότερο.
- Τα περιγράμματα πεδίων είναι ελαφρώς πιο σκούρα για αντίθεση περίπου 3,11:1. Τα screenshots καταστάσεων περιλαμβάνουν το απαραίτητο περίγραμμα εστίασης της σύνοψης / επιτυχίας.
- Το υπάρχον εγκεκριμένο κατακόρυφο Aspect, ο τέταρτος νομικός σύνδεσμος και οι προσβάσιμοι στόχοι του footer διαφέρουν από τα παλαιότερα PNG. Δεν αλλάχθηκαν. Συνολικό ύψος: +33 px στον υπολογιστή και +230 px στο κινητό.
- Απλή φόρτωση: 0 εξωτερικές αιτήσεις. Η παραγωγική υποβολή προβλέπει το συγκεκριμένο POST μόνο μετά από ενέργεια χρήστη. **Ο πραγματικός server δεν κλήθηκε**: η πραγματική παραλαβή και το production CORS παραμένουν εκτός δοκιμών, όπως ζητήθηκε. Δεν προστέθηκε proxy ή αλλαγή CORS.

Δεν έγινε merge, deployment, Cloudflare setup, Astra, τελικό φινίρισμα ή Βήμα 6. Σε περίπτωση `Forbidden` από το API, η παρούσα περιγραφή είναι έτοιμη για χειροκίνητο άνοιγμα PR από τον ιδιοκτήτη.
