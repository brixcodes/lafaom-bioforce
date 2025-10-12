import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { News, NewsResponse, PaginationParams, SearchFilters, BlogCategory, CategoryResponse, ArticleSection, ArticleSectionsResponse } from '../models/api.models';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = this.configService.API_BASE_URL;
  }

  /**
   * Récupérer toutes les actualités avec pagination
   */
  getNews(params?: PaginationParams & SearchFilters): Observable<NewsResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.sort_by) httpParams = httpParams.set('sort_by', params.sort_by);
      if (params.sort_order) httpParams = httpParams.set('sort_order', params.sort_order);
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.category) httpParams = httpParams.set('category', params.category);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.date_from) httpParams = httpParams.set('date_from', params.date_from);
      if (params.date_to) httpParams = httpParams.set('date_to', params.date_to);
    }

    return this.http.get<NewsResponse>(`${this.baseUrl}/blog/posts`, { params: httpParams })
      .pipe(
        catchError((error: any) => {
          console.error('Erreur lors du chargement des actualités:', error);
          // Retourner une réponse vide en cas d'erreur
          return of({
            data: [],
            page: 1,
            number: 0,
            total_number: 0
          });
        })
      );
  }

  /**
   * Récupérer une actualité par son ID
   */
  getNewsById(id: number): Observable<{data: News}> {
    return this.http.get<{data: News}>(`${this.baseUrl}/blog/posts/${id}`)
      .pipe(
        catchError((error: any) => {
          console.error(`Erreur lors du chargement de l'actualité ${id}:`, error);
          // Retourner une actualité par défaut en cas d'erreur
          return of({
            data: {
              id: id,
              user_id: 'unknown',
              title: 'Actualité non disponible',
              slug: 'actualite-non-disponible',
              summary: 'Cette actualité n\'est pas disponible.',
              content: 'Contenu non disponible.',
              cover_image: null,
              author_name: 'Auteur inconnu',
              category_id: 0,
              published_at: null,
              created_at: '',
              updated_at: '',
              tags: ''
            }
          });
        })
      );
  }

  /**
   * Récupérer les actualités publiées
   */
  getPublishedNews(params?: PaginationParams & SearchFilters): Observable<NewsResponse> {
    const httpParams = new HttpParams()
      .set('per_page', (params?.per_page || 5).toString())
      .set('page', (params?.page || 1).toString());
    
    return this.http.get<NewsResponse>(`${this.baseUrl}/blog/posts`, { params: httpParams });
  }

  /**
   * Récupérer les actualités par catégorie
   */
  getNewsByCategory(category: string, params?: PaginationParams): Observable<NewsResponse> {
    const httpParams = new HttpParams()
      .set('per_page', (params?.per_page || 5).toString())
      .set('page', (params?.page || 1).toString())
      .set('category', category);
    
    return this.http.get<NewsResponse>(`${this.baseUrl}/blog/posts`, { params: httpParams });
  }

  /**
   * Rechercher des actualités
   */
  searchNews(searchTerm: string, params?: PaginationParams): Observable<NewsResponse> {
    const httpParams = new HttpParams()
      .set('per_page', (params?.per_page || 5).toString())
      .set('page', (params?.page || 1).toString())
      .set('search', searchTerm);
    
    return this.http.get<NewsResponse>(`${this.baseUrl}/blog/posts`, { params: httpParams });
  }

  /**
   * Récupérer les actualités récentes
   */
  getRecentNews(limit: number = 5): Observable<NewsResponse> {
    const params = new HttpParams()
      .set('per_page', limit.toString())
      .set('page', '1')
      .set('published', 'true'); // Filtrer seulement les actualités publiées
    
    return this.http.get<NewsResponse>(`${this.baseUrl}/blog/posts`, { params })
      .pipe(
        catchError((error: any) => {
          console.error('Erreur lors du chargement des actualités récentes:', error);
          // Retourner des données par défaut en cas d'erreur
          return of({
            data: [],
            page: 1,
            number: 0,
            total_number: 0
          });
        })
      );
  }

  /**
   * Récupérer les actualités populaires
   */
  getPopularNews(limit: number = 5): Observable<NewsResponse> {
    const params: PaginationParams = {
      per_page: limit,
      sort_by: 'views', // Supposant qu'il y a un champ views
      sort_order: 'desc'
    };
    return this.getPublishedNews(params);
  }

  /**
   * Récupérer les actualités par date
   */
  getNewsByDateRange(dateFrom: string, dateTo: string, params?: PaginationParams): Observable<NewsResponse> {
    const filters = { 
      ...params, 
      date_from: dateFrom, 
      date_to: dateTo 
    };
    return this.getNews(filters);
  }

  /**
   * Récupérer les actualités avec des tags spécifiques
   */
  getNewsByTags(tags: string[], params?: PaginationParams): Observable<NewsResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.sort_by) httpParams = httpParams.set('sort_by', params.sort_by);
      if (params.sort_order) httpParams = httpParams.set('sort_order', params.sort_order);
    }
    
    // Ajouter les tags comme paramètres
    tags.forEach(tag => {
      httpParams = httpParams.append('tags[]', tag);
    });

    return this.http.get<NewsResponse>(`${this.baseUrl}/blog/posts`, { params: httpParams });
  }

  /**
   * Récupérer une catégorie par son ID
   */
  getCategoryById(categoryId: number): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.baseUrl}/blog/categories/${categoryId}`)
      .pipe(
        catchError((error: any) => {
          console.error(`Erreur lors du chargement de la catégorie ${categoryId}:`, error);
          // Retourner une catégorie par défaut en cas d'erreur
          return of({
            success: false,
            message: 'Catégorie non disponible',
            data: {
              id: categoryId,
              title: `Catégorie ${categoryId}`,
              slug: `categorie-${categoryId}`,
              description: 'Catégorie non disponible',
              created_at: '',
              updated_at: ''
            }
          });
        })
      );
  }

  /**
   * Récupérer les sections d'un article
   */
  getArticleSections(postId: number): Observable<ArticleSectionsResponse> {
    return this.http.get<ArticleSectionsResponse>(`${this.baseUrl}/blog/posts/${postId}/sections`)
      .pipe(
        catchError((error: any) => {
          console.error(`Erreur lors du chargement des sections de l'article ${postId}:`, error);
          // Retourner des sections par défaut en cas d'erreur
          return of({
            success: false,
            message: 'Sections non disponibles',
            data: []
          });
        })
      );
  }
}
