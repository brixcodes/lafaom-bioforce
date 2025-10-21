import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingService } from '../../services/training.service';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-form-training',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-training.html',
  styleUrl: './form-training.css'
})
export class FormTraining implements OnInit {
  form: FormGroup;
  trainingId: string | null = null;
  sessions: any[] = [];
  selectedSession: any | null = null;
  isSubmitting = false;
  submitError: string | null = null;
  
  // Nouvelles propriétés pour les paiements
  paymentMethods: any[] = [];
  selectedPaymentMethod: string = 'WALLET';
  isLoadingPaymentMethods = false;

  constructor(
    private fb: FormBuilder, 
    private route: ActivatedRoute, 
    private router: Router, 
    private trainingService: TrainingService,
    private paymentService: PaymentService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      phone_number: ['', [Validators.required]],
      country_code: ['SN', [Validators.required]], // Sénégal par défaut
      target_session_id: ['', [Validators.required]],
      payment_method: ['WALLET', [Validators.required]], // Nouveau champ pour la méthode de paiement
      consent: [false, [Validators.requiredTrue]]
    });
  }

  ngOnInit(): void {
    this.trainingId = this.route.snapshot.paramMap.get('id');
    this.loadPaymentMethods();
    
    if (this.trainingId) {
      this.trainingService.getSessionsByTrainingId(this.trainingId).subscribe({
        next: (res: any) => {
          this.sessions = res?.data || [];
          console.log('📅 [FORM-TRAINING] Sessions chargées:', this.sessions);
          // Ne plus sélectionner automatiquement une session
          // L'utilisateur doit choisir manuellement
        },
        error: (err: any) => {
          console.error('📅 [FORM-TRAINING] Erreur lors du chargement des sessions:', err);
        }
      });
    }
  }

  loadPaymentMethods(): void {
    this.isLoadingPaymentMethods = true;
    this.paymentService.getPaymentMethods('FORMATION').subscribe({
      next: (res: any) => {
        this.paymentMethods = res?.data || [];
        this.isLoadingPaymentMethods = false;
        console.log('💳 [FORM-TRAINING] Méthodes de paiement chargées:', this.paymentMethods);
      },
      error: (err: any) => {
        this.isLoadingPaymentMethods = false;
        console.error('💳 [FORM-TRAINING] Erreur lors du chargement des méthodes:', err);
        // Méthodes par défaut en cas d'erreur
        this.paymentMethods = [
          { value: 'WALLET', label: 'Portefeuille électronique' },
          { value: 'CREDIT_CARD', label: 'Carte bancaire' }
        ];
      }
    });
  }

  onPaymentMethodChange(method: string): void {
    this.selectedPaymentMethod = method;
    this.form.patchValue({ payment_method: method });
  }

  onSessionChange(event: any): void {
    const sessionId = event.target.value;
    this.selectedSession = this.sessions.find(s => s.id === sessionId);
    console.log('📅 [FORM-TRAINING] Session sélectionnée:', this.selectedSession);
  }

  formatSessionDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  submit(): void {
    if (this.form.invalid || !this.trainingId) { 
      this.form.markAllAsTouched(); 
      return; 
    }
    
    this.isSubmitting = true;
    this.submitError = null;
    
    const payload = {
      email: this.form.value.email,
      target_session_id: this.form.value.target_session_id,
      first_name: this.form.value.first_name,
      last_name: this.form.value.last_name,
      phone_number: this.form.value.phone_number,
      country_code: this.form.value.country_code,
      payment_method: this.form.value.payment_method, // Nouveau champ pour la méthode de paiement
      subscription_type: 'FORMATION', // Type de souscription
      attachments: [] as string[]
    };
    
    this.trainingService.createStudentApplication(payload).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        // Redirection vers la page de succès avec les informations de paiement
        this.router.navigate(['/recruitment/success'], { 
          queryParams: { 
            applicationNumber: response?.data?.application_number || '',
            paymentMethod: this.form.value.payment_method,
            subscriptionType: 'FORMATION'
          } 
        });
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.submitError = err?.error?.message || 'Erreur lors de la soumission.';
      }
    });
  }
}
