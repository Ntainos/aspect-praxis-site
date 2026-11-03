## Βήμα 3 · Πώς λειτουργεί και Είδη πράξεων

Προστίθενται μόνο `/pos-leitourgei` και `/eidi`, από main `3cf7b11` (PR #2). Περιλαμβάνονται οι εγκεκριμένες εισαγωγές/breadcrumbs, τα τρία βήματα με στατικές HTML/CSS/SVG απεικονίσεις και όλα τα κείμενα, η τελική ευθύνη, οι πέντε κατηγορίες/23 είδη και η κάρτα ανάπτυξης. Επαναχρησιμοποιούνται Layout/Header/Footer/Card/ApplicationClosing και Button μέσω του κλεισίματος.

Η μοναδική αλλαγή στην κοινή μπάρα είναι `aria-current="page"` και η ένδειξη ενεργού συνδέσμου, χωρίς αλλαγή γεωμετρίας ή JavaScript. Τα styles των νέων σελίδων είναι χωριστά. Δεν αλλάζουν Αρχική, `/odigos`, footer, layout, κλείσιμο, παλαιότερα styles ή design.

### Έλεγχοι / εκτέλεση

`npm ci`, `npm run build`, `npm run preview -- --host 127.0.0.1`. Με ενεργό preview στη θύρα 4321: `npm run test:pages`, `npm test`, `npm run test:home`, με τοπικό Chromium (`/usr/bin/chromium` ή `CHROMIUM_PATH`).

- Build: επιτυχία, 4 στατικές διαδρομές.
- Δύο νέες σελίδες × 1440/768/390: HTTP 200, ένας H1, `lang`, σωστά breadcrumbs/links/ενεργή πλοήγηση, χωρίς οριζόντια κύλιση ή JS errors.
- Ακριβή κείμενα και `[●]`, 5 κατηγορίες και 23 είδη σε σωστή σειρά, πλήρης λίστα στο mobile.
- Sticky header και μενού με Enter/Tab/Space/Escape, εστίαση, κλικ/αφή και κρυφά μη εστιάσιμα στοιχεία.
- Καμία νέα JS ή λειτουργικά controls στις εικονογραφήσεις. Τοπικά assets, μηδενικές εξωτερικές αιτήσεις/αποθήκευση.
- Axe A/AA: 0 παραβιάσεις σε όλα τα σενάρια. Lighthouse και στις δύο σελίδες: Accessibility **100**, Best Practices **100**.
- Πέρασαν ξανά οι έλεγχοι Βημάτων 1–2. Το design και τα artifacts δεν υπάρχουν στο dist.

### Εικόνες και αποκλίσεις

[Αναλυτική αναφορά](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-3-pages/artifacts/step-3/REPORT.md) με όλες τις εικόνες 1440/768/390, μετρήσεις ενοτήτων και επτά συγκεκριμένες κατηγορίες αποκλίσεων.

- [Πώς λειτουργεί · σύγκριση 1440](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-3-pages/artifacts/step-3/comparison-pos-leitourgei-1440.png)
- [Πώς λειτουργεί · σύγκριση 390](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-3-pages/artifacts/step-3/comparison-pos-leitourgei-390.png)
- [Είδη · σύγκριση 1440](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-3-pages/artifacts/step-3/comparison-eidi-1440.png)
- [Είδη · σύγκριση 390](https://github.com/Ntainos/aspect-praxis-site/blob/feat/step-3-pages/artifacts/step-3/comparison-eidi-390.png)

Design αριστερά, υλοποίηση δεξιά, ίδια κλίμακα χωρίς παραμόρφωση. Μετά από οπτικές διορθώσεις παραμένουν διαφορές σε αναδιπλώσεις, εσωτερικά κενά, SVG και σχηματικές γραμμές. Η έναρξη κλεισίματος της «Πώς λειτουργεί» είναι y=3717/6418 έναντι 3653/6194 (+64/+224 px σε desktop/mobile). Στα «Είδη» είναι 1330/2460 έναντι 1313/2434 (+17/+26 px). Δεν επιβλήθηκαν τεχνητά ύψη ή περικοπή. Το κοινό footer κρατά το εγκεκριμένο κατακόρυφο Aspect logo και τον τέταρτο νομικό σύνδεσμο, που διαφέρουν από την παλιά εικόνα.

### Όρια

Δεν υλοποιούνται «Ασφάλεια και δεδομένα», «Τιμές» ή φόρμα· οι σύνδεσμοι προετοιμάζουν τα επόμενα βήματα και οι προορισμοί παραμένουν 404. Η `/odigos` θα αποκλειστεί από την τελική παραγωγική δημοσίευση στο Βήμα 6. Καμία εργασία επόμενου βήματος, Cloudflare login, deployment ή merge.
