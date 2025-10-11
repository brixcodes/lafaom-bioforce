import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { JobApplicationCreateInput, JobApplicationResponse, JobAttachmentUploadResponse } from '../models/job-application.models';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class JobApplicationService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = this.configService.API_BASE_URL;
  }

  /**
   * Uploader un fichier d'attachement
   */
  uploadAttachment(name: string, file: File): Observable<JobAttachmentUploadResponse> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);

    return this.http.post<JobAttachmentUploadResponse>(`${this.baseUrl}/job-attachments`, formData)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de l\'upload du fichier:', error);
          throw error;
        })
      );
  }

  /**
   * Créer une candidature
   */
  createApplication(applicationData: JobApplicationCreateInput): Observable<JobApplicationResponse> {
    return this.http.post<JobApplicationResponse>(`${this.baseUrl}/job-applications`, applicationData)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la création de la candidature:', error);
          throw error;
        })
      );
  }
}
