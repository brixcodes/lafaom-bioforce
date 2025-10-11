import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { JobService } from '../../../services/job.service';
import { JobApplicationService } from '../../../services/job-application.service';
import { JobOffer, JobSession } from '../../../models/job.models';
import { JobApplicationCreateInput, JobAttachmentInput } from '../../../models/job-application.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {
  featuredJobs: JobOffer[] = [];
  loading = false; // Changé de true à false pour éviter le loading automatique
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
      country_code: ['SN'], // Sénégal bloqué
      city: [''],
      address: [''],
      date_of_birth: [''],
      job_offer_id: [''],
      job_session_id: ['']
    });
  }

  ngOnInit() {
    this.loadFeaturedJobs();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadFeaturedJobs() {
    // Ne pas afficher le loading au chargement initial
    this.error = null;

    this.subscription.add(
      this.jobService.getFeaturedJobOffers(3).subscribe({
        next: (response) => {
          console.log('Réponse API reçue:', response);
          this.featuredJobs = response.data;
          console.log('Données assignées:', this.featuredJobs);
          this.loading = false;
          console.log('Offres d\'emploi mises en avant chargées:', this.featuredJobs);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des offres d\'emploi:', error);
          this.error = 'Impossible de charger les offres d\'emploi';
          this.loading = false;
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


  getSkillsText(competencies: string): string {
    const skills = competencies.split(',').map(s => s.trim());
    return skills.slice(0, 3).join(', ') + (skills.length > 3 ? '...' : '');
  }

  formatSalary(salary: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR').format(salary) + ' ' + currency;
  }

  openModal(job: JobOffer) {
    this.selectedJob = job;
    this.showModal = true;
    this.loadJobSessions(job.id);
    
    // Empêcher le scroll du body quand le modal est ouvert
    if (typeof document !== 'undefined') {
      document.body.classList.add('modal-open');
    }
  }

  loadJobSessions(jobId: string) {
    // Simuler le chargement des sessions pour cette offre d'emploi
    // Dans un vrai projet, vous feriez un appel API ici
    this.availableSessions = [
      {
        id: '1',
        job_offer_id: jobId,
        start_date: '2024-02-01',
        end_date: '2024-02-28',
        registration_deadline: '2024-01-25',
        available_positions: 5,
        status: 'OPEN_FOR_REGISTRATION',
        location: 'Dakar',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      {
        id: '2',
        job_offer_id: jobId,
        start_date: '2024-03-01',
        end_date: '2024-03-31',
        registration_deadline: '2024-02-25',
        available_positions: 3,
        status: 'OPEN_FOR_REGISTRATION',
        location: 'Ziguinchor',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
    ];
  }

  openSessionsModal() {
    this.showSessionsModal = true;
    
    // Empêcher le scroll du body quand le modal est ouvert
    if (typeof document !== 'undefined') {
      document.body.classList.add('modal-open');
    }
  }

  closeSessionsModal() {
    this.showSessionsModal = false;
    this.selectedSession = null;
    
    // Nettoyer l'état du modal
    if (typeof document !== 'undefined') {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
    }
  }

  selectSession(session: JobSession) {
    this.selectedSession = session;
    this.closeSessionsModal();
    this.openApplicationModal(this.selectedJob!);
    
    // Mettre à jour le formulaire avec l'ID de la session
    this.applicationForm.patchValue({
      job_session_id: session.id
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedJob = null;
    
    // Nettoyer complètement l'état du modal
    if (typeof document !== 'undefined') {
      // Supprimer toutes les classes et styles liés au modal
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.style.padding = '';
      
      // Supprimer tous les backdrops existants
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
      
      // Supprimer tous les overlays de modal
      const modals = document.querySelectorAll('.modal');
      modals.forEach(modal => {
        modal.classList.remove('show');
        (modal as HTMLElement).style.display = 'none';
      });
      
      // Forcer le reflow pour s'assurer que les changements sont appliqués
      document.body.offsetHeight;
      
      // Recharger la page après fermeture du modal
      window.location.reload();
    }
  }

  // Méthodes pour le modal de candidature
  openApplicationModal(job: JobOffer) {
    // Fermer complètement le modal de présentation du poste
    this.showModal = false;
    this.selectedJob = null; // Réinitialiser le job sélectionné pour le modal de présentation
    
    // Nettoyer l'état du modal de présentation
    if (typeof document !== 'undefined') {
      // Supprimer les backdrops du modal de présentation
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
      
      // Supprimer les classes du body liées au modal de présentation
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    // Ouvrir le modal de candidature
    this.selectedJob = job;
    this.showApplicationModal = true;
    this.success = false;
    this.error = null;
    
    // Initialiser les pièces jointes requises
    this.requiredAttachments = job.attachment && job.attachment.length > 0 
      ? job.attachment 
      : ['CV', 'Lettre de motivation', 'Copie de la pièce d\'identité'];
    
    // Mettre à jour le formulaire avec l'ID de l'offre
    this.applicationForm.patchValue({
      job_offer_id: job.id
    });
    
    // Empêcher le scroll du body quand le modal de candidature est ouvert
    if (typeof document !== 'undefined') {
      document.body.classList.add('modal-open');
    }
  }

  closeApplicationModal() {
    this.showApplicationModal = false;
    this.selectedJob = null;
    this.success = false;
    this.error = null;
    this.uploadedFiles = {};
    this.uploadingFiles = {};
    this.applicationForm.reset();
    
    // Nettoyer complètement l'état du modal
    if (typeof document !== 'undefined') {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
      
      const modals = document.querySelectorAll('.modal');
      modals.forEach(modal => {
        modal.classList.remove('show');
        (modal as HTMLElement).style.display = 'none';
      });
      
      // Recharger la page entière après fermeture du modal de candidature
      window.location.reload();
    }
  }

  onFileSelected(event: any, attachmentType: string) {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file, attachmentType);
    }
  }

  uploadFile(file: File, attachmentType: string) {
    const fileName = `${attachmentType}_${Date.now()}_${file.name}`;
    this.uploadingFiles[attachmentType] = true;
    
    this.subscription.add(
      this.jobApplicationService.uploadAttachment(fileName, file).subscribe({
        next: (response: any) => {
          this.uploadingFiles[attachmentType] = false;
          console.log('📎 [HEADER] Réponse upload:', response);
          if (response.data && response.data.length > 0) {
            console.log('📎 [HEADER] Données upload:', response.data[0]);
            this.uploadedFiles[attachmentType] = {
              file: file,
              url: response.data[0].url || response.data[0].file_path, // Fallback sur file_path
              name: response.data[0].name
            };
            console.log('📎 [HEADER] Fichier stocké:', this.uploadedFiles[attachmentType]);
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
    if (!this.applicationForm.valid) {
      return false;
    }

    for (const attachmentType of this.requiredAttachments) {
      if (!this.uploadedFiles[attachmentType]) {
        return false;
      }
    }
    return true;
  }

  onSubmitApplication() {
    this.submitting = true;
    this.error = null;

    const attachments: JobAttachmentInput[] = [];
    for (const [type, fileData] of Object.entries(this.uploadedFiles)) {
      attachments.push({
        name: fileData.name,
        type: type,
        url: fileData.url  // Ajouter l'URL du fichier uploadé
      });
    }
    
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

    // Debug: Afficher les données envoyées
    console.log('📤 [HEADER] Données de candidature à envoyer:', applicationData);
    console.log('📎 [HEADER] Attachments:', attachments);

    this.subscription.add(
      this.jobApplicationService.createApplication(applicationData).subscribe({
        next: (response: any) => {
          this.success = true;
          this.submitting = false;
          
          if (response.data && response.data.payment && response.data.payment.payment_link) {
            window.location.href = response.data.payment.payment_link;
          } else {
            // Afficher le message de succès puis recharger la page
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        },
        error: (error: any) => {
          console.error('Erreur lors de la soumission de la candidature:', error);
          this.error = `Erreur lors de la soumission: ${error.error?.message || error.message || 'Erreur inconnue'}`;
          this.submitting = false;
        }
      })
    );
  }
}
