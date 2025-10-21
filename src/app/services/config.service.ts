import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  // Configuration de l'API - URLs de fallback
  private readonly API_URLS = [
    environment.apiUrl, // URL principale selon l'environnement
    environment.backendUrl // Backend direct (fallback)
  ];

  readonly API_BASE_URL = this.API_URLS[0]; // URL principale
  
  // Endpoints
  readonly ENDPOINTS = {
    NEWS: 'news',
    JOB_OFFERS: 'job-offers',
    JOB_APPLICATIONS: 'job-applications',
    JOB_ATTACHMENTS: 'job-attachments',
    CABINET_OFFERS: 'cabinet-offers'
  };

  // Configuration de pagination par défaut
  readonly DEFAULT_PAGINATION = {
    page: 1,
    per_page: 10,
    sort_by: 'created_at',
    sort_order: 'desc' as 'asc' | 'desc'
  };

  // Configuration des limites
  readonly LIMITS = {
    MAX_RECENT_ITEMS: 5,
    MAX_SEARCH_RESULTS: 50,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
  };

  // Configuration des statuts
  readonly STATUS = {
    NEWS: {
      DRAFT: 'draft',
      PUBLISHED: 'published',
      ARCHIVED: 'archived'
    },
    JOB_OFFERS: {
      ACTIVE: 'active',
      INACTIVE: 'inactive',
      CLOSED: 'closed'
    },
    APPLICATIONS: {
      PENDING: 'pending',
      REVIEWED: 'reviewed',
      ACCEPTED: 'accepted',
      REJECTED: 'rejected'
    }
  };

  // Configuration des types d'emploi
  readonly EMPLOYMENT_TYPES = {
    FULL_TIME: 'full-time',
    PART_TIME: 'part-time',
    CONTRACT: 'contract',
    INTERNSHIP: 'internship'
  };

  // Configuration des niveaux d'expérience
  readonly EXPERIENCE_LEVELS = {
    ENTRY: 'entry',
    MID: 'mid',
    SENIOR: 'senior',
    EXECUTIVE: 'executive'
  };

  // Configuration des types de service du cabinet
  readonly SERVICE_TYPES = {
    CONSULTATION: 'consultation',
    FORMATION: 'formation',
    ACCOMPAGNEMENT: 'accompagnement',
    RECHERCHE: 'recherche',
    AUTRE: 'autre'
  };

  constructor(private http: HttpClient) { 
    console.log('🔧 [CONFIG] Configuration initialisée:', {
      apiUrl: environment.apiUrl,
      backendUrl: environment.backendUrl,
      production: environment.production,
      finalUrl: this.API_BASE_URL
    });
  }

  /**
   * Obtenir l'URL de base de l'API
   */
  getApiBaseUrl(): string {
    console.log('🔧 [CONFIG] getApiBaseUrl appelé:', this.API_BASE_URL);
    return this.API_BASE_URL;
  }

  /**
   * Obtenir l'URL complète pour un endpoint
   */
  getFullUrl(endpoint: string): string {
    return `${this.API_BASE_URL}/${endpoint}`;
  }

  /**
   * Obtenir la configuration de pagination par défaut
   */
  getDefaultPagination() {
    return { ...this.DEFAULT_PAGINATION };
  }

  /**
   * Valider un type de fichier
   */
  isValidFileType(fileName: string): boolean {
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return this.LIMITS.ALLOWED_FILE_TYPES.includes(extension);
  }

  /**
   * Valider la taille d'un fichier
   */
  isValidFileSize(fileSize: number): boolean {
    return fileSize <= this.LIMITS.MAX_FILE_SIZE;
  }

  /**
   * Récupérer les méthodes de paiement disponibles
   */
  getPaymentMethods(subscriptionType?: string): Observable<any> {
    const endpoint = subscriptionType 
      ? `payments/payment-methods/${subscriptionType}`
      : 'payments/payment-methods';
    
    const url = `${this.API_BASE_URL}/${endpoint}`;
    console.log('🔧 [CONFIG] Récupération des méthodes de paiement:', url);
    
    return this.http.get(url);
  }
}
