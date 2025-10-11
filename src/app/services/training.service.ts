import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { Training, TrainingResponse, TrainingPaginationParams } from '../models/training.models';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class TrainingService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = this.configService.API_BASE_URL;
  }

  /**
   * Récupérer toutes les formations
   */
  getTrainings(params?: TrainingPaginationParams): Observable<TrainingResponse> {
    let httpParams = new HttpParams();
    
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.per_page) {
      httpParams = httpParams.set('per_page', params.per_page.toString());
    }
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.type) {
      httpParams = httpParams.set('type', params.type);
    }
    if (params?.location) {
      httpParams = httpParams.set('location', params.location);
    }

    return this.http.get<TrainingResponse>(`${this.baseUrl}/trainings`, { params: httpParams })
      .pipe(
        catchError((error: any) => {
          console.error('Erreur lors du chargement des formations:', error);
          // Retourner des données par défaut en cas d'erreur
          return of({
            success: false,
            message: 'Formations non disponibles',
            data: [],
            page: 1,
            number: 0,
            total_number: 0
          });
        })
      );
  }

  /**
   * Récupérer une formation par son ID
   */
  getTrainingById(id: number): Observable<{data: Training}> {
    return this.http.get<{data: Training}>(`${this.baseUrl}/trainings/${id}`)
      .pipe(
        catchError((error: any) => {
          console.error(`Erreur lors du chargement de la formation ${id}:`, error);
          // Retourner une formation par défaut en cas d'erreur
          return of({
            data: {
              id: id,
              title: 'Formation non disponible',
              description: 'Cette formation n\'est pas disponible.',
              duration: 'N/A',
              location: 'N/A',
              type: 'N/A',
              sessions_available: 0,
              slug: 'formation-non-disponible',
              featured: false,
              created_at: '',
              updated_at: ''
            }
          });
        })
      );
  }

  /**
   * Récupérer les formations à la une
   */
  getFeaturedTrainings(limit: number = 5): Observable<TrainingResponse> {
    const params = new HttpParams()
      .set('per_page', limit.toString())
      .set('page', '1')
      .set('featured', 'true');
    
    return this.http.get<TrainingResponse>(`${this.baseUrl}/trainings`, { params })
      .pipe(
        catchError((error: any) => {
          console.error('Erreur lors du chargement des formations à la une:', error);
          return of({
            success: false,
            message: 'Formations à la une non disponibles',
            data: [],
            page: 1,
            number: 0,
            total_number: 0
          });
        })
      );
  }

  /**
   * Rechercher des formations
   */
  searchTrainings(searchTerm: string, params?: TrainingPaginationParams): Observable<TrainingResponse> {
    const searchParams = { ...params, search: searchTerm };
    return this.getTrainings(searchParams);
  }
}
