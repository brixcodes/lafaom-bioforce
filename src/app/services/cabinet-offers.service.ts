import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CabinetOffer, CabinetOfferResponse, PaginationParams, SearchFilters } from '../models/api.models';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CabinetOffersService {

  constructor(private apiService: ApiService) { }

  /**
   * Récupérer toutes les offres du cabinet avec pagination
   */
  getCabinetOffers(params?: PaginationParams & SearchFilters): Observable<CabinetOfferResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.sort_by) httpParams = httpParams.set('sort_by', params.sort_by);
      if (params.sort_order) httpParams = httpParams.set('sort_order', params.sort_order);
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.location) httpParams = httpParams.set('location', params.location);
      if (params.experience_level) httpParams = httpParams.set('experience_level', params.experience_level);
    }

    return this.apiService.get<CabinetOfferResponse>('cabinet-offers', httpParams);
  }

  /**
   * Récupérer une offre du cabinet par son ID
   */
  getCabinetOfferById(id: string): Observable<CabinetOffer> {
    return this.apiService.get<CabinetOffer>(`cabinet-offers/${id}`);
  }

  /**
   * Récupérer les offres du cabinet actives
   */
  getActiveCabinetOffers(params?: PaginationParams & SearchFilters): Observable<CabinetOfferResponse> {
    const filters = { ...params, status: 'active' };
    return this.getCabinetOffers(filters);
  }

  /**
   * Rechercher des offres du cabinet
   */
  searchCabinetOffers(searchTerm: string, params?: PaginationParams): Observable<CabinetOfferResponse> {
    const filters = { ...params, search: searchTerm };
    return this.getCabinetOffers(filters);
  }

  /**
   * Récupérer les offres du cabinet par localisation
   */
  getCabinetOffersByLocation(location: string, params?: PaginationParams): Observable<CabinetOfferResponse> {
    const filters = { ...params, location };
    return this.getCabinetOffers(filters);
  }

  /**
   * Récupérer les offres du cabinet par type de service
   */
  getCabinetOffersByServiceType(serviceType: string, params?: PaginationParams): Observable<CabinetOfferResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.sort_by) httpParams = httpParams.set('sort_by', params.sort_by);
      if (params.sort_order) httpParams = httpParams.set('sort_order', params.sort_order);
    }
    
    httpParams = httpParams.set('service_type', serviceType);
    httpParams = httpParams.set('status', 'active');

    return this.apiService.get<CabinetOfferResponse>('cabinet-offers', httpParams);
  }

  /**
   * Récupérer les offres du cabinet par niveau d'expérience
   */
  getCabinetOffersByExperienceLevel(experienceLevel: string, params?: PaginationParams): Observable<CabinetOfferResponse> {
    const filters = { ...params, experience_level: experienceLevel };
    return this.getCabinetOffers(filters);
  }

  /**
   * Récupérer les offres du cabinet par département
   */
  getCabinetOffersByDepartment(department: string, params?: PaginationParams): Observable<CabinetOfferResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.sort_by) httpParams = httpParams.set('sort_by', params.sort_by);
      if (params.sort_order) httpParams = httpParams.set('sort_order', params.sort_order);
    }
    
    httpParams = httpParams.set('department', department);
    httpParams = httpParams.set('status', 'active');

    return this.apiService.get<CabinetOfferResponse>('cabinet-offers', httpParams);
  }

  /**
   * Récupérer les offres du cabinet récentes
   */
  getRecentCabinetOffers(limit: number = 5): Observable<CabinetOfferResponse> {
    const params: PaginationParams = {
      per_page: limit,
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    return this.getActiveCabinetOffers(params);
  }

  /**
   * Récupérer les offres du cabinet avec filtres avancés
   */
  getCabinetOffersWithFilters(filters: {
    search?: string;
    location?: string;
    service_type?: string;
    experience_level?: string;
    department?: string;
    duration?: string;
    date_from?: string;
    date_to?: string;
  }, params?: PaginationParams): Observable<CabinetOfferResponse> {
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

    return this.apiService.get<CabinetOfferResponse>('cabinet-offers', httpParams);
  }

  /**
   * Récupérer les offres du cabinet par compétences requises
   */
  getCabinetOffersBySkills(skills: string[], params?: PaginationParams): Observable<CabinetOfferResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.sort_by) httpParams = httpParams.set('sort_by', params.sort_by);
      if (params.sort_order) httpParams = httpParams.set('sort_order', params.sort_order);
    }
    
    // Ajouter les compétences comme paramètres
    skills.forEach(skill => {
      httpParams = httpParams.append('skills[]', skill);
    });
    
    httpParams = httpParams.set('status', 'active');

    return this.apiService.get<CabinetOfferResponse>('cabinet-offers', httpParams);
  }

  /**
   * Récupérer les offres du cabinet par durée
   */
  getCabinetOffersByDuration(duration: string, params?: PaginationParams): Observable<CabinetOfferResponse> {
    const filters = { ...params, duration };
    return this.getCabinetOffers(filters);
  }

  /**
   * Récupérer les offres du cabinet par date de création
   */
  getCabinetOffersByDateRange(dateFrom: string, dateTo: string, params?: PaginationParams): Observable<CabinetOfferResponse> {
    const filters = { 
      ...params, 
      date_from: dateFrom, 
      date_to: dateTo 
    };
    return this.getCabinetOffers(filters);
  }
}
