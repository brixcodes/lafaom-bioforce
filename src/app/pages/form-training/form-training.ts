import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingService } from '../../services/training.service';
import { JobApplicationService } from '../../services/job-application.service';
import { StudentApplicationCreateInput, StudentApplicationResponse } from '../../models/training.models';

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
  paymentMethod: 'ONLINE' | 'TRANSFER' = 'ONLINE';
  requiredAttachments: string[] = [];
  uploadedFiles: { [key: string]: { file: File, url: string, name: string } } = {};
  uploadingFiles: { [key: string]: boolean } = {};
  

  constructor(
    private fb: FormBuilder, 
    private route: ActivatedRoute, 
    private router: Router, 
    private trainingService: TrainingService,
    private jobApplicationService: JobApplicationService
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
      target_session_id: ['', [Validators.required]],
      payment_method: ['ONLINE', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.trainingId = this.route.snapshot.paramMap.get('id');
    
    // Pour les formations, pas de pièces jointes par défaut
    this.requiredAttachments = [];
    
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

  onPaymentMethodChange(method: 'ONLINE' | 'TRANSFER'): void {
    this.paymentMethod = method;
    this.form.patchValue({ payment_method: method });
    console.log('💳 [FORM-TRAINING] Méthode de paiement changée:', method);
  }

  onFileChange(event: any, attachmentType: string): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file, attachmentType);
    }
  }

  uploadFile(file: File, attachmentType: string): void {
    const fileName = `${attachmentType}`;
    this.uploadingFiles[attachmentType] = true;
    
    this.jobApplicationService.uploadAttachment(fileName, file).subscribe({
      next: (response: any) => {
        this.uploadingFiles[attachmentType] = false;
        console.log('📎 [FORM-TRAINING] Réponse upload:', response);
        if (response.data && response.data.length > 0) {
          this.uploadedFiles[attachmentType] = {
            file: file,
            url: response.data[0].url || response.data[0].file_path,
            name: response.data[0].name
          };
          console.log('📎 [FORM-TRAINING] Fichier stocké:', this.uploadedFiles[attachmentType]);
        }
      },
      error: (error: any) => {
        console.error(`Erreur lors de l'upload du fichier ${attachmentType}:`, error);
        this.uploadingFiles[attachmentType] = false;
        this.submitError = `Erreur lors de l'upload du fichier ${attachmentType}: ${error.error?.message || error.message}`;
      }
    });
  }

  getAttachmentControlName(type: string): string {
    return `attachment_${type.toLowerCase().replace(/\s+/g, '_')}`;
  }

  translateAttachment(type: string): string {
    const translations: { [key: string]: string } = {
      'CV': 'CV',
      'Lettre de motivation': 'Lettre de motivation',
      'Copie de la pièce d\'identité': 'Copie de la pièce d\'identité',
      'BANK_TRANSFER_RECEIPT': 'Reçu de virement bancaire'
    };
    return translations[type] || type;
  }

  removeFile(attachmentType: string): void {
    delete this.uploadedFiles[attachmentType];
  }

  submit(): void {
    if (this.form.invalid || !this.trainingId) { 
      this.form.markAllAsTouched(); 
      return; 
    }
    
    // Pour les formations : aucun document si paiement en ligne, seulement reçu si virement
    if (this.paymentMethod === 'TRANSFER') {
      if (!this.uploadedFiles['BANK_TRANSFER_RECEIPT']) {
        this.submitError = 'Veuillez télécharger le reçu de virement bancaire.';
        return;
      }
    }
    
    this.isSubmitting = true;
    this.submitError = null;
    
    // Préparer les pièces jointes - l'API attend un tableau d'URLs
    const attachments = Object.entries(this.uploadedFiles).map(([type, fileData]) => fileData.url);
    
     const payload: StudentApplicationCreateInput = {
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
       payment_method: this.form.value.payment_method || this.paymentMethod,
       attachments: attachments
     };
    
    console.log('📤 [FORM-TRAINING] Soumission avec pièces jointes:', payload);
    
    this.trainingService.createStudentApplication(payload).subscribe({
      next: (response: StudentApplicationResponse) => {
        this.isSubmitting = false;
        console.log('✅ [FORM-TRAINING] Candidature créée avec succès:', response);
        
        // Vérifier si c'est un paiement en ligne
        if (response.data.payment && response.data.payment.payment_link) {
          // Redirection vers le lien de paiement
          window.location.href = response.data.payment.payment_link;
        } else {
          // Redirection vers la page de succès avec les informations de paiement
          this.router.navigate(['/recruitment/success'], { 
            queryParams: { 
              applicationNumber: response.data.student_application.application_number,
              subscriptionType: 'FORMATION',
              paymentMethod: response.data.student_application.payment_method,
              amount: response.data.payment?.amount,
              currency: response.data.payment?.currency
            } 
          });
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.submitError = err?.error?.message || 'Erreur lors de la soumission.';
        console.error('❌ [FORM-TRAINING] Erreur lors de la soumission:', err);
      }
    });
  }
}
