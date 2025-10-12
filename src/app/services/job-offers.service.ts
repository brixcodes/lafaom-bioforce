import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { JobOffer, JobOfferResponse, JobApplication, JobApplicationResponse, JobAttachment, JobAttachmentResponse, PaginationParams, SearchFilters } from '../models/api.models';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class JobOffersService {

  constructor(private apiService: ApiService) { }

  /**
   * Récupérer toutes les offres d'emploi avec pagination
   */
  getJobOffers(params?: PaginationParams & SearchFilters): Observable<JobOfferResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.sort_by) httpParams = httpParams.set('sort_by', params.sort_by);
      if (params.sort_order) httpParams = httpParams.set('sort_order', params.sort_order);
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.location) httpParams = httpParams.set('location', params.location);
      if (params.employment_type) httpParams = httpParams.set('employment_type', params.employment_type);
      if (params.experience_level) httpParams = httpParams.set('experience_level', params.experience_level);
    }

    return this.apiService.get<JobOfferResponse>('job-offers', httpParams);
  }

  /**
   * Récupérer une offre d'emploi par son ID
   */
  getJobOfferById(id: string): Observable<JobOffer> {
    return this.apiService.get<JobOffer>(`job-offers/${id}`);
  }

  /**
   * Récupérer les offres d'emploi actives
   */
  getActiveJobOffers(params?: PaginationParams & SearchFilters): Observable<JobOfferResponse> {
    const filters = { ...params, status: 'active' };
    return this.getJobOffers(filters);
  }

  /**
   * Rechercher des offres d'emploi
   */
  searchJobOffers(searchTerm: string, params?: PaginationParams): Observable<JobOfferResponse> {
    const filters = { ...params, search: searchTerm };
    return this.getJobOffers(filters);
  }

  /**
   * Récupérer les offres d'emploi par localisation
   */
  getJobOffersByLocation(location: string, params?: PaginationParams): Observable<JobOfferResponse> {
    const filters = { ...params, location };
    return this.getJobOffers(filters);
  }

  /**
   * Récupérer les offres d'emploi par type d'emploi
   */
  getJobOffersByEmploymentType(employmentType: string, params?: PaginationParams): Observable<JobOfferResponse> {
    const filters = { ...params, employment_type: employmentType };
    return this.getJobOffers(filters);
  }

  /**
   * Récupérer les offres d'emploi par niveau d'expérience
   */
  getJobOffersByExperienceLevel(experienceLevel: string, params?: PaginationParams): Observable<JobOfferResponse> {
    const filters = { ...params, experience_level: experienceLevel };
    return this.getJobOffers(filters);
  }

  /**
   * Récupérer les offres d'emploi par département
   */
  getJobOffersByDepartment(department: string, params?: PaginationParams): Observable<JobOfferResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.sort_by) httpParams = httpParams.set('sort_by', params.sort_by);
      if (params.sort_order) httpParams = httpParams.set('sort_order', params.sort_order);
    }
    
    httpParams = httpParams.set('department', department);
    httpParams = httpParams.set('status', 'active');

    return this.apiService.get<JobOfferResponse>('job-offers', httpParams);
  }

  /**
   * Récupérer les offres d'emploi récentes
   */
  getRecentJobOffers(limit: number = 5): Observable<JobOfferResponse> {
    const params: PaginationParams = {
      per_page: limit,
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    return this.getActiveJobOffers(params);
  }

  /**
   * Soumettre une candidature pour une offre d'emploi
   */
  submitJobApplication(applicationData: JobApplication): Observable<JobApplicationResponse> {
    return this.apiService.post<JobApplicationResponse>('job-applications', applicationData);
  }

  /**
   * Uploader un fichier de candidature
   */
  uploadJobAttachment(formData: FormData): Observable<JobAttachmentResponse> {
    return this.apiService.uploadFile<JobAttachmentResponse>('job-attachments', formData);
  }

  /**
   * Récupérer les candidatures d'un utilisateur
   */
  getUserApplications(userId?: string): Observable<JobApplication[]> {
    const endpoint = userId ? `job-applications/user/${userId}` : 'job-applications/my-applications';
    return this.apiService.get<JobApplication[]>(endpoint);
  }

  /**
   * Récupérer une candidature par son ID
   */
  getJobApplicationById(applicationId: string): Observable<JobApplication> {
    return this.apiService.get<JobApplication>(`job-applications/${applicationId}`);
  }

  /**
   * Mettre à jour le statut d'une candidature
   */
  updateApplicationStatus(applicationId: string, status: string): Observable<JobApplicationResponse> {
    return this.apiService.patch<JobApplicationResponse>(`job-applications/${applicationId}/status`, { status });
  }

  /**
   * Récupérer les offres d'emploi avec filtres avancés
   */
  getJobOffersWithFilters(filters: {
    search?: string;
    location?: string;
    employment_type?: string;
    experience_level?: string;
    department?: string;
    salary_min?: number;
    salary_max?: number;
    remote_work?: boolean;
    date_from?: string;
    date_to?: string;
  }, params?: PaginationParams): Observable<JobOfferResponse> {
    let httpParams = new HttpParams();
    
    // Ajouter les paramètres de pagination
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.sort_by) httpParams = httpParams.set('sort_by', params.sort_by);
      if (params.sort_order) httpParams = httpParams.set('sort_order', params.sort_order);
    }
    
    // Ajouter les filtres
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return this.apiService.get<JobOfferResponse>('job-offers', httpParams);
  }
}
