import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingService } from '../../services/training.service';

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
  

  constructor(
    private fb: FormBuilder, 
    private route: ActivatedRoute, 
    private router: Router, 
    private trainingService: TrainingService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      civility: [''],
      country_code: ['SN'],  // Sénégal par défaut
      city: [''],
      address: [''],
      date_of_birth: [''],
      target_session_id: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.trainingId = this.route.snapshot.paramMap.get('id');
    
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
      civility: this.form.value.civility,
      country_code: 'SN', // Sénégal par défaut
      city: this.form.value.city,
      address: this.form.value.address,
      date_of_birth: this.form.value.date_of_birth,
      attachments: [] as string[]
    };
    
    this.trainingService.createStudentApplication(payload).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        // Redirection vers la page de succès avec les informations de paiement
        this.router.navigate(['/recruitment/success'], { 
          queryParams: { 
            applicationNumber: response?.data?.application_number || '',
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
