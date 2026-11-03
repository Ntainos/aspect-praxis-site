# Βήμα 4: Ασφάλεια και δεδομένα / Τιμές

Προστίθενται οι στατικές σελίδες `/dedomena` και `/times` από τα εγκεκριμένα κείμενα και PNG. Η πρώτη παρουσιάζει χωριστά την αποθήκευση εντός ΕΕ, τον πάροχο στις ΗΠΑ, τις δύο διακριτές αποστολές, το πλασματικό παράδειγμα και τα 10 μέτρα. Η δεύτερη εμφανίζει τρεις ίδιες ενδεικτικές κάρτες στον υπολογιστή, μία στο κινητό και τις τρεις εγκεκριμένες παροχές. Όλα τα `[●]` διατηρούνται.

Επαναχρησιμοποιούνται τα κοινά components, με νέο στατικό διάγραμμα και τοπικό CSS. Δεν αλλάζουν η Αρχική, το «Πώς λειτουργεί», τα «Είδη πράξεων», τα κοινά components ή το `design/`. Διατηρούνται το εγκεκριμένο κατακόρυφο λογότυπο Aspect και οι τέσσερις νομικοί σύνδεσμοι. Προστίθεται ο εγκεκριμένος σύνδεσμος της Σύμβασης μέσα στα αναλυτικά μέτρα.

## Έλεγχοι

- `npm run build`, `npm run test:data-pricing`, `npm test`, `npm run test:home`, `npm run test:pages`: επιτυχία.
- Νέες σελίδες σε 1440 / 768 / 390 px: axe 0, χωρίς οριζόντια κύλιση, εξωτερικές αιτήσεις, cookies, storage, αποτυχημένες αιτήσεις ή JavaScript errors.
- Lighthouse και για τις δύο σελίδες, υπολογιστής και κινητό: Accessibility **100**, Best Practices **100**.
- Μενού με Enter / Space / Tab / Escape / touch, aria-expanded, επιστροφή εστίασης, μη εστιάσιμα κρυφά links, sticky header και άγκυρα: επιτυχία.
- Έλεγχοι ακριβούς περιεχομένου, `[●]`, σειράς και των 10 μέτρων, νομικών συνδέσμων και 3/1 ορατών καρτών: επιτυχία.
- Τα **23 προηγούμενα PNG παραμένουν ακριβώς ίδια σε bytes** με το main `5989d64`.
- Καμία νέα εξάρτηση ή JavaScript: τα scripts των δύο νέων σελίδων είναι ίδια με της Αρχικής. Το `dist/` δεν περιλαμβάνει `design/` ή artifacts.

## Συγκρίσεις και στιγμιότυπα

Αναφορά αριστερά, υλοποίηση δεξιά, στην ίδια κλίμακα και χωρίς τέντωμα:

- [Δεδομένα 1440](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-4-data-pricing/artifacts/step-4/comparison-dedomena-1440.png) · [390](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-4-data-pricing/artifacts/step-4/comparison-dedomena-390.png).
- [Τιμές 1440](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-4-data-pricing/artifacts/step-4/comparison-times-1440.png) · [390](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-4-data-pricing/artifacts/step-4/comparison-times-390.png).
- Στιγμιότυπα δεδομένων: [1440](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-4-data-pricing/artifacts/step-4/dedomena-1440.png), [768](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-4-data-pricing/artifacts/step-4/dedomena-768.png), [390](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-4-data-pricing/artifacts/step-4/dedomena-390.png).
- Στιγμιότυπα τιμών: [1440](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-4-data-pricing/artifacts/step-4/times-1440.png), [768](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-4-data-pricing/artifacts/step-4/times-768.png), [390](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-4-data-pricing/artifacts/step-4/times-390.png).

## Μετρήσεις

Αρχή / ύψος σε CSS px, μετά τη φόρτωση Geologica. Στρογγυλοποίηση ανεξάρτητα. Στις Τιμές η στήλη «Κύριο περιεχόμενο» περιλαμβάνει κάρτες, παροχές και τελική σημείωση.

| Σελίδα / πλάτος | Εισαγωγή | Κύριο περιεχόμενο | Αναλυτικά μέτρα | Κοινό κλείσιμο | Διαφορά αρχής κλεισίματος |
|---|---:|---:|---:|---:|---:|
| /dedomena 1440 | 77 / 286 | 363 / 1311 | 1674 / 1141 | 2815 / 502 | +5 έναντι 2810 |
| /dedomena 390 | 65 / 293 | 358 / 2307 | 2666 / 1883 | 4548 / 775 | +2 έναντι 4546 |
| /times 1440 | 77 / 227 | 304 / 816 | — | 1120 / 502 | +2 έναντι 1118 |
| /times 390 | 65 / 255 | 320 / 957 | — | 1278 / 775 | +6 έναντι 1272 |

Αναλυτικός πίνακας αναφοράς → υλοποίησης ανά ενότητα, οι μετρήσεις στα 768 px, τα Lighthouse JSON και όλα τα τεχνικά αποτελέσματα βρίσκονται στο [REPORT.md](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-4-data-pricing/artifacts/step-4/REPORT.md) και στο [results.json](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-4-data-pricing/artifacts/step-4/results.json).

## Διαφορές που παραμένουν

- Μικρές αποκλίσεις αναδίπλωσης, εσωτερικών κενών και περιγραμμάτων CSS/SVG. Το διάγραμμα έχει ύψος 543 αντί περίπου 542 px στον υπολογιστή και 1185 αντί περίπου 1186 px στο κινητό. Τα παραδείγματα στο κινητό αρχίζουν περίπου 8 px νωρίτερα. Οι αποκλίσεις έναρξης κλεισίματος είναι στον παραπάνω πίνακα.
- Το υπάρχον κοινό κλείσιμο διατηρεί τα διαφορετικά σπασίματα κειμένου και το ύψος του. Η υπάρχουσα μπάρα και το footer έχουν μικρές προϋπάρχουσες διαφορές από τα PNG, όπως η απουσία διαχωριστικής γραμμής πριν από το footer.
- Το εγκεκριμένο κατακόρυφο Aspect, ο τέταρτος νομικός σύνδεσμος και οι προσβάσιμοι στόχοι του footer διαφέρουν από τα παλαιότερα PNG. Συνολικό ύψος /dedomena: +68 px στα 1440, +231 px στα 390· /times: +66 και +233 px. Τα κοινά components διατηρήθηκαν αυτούσια.
- Η Σύμβαση μέσα στα μέτρα έχει πλέον την εγκεκριμένη υπογράμμιση και εστίαση συνδέσμου.

Οι σύνδεσμοι προς `/aitisi` παραμένουν προετοιμασμένοι για το Βήμα 5. Δεν προστίθεται φόρμα. Δεν έγινε Cloudflare, deployment ή merge.

Αν το API αρνηθεί τη δημιουργία PR με `Forbidden`, η παρούσα περιγραφή είναι έτοιμη για χειροκίνητο άνοιγμα από τον ιδιοκτήτη.
