// Interface pour les formations
export interface Training {
  id: number;
  title: string;
  description: string;
  duration: string;
  location: string;
  type: string;
  sessions_available: number;
  slug: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
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
  search?: string;
  type?: string;
  location?: string;
}
