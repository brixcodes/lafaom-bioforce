// Interfaces pour les actualités (basées sur la structure réelle du backend /api/v1/blog/posts)
export interface News {
  id: number;
  user_id: string;
  author_name: string;
  title: string;
  slug: string;
  cover_image: string | null;
  summary: string;
  content?: string;
  published_at: string | null;
  tags: string;
  category_id: number;
  created_at: string;
  updated_at: string;
}

export interface NewsResponse {
  data: News[];
  page: number;
  number: number;
  total_number: number;
}

// Interface pour les catégories de blog
export interface BlogCategory {
  id: number;
  title: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: BlogCategory;
}

// Interfaces pour les offres d'emploi (basées sur la structure réelle du backend)
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

// Interfaces pour les offres du cabinet
export interface CabinetOffer {
  id: string;
  title: string;
  description: string;
  service_type: string;
  duration?: string;
  location: string;
  requirements: string;
  benefits: string[];
  status: 'active' | 'inactive' | 'closed';
  application_deadline?: string;
  created_at: string;
  updated_at: string;
  department?: string;
  experience_level: 'entry' | 'mid' | 'senior' | 'executive';
  skills_required?: string[];
}

export interface CabinetOfferResponse {
  data: CabinetOffer[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    last_page: number;
  };
}

// Interface pour les candidatures
export interface JobApplication {
  id: string;
  job_offer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  civility?: string;
  country_code: string;
  city: string;
  address: string;
  date_of_birth?: string;
  attachments: Array<{
    name: string;
    type: string;
  }>;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface JobApplicationResponse {
  data: JobApplication;
  message: string;
}

// Interface pour les pièces jointes
export interface JobAttachment {
  id: string;
  name: string;
  type: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface JobAttachmentResponse {
  data: JobAttachment[];
  message: string;
}

// Interface générique pour les réponses API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

// Interface pour la pagination
export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Interface pour les filtres de recherche
export interface SearchFilters {
  search?: string;
  category?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  location?: string;
  employment_type?: string;
  experience_level?: string;
}
