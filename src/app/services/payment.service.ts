import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  
  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {}

  /**
   * Récupérer les méthodes de paiement disponibles
   */
  getPaymentMethods(subscriptionType?: string): Observable<any> {
    const endpoint = subscriptionType 
      ? `payments/payment-methods/${subscriptionType}`
      : 'payments/payment-methods';
    
    const url = `${this.config.getApiBaseUrl()}/${endpoint}`;
    console.log('💳 [PAYMENT] Récupération des méthodes de paiement:', url);
    
    return this.http.get(url);
  }

  /**
   * Initier un paiement
   */
  initiatePayment(paymentData: any): Observable<any> {
    const url = `${this.config.getApiBaseUrl()}/payments/initiate`;
    console.log('💳 [PAYMENT] Initiation du paiement:', url, paymentData);
    
    return this.http.post(url, paymentData);
  }

  /**
   * Vérifier le statut d'un paiement
   */
  checkPaymentStatus(transactionId: string): Observable<any> {
    const url = `${this.config.getApiBaseUrl()}/payments/check-status/${transactionId}`;
    console.log('💳 [PAYMENT] Vérification du statut:', url);
    
    return this.http.get(url);
  }
}
