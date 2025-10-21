import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
    private fb: FormBuilder,
    private router: Router
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

  viewJobDetails(job: JobOffer) {
    console.log('📋 [HEADER] Redirection vers les détails de l\'offre:', job.title, 'ID:', job.id);
    this.router.navigate(['/application-recuitement', job.id]);
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
   * Convertit les noms d'affichage en codes techniques pour l'API
   */
  private getAttachmentTechnicalCode(displayName: string): string {
    const technicalCodes: { [key: string]: string } = {
      'CV': 'CV',
      'CV détaillé': 'RESUME',
      'Lettre de motivation': 'COVER_LETTER',
      'Copie de la pièce d\'identité': 'IDENTITY_CARD',
      'Diplômes et certifications': 'DIPLOMA',
      'Diplômes': 'DEGREE',
      'Relevés de notes': 'TRANSCRIPT',
      'Relevés de notes (Master)': 'TRANSCRIPT',
      'Attestations de formation': 'CERTIFICATE',
      'Lettres de recommandation': 'RECOMMENDATION_LETTER'
    };

    return technicalCodes[displayName] || displayName;
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
           this.error = null; // Clear any previous errors

    this.subscription.add(
      this.jobApplicationService.uploadAttachment(fileName, file).subscribe({
        next: (response: any) => {
                 console.log(`📤 [HEADER] Réponse d'upload pour ${attachmentType}:`, response);
                 
          this.uploadingFiles[attachmentType] = false;
                 
                 // Vérifier la structure de la réponse selon l'API backend
                 console.log(`🔍 [HEADER] Structure de réponse pour ${attachmentType}:`, response);
                 
                 let uploadedFileData: any = null;
                 
                 // Structure attendue selon l'API: JobAttachmentListOutSuccess
                 // { success: boolean, message: string, data: JobAttachmentOut[] }
                 if (response && response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
                   const attachmentData = response.data[0];
                   uploadedFileData = {
                     file: file,
                     url: attachmentData.file_path, // L'API retourne file_path, pas url
                     name: attachmentData.name || fileName
                   };
                   console.log(`✅ [HEADER] Structure API correcte détectée:`, attachmentData);
                 }
                 // Structure alternative: response.data[0].url
                 else if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
                   const attachmentData = response.data[0];
                   uploadedFileData = {
                     file: file,
                     url: attachmentData.url || attachmentData.file_path,
                     name: attachmentData.name || fileName
                   };
                   console.log(`✅ [HEADER] Structure alternative détectée:`, attachmentData);
                 }
                 // Structure 3: response.url directement
                 else if (response && response.url) {
                   uploadedFileData = {
                     file: file,
                     url: response.url,
                     name: response.name || fileName
                   };
                   console.log(`✅ [HEADER] Structure URL directe détectée:`, response);
                 }
                 // Structure 4: Simuler une URL si l'upload a réussi mais pas d'URL
                 else if (response && (response.success || response.message)) {
                   console.warn(`⚠️ [HEADER] Upload réussi mais pas d'URL pour ${attachmentType}, simulation d'une URL temporaire`);
                   uploadedFileData = {
              file: file,
                     url: `temp://uploaded/${fileName}`, // URL temporaire
                     name: fileName
                   };
                 }
                 
                 if (uploadedFileData) {
                   this.uploadedFiles[attachmentType] = uploadedFileData;
                   
                   console.log(`✅ [HEADER] Fichier ${attachmentType} uploadé avec succès:`, uploadedFileData);
                   console.log(`✅ [HEADER] URL stockée: ${uploadedFileData.url}`);
                   
                   // Vérifier que l'URL est valide (mais accepter les URLs temporaires)
                   if (!uploadedFileData.url || uploadedFileData.url.trim() === '') {
                     console.error(`❌ [HEADER] URL vide ou invalide pour le fichier ${attachmentType}`);
                     this.error = `Erreur: URL vide pour le fichier ${attachmentType}. Veuillez re-uploader ce fichier.`;
                     // Supprimer le fichier de la liste des fichiers uploadés
                     delete this.uploadedFiles[attachmentType];
                   } else {
                     console.log(`✅ [HEADER] Fichier ${attachmentType} correctement stocké avec URL: ${uploadedFileData.url}`);
                   }
                 } else {
                   console.error('❌ [HEADER] Réponse d\'upload invalide:', response);
                   this.error = `Réponse d'upload invalide pour ${attachmentType}. Structure de réponse: ${JSON.stringify(response)}`;
                   // Supprimer le fichier de la liste des fichiers uploadés
                   delete this.uploadedFiles[attachmentType];
          }
        },
        error: (error: any) => {
                 console.error(`❌ [HEADER] Erreur lors de l'upload du fichier ${attachmentType}:`, error);
                 console.error(`❌ [HEADER] Détails de l'erreur d'upload:`, {
                   status: error.status,
                   statusText: error.statusText,
                   message: error.message,
                   error: error.error,
                   url: error.url
                 });
                 
          this.uploadingFiles[attachmentType] = false;
                 
                 // Messages d'erreur spécifiques
                 if (error.status === 0) {
                   this.error = `Erreur de connexion pour ${attachmentType}. Vérifiez votre connexion internet.`;
                 } else if (error.status === 500) {
                   this.error = `Erreur serveur pour ${attachmentType}. Le serveur a rencontré un problème.`;
                 } else if (error.status === 413) {
                   this.error = `Fichier ${attachmentType} trop volumineux. Taille maximale: 10MB.`;
                 } else {
                   this.error = `Erreur lors de l'upload du fichier ${attachmentType}: ${error.error?.message || error.message || 'Erreur inconnue'}`;
                 }
                 
                 // Supprimer le fichier de la liste des fichiers uploadés
                 delete this.uploadedFiles[attachmentType];
        }
      })
    );
  }

  /**
   * Supprime un fichier uploadé
   */
  removeFile(attachmentType: string) {
    delete this.uploadedFiles[attachmentType];
    console.log(`🗑️ [HEADER] Fichier ${attachmentType} supprimé`);
  }

  /**
   * Force la re-upload d'un fichier spécifique
   */
  retryUpload(attachmentType: string) {
    console.log(`🔄 [HEADER] Tentative de re-upload pour ${attachmentType}`);
    
    // Supprimer le fichier actuel
    delete this.uploadedFiles[attachmentType];
    this.uploadingFiles[attachmentType] = false;
    this.error = null;
    
    // Déclencher le sélecteur de fichier
    const fileInput = document.querySelector(`input[type="file"][data-attachment="${attachmentType}"]`) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    } else {
      console.error(`❌ [HEADER] Impossible de trouver l'input file pour ${attachmentType}`);
      this.error = `Impossible de re-uploader ${attachmentType}. Veuillez sélectionner le fichier manuellement.`;
    }
  }

  /**
   * Méthode pour déboguer l'état actuel du formulaire
   */
  debugFormState() {
    console.log('🔍 [HEADER] État actuel du formulaire:');
    console.log('📝 [HEADER] Formulaire valide:', this.applicationForm.valid);
    console.log('📝 [HEADER] Valeurs du formulaire:', this.applicationForm.value);
    console.log('📎 [HEADER] Fichiers uploadés:', this.uploadedFiles);
    console.log('📎 [HEADER] Fichiers en cours d\'upload:', this.uploadingFiles);
    console.log('❌ [HEADER] Erreur actuelle:', this.error);
    console.log('✅ [HEADER] Validation complète:', this.isFormValid());
    
    // Vérifier chaque fichier uploadé
    for (const [type, fileData] of Object.entries(this.uploadedFiles)) {
      console.log(`📎 [HEADER] Fichier ${type}:`, {
        name: fileData.name,
        url: fileData.url,
        hasUrl: !!fileData.url,
        urlLength: fileData.url ? fileData.url.length : 0,
        isTemporary: fileData.url ? fileData.url.startsWith('temp://') : false
      });
    }
  }

  /**
   * Force la re-upload de tous les fichiers avec des URLs temporaires
   */
  retryAllTemporaryUploads() {
    console.log('🔄 [HEADER] Re-upload de tous les fichiers avec URLs temporaires');
    
    const temporaryFiles: string[] = [];
    for (const [type, fileData] of Object.entries(this.uploadedFiles)) {
      if (fileData.url && fileData.url.startsWith('temp://')) {
        temporaryFiles.push(type);
      }
    }
    
    if (temporaryFiles.length === 0) {
      console.log('✅ [HEADER] Aucun fichier avec URL temporaire trouvé');
      return;
    }
    
    console.log(`🔄 [HEADER] Fichiers avec URLs temporaires: ${temporaryFiles.join(', ')}`);
    
    // Supprimer tous les fichiers temporaires
    for (const type of temporaryFiles) {
      delete this.uploadedFiles[type];
    }
    
    this.error = `Re-upload nécessaire pour ${temporaryFiles.length} fichier(s). Veuillez re-sélectionner les fichiers.`;
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
    for (const [displayType, fileData] of Object.entries(this.uploadedFiles)) {
      console.log(`📎 [HEADER] Traitement du fichier ${displayType}:`, fileData);
      
      // Vérifier que l'URL existe
      if (!fileData.url) {
        console.error(`❌ [HEADER] URL manquante pour le fichier ${displayType}`);
        this.error = `URL manquante pour le fichier ${displayType}. Veuillez re-uploader ce fichier.`;
        this.submitting = false;
        return;
      }

      // Gérer les URLs temporaires
      let finalUrl = fileData.url;
      if (fileData.url.startsWith('temp://')) {
        console.warn(`⚠️ [HEADER] URL temporaire détectée pour ${displayType}, utilisation du nom de fichier`);
        // Pour les URLs temporaires, utiliser le nom du fichier comme URL
        finalUrl = fileData.name;
      }

      // Convertir le nom d'affichage en code technique
      const technicalType = this.getAttachmentTechnicalCode(displayType);
      console.log(`🔄 [HEADER] Conversion ${displayType} -> ${technicalType}`);

      attachments.push({
        name: fileData.name,
        type: technicalType, // Utiliser le code technique pour l'API
        url: finalUrl
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
   * Redirige vers le formulaire de candidature cabinet
   */
  applyForCabinet() {
    this.router.navigate(['/form-cabinet']);
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