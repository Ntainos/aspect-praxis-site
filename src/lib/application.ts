export const APPLICATION_ENDPOINT = 'https://app.aspect-praxis.com/api/public/office-application';
export const MAX_PAYLOAD_BYTES = 16 * 1024;
export interface OfficeApplication {
  officeName: string;
  notaryName: string;
  email: string;
  phone: string;
  city: string;
  message: string;
  acceptTerms: boolean;
  website: string;
}
export type ApplicationField = Exclude<keyof OfficeApplication, 'website'>;
export interface FieldError { field: ApplicationField; message: string; }
export const fieldLabels: Record<ApplicationField, string> = {
  officeName:'Γραφείο', city:'Πόλη', notaryName:'Ονοματεπώνυμο', email:'Email',
  phone:'Τηλέφωνο', message:'Μήνυμα', acceptTerms:'Αποδοχή Όρων χρήσης'
};
export const sendingFailure = 'Η αποστολή δεν έγινε· γράψτε μας στο info@aspect-praxis.com';
export const tooLargeMessage = 'Το αίτημα είναι πολύ μεγάλο. Συντομεύστε τα στοιχεία ή το μήνυμα και δοκιμάστε ξανά.';
export const changedTermsMessage = 'Οι Όροι χρήσης άλλαξαν. Ανανεώστε τη σελίδα και διαβάστε ξανά τους Όρους χρήσης πριν υποβάλετε την αίτηση.';
export function validateApplication(data: OfficeApplication): FieldError[] {
  const errors: FieldError[] = [];
  const length = (s: string) => [...s].length;
  if(length(data.officeName)<2 || length(data.officeName)>200) errors.push({field:'officeName',message:'Γράψτε το γραφείο σας με 2–200 χαρακτήρες.'});
  if(!data.city) errors.push({field:'city',message:'Γράψτε την πόλη του γραφείου σας.'});
  if(length(data.notaryName)<2 || length(data.notaryName)>200) errors.push({field:'notaryName',message:'Γράψτε το ονοματεπώνυμό σας με 2–200 χαρακτήρες.'});
  if(!/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/u.test(data.email)) errors.push({field:'email',message:'Γράψτε ολόκληρο το email, π.χ. onoma@domain.gr.'});
  if(data.phone.length<5 || data.phone.length>40 || !/^[0-9 +()./\-]+$/.test(data.phone)) errors.push({field:'phone',message:'Γράψτε τηλέφωνο με 5–40 χαρακτήρες: ψηφία, κενά και + ( ) . / -.'});
  if(data.acceptTerms !== true) errors.push({field:'acceptTerms',message:'Για να στείλετε την αίτηση, αποδεχτείτε τους Όρους χρήσης.'});
  return errors;
}
export function applicationBody(data: OfficeApplication) {
  const body = JSON.stringify(data);
  return {body, bytes:new TextEncoder().encode(body).byteLength};
}
export function termsHaveChanged(message: string): boolean {
  const plain=message.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
  return /(?:^|[^\p{L}])(?:οροι|ορων|ορους|terms)(?:$|[^\p{L}])/u.test(plain) && /(αλλα|εκδοσ|ενημερω|τροποποι|version|changed|updated)/.test(plain);
}
