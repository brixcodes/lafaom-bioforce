import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingService } from '../../services/training.service';
import { JobApplicationService } from '../../services/job-application.service';
import { StudentApplicationCreateInput, StudentApplicationResponse } from '../../models/training.models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SimpleTranslateService } from '../../services/simple-translate.service';

@Component({
  selector: 'app-form-training',
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
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
  paymentMethod: 'ONLINE' | 'TRANSFER' = 'TRANSFER';
  requiredAttachments: string[] = [];
  uploadedFiles: { [key: string]: { file: File, url: string, name: string } } = {};
  uploadingFiles: { [key: string]: boolean } = {};


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private trainingService: TrainingService,
    private jobApplicationService: JobApplicationService,
    private translateService: SimpleTranslateService
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
      payment_method: ['TRANSFER', [Validators.required]]  // TRANSFER par défaut
    });
  }

  ngOnInit(): void {
    this.trainingId = this.route.snapshot.paramMap.get('id');

    // Définir la méthode de paiement par défaut sur TRANSFER
    this.paymentMethod = 'TRANSFER';
    this.form.patchValue({ payment_method: 'TRANSFER' });

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
    const currentLang = this.translateService.getCurrentLanguage();
    const localeMap: { [key: string]: string } = {
      'fr': 'fr-FR',
      'en': 'en-US',
      'de': 'de-DE'
    };
    const locale = localeMap[currentLang] || 'fr-FR';
    return date.toLocaleDateString(locale, {
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
      // Stocker directement le fichier sans l'uploader sur S3
      this.uploadedFiles[attachmentType] = {
        file: file,
        url: '', // Pas besoin d'URL pour l'instant
        name: file.name
      };
      console.log('📎 [FORM-TRAINING] Fichier sélectionné:', this.uploadedFiles[attachmentType]);
    }
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
        // Le message d'erreur sera traduit dans le template
        this.submitError = 'bankReceiptRequired';
        return;
      }
    }

    this.isSubmitting = true;
    this.submitError = null;

    // ÉTAPE 1: Créer la candidature SANS attachments
    const payload: StudentApplicationCreateInput = {
      email: this.form.value.email,
      target_session_id: this.form.value.target_session_id,
      first_name: this.form.value.first_name,
      last_name: this.form.value.last_name,
      phone_number: this.form.value.phone_number,
      civility: this.form.value.civility,
      country_code: this.form.value.country_code || 'SN', // Utilise la valeur du formulaire
      city: this.form.value.city,
      address: this.form.value.address,
      date_of_birth: this.form.value.date_of_birth,
      payment_method: this.form.value.payment_method || this.paymentMethod
      // PAS d'attachments ici
    };

    console.log('📤 [FORM-TRAINING] ÉTAPE 1: Création de la candidature sans attachments:', payload);

    this.trainingService.createStudentApplication(payload).subscribe({
      next: (response: StudentApplicationResponse) => {
        console.log('✅ [FORM-TRAINING] ÉTAPE 1: Candidature créée avec succès:', response);
        console.log('📊 [FORM-TRAINING] Structure de response.data:', response.data);

        // ÉTAPE 2: Uploader les attachments si nécessaire
        if (this.paymentMethod === 'TRANSFER' && this.uploadedFiles['BANK_TRANSFER_RECEIPT']) {
          // Accéder directement à response.data.id (pas de student_application)
          const applicationId = (response.data as any).id;
          const file = this.uploadedFiles['BANK_TRANSFER_RECEIPT'].file;

          console.log('📤 [FORM-TRAINING] ÉTAPE 2: Upload du reçu bancaire pour application:', applicationId);

          this.trainingService.uploadStudentApplicationAttachment(
            applicationId.toString(),
            'BANK_TRANSFER_RECEIPT',
            file
          ).subscribe({
            next: (uploadResponse: any) => {
              console.log('✅ [FORM-TRAINING] ÉTAPE 2: Reçu bancaire uploadé avec succès:', uploadResponse);
              this.isSubmitting = false;

              // Redirection vers la page de succès
              this.router.navigate(['/training/success'], {
                queryParams: {
                  applicationNumber: (response.data as any).application_number,
                  subscriptionType: 'FORMATION',
                  paymentMethod: (response.data as any).payment_method,
                  amount: (response.data as any).submission_fee,
                  currency: (response.data as any).currency
                }
              });
            },
            error: (uploadErr: any) => {
              console.error('❌ [FORM-TRAINING] ÉTAPE 2: Erreur lors de l\'upload du reçu:', uploadErr);
              this.isSubmitting = false;
              this.submitError = uploadErr?.error?.message || 'Erreur lors de l\'upload du reçu bancaire';
            }
          });
        } else {
          // Pas d'upload nécessaire (paiement en ligne)
          this.isSubmitting = false;

          // Vérifier si c'est un paiement en ligne avec lien
          if ((response.data as any).payment && (response.data as any).payment.payment_link) {
            window.location.href = (response.data as any).payment.payment_link;
          } else {
            // Redirection vers la page de succès
            this.router.navigate(['/training/success'], {
              queryParams: {
                applicationNumber: (response.data as any).application_number,
                subscriptionType: 'FORMATION',
                paymentMethod: (response.data as any).payment_method,
                amount: (response.data as any).submission_fee,
                currency: (response.data as any).currency
              }
            });
          }
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.submitError = err?.error?.message || 'submissionError';
        console.error('❌ [FORM-TRAINING] ÉTAPE 1: Erreur lors de la création de la candidature:', err);
      }
    });
  }
}
