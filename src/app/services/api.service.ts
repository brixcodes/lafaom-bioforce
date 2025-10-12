import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'https://lafaom.vertex-cam.com/api/v1';

  constructor(private http: HttpClient) { }

  /**
   * Méthode générique pour les requêtes GET
   */
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params });
  }

  /**
   * Méthode générique pour les requêtes POST
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  /**
   * Méthode générique pour les requêtes PUT
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  /**
   * Méthode générique pour les requêtes DELETE
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
  }

  /**
   * Méthode générique pour les requêtes PATCH
   */
  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  /**
   * Méthode pour upload de fichiers
   */
  uploadFile<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, formData);
  }
}
