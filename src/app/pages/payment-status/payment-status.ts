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

    constructor(
        private route: ActivatedRoute,
        private apiService: ApiService
    ) { }

    ngOnInit() {
        this.isSuccess = this.route.snapshot.url[0].path === 'success';
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
                this.loading = false;
            },
            error: (err) => {
                console.error('❌ [PAYMENT-STATUS] Erreur lors de la vérification:', err);
                this.loading = false;
            }
        });
    }
}
