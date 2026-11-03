import {APPLICATION_ENDPOINT,MAX_PAYLOAD_BYTES,applicationBody,validateApplication,fieldLabels,sendingFailure,tooLargeMessage,changedTermsMessage,termsHaveChanged} from '../lib/application';
import type {OfficeApplication,ApplicationField,FieldError} from '../lib/application';
const form=document.querySelector<HTMLFormElement>('#office-application')!;
const fields=form.querySelector<HTMLFieldSetElement>('fieldset')!;
const submit=form.querySelector<HTMLButtonElement>('[type=submit]')!;
const submitText=submit.querySelector('span')!;
const status=form.querySelector<HTMLElement>('.application-status')!;
const summary=document.querySelector<HTMLElement>('#application-errors')!;
const summaryTitle=summary.querySelector<HTMLElement>('[data-summary-title]')!;
const errorLinks=summary.querySelector<HTMLUListElement>('[data-error-links]')!;
const serverError=summary.querySelector<HTMLElement>('[data-server-error]')!;
const success=document.querySelector<HTMLElement>('#application-success')!;
let pending=false;
let completed=false;
let termsChanged=false;
const control=(name:string)=>form.elements.namedItem(name) as HTMLInputElement|HTMLTextAreaElement;
function clearErrors(){
  summary.hidden=true;errorLinks.replaceChildren();errorLinks.hidden=true;serverError.hidden=true;serverError.replaceChildren();
  for(const input of form.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('[aria-invalid]')){
    input.removeAttribute('aria-invalid');
    const hint=document.getElementById(`${input.id}-hint`);
    if(hint)input.setAttribute('aria-describedby',hint.id);else input.removeAttribute('aria-describedby');
  }
  for(const error of form.querySelectorAll<HTMLElement>('.field-error'))error.hidden=true;
}
function showSummary(){summary.hidden=false;summary.focus();}
function showFieldErrors(errors:FieldError[]){
  summaryTitle.textContent=`Η αίτηση δεν στάλθηκε. Διορθώστε ${errors.length} ${errors.length===1?'σημείο':'σημεία'}:`;
  for(const {field,message} of errors){
    const input=control(field),error=document.getElementById(`${input.id}-error`)!;
    input.setAttribute('aria-invalid','true');
    input.setAttribute('aria-describedby',[document.getElementById(`${input.id}-hint`)?.id,error.id].filter(Boolean).join(' '));
    error.querySelector('[data-field-error-text]')!.textContent=message;error.hidden=false;
    const li=document.createElement('li'),link=document.createElement('a');link.href=`#${input.id}`;link.textContent=fieldLabels[field];li.append(link);errorLinks.append(li);
  }
  errorLinks.hidden=false;showSummary();
}
function showServerError(message:string){
  summaryTitle.textContent='Η αίτηση δεν στάλθηκε.';
  // API messages are untrusted text. Never parse them as HTML.
  const email='info@aspect-praxis.com',parts=message.split(email);
  parts.forEach((part,index)=>{serverError.append(document.createTextNode(part));if(index<parts.length-1){const a=document.createElement('a');a.href=`mailto:${email}`;a.textContent=email;serverError.append(a);}});
  serverError.hidden=false;showSummary();
}
summary.addEventListener('click',event=>{
  const link=(event.target as Element).closest<HTMLAnchorElement>('a[href^="#application-"]');
  if(link){event.preventDefault();const input=document.getElementById(link.hash.slice(1));input?.focus({preventScroll:true});input?.scrollIntoView({block:'center'});}
});
form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(pending||completed)return;
  clearErrors();
  if(termsChanged){showServerError(changedTermsMessage);return;}
  // Check the trap before building or sending a payload containing personal data.
  if(control('website').value!==''){showServerError(sendingFailure);return;}
  const value=(name:ApplicationField)=>control(name).value.trim();
  const data:OfficeApplication={officeName:value('officeName'),notaryName:value('notaryName'),email:value('email'),phone:value('phone'),city:value('city'),message:value('message'),acceptTerms:(control('acceptTerms') as HTMLInputElement).checked,website:''};
  const errors=validateApplication(data);
  if((control('email') as HTMLInputElement).validity.typeMismatch&&!errors.some(error=>error.field==='email'))errors.push({field:'email',message:'Γράψτε ολόκληρο το email, π.χ. onoma@domain.gr.'});
  if(errors.length){showFieldErrors(errors);return;}
  const {body,bytes}=applicationBody(data);
  if(bytes>MAX_PAYLOAD_BYTES){showServerError(tooLargeMessage);return;}
  pending=true;fields.disabled=true;submit.disabled=true;form.setAttribute('aria-busy','true');status.textContent='Η αίτησή σας αποστέλλεται…';submitText.textContent='Αποστολή…';
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20_000);
  try{
    const response=await fetch(APPLICATION_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body,credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:controller.signal});
    if(response.status===200){
      const result:unknown=await response.json();
      if(result!==null&&typeof result==='object'&&!Array.isArray(result)&&'ok' in result&&result.ok===true){completed=true;form.reset();form.hidden=true;success.hidden=false;success.focus();}
      else showServerError(sendingFailure);
    }else if(response.status===400){
      const result:unknown=await response.json();
      if(result!==null&&typeof result==='object'&&'error' in result&&typeof result.error==='string'&&result.error.trim()){
        termsChanged=termsHaveChanged(result.error);
        if(termsChanged)(control('acceptTerms') as HTMLInputElement).checked=false;
        showServerError(result.error+(termsChanged?` ${changedTermsMessage}`:''));
      }else showServerError(sendingFailure);
    }else if(response.status===413)showServerError(tooLargeMessage);
    else if(response.status===429)showServerError('Πολλές αιτήσεις· δοκιμάστε ξανά σε λίγο ή γράψτε στο info@aspect-praxis.com');
    else showServerError(sendingFailure);
  }catch{showServerError(sendingFailure);}
  finally{
    clearTimeout(timeout);pending=false;fields.disabled=false;submit.disabled=completed||termsChanged;form.removeAttribute('aria-busy');status.textContent='';submitText.textContent='Υποβολή αίτησης';
  }
});
// Disabled until the submit handler is attached: no native, differently encoded POST.
form.noValidate=true;submit.disabled=false;
