// Modèles pour les offres d'emploi

export interface JobOffer {
  id: string;
  reference: string;
  title: string;
  location: string;
  postal_code: string;
  contract_type: string;
  uncertain_term: boolean;
  start_date: string;
  end_date: string;
  weekly_hours: number;
  driving_license_required: boolean;
  submission_deadline: string;
  main_mission: string;
  responsibilities: string;
  competencies: string;
  profile: string;
  salary: number;
  benefits: string;
  submission_fee: number;
  currency: string;
  attachment: string[];
  conditions: string;
  created_at: string;
  updated_at: string;
}

export interface JobOfferResponse {
  data: JobOffer[];
  page: number;
  number: number;
  total_number: number;
}

export interface JobOfferPaginationParams {
  page?: number;
  per_page?: number;
  search?: string;
  location?: string;
  contract_type?: string;
  experience_level?: string;
  featured?: boolean;
  status?: string;
}

export interface JobOfferFilters {
  locations: string[];
  contractTypes: string[];
  experienceLevels: string[];
  searchTerm: string;
}

export interface JobOfferFilterOptions {
  locations: string[];
  contractTypes: string[];
  experienceLevels: string[];
}

// Interface pour les sessions d'emploi (si applicable)
export interface JobSession {
  id: string;
  job_offer_id: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  available_positions: number;
  status: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface JobSessionsResponse {
  data: JobSession[];
  page: number;
  number: number;
  total_number: number;
  message?: string;
  success: boolean;
}