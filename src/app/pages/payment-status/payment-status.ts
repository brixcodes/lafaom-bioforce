import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-payment-status',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './payment-status.html',
    styleUrl: './payment-status.css'
})
export class PaymentStatus implements OnInit {
    isSuccess: boolean = false;
    transactionId: string | null = null;
    loading: boolean = true;
    payment: any = null;
    amount: number | null = null;

    constructor(
        private route: ActivatedRoute,
        private apiService: ApiService
    ) { }

    ngOnInit() {
        // Détecter si on est sur la page de succès ou d'erreur
        // snapshot.url contient tous les segments de la route (ex: ['payment', 'success'])
        const urlSegments = this.route.snapshot.url.map(segment => segment.path);
        this.isSuccess = urlSegments.includes('success');

        this.route.queryParams.subscribe(params => {
            this.transactionId = params['id'] || params['transaction_id'] || null;
            if (this.transactionId) {
                this.checkStatus(this.transactionId);
            } else {
                this.loading = false;
            }
        });
    }

    checkStatus(id: string) {
        this.apiService.get(`payments/check-status/${id}`).subscribe({
            next: (res: any) => {
                console.log('✅ [PAYMENT-STATUS] Statut mis à jour:', res);
                this.payment = res.data;

                if (this.payment) {
                    this.amount = this.payment.amount;
                    // Si l'API confirme que le paiement est ACCEPTED, on force isSuccess à true
                    if (this.payment.status === 'ACCEPTED') {
                        this.isSuccess = true;
                    }
                }

                this.loading = false;
            },
            error: (err) => {
                console.error('❌ [PAYMENT-STATUS] Erreur lors de la vérification:', err);
                this.loading = false;
            }
        });
    }
}
