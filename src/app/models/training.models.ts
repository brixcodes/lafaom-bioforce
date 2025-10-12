// Interface pour les formations
export interface Training {
  id: string; // Changé de number à string pour correspondre à l'API
  title: string;
  status: string;
  duration: number;
  duration_unit: string;
  specialty_id: number;
  info_sheet?: string;
  training_type: string;
  type: string; // Ajouté pour correspondre aux templates
  slug: string; // Ajouté pour correspondre aux templates
  presentation: string;
  benefits?: BenefitInput[];
  strengths?: StrengthInput[];
  target_skills: string;
  program: string;
  target_audience: string;
  prerequisites?: string;
  enrollment: string;
  created_at: string;
  updated_at: string;
}

// Interface pour les avantages
export interface BenefitInput {
  image: string;
  content: string;
  url: string;
}

// Interface pour les points forts
export interface StrengthInput {
  image: string;
  content: string;
}

// Interface pour la réponse de l'API
export interface TrainingResponse {
  data: Training[];
  page: number;
  number: number;
  total_number: number;
  message?: string;
  success: boolean;
}

// Interface pour les paramètres de pagination
export interface TrainingPaginationParams {
  page?: number;
  per_page?: number;
  page_size?: number; // Ajouté pour compatibilité
  search?: string;
  type?: string;
  location?: string;
}

// Interface pour les sessions de formation
export interface TrainingSession {
  id: string;
  training_id: string;
  center_id?: number;
  start_date?: string;
  end_date?: string;
  registration_deadline: string;
  available_slots?: number;
  status: string;
  registration_fee?: number;
  training_fee?: number;
  currency: string;
  location?: string; // Ajouté pour afficher la ville du centre
  moodle_course_id?: number;
  created_at: string;
  updated_at: string;
}

// Interface pour la réponse des sessions
export interface TrainingSessionsResponse {
  data: TrainingSession[];
  page: number;
  number: number;
  total_number: number;
  message?: string;
  success: boolean;
}

// Interface pour les paramètres de filtrage des sessions
export interface TrainingSessionFilters {
  page?: number;
  page_size?: number;
  status?: string;
  center_id?: number;
  order_by?: 'created_at' | 'registration_deadline' | 'start_date';
  asc?: 'asc' | 'desc';
}

// Interface pour les centres d'organisation
export interface OrganizationCenter {
  id: number;
  name: string;
  address: string;
  city: string;
  postal_code?: string;
  country_code: string;
  telephone_number: string;
  mobile_number: string;
  email: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  organization_type: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Interface pour la réponse des centres d'organisation
export interface OrganizationCenterResponse {
  data: OrganizationCenter;
  message?: string;
  success: boolean;
}

// Interface pour les spécialités
export interface Specialty {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Interface pour les options de filtres
export interface FilterOptions {
  specialties: Specialty[];
  locations: string[];
  types: string[];
  durations: string[];
}
