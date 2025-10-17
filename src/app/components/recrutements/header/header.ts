import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { JobService } from '../../../services/job.service';
import { JobApplicationService } from '../../../services/job-application.service';
import { JobOffer, JobSession } from '../../../models/job.models';
import { JobApplicationCreateInput, JobAttachmentInput } from '../../../models/job-application.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {
  featuredJobs: JobOffer[] = [];
  loading = false;
  error: string | null = null;
  showModal = false;
  selectedJob: JobOffer | null = null;

  // Propriétés pour les sessions d'emploi
  availableSessions: JobSession[] = [];
  showSessionsModal = false;
  selectedSession: JobSession | null = null;

  // Propriétés pour le modal de candidature
  showApplicationModal = false;
  applicationForm: FormGroup;
  submitting = false;
  success = false;
  uploadedFiles: { [key: string]: { file: File, url: string, name: string } } = {};
  uploadingFiles: { [key: string]: boolean } = {};
  requiredAttachments: string[] = [];

  private subscription: Subscription = new Subscription();

  constructor(
    private jobService: JobService,
    private jobApplicationService: JobApplicationService,
    private fb: FormBuilder
  ) {
    this.applicationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      civility: [''],
      country_code: ['SN'],
      city: [''],
      address: [''],
      date_of_birth: [''],
      job_offer_id: [''],
      job_session_id: ['']
    });
  }

  ngOnInit() {
    console.log('🚀 [HEADER] Composant initialisé');
    this.loadFeaturedJobs();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadFeaturedJobs() {
    console.log('📋 [HEADER] Début du chargement des offres d\'emploi...');
    this.loading = true;
    this.error = null;

    this.subscription.add(
      this.jobService.getJobOffers({ featured: true, per_page: 10 }).subscribe({
        next: (response: any) => {
          this.loading = false;
          console.log('📋 [HEADER] Réponse complète:', response);
          
          if (response.data && Array.isArray(response.data)) {
            this.featuredJobs = response.data;
            console.log('📋 [HEADER] Offres d\'emploi chargées:', this.featuredJobs);
            console.log('📋 [HEADER] Nombre d\'offres:', this.featuredJobs.length);
            
            // Si aucune offre featured, charger toutes les offres disponibles
            if (this.featuredJobs.length === 0) {
              console.log('📋 [HEADER] Aucune offre featured, chargement de toutes les offres...');
              this.loadAllJobs();
            }
          } else {
            console.warn('📋 [HEADER] Format de réponse inattendu:', response);
            this.featuredJobs = [];
          }
        },
        error: (error: any) => {
          console.error('❌ [HEADER] Erreur lors du chargement des offres:', error);
          this.loading = false;
          this.error = `Erreur lors du chargement des offres d'emploi: ${error.error?.message || error.message}`;
        }
      })
    );
  }

  loadAllJobs() {
    console.log('📋 [HEADER] Chargement de toutes les offres d\'emploi...');
    
    this.subscription.add(
      this.jobService.getJobOffers({ per_page: 10 }).subscribe({
        next: (response: any) => {
          console.log('📋 [HEADER] Toutes les offres chargées:', response);
          
          if (response.data && Array.isArray(response.data)) {
            this.featuredJobs = response.data;
            console.log('📋 [HEADER] Toutes les offres d\'emploi chargées:', this.featuredJobs);
            console.log('📋 [HEADER] Nombre total d\'offres:', this.featuredJobs.length);
          }
        },
        error: (error: any) => {
          console.error('❌ [HEADER] Erreur lors du chargement de toutes les offres:', error);
        }
      })
    );
  }

  openModal(job: JobOffer) {
    this.selectedJob = job;
    this.showModal = true;
    console.log('📋 [HEADER] Modal ouvert pour:', job.title);
  }

  closeModal() {
    this.showModal = false;
    this.selectedJob = null;
  }

  openApplicationModal(job: JobOffer) {
    this.selectedJob = job;
    this.showApplicationModal = true;
    this.resetApplicationForm();
    console.log('📝 [HEADER] Modal de candidature ouvert pour:', job.title);
  }

  closeApplicationModal() {
    this.showApplicationModal = false;
    this.selectedJob = null;
    this.resetApplicationForm();
  }

  resetApplicationForm() {
    this.applicationForm.reset({
      country_code: 'SN'
    });
    this.uploadedFiles = {};
    this.uploadingFiles = {};
    this.error = null;
    this.success = false;
    this.submitting = false;
  }

  openSessionsModal(job: JobOffer) {
    this.selectedJob = job;
    this.loadAvailableSessions(Number(job.id));
  }

  closeSessionsModal() {
    this.showSessionsModal = false;
    this.selectedJob = null;
    this.availableSessions = [];
  }

  loadAvailableSessions(jobId: number) {
    // Pour l'instant, on simule des sessions vides
    // Cette fonctionnalité sera implémentée plus tard
    this.availableSessions = [];
    this.showSessionsModal = true;
    console.log('📅 [HEADER] Sessions non disponibles pour le moment');
  }

  selectSession(session: JobSession) {
    this.selectedSession = session;
    this.applicationForm.patchValue({
      job_session_id: session.id
    });
    this.closeSessionsModal();
    this.openApplicationModal(this.selectedJob!);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
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

  /**
   * Détermine les pièces jointes requises pour une offre d'emploi
   */
  getRequiredAttachments(job: JobOffer | null): string[] {
    if (!job) return [];

    // Si l'offre a des pièces jointes spécifiées dans l'API
    if (job.attachment && Array.isArray(job.attachment) && job.attachment.length > 0) {
      // Convertir les codes techniques en noms lisibles
      return job.attachment.map((attachment: string) => this.getAttachmentDisplayName(attachment));
    }

    // Pièces jointes par défaut selon le type de poste
    if (job.title && job.title.toLowerCase().includes('directeur')) {
      return [
        'CV détaillé',
        'Lettre de motivation',
        'Copie de la pièce d\'identité',
        'Diplômes et certifications',
        'Relevés de notes (Master)',
        'Attestations de formation',
        'Lettres de recommandation'
      ];
    } else {
      return [
        'CV',
        'Lettre de motivation',
        'Copie de la pièce d\'identité',
        'Diplômes et certifications'
      ];
    }
  }

  /**
   * Convertit les codes techniques des pièces jointes en noms lisibles
   */
  private getAttachmentDisplayName(attachmentCode: string): string {
    const attachmentNames: { [key: string]: string } = {
      'CV': 'CV',
      'COVER_LETTER': 'Lettre de motivation',
      'DIPLOMA': 'Diplômes et certifications',
      'IDENTITY_CARD': 'Copie de la pièce d\'identité',
      'TRANSCRIPT': 'Relevés de notes',
      'CERTIFICATE': 'Attestations de formation',
      'RECOMMENDATION_LETTER': 'Lettres de recommandation',
      'RESUME': 'CV détaillé',
      'MOTIVATION_LETTER': 'Lettre de motivation',
      'DEGREE': 'Diplômes',
      'ID_COPY': 'Copie de la pièce d\'identité'
    };

    return attachmentNames[attachmentCode] || attachmentCode;
  }

  /**
   * Gère la sélection de fichiers
   */
  onFileSelected(event: any, attachmentType: string) {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (file.type !== 'application/pdf') {
        this.error = 'Seuls les fichiers PDF sont acceptés';
        return;
      }
      // Vérifier la taille du fichier (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.error = 'Le fichier ne doit pas dépasser 10MB';
        return;
      }
      // Upload immédiat du fichier
      this.uploadFile(file, attachmentType);
    }
  }

  /**
   * Upload un fichier
   */
  uploadFile(file: File, attachmentType: string) {
    const fileName = `${attachmentType}_${Date.now()}_${file.name}`;
    
    console.log(`📤 [HEADER] Début de l'upload du fichier ${attachmentType}:`, {
      fileName: fileName,
      fileSize: file.size,
      fileType: file.type
    });
    
    // Marquer comme en cours d'upload
    this.uploadingFiles[attachmentType] = true;

    this.subscription.add(
      this.jobApplicationService.uploadAttachment(fileName, file).subscribe({
        next: (response: any) => {
          console.log(`📤 [HEADER] Réponse d'upload pour ${attachmentType}:`, response);
          
          this.uploadingFiles[attachmentType] = false;
          
          if (response.data && response.data.length > 0) {
            const uploadedFileData = {
              file: file,
              url: response.data[0].url,
              name: response.data[0].name
            };
            
            this.uploadedFiles[attachmentType] = uploadedFileData;
            
            console.log(`✅ [HEADER] Fichier ${attachmentType} uploadé avec succès:`, uploadedFileData);
            console.log(`✅ [HEADER] URL stockée: ${uploadedFileData.url}`);
            
            // Vérifier que l'URL est valide
            if (!uploadedFileData.url) {
              console.error(`❌ [HEADER] URL vide pour le fichier ${attachmentType}`);
              this.error = `Erreur: URL vide pour le fichier ${attachmentType}`;
            }
          } else {
            console.error('❌ [HEADER] Réponse d\'upload invalide:', response);
            this.error = `Réponse d'upload invalide pour ${attachmentType}`;
          }
        },
        error: (error: any) => {
          console.error(`❌ [HEADER] Erreur lors de l'upload du fichier ${attachmentType}:`, error);
          console.error(`❌ [HEADER] Détails de l'erreur d'upload:`, {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
          
          this.uploadingFiles[attachmentType] = false;
          this.error = `Erreur lors de l'upload du fichier ${attachmentType}: ${error.error?.message || error.message}`;
        }
      })
    );
  }

  /**
   * Supprime un fichier uploadé
   */
  removeFile(attachmentType: string) {
    delete this.uploadedFiles[attachmentType];
    console.log(`Fichier ${attachmentType} supprimé`);
  }

  /**
   * Vérifie si le formulaire est valide
   */
  isFormValid(): boolean {
    console.log('🔍 [HEADER] Vérification de la validité du formulaire...');
    
    // Vérifier que tous les champs requis sont remplis
    const formValid = this.applicationForm.valid;
    console.log('📝 [HEADER] Formulaire valide:', formValid);
    console.log('📝 [HEADER] Erreurs du formulaire:', this.getFormErrors());
    
    if (!formValid) {
      return false;
    }

    // Vérifier que tous les fichiers requis sont uploadés
    const requiredAttachments = this.getRequiredAttachments(this.selectedJob);
    console.log('📎 [HEADER] Pièces jointes requises:', requiredAttachments);
    console.log('📎 [HEADER] Fichiers uploadés:', Object.keys(this.uploadedFiles));
    
    for (const attachmentType of requiredAttachments) {
      if (!this.uploadedFiles[attachmentType]) {
        console.log(`❌ [HEADER] Fichier manquant: ${attachmentType}`);
        return false;
      }
    }

    console.log('✅ [HEADER] Formulaire valide et tous les fichiers uploadés');
    return true;
  }

  /**
   * Récupère les erreurs du formulaire pour le débogage
   */
  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.applicationForm.controls).forEach(key => {
      const control = this.applicationForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  /**
   * Soumet la candidature
   */
  onSubmitApplication() {
    console.log('🚀 [HEADER] onSubmitApplication démarré');
    
    if (!this.isFormValid()) {
      this.error = 'Veuillez remplir tous les champs requis et uploader tous les documents';
      return;
    }

    this.submitting = true;
    this.error = null;

    // Debug: Afficher les fichiers uploadés
    console.log('📎 [HEADER] Fichiers uploadés détaillés:', this.uploadedFiles);
    
    // Préparer les attachments selon le format attendu par le backend
    const attachments: JobAttachmentInput[] = [];
    for (const [type, fileData] of Object.entries(this.uploadedFiles)) {
      console.log(`📎 [HEADER] Traitement du fichier ${type}:`, fileData);
      
      // Vérifier que l'URL existe
      if (!fileData.url) {
        console.error(`❌ [HEADER] URL manquante pour le fichier ${type}`);
        this.error = `URL manquante pour le fichier ${type}. Veuillez re-uploader ce fichier.`;
        this.submitting = false;
        return;
      }

      attachments.push({
        name: fileData.name,
        type: type, // Utiliser le nom d'affichage comme type
        url: fileData.url
      });
    }

    console.log('📎 [HEADER] Attachments préparés:', attachments);

    const applicationData: JobApplicationCreateInput = {
      ...this.applicationForm.value,
      job_offer_id: this.selectedJob?.id,
      attachments: attachments
    };

    console.log('📤 [HEADER] Données de candidature complètes:', applicationData);
    console.log('📤 [HEADER] Formulaire values:', this.applicationForm.value);
    console.log('📤 [HEADER] Job offer ID:', this.selectedJob?.id);

    this.subscription.add(
      this.jobApplicationService.createApplication(applicationData).subscribe({
        next: (response: any) => {
          console.log('✅ [HEADER] Réponse de la candidature:', response);
          this.success = true;
          this.submitting = false;

          // Rediriger vers la page de paiement si disponible
          if (response.data && response.data.payment && response.data.payment.payment_link) {
            console.log('💳 [HEADER] Redirection vers le paiement:', response.data.payment.payment_link);
            window.location.href = response.data.payment.payment_link;
          } else {
            console.log('ℹ️ [HEADER] Aucune redirection disponible, affichage du message de succès');
          }
        },
        error: (error: any) => {
          console.error('❌ [HEADER] Erreur lors de la soumission de la candidature:', error);
          console.error('❌ [HEADER] Détails de l\'erreur:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error,
            url: error.url
          });
          
          // Afficher des messages d'erreur plus spécifiques
          if (error.status === 422) {
            this.error = `Erreur de validation: ${error.error?.detail || 'Données invalides'}`;
          } else if (error.status === 0) {
            this.error = 'Erreur de connexion. Vérifiez votre connexion internet.';
          } else {
            this.error = `Erreur lors de la soumission: ${error.error?.message || error.message || 'Erreur inconnue'}`;
          }
          
          this.submitting = false;
        }
      })
    );
  }

  /**
   * Télécharge le document PDF d'appel d'offre
   */
  downloadDocument() {
    const documentUrl = '/asset/appel_offre_cabinet_conseil_lafaom.pdf';
    const fileName = 'Appel-d-offre-LAFAOM.pdf';

    try {
      // Créer un élément <a> temporaire pour déclencher le téléchargement
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = fileName;
      link.target = '_blank';

      // Ajouter le lien au DOM temporairement
      document.body.appendChild(link);

      // Déclencher le téléchargement
      link.click();

      // Nettoyer le DOM
      document.body.removeChild(link);

      console.log('📄 Document téléchargé avec succès:', fileName);
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement du document:', error);
      // Fallback: ouvrir le document dans un nouvel onglet
      window.open(documentUrl, '_blank');
    }
  }

  /**
   * Méthode de test pour déboguer le formulaire
   */
  testFormSubmission() {
    console.log('🧪 [HEADER] Test de soumission du formulaire');
    console.log('🧪 [HEADER] État du formulaire:', {
      valid: this.applicationForm.valid,
      value: this.applicationForm.value,
      errors: this.getFormErrors()
    });
    console.log('🧪 [HEADER] Fichiers uploadés:', this.uploadedFiles);
    console.log('🧪 [HEADER] Validation du formulaire:', this.isFormValid());
    
    // Simuler des données de test si nécessaire
    if (Object.keys(this.uploadedFiles).length === 0) {
      console.log('🧪 [HEADER] Aucun fichier uploadé - simulation de fichiers de test');
      this.uploadedFiles = {
        'CV': {
          file: new File(['test'], 'test-cv.pdf', { type: 'application/pdf' }),
          url: 'http://test-url.com/cv.pdf',
          name: 'test-cv.pdf'
        },
        'Lettre de motivation': {
          file: new File(['test'], 'test-letter.pdf', { type: 'application/pdf' }),
          url: 'http://test-url.com/letter.pdf',
          name: 'test-letter.pdf'
        }
      };
    }
  }
}