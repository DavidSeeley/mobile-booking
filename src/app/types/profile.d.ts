// Shared ContactState used across profile.tsx, StepContact.tsx, StepReview.tsx
// Mirrors the `profile` table columns (enrollment form omits trumuv_payee_id from UI but type stays aligned)
export type ContactState = {
  company: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  remit_address1: string;
  remit_address2: string;
  remit_city: string;
  remit_state: string;
  remit_zip: string;
  trumuv_payee_id?: number;
};
