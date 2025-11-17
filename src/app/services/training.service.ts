import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Training, TrainingResponse, TrainingPaginationParams, TrainingSession, TrainingSessionsResponse, TrainingSessionFilters, OrganizationCenter, OrganizationCenterResponse, Specialty, FilterOptions, StudentApplicationCreateInput, StudentApplicationResponse } from '../models/training.models';
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
  getTrainingById(id: number | string): Observable<{data: Training}> {
    return this.http.get<{data: Training}>(`${this.baseUrl}/trainings/${id}`)
      .pipe(
        catchError((error: any) => {
          console.error(`Erreur lors du chargement de la formation ${id}:`, error);
          // Retourner une formation par défaut en cas d'erreur
          return of({
            data: {
              id: id.toString(),
              title: 'Formation non disponible',
              status: 'inactive',
              duration: 0,
              duration_unit: 'heures',
              specialty_id: 0,
              training_type: 'N/A',
              type: 'N/A',
              slug: 'formation-non-disponible',
              presentation: 'Cette formation n\'est pas disponible.',
              target_skills: '',
              program: '',
              target_audience: '',
              enrollment: '',
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

  /**
   * Récupérer les sessions d'une formation
   */
  getTrainingSessions(trainingId: string, filters?: TrainingSessionFilters): Observable<TrainingSessionsResponse> {
    let httpParams = new HttpParams();

    if (filters?.page) {
      httpParams = httpParams.set('page', filters.page.toString());
    }
    if (filters?.page_size) {
      httpParams = httpParams.set('page_size', filters.page_size.toString());
    }
    if (filters?.status) {
      httpParams = httpParams.set('status', filters.status);
    }
    if (filters?.center_id) {
      httpParams = httpParams.set('center_id', filters.center_id.toString());
    }
    if (filters?.order_by) {
      httpParams = httpParams.set('order_by', filters.order_by);
    }
    if (filters?.asc) {
      httpParams = httpParams.set('asc', filters.asc);
    }

    return this.http.get<TrainingSessionsResponse>(`${this.baseUrl}/trainings/${trainingId}/sessions`, { params: httpParams })
      .pipe(
        catchError((error: any) => {
          console.error(`Erreur lors du chargement des sessions de la formation ${trainingId}:`, error);
          return of({
            success: false,
            message: 'Sessions non disponibles',
            data: [],
            page: 1,
            number: 0,
            total_number: 0
          });
        })
      );
  }

  /**
   * Backward-compatible alias used by pages
   */
  getSessionsByTrainingId(trainingId: string): Observable<TrainingSessionsResponse> {
    return this.getTrainingSessions(trainingId, { page_size: 100 });
  }

  /**
   * Create student application (public endpoint)
   */
  createStudentApplication(payload: StudentApplicationCreateInput): Observable<StudentApplicationResponse> {
    return this.http.post<StudentApplicationResponse>(`${this.baseUrl}/student-applications`, payload);
  }

  /**
   * Compter les sessions disponibles (non commencées) d'une formation
   */
  getAvailableSessionsCount(trainingId: string): Observable<number> {
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

    return this.getTrainingSessions(trainingId, {
      page: 1,
      page_size: 100, // Récupérer toutes les sessions
      status: 'active' // Seulement les sessions actives
    }).pipe(
      map((response: TrainingSessionsResponse) => {
        const todayDate = new Date();
        const availableSessions = response.data.filter((session: TrainingSession) => {
          // Vérifier que la session n'a pas encore commencé
          if (session.start_date) {
            const startDate = new Date(session.start_date);
            return startDate > todayDate;
          }
          return false;
        });
        return availableSessions.length;
      }),
      catchError((error: any) => {
        console.error(`Erreur lors du comptage des sessions de la formation ${trainingId}:`, error);
        return of(0);
      })
    );
  }

  /**
   * Récupérer un centre d'organisation par son ID (route publique)
   */
  getOrganizationCenter(centerId: number): Observable<OrganizationCenterResponse> {
    return this.http.get<OrganizationCenterResponse>(`${this.baseUrl}/system/organization-centers/${centerId}/public`)
      .pipe(
        catchError((error: any) => {
          console.error(`Erreur lors du chargement du centre ${centerId}:`, error);
          return of({
            success: false,
            message: 'Centre non disponible',
            data: {
              id: centerId,
              name: 'Centre non disponible',
              address: '',
              city: 'N/A',
              country_code: '',
              telephone_number: '',
              mobile_number: '',
              email: '',
              status: 'inactive',
              organization_type: '',
              created_at: '',
              updated_at: ''
            }
          });
        })
      );
  }

  /**
   * Récupérer toutes les spécialités
   */
  getSpecialties(): Observable<Specialty[]> {
    return this.http.get<{data: Specialty[]}>(`${this.baseUrl}/specialties`)
      .pipe(
        map(response => response.data),
        catchError((error: any) => {
          console.error('Erreur lors du chargement des spécialités:', error);
          return of([]);
        })
      );
  }

  /**
   * Récupérer les options de filtres dynamiques
   */
  getFilterOptions(): Observable<FilterOptions> {
    return this.getSpecialties().pipe(
      map(specialties => {
        // Extraire les types et durées uniques des formations existantes
        const types = [...new Set(['Formation métier ', 'Séminaire thématique '])];
        const durations = [...new Set(['12 mois ','2 à  15 jours'])];

        return {
          specialties,
          locations: [], // Sera rempli dynamiquement
          types,
          durations
        };
      }),
      catchError((error: any) => {
        console.error('Erreur lors du chargement des options de filtres:', error);
        return of({
          specialties: [],
          locations: [],
          types: [],
          durations: []
        });
      })
    );
  }

  /**
   * Récupérer les lieux uniques depuis toutes les sessions de formations
   */
  getAllLocations(): Observable<string[]> {
    return this.getTrainings({ per_page: 100 }).pipe(
      switchMap((response: TrainingResponse) => {
        const trainingIds = response.data.map(training => training.id.toString());

        if (trainingIds.length === 0) {
          return of(['Ziguinchor']); // Ville par défaut
        }

        // Récupérer les sessions pour toutes les formations
        const sessionObservables = trainingIds.map(trainingId =>
          this.getTrainingSessions(trainingId, { page_size: 100 })
        );

        return forkJoin(sessionObservables).pipe(
          switchMap((responses: TrainingSessionsResponse[]) => {
            const centerIds = new Set<number>();

            // Collecter tous les centre_id des sessions
            responses.forEach(response => {
              response.data.forEach(session => {
                if (session.center_id) {
                  centerIds.add(session.center_id);
                }
              });
            });

            if (centerIds.size === 0) {
              return of(['Ziguinchor']); // Ville par défaut
            }

            // Récupérer les centres pour obtenir les villes
            const centerObservables = Array.from(centerIds).map(centerId =>
              this.getOrganizationCenter(centerId).pipe(
                map(centerResponse => centerResponse.data.city),
                catchError(() => of('N/A'))
              )
            );

            return forkJoin(centerObservables).pipe(
              map((cities: string[]) => {
                const uniqueCities = [...new Set(cities.filter(city => city && city !== 'N/A'))];
                return uniqueCities.length > 0 ? uniqueCities : ['Ziguinchor'];
              })
            );
          }),
          catchError(() => of(['Ziguinchor']))
        );
      }),
      catchError((error: any) => {
        console.error('Erreur lors du chargement des lieux:', error);
        return of(['Ziguinchor']);
      })
    );
  }
}
