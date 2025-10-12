export interface JobAttachmentInput {
  name: string;
  type: string;
  url: string;
}

export interface JobApplicationCreateInput {
  job_offer_id: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  civility?: string;
  country_code?: string;
  city?: string;
  address?: string;
  date_of_birth?: string;
  attachments?: JobAttachmentInput[];
}

export interface JobApplicationResponse {
  message: string;
  data: {
    job_application: {
      id: number;
      job_offer_id: string;
      application_number: string;
      status: string;
      refusal_reason: string | null;
      submission_fee: number;
      currency: string;
      payment_id: string | null;
      email: string;
      phone_number: string;
      first_name: string;
      last_name: string;
      civility: string | null;
      country_code: string | null;
      city: string | null;
      address: string | null;
      date_of_birth: string | null;
      created_at: string;
      updated_at: string;
    };
    payment: {
      payment_provider: string;
      amount: number;
      transaction_id: string;
      payment_link?: string;
      notify_url?: string;
      message?: string;
    };
  };
}

export interface JobAttachmentUploadResponse {
  message: string;
  data: {
    id: number;
    name: string;
    type: string;
    url: string;
    created_at: string;
    updated_at: string;
  }[];
}
