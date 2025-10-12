import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { JobService } from '../../../services/job.service';
import { JobApplicationService } from '../../../services/job-application.service';
import { JobOffer } from '../../../models/job.models';
import { JobApplicationCreateInput, JobAttachmentInput } from '../../../models/job-application.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recrutements-section-1',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './section-1.html',
  styleUrl: './section-1.css'
})
export class Section1 implements OnInit, OnDestroy {
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
    const value = (event.target as HTMLInputElement)?.value;
    console.log(`🔄 [SECTION-1] ${field} changé:`, value);
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
      // Forcer la détection des changements
      setTimeout(() => {
        console.log('Formulaire changé, validation...');
        console.log('État du formulaire:', this.applicationForm.status);
        console.log('Erreurs du formulaire:', this.applicationForm.errors);
        console.log('Champs avec erreurs:');
        Object.keys(this.applicationForm.controls).forEach(key => {
          const control = this.applicationForm.get(key);
          if (control && control.errors) {
            console.log(`${key}:`, control.errors);
          }
        });
      }, 100);
    });
  }

  ngOnInit() {
    console.log('🚀 [SECTION-1] ngOnInit démarré');
    console.log('🔍 [SECTION-1] État initial:', {
      loading: this.loading,
      jobOffer: this.jobOffer,
      error: this.error
    });
    
    // Toujours recharger la page pour s'assurer que les données sont bien chargées
    if (typeof window !== 'undefined') {
      console.log('🌐 [SECTION-1] Window disponible, vérification du sessionStorage');
      const reloadFlag = sessionStorage.getItem('candidature-reloaded');
      console.log('🔍 [SECTION-1] Flag de rechargement:', reloadFlag);
      
      // Vérifier si on vient d'une autre page (pas de rechargement en boucle)
      if (!reloadFlag) {
        console.log('🔄 [SECTION-1] Premier chargement, rechargement de la page');
        sessionStorage.setItem('candidature-reloaded', 'true');
        window.location.reload();
        return;
      } else {
        console.log('🔄 [SECTION-1] Deuxième chargement, nettoyage et rechargement');
        // Nettoyer le flag et recharger à nouveau
        sessionStorage.removeItem('candidature-reloaded');
        window.location.reload();
        return;
      }
    }
    console.log('📋 [SECTION-1] Chargement de l\'offre d\'emploi');
    this.loadJobOffer();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    // Nettoyer le sessionStorage quand on quitte la page
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('candidature-reloaded');
    }
  }

  loadJobOffer() {
    console.log('📋 [SECTION-1] loadJobOffer démarré');
    this.loading = true; // Démarrer le loading
    this.error = null;
    console.log('⏳ [SECTION-1] Loading activé');
    
    this.route.params.subscribe((params: any) => {
      console.log('🔍 [SECTION-1] Paramètres de route:', params);
      const jobId = params['id'];
      console.log('🆔 [SECTION-1] Job ID extrait:', jobId);
      
      if (jobId) {
        console.log('🌐 [SECTION-1] Appel de l\'API pour récupérer l\'offre:', jobId);
        this.subscription.add(
          this.jobService.getJobOfferById(jobId).subscribe({
            next: (jobOffer: any) => {
              console.log('✅ [SECTION-1] Offre d\'emploi chargée avec succès:', jobOffer);
              this.jobOffer = jobOffer;
              console.log('📎 [SECTION-1] Pièces jointes de l\'offre:', jobOffer.attachment);
              
              // Si pas de pièces jointes spécifiées, utiliser des documents par défaut
              this.requiredAttachments = jobOffer.attachment && jobOffer.attachment.length > 0 
                ? jobOffer.attachment 
                : ['CV', 'Lettre de motivation', 'Copie de la pièce d\'identité'];
              
              console.log('📋 [SECTION-1] Pièces jointes requises:', this.requiredAttachments);
              
              this.applicationForm.patchValue({
                job_offer_id: jobOffer.id
              });
              console.log('📝 [SECTION-1] Formulaire mis à jour avec job_offer_id:', jobOffer.id);
              this.loading = false;
              console.log('✅ [SECTION-1] Loading désactivé');
            },
            error: (error: any) => {
              console.error('❌ [SECTION-1] Erreur lors du chargement de l\'offre d\'emploi:', error);
              this.error = 'Impossible de charger l\'offre d\'emploi';
              this.loading = false;
              console.log('❌ [SECTION-1] Loading désactivé après erreur');
            }
          })
        );
      } else {
        console.log('❌ [SECTION-1] Aucun Job ID trouvé');
        this.error = 'Aucune offre d\'emploi spécifiée';
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any, attachmentType: string) {
    const file = event.target.files[0];
    console.log('Event de sélection de fichier:', event);
    console.log('Fichier sélectionné:', file);
    console.log('Type d\'attachement:', attachmentType);
    
    if (file) {
      console.log(`Fichier sélectionné pour ${attachmentType}:`, file.name, file.size, file.type);
      // Upload immédiat du fichier
      this.uploadFile(file, attachmentType);
    } else {
      console.log('Aucun fichier sélectionné');
    }
  }

  uploadFile(file: File, attachmentType: string) {
    const fileName = `${attachmentType}_${Date.now()}_${file.name}`;
    console.log(`Début de l'upload pour ${attachmentType}:`, fileName);
    console.log('Service d\'upload:', this.jobApplicationService);
    
    // Marquer comme en cours d'upload
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
            console.log('Fichiers uploadés après:', Object.keys(this.uploadedFiles));
            console.log('État complet des fichiers:', this.uploadedFiles);
            // Forcer la détection des changements
            setTimeout(() => {
              console.log('Validation après upload...');
            }, 100);
          } else {
            console.error('Réponse d\'upload invalide:', response);
          }
        },
        error: (error: any) => {
          console.error(`Erreur lors de l'upload du fichier ${attachmentType}:`, error);
          console.error('Détails de l\'erreur:', error.error);
          this.uploadingFiles[attachmentType] = false;
          this.error = `Erreur lors de l'upload du fichier ${attachmentType}: ${error.error?.message || error.message}`;
        }
      })
    );
  }

  removeFile(attachmentType: string) {
    delete this.uploadedFiles[attachmentType];
    console.log(`Fichier ${attachmentType} supprimé`);
    console.log('Fichiers restants:', Object.keys(this.uploadedFiles));
    // Forcer la détection des changements
    setTimeout(() => {
      console.log('Validation après suppression...');
    }, 100);
  }

  getFileStatus(attachmentType: string): string {
    if (this.uploadedFiles[attachmentType]) {
      return 'uploaded';
    }
    return 'pending';
  }

  isFormValid(): boolean {
    console.log('Validation du formulaire...');
    console.log('Formulaire valide:', this.applicationForm.valid);
    console.log('Fichiers uploadés:', Object.keys(this.uploadedFiles));
    console.log('Fichiers requis:', this.requiredAttachments);
    
    // Vérifier que tous les champs requis sont remplis
    if (!this.applicationForm.valid) {
      console.log('Formulaire invalide - champs manquants');
      return false;
    }

    // Vérifier que tous les fichiers requis sont uploadés
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
    console.log('🚀 [SECTION-1] onSubmit démarré');
    console.log('📋 [SECTION-1] État du formulaire:', {
      valid: this.applicationForm.valid,
      value: this.applicationForm.value,
      errors: this.applicationForm.errors
    });
    console.log('📎 [SECTION-1] Fichiers uploadés:', Object.keys(this.uploadedFiles));
    console.log('📊 [SECTION-1] Détail des fichiers uploadés:', this.uploadedFiles);
    
    // Avertissement si le formulaire n'est pas complet, mais on continue
    if (!this.applicationForm.valid) {
      console.warn('⚠️ [SECTION-1] Formulaire incomplet, mais soumission autorisée');
      console.log('🔍 [SECTION-1] Erreurs du formulaire:', this.applicationForm.errors);
    }
    
    if (Object.keys(this.uploadedFiles).length === 0) {
      console.warn('⚠️ [SECTION-1] Aucun fichier uploadé, mais soumission autorisée');
    }

    console.log('⏳ [SECTION-1] Démarrage de la soumission');
    this.submitting = true;
    this.error = null;

    // Préparer les attachments selon le format attendu par le backend
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

    const applicationData: JobApplicationCreateInput = {
      ...this.applicationForm.value,
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
                  this.router.navigate(['/recrutements/success'], {
                    queryParams: { applicationNumber: response.data.job_application.application_number }
                  });
                } else {
                  console.log('Aucune redirection disponible, affichage du message de succès');
                }
        },
        error: (error: any) => {
          console.error('Erreur lors de la soumission de la candidature:', error);
          console.error('Détails de l\'erreur:', error.error);
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