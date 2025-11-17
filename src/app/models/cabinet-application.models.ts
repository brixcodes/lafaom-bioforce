export interface CabinetApplicationCreateInput {
  company_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  registration_number: string;
  experience_years: number;
  qualifications: string;
  technical_proposal: string;
  financial_proposal: string;
  references: string;
}

export interface CabinetApplicationResponse {
  company_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  registration_number: string;
  experience_years: number;
  qualifications: string;
  technical_proposal: string;
  financial_proposal: string;
  references: string;
  id: string;
  status: string;
  payment_status: string;
  payment_reference: string;
  payment_amount: number;
  payment_currency: string;
  payment_date: string | null;
  account_created: boolean;
  credentials_sent: boolean;
  created_at: string;
  updated_at: string;
  payment_url: string;
}
