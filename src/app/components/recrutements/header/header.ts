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
    
    // Marquer comme en cours d'upload
    this.uploadingFiles[attachmentType] = true;

    this.subscription.add(
      this.jobApplicationService.uploadAttachment(fileName, file).subscribe({
        next: (response: any) => {
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
    // Vérifier que tous les champs requis sont remplis
    if (!this.applicationForm.valid) {
      return false;
    }

    // Vérifier que tous les fichiers requis sont uploadés
    const requiredAttachments = this.getRequiredAttachments(this.selectedJob);
    for (const attachmentType of requiredAttachments) {
      if (!this.uploadedFiles[attachmentType]) {
        return false;
      }
    }

    return true;
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

    // Préparer les attachments selon le format attendu par le backend
    const attachments: JobAttachmentInput[] = [];
    for (const [type, fileData] of Object.entries(this.uploadedFiles)) {
      attachments.push({
        name: fileData.name,
        type: type,
        url: fileData.url
      });
    }

    const applicationData: JobApplicationCreateInput = {
      ...this.applicationForm.value,
      job_offer_id: this.selectedJob?.id,
      attachments: attachments
    };

    console.log('📤 [HEADER] Données de candidature:', applicationData);

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
          this.error = `Erreur lors de la soumission de la candidature: ${error.error?.message || error.message || 'Erreur inconnue'}`;
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
}