/**
 * Service API de base
 * 
 * Ce service fournit des méthodes génériques pour effectuer des requêtes HTTP
 * vers l'API backend. Il encapsule les opérations CRUD de base.
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  /** URL de base de l'API */
  private readonly baseUrl = 'https://api.lafaom-mao.org/api/v1';

  constructor(private http: HttpClient) { }

  /**
   * Effectuer une requête GET
   * @param endpoint - L'endpoint à appeler (sans le préfixe de base)
   * @param params - Paramètres de requête optionnels
   * @returns Observable contenant la réponse typée
   */
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params });
  }

  /**
   * Effectuer une requête POST
   * @param endpoint - L'endpoint à appeler
   * @param data - Les données à envoyer
   * @returns Observable contenant la réponse typée
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  /**
   * Effectuer une requête PUT
   * @param endpoint - L'endpoint à appeler
   * @param data - Les données à envoyer
   * @returns Observable contenant la réponse typée
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  /**
   * Effectuer une requête DELETE
   * @param endpoint - L'endpoint à appeler
   * @returns Observable contenant la réponse typée
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
  }

  /**
   * Effectuer une requête PATCH
   * @param endpoint - L'endpoint à appeler
   * @param data - Les données à envoyer
   * @returns Observable contenant la réponse typée
   */
  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  /**
   * Uploader un fichier
   * @param endpoint - L'endpoint pour l'upload
   * @param formData - Les données du formulaire contenant le fichier
   * @returns Observable contenant la réponse typée
   */
  uploadFile<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, formData);
  }
}
