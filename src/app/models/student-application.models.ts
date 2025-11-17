export interface StudentApplicationCreateInput {
  email: string;
  target_session_id: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  civility?: string;
  country_code?: string;
  city?: string;
  address?: string;
  date_of_birth?: string;
  attachments?: string[]; // Noms des fichiers (optionnel selon l'API)
}

export interface StudentApplicationOut {
  id: number;
  user_id: string;
  training_id: string;
  target_session_id: string;
  application_number: string;
  status: string;
  payment_id?: string;
  refusal_reason?: string;
  registration_fee?: number;
  training_fee?: number;
  currency: string;
  training_title: string;
  training_session_start_date: string;
  training_session_end_date: string;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  created_at: string;
  updated_at: string;
}

export interface StudentApplicationResponse {
  success: boolean;
  message: string;
  data: StudentApplicationOut;
}

export interface StudentAttachmentInput {
  name: string;
  file: File;
}

export interface StudentAttachmentOut {
  id: number;
  application_id: number;
  document_type: string;
  file_path: string;
  created_at: string;
  updated_at: string;
}

export interface StudentAttachmentResponse {
  success: boolean;
  message: string;
  data: StudentAttachmentOut;
}

export interface InitPaymentOut {
  payment_provider: string;
  amount: number;
  transaction_id: string;
  payment_link?: string;
  notify_url?: string;
  message?: string;
}

export interface InitPaymentOutSuccess {
  success: boolean;
  message: string;
  data: InitPaymentOut;
}
