import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { ConfigService } from './config.service';
import { 
  StudentApplicationCreateInput, 
  StudentApplicationResponse,
  StudentAttachmentInput,
  StudentAttachmentResponse,
  InitPaymentOutSuccess
} from '../models/student-application.models';

@Injectable({
  providedIn: 'root'
})
export class StudentApplicationService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = this.configService.API_BASE_URL;
  }

  /**
   * Créer une candidature étudiante
   */
  createApplication(data: StudentApplicationCreateInput): Observable<StudentApplicationResponse> {
    return this.http.post<StudentApplicationResponse>(`${this.baseUrl}/student-applications`, data)
      .pipe(
        catchError((error: any) => {
          console.error('Erreur lors de la création de la candidature étudiante:', error);
          throw error;
        })
      );
  }

  /**
   * Uploader un fichier pour une candidature étudiante
   */
  uploadAttachment(applicationId: number, fileName: string, file: File): Observable<StudentAttachmentResponse> {
    const formData = new FormData();
    formData.append('name', fileName);
    formData.append('file', file);

    return this.http.post<StudentAttachmentResponse>(`${this.baseUrl}/my-student-applications/${applicationId}/attachments`, formData, {
      reportProgress: true,
      observe: 'response'
    }).pipe(
      map((response: any) => {
        console.log('📤 [STUDENT-APP] Upload response:', response);
        return response.body;
      }),
      catchError((error: any) => {
        console.error('❌ [STUDENT-APP] Erreur lors de l\'upload du fichier:', error);
        throw error;
      })
    );
  }

  /**
   * Soumettre une candidature (initie le paiement)
   */
  submitApplication(applicationId: number): Observable<InitPaymentOutSuccess> {
    // Paramètres pour activer les paiements bancaires
    const paymentParams = {
      payment_methods: ['MOBILE_MONEY', 'WALLET', 'CARD'],
      enable_card_payments: true,
      enable_bank_transfers: true,
      channels: 'MOBILE_MONEY,WALLET,CREDIT_CARD,INTERNATIONAL_CARD'
    };
    
    console.log('🚀 [STUDENT-APP-SERVICE] Envoi des paramètres de paiement:', paymentParams);
    
    return this.http.post<InitPaymentOutSuccess>(`${this.baseUrl}/my-student-applications/${applicationId}/submit`, paymentParams)
      .pipe(
        catchError((error: any) => {
          console.error('Erreur lors de la soumission de la candidature:', error);
          throw error;
        })
      );
  }
}
