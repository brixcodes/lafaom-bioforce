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
    /** null = encore inconnu, true = confirmé ACCEPTED, false = refusé/annulé/erreur */
    isSuccess: boolean | null = null;
    transactionId: string | null = null;
    loading: boolean = true;
    payment: any = null;
    amount: number | null = null;

    constructor(
        private route: ActivatedRoute,
        private apiService: ApiService
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.transactionId = params['id'] || params['transaction_id'] || null;
            if (this.transactionId) {
                this.checkStatus(this.transactionId);
            } else {
                // Pas d'ID de transaction → on ne peut rien vérifier
                // On utilise l'URL uniquement comme indication de fallback
                const urlSegments = this.route.snapshot.url.map(seg => seg.path);
                this.isSuccess = urlSegments.includes('success');
                this.loading = false;
            }
        });
    }

    checkStatus(id: string) {
        this.loading = true;
        this.apiService.get(`payments/check-status/${id}`).subscribe({
            next: (res: any) => {
                this.payment = res.data;

                if (this.payment) {
                    this.amount = this.payment.product_amount ?? this.payment.amount;

                    // La SOURCE DE VÉRITÉ est uniquement le statut retourné par l'API
                    // On harmonise en majuscules pour éviter les erreurs de casse (ex: 'accepted' vs 'ACCEPTED')
                    const status = (this.payment.status || '').toUpperCase();
                    this.isSuccess = status === 'ACCEPTED';
                } else {
                    this.isSuccess = false;
                }

                this.loading = false;
            },
            error: (err) => {
                console.error('❌ [PAYMENT-STATUS] Erreur:', err);
                this.isSuccess = false;
                this.loading = false;
            }
        });
    }
}
