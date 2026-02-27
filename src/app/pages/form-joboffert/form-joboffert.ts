import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { JobService } from '../../services/job.service';
import { JobApplicationService } from '../../services/job-application.service';
import { JobOffer } from '../../models/job.models';
import { JobApplicationCreateInput, JobAttachmentInput } from '../../models/job-application.models';
import { Subscription } from 'rxjs';

import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-form-joboffert',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './form-joboffert.html',
  styleUrls: ['./form-joboffert.css']
})
export class FormJoboffert implements OnInit, OnDestroy {
  jobOffer: JobOffer | null = null;
  applicationForm: FormGroup;
  loading = false;
  submitting = false;
  error: string | null = null;
  success = false;
  uploadedFiles: { [key: string]: { file: File, url: string, name: string } } = {};
  uploadingFiles: { [key: string]: boolean } = {};
  requiredAttachments: string[] = [];
  private subscription: Subscription = new Subscription();

  // Méthode de logging pour les templates
  logChange(field: string, event: any) {
    const value = (event.target as HTMLInputElement | HTMLSelectElement)?.value;
    console.log(`🔄 [FORM-JOBOFFERT] ${field} changé:`, value);
  }

  constructor(
    private jobService: JobService,
    private jobApplicationService: JobApplicationService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.applicationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      civility: [''],
      country_code: ['SN'], // Sénégal par défaut
      city: [''],
      address: [''],
      date_of_birth: [''],
      job_offer_id: ['']
    });

    // Écouter les changements du formulaire pour déclencher la validation
    this.applicationForm.valueChanges.subscribe(() => {
      setTimeout(() => {
        console.log('Formulaire changé, validation...');
        console.log('État du formulaire:', this.applicationForm.status);
      }, 100);
    });
  }

  ngOnInit() {
    console.log('🚀 [FORM-JOBOFFERT] ngOnInit démarré');
    console.log('🔍 [FORM-JOBOFFERT] État initial:', {
      loading: this.loading,
      jobOffer: this.jobOffer,
      error: this.error
    });

    // Toujours recharger la page pour s'assurer que les données sont bien chargées
    if (typeof window !== 'undefined') {
      console.log('🌐 [FORM-JOBOFFERT] Window disponible, vérification du sessionStorage');
      const reloadFlag = sessionStorage.getItem('form-joboffert-reloaded');
      console.log('🔍 [FORM-JOBOFFERT] Flag de rechargement:', reloadFlag);

      // Vérifier si on vient d'une autre page (pas de rechargement en boucle)
      if (!reloadFlag) {
        console.log('🔄 [FORM-JOBOFFERT] Premier chargement, rechargement de la page');
        sessionStorage.setItem('form-joboffert-reloaded', 'true');
        window.location.reload();
        return;
      } else {
        console.log('🔄 [FORM-JOBOFFERT] Deuxième chargement, nettoyage et rechargement');
        // Nettoyer le flag et recharger à nouveau
        sessionStorage.removeItem('form-joboffert-reloaded');
        window.location.reload();
        return;
      }
    }

    console.log('📋 [FORM-JOBOFFERT] Chargement de l\'offre d\'emploi');
    // Récupérer l'ID de l'offre depuis les paramètres de route
    this.route.params.subscribe((params: any) => {
      const jobId = params['id'];
      if (jobId) {
        this.loadJobOffer(jobId);
      } else {
        this.error = 'Aucune offre d\'emploi spécifiée';
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    // Nettoyer le sessionStorage quand on quitte la page
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('form-joboffert-reloaded');
    }
  }

  loadJobOffer(jobId: string) {
    console.log('📋 [FORM-JOBOFFERT] Chargement de l\'offre d\'emploi:', jobId);
    this.loading = true;
    this.error = null;

    this.subscription.add(
      this.jobService.getJobOfferById(jobId).subscribe({
        next: (jobOffer: JobOffer) => {
          console.log('✅ [FORM-JOBOFFERT] Offre d\'emploi chargée:', jobOffer);
          this.jobOffer = jobOffer;

          // Définir les pièces jointes requises
          this.requiredAttachments = jobOffer.attachment && jobOffer.attachment.length > 0
            ? jobOffer.attachment
            : ['CV', 'Lettre de motivation', 'Copie de la pièce d\'identité'];

          console.log('📋 [FORM-JOBOFFERT] Pièces jointes requises:', this.requiredAttachments);

          this.applicationForm.patchValue({
            job_offer_id: jobOffer.id
          });

          this.loading = false;
        },
        error: (error: any) => {
          console.error('❌ [FORM-JOBOFFERT] Erreur lors du chargement:', error);
          this.error = 'Impossible de charger l\'offre d\'emploi';
          this.loading = false;
        }
      })
    );
  }

  onFileSelected(event: any, attachmentType: string) {
    const file = event.target.files[0];
    console.log(`Fichier sélectionné pour ${attachmentType}:`, file);

    if (file) {
      this.uploadFile(file, attachmentType);
    }
  }

  uploadFile(file: File, attachmentType: string) {
    const fileName = `${attachmentType}_${Date.now()}_${file.name}`;
    console.log(`Début de l'upload pour ${attachmentType}:`, fileName);

    this.uploadingFiles[attachmentType] = true;

    this.subscription.add(
      this.jobApplicationService.uploadAttachment(fileName, file).subscribe({
        next: (response: any) => {
          console.log('Réponse de l\'upload:', response);
          this.uploadingFiles[attachmentType] = false;

          if (response.data && response.data.length > 0) {
            this.uploadedFiles[attachmentType] = {
              file: file,
              url: response.data[0].url,
              name: response.data[0].name
            };
            console.log(`Fichier ${attachmentType} uploadé avec succès:`, response.data[0]);
          } else {
            console.error('Réponse d\'upload invalide:', response);
          }
        },
        error: (error: any) => {
          console.error(`Erreur lors de l'upload du fichier ${attachmentType}:`, error);
          this.uploadingFiles[attachmentType] = false;
          this.error = `Erreur lors de l'upload du fichier ${attachmentType}: ${error.error?.message || error.message}`;
        }
      })
    );
  }

  removeFile(attachmentType: string) {
    delete this.uploadedFiles[attachmentType];
    console.log(`Fichier ${attachmentType} supprimé`);
  }

  getFileStatus(attachmentType: string): string {
    if (this.uploadedFiles[attachmentType]) {
      return 'uploaded';
    }
    if (this.uploadingFiles[attachmentType]) {
      return 'uploading';
    }
    return 'pending';
  }

  isFormValid(): boolean {
    console.log('Validation du formulaire...');
    console.log('Formulaire valide:', this.applicationForm.valid);
    console.log('Fichiers uploadés:', Object.keys(this.uploadedFiles));
    console.log('Fichiers requis:', this.requiredAttachments);

    if (!this.applicationForm.valid) {
      console.log('Formulaire invalide - champs manquants');
      return false;
    }

    for (const attachmentType of this.requiredAttachments) {
      if (!this.uploadedFiles[attachmentType]) {
        console.log(`Fichier manquant: ${attachmentType}`);
        return false;
      }
    }

    console.log('Formulaire valide !');
    return true;
  }

  onSubmit() {
    console.log('🚀 [FORM-JOBOFFERT] Soumission du formulaire');
    console.log('📋 [FORM-JOBOFFERT] État du formulaire:', {
      valid: this.applicationForm.valid,
      value: this.applicationForm.value,
      errors: this.applicationForm.errors
    });
    console.log('📎 [FORM-JOBOFFERT] Fichiers uploadés:', Object.keys(this.uploadedFiles));

    this.submitting = true;
    this.error = null;

    // Préparer les attachments
    const attachments: JobAttachmentInput[] = [];
    for (const [type, fileData] of Object.entries(this.uploadedFiles)) {
      attachments.push({
        name: fileData.name,
        type: type,
        url: fileData.url
      });
    }

    console.log('Données de candidature à envoyer:', {
      ...this.applicationForm.value,
      attachments: attachments
    });

    // Préparer les données en convertissant date_of_birth si nécessaire
    const formValue = { ...this.applicationForm.value };

    // Convertir date_of_birth de string vers date si présent
    if (formValue.date_of_birth && formValue.date_of_birth.trim() !== '') {
      formValue.date_of_birth = new Date(formValue.date_of_birth).toISOString().split('T')[0];
    } else {
      // Supprimer le champ si vide pour éviter l'erreur de validation
      delete formValue.date_of_birth;
    }

    const applicationData: JobApplicationCreateInput = {
      ...formValue,
      attachments: attachments
    };

    this.subscription.add(
      this.jobApplicationService.createApplication(applicationData).subscribe({
        next: (response: any) => {
          console.log('Réponse de la candidature:', response);
          this.success = true;
          this.submitting = false;

          // Rediriger vers la page de paiement si disponible
          if (response.data && response.data.payment && response.data.payment.payment_link) {
            console.log('Redirection vers le paiement:', response.data.payment.payment_link);
            window.location.href = response.data.payment.payment_link;
          } else if (response.data && response.data.job_application) {
            console.log('Redirection vers la page de succès');
            this.router.navigate(['/recruitment/success'], {
              queryParams: { applicationNumber: response.data.job_application.application_number }
            });
          } else {
            console.log('Aucune redirection disponible, affichage du message de succès');
          }
        },
        error: (error: any) => {
          console.error('❌ [FORM-JOBOFFERT] Erreur lors de la soumission:', error);
          this.error = `Erreur lors de la soumission de la candidature: ${error.error?.message || error.message || 'Erreur inconnue'}`;
          this.submitting = false;
        }
      })
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatSalary(salary: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR').format(salary) + ' ' + currency;
  }
}