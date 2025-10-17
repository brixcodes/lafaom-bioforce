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
  uploadAttachment(name: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);

    console.log('📤 [JOB-APPLICATION-SERVICE] Upload du fichier:', {
      name: name,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    return this.http.post<any>(`${this.baseUrl}/job-attachments`, formData)
      .pipe(
        catchError(error => {
          console.error('❌ [JOB-APPLICATION-SERVICE] Erreur lors de l\'upload du fichier:', error);
          console.error('❌ [JOB-APPLICATION-SERVICE] Détails de l\'erreur:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
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
