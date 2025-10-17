import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import { JobOffer, JobOfferResponse, JobOfferPaginationParams, JobOfferFilterOptions } from '../models/job.models';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = this.configService.getApiBaseUrl();
    console.log('🔧 [JOB-SERVICE] Base URL initialisée:', this.baseUrl);
  }

  /**
   * Récupérer toutes les offres d'emploi
   */
  getJobOffers(params: JobOfferPaginationParams = {}): Observable<JobOfferResponse> {
    let httpParams = new HttpParams();
    
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.location) httpParams = httpParams.set('location', params.location);
    if (params.contract_type) httpParams = httpParams.set('contract_type', params.contract_type);
    if (params.experience_level) httpParams = httpParams.set('experience_level', params.experience_level);
    if (params.featured !== undefined) httpParams = httpParams.set('featured', params.featured.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);

    console.log('🌐 [JOB-SERVICE] Tentative de chargement des offres d\'emploi...');
    console.log('🌐 [JOB-SERVICE] URL:', `${this.baseUrl}/job-offers`);
    console.log('🌐 [JOB-SERVICE] Paramètres:', httpParams.toString());

    return this.http.get<JobOfferResponse>(`${this.baseUrl}/job-offers`, { params: httpParams })
      .pipe(
        catchError(error => {
          console.error('❌ [JOB-SERVICE] Erreur lors du chargement des offres d\'emploi:', error);
          console.error('❌ [JOB-SERVICE] URL tentée:', `${this.baseUrl}/job-offers`);
          console.error('❌ [JOB-SERVICE] Status:', error.status);
          console.error('❌ [JOB-SERVICE] Message:', error.message);
          
          // Retourner une réponse vide en cas d'erreur
          return of({
            data: [],
            page: 0,
            number: 0,
            total_number: 0
          });
        })
      );
  }

  /**
   * Récupérer une offre d'emploi par ID
   */
  getJobOfferById(id: string): Observable<JobOffer> {
    return this.http.get<JobOffer>(`${this.baseUrl}/job-offers/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Erreur lors du chargement de l'offre d'emploi ${id}:`, error);
          throw error; // Propager l'erreur au lieu de retourner des données de fallback
        })
      );
  }

  /**
   * Récupérer les offres d'emploi mises en avant
   */
  getFeaturedJobOffers(limit: number = 3): Observable<JobOfferResponse> {
    return this.getJobOffers({ 
      per_page: limit 
    });
  }

  /**
   * Récupérer les options de filtres
   */
  getFilterOptions(): Observable<JobOfferFilterOptions> {
    return this.getJobOffers({ per_page: 100 }).pipe(
      map((response: JobOfferResponse) => {
        // Extraire les options uniques des offres d'emploi
        const locations = [...new Set(response.data.map(job => job.location))];
        const contractTypes = [...new Set(response.data.map(job => job.contract_type))];
        const experienceLevels = ['Junior', 'Intermédiaire', 'Senior', 'Expert']; // Niveaux fixes
        
        return {
          locations,
          contractTypes,
          experienceLevels
        };
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des options de filtres:', error);
        return of({
          locations: [],
          contractTypes: [],
          experienceLevels: []
        });
      })
    );
  }

  /**
   * Rechercher des offres d'emploi
   */
  searchJobOffers(searchTerm: string, filters: any = {}): Observable<JobOfferResponse> {
    return this.getJobOffers({
      search: searchTerm,
      ...filters
    });
  }

}
