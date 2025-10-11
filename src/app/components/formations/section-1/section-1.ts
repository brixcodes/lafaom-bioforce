import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TrainingService } from '../../../services/training.service';
import { TrainingFilterService, TrainingFilters } from '../../../services/training-filter.service';
import { StudentApplicationService } from '../../../services/student-application.service';
import { Training, TrainingSession } from '../../../models/training.models';
import { StudentApplicationCreateInput, StudentAttachmentInput } from '../../../models/student-application.models';
import { Observable, interval, Subscription, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-formations-section-1',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './section-1.html',
  styleUrl: './section-1.css'
})
export class Section1 implements OnInit, OnDestroy {
  featuredTrainings$: Observable<any> | undefined;
  featuredTrainings: Training[] = [];
  trainingSessionsCount: Map<string, number> = new Map(); // ID de formation -> nombre de sessions disponibles
  trainingCities: Map<string, string[]> = new Map(); // ID de formation -> liste des villes
  filteredTrainings: Training[] = []; // Formations filtrées
  loading = false;
  error: string | null = null;
  
  // Propriétés pour les modals de candidature
  showModal = false;
  showApplicationModal = false;
  selectedTraining: Training | null = null;
  selectedSession: TrainingSession | null = null;
  availableSessions: TrainingSession[] = [];
  applicationForm: FormGroup;
  submitting = false;
  success: string | boolean = false;
  uploadedFiles: { [key: string]: { file: File, url: string, name: string } } = {};
  uploadingFiles: { [key: string]: boolean } = {};
  requiredAttachments: string[] = ['CV', 'Lettre de motivation', 'Copie de la pièce d\'identité'];
  
  private refreshSubscription: Subscription | undefined;
  private filterSubscription: Subscription | undefined;
  private readonly REFRESH_INTERVAL = 30000; // 30 secondes

  constructor(
    private trainingService: TrainingService,
    private filterService: TrainingFilterService,
    private studentApplicationService: StudentApplicationService,
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
      target_session_id: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadFeaturedTrainings();
    this.startAutoRefresh();
    this.subscribeToFilters();
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }

  startAutoRefresh() {
    // Vérifier si nous sommes dans un environnement de build (SSR)
    if (typeof window === 'undefined') {
      return; // Ne pas démarrer le rechargement automatique en SSR
    }
    
    // Recharger les formations toutes les 30 secondes
    this.refreshSubscription = interval(this.REFRESH_INTERVAL).subscribe(() => {
      console.log('Rechargement automatique des formations...');
      this.loadFeaturedTrainings(false); // Pas d'indicateur de chargement pour les rechargements automatiques
    });
  }

  subscribeToFilters() {
    this.filterSubscription = this.filterService.selectedFilters$.subscribe(filters => {
      this.applyFilters(filters);
    });
  }

  applyFilters(filters: any) {
    if (this.featuredTrainings.length === 0) return;

    // Optimisation : vérifier d'abord si des filtres sont actifs
    const hasActiveFilters = filters.searchTerm || 
                            filters.specialties.length > 0 || 
                            filters.locations.length > 0 || 
                            filters.types.length > 0 || 
                            filters.durations.length > 0;

    if (!hasActiveFilters) {
      this.filteredTrainings = [...this.featuredTrainings];
      return;
    }

    this.filteredTrainings = this.featuredTrainings.filter(training => {
      // Filtre par terme de recherche (le plus rapide à vérifier)
      if (filters.searchTerm && !training.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }

      // Filtre par types (vérification directe)
      if (filters.types.length > 0 && !filters.types.includes(training.type)) {
        return false;
      }

      // Filtre par durées (vérification directe)
      if (filters.durations.length > 0 && !filters.durations.includes(training.duration)) {
        return false;
      }

      // Filtre par spécialités (si applicable)
      if (filters.specialties.length > 0 && !filters.specialties.includes(training.id)) {
        return false;
      }

      // Filtre par lieux (le plus coûteux, à la fin)
      if (filters.locations.length > 0) {
        const trainingCities = this.getTrainingCities(training);
        const hasMatchingLocation = trainingCities.some(city => 
          filters.locations.some((filterLocation: string) => 
            city.toLowerCase().includes(filterLocation.toLowerCase())
          )
        );
        if (!hasMatchingLocation) return false;
      }

      return true;
    });

    console.log('Formations filtrées:', this.filteredTrainings.length);
  }

  loadFeaturedTrainings(showLoading: boolean = true) {
    if (showLoading) {
      this.loading = false; // Pas de loading automatique
    }
    this.error = null;
    
    this.trainingService.getFeaturedTrainings(5).subscribe({
      next: (response: any) => {
        console.log('Réponse API formations:', response);
        this.featuredTrainings = response.data || [];
        this.filteredTrainings = [...this.featuredTrainings]; // Initialiser avec toutes les formations
        
        // Charger les sessions pour chaque formation
        this.loadSessionsForTrainings();
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des formations:', error);
        this.error = 'Impossible de charger les formations';
        this.loading = false;
      }
    });
  }

  loadSessionsForTrainings() {
    if (this.featuredTrainings.length === 0) {
      this.loading = false;
      return;
    }

    // Créer un observable pour chaque formation
    const sessionObservables = this.featuredTrainings.map(training => 
      this.trainingService.getTrainingSessions(training.id.toString(), {
        page: 1,
        page_size: 100
        // Pas de filtre de statut pour récupérer toutes les sessions
      }).pipe(
        map((response: any) => {
          const today = new Date();
          console.log(`Formation ${training.id} - Sessions reçues:`, response.data);
          
          const availableSessions = response.data.filter((session: any) => {
            // Vérifier que la session n'a pas encore commencé ET qu'elle est ouverte aux inscriptions
            if (session.start_date && session.status === 'OPEN_FOR_REGISTRATION') {
              const startDate = new Date(session.start_date);
              const isAvailable = startDate > today;
              console.log(`Session ${session.id}: start_date=${session.start_date}, startDate=${startDate}, today=${today}, status=${session.status}, isAvailable=${isAvailable}`);
              return isAvailable;
            }
            console.log(`Session ${session.id} rejetée: start_date=${session.start_date}, status=${session.status}`);
            return false;
          });
          
          console.log(`Formation ${training.id} - Sessions disponibles:`, availableSessions.length);
          return { 
            trainingId: training.id.toString(), 
            count: availableSessions.length,
            sessions: availableSessions
          };
        }),
        catchError((error: any) => {
          console.error(`Erreur lors du chargement des sessions pour la formation ${training.id}:`, error);
          return of({ trainingId: training.id.toString(), count: 0, sessions: [] });
        })
      )
    );

    // Exécuter toutes les requêtes en parallèle
    forkJoin(sessionObservables).subscribe({
      next: (results: any[]) => {
        // Mettre à jour le Map avec les comptes
        results.forEach((result: any) => {
          this.trainingSessionsCount.set(result.trainingId, result.count);
        });
        
        // Charger les villes des centres pour chaque formation
        this.loadCitiesForTrainings(results);
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des sessions:', error);
        this.loading = false;
      }
    });
  }

  loadCitiesForTrainings(results: any[]) {
    // Récupérer tous les centre_id uniques de toutes les sessions
    const centerIds = new Set<number>();
    results.forEach((result: any) => {
      result.sessions.forEach((session: any) => {
        if (session.center_id) {
          centerIds.add(session.center_id);
        }
      });
    });

    if (centerIds.size === 0) {
      this.loading = false;
      return;
    }

    // Créer un observable pour chaque centre
    const centerObservables = Array.from(centerIds).map(centerId => 
      this.trainingService.getOrganizationCenter(centerId).pipe(
        map((response: any) => response.data.city),
        catchError((error: any) => {
          console.error(`Erreur lors du chargement du centre ${centerId}:`, error);
          return of('N/A');
        })
      )
    );

    // Exécuter toutes les requêtes en parallèle
    forkJoin(centerObservables).subscribe({
      next: (cities: string[]) => {
        // Créer une map des centre_id vers les villes
        const centerIdToCity = new Map<number, string>();
        Array.from(centerIds).forEach((centerId, index) => {
          centerIdToCity.set(centerId, cities[index]);
        });

        // Assigner les villes à chaque formation
        results.forEach((result: any) => {
          const citiesForTraining = new Set<string>();
          result.sessions.forEach((session: any) => {
            if (session.center_id && centerIdToCity.has(session.center_id)) {
              const city = centerIdToCity.get(session.center_id);
              if (city && city !== 'N/A') {
                citiesForTraining.add(city);
              }
            }
          });
          this.trainingCities.set(result.trainingId, Array.from(citiesForTraining));
        });

        this.loading = false;
        console.log('Villes chargées:', this.trainingCities);
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des villes:', error);
        this.loading = false;
      }
    });
  }

  getTrainingUrl(training: Training): string {
    return `/formation/${training.slug}`;
  }

  /**
   * Obtenir le nombre de sessions disponibles pour une formation
   */
  getAvailableSessionsCount(training: Training): number {
    return this.trainingSessionsCount.get(training.id.toString()) || 0;
  }

  /**
   * Vérifier si une formation a des sessions disponibles
   */
  hasAvailableSessions(training: Training): boolean {
    return this.getAvailableSessionsCount(training) > 0;
  }

  /**
   * Vérifier si une formation est désactivée (pas de sessions disponibles)
   */
  isTrainingDisabled(training: Training): boolean {
    return !this.hasAvailableSessions(training);
  }

  /**
   * Obtenir les villes des centres pour une formation
   */
  getTrainingCities(training: Training): string[] {
    return this.trainingCities.get(training.id.toString()) || [];
  }

  /**
   * Obtenir les villes formatées pour l'affichage
   */
  getFormattedCities(training: Training): string {
    const cities = this.getTrainingCities(training);
    if (cities.length === 0) {
      return 'Ziguinchor'; // Ville par défaut
    }
    return cities.join(', ');
  }

  /**
   * Formater la durée
   */
  formatDuration(duration: string | number): string {
    if (!duration) return 'Non spécifié';
    if (typeof duration === 'string') {
      return duration || 'N/A';
    }
    return duration.toString();
  }

  /**
   * Réinitialiser les filtres
   */
  resetFilters() {
    this.filterService.resetFilters();
    this.filteredTrainings = [...this.featuredTrainings];
  }

  // ===== MÉTHODES POUR LES MODALS DE CANDIDATURE =====

  /**
   * Ouvrir le modal de détails de formation
   */
  openModal(training: Training) {
    this.selectedTraining = training;
    this.showModal = true;
    this.loadTrainingSessions(training.id);
    
    // Empêcher le scroll du body quand le modal est ouvert
    if (typeof document !== 'undefined') {
      document.body.classList.add('modal-open');
    }
  }

  /**
   * Fermer le modal de détails
   */
  closeModal() {
    this.showModal = false;
    this.selectedTraining = null;
    this.availableSessions = [];
    
    // Nettoyer l'état du modal
    if (typeof document !== 'undefined') {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      // Supprimer tous les backdrops existants
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
    }
  }

  /**
   * Charger les sessions disponibles pour une formation
   */
  loadTrainingSessions(trainingId: string) {
    this.trainingService.getTrainingSessions(trainingId).subscribe({
      next: (response: any) => {
        this.availableSessions = response.data || [];
        console.log('Sessions chargées:', this.availableSessions);
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des sessions:', error);
        this.availableSessions = [];
      }
    });
  }

  /**
   * Ouvrir le modal de candidature
   */
  selectSession(session: TrainingSession) {
    this.selectedSession = session;
    this.openApplicationModal(this.selectedTraining!);
    
    // Mettre à jour le formulaire avec l'ID de la session
    this.applicationForm.patchValue({
      target_session_id: session.id
    });
  }

  openApplicationModal(training: Training) {
    // Fermer le modal de détails
    this.showModal = false;
    this.selectedTraining = null;
    
    // Nettoyer l'état du modal de détails
    if (typeof document !== 'undefined') {
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
      
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    // Ouvrir le modal de candidature
    this.selectedTraining = training;
    this.showApplicationModal = true;
    this.success = false;
    this.error = null;
    this.uploadedFiles = {};
    this.uploadingFiles = {};
    
    // Charger les sessions disponibles
    this.loadTrainingSessions(training.id);
    
    // Réinitialiser le formulaire
    this.applicationForm.reset();
    this.applicationForm.patchValue({
      country_code: 'SN'
    });
    
    // Empêcher le scroll du body quand le modal de candidature est ouvert
    if (typeof document !== 'undefined') {
      document.body.classList.add('modal-open');
    }
  }

  /**
   * Fermer le modal de candidature
   */
  closeApplicationModal() {
    this.showApplicationModal = false;
    this.selectedTraining = null;
    this.success = false;
    this.error = null;
    this.uploadedFiles = {};
    this.uploadingFiles = {};
    this.availableSessions = [];
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
      
      // Recharger la page entière après fermeture du modal
      window.location.reload();
    }
  }

  /**
   * Gérer la sélection de fichier
   */
  onFileSelected(event: any, attachmentType: string) {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file, attachmentType);
    }
  }

  /**
   * Uploader un fichier
   */
  uploadFile(file: File, attachmentType: string) {
    const fileName = `${attachmentType}_${Date.now()}_${file.name}`;
    this.uploadingFiles[attachmentType] = true;
    
    // Stocker le fichier localement pour l'instant
    // L'upload réel se fera lors de la soumission de la candidature
    setTimeout(() => {
      this.uploadingFiles[attachmentType] = false;
      this.uploadedFiles[attachmentType] = {
        file: file,
        url: URL.createObjectURL(file),
        name: fileName
      };
      console.log('📎 [FORMATIONS] Fichier préparé:', this.uploadedFiles[attachmentType]);
    }, 500);
  }

  /**
   * Supprimer un fichier uploadé
   */
  removeFile(attachmentType: string) {
    delete this.uploadedFiles[attachmentType];
  }

  /**
   * Obtenir le statut d'un fichier
   */
  getFileStatus(attachmentType: string): string {
    if (this.uploadedFiles[attachmentType]) {
      return 'uploaded';
    }
    if (this.uploadingFiles[attachmentType]) {
      return 'uploading';
    }
    return 'pending';
  }

  /**
   * Vérifier si le formulaire est valide
   */
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

  /**
   * Soumettre la candidature
   */
  onSubmitApplication() {
    this.submitting = true;
    this.error = null;

    // Préparer les attachments
    const attachments: string[] = [];
    for (const [type, fileData] of Object.entries(this.uploadedFiles)) {
      attachments.push(fileData.url);
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
    
    const applicationData: StudentApplicationCreateInput = {
      ...formValue,
      attachments: attachments
    };

    // Debug: Afficher les données envoyées
    console.log('📤 [FORMATIONS] Données de candidature à envoyer:', applicationData);
    console.log('📎 [FORMATIONS] Attachments:', attachments);

    this.studentApplicationService.createApplication(applicationData).subscribe({
      next: (response: any) => {
        console.log('✅ [FORMATIONS] Candidature créée:', response);
        const applicationId = response.data.id;
        
        // Uploader tous les fichiers
        this.uploadAllFiles(applicationId);
      },
      error: (error: any) => {
        console.error('❌ [FORMATIONS] Erreur création candidature:', error);
        this.error = `Erreur lors de la création de la candidature: ${error.error?.message || error.message || 'Erreur inconnue'}`;
        this.submitting = false;
      }
    });
  }

  /**
   * Uploader tous les fichiers pour une candidature
   */
  uploadAllFiles(applicationId: number) {
    const uploadObservables = Object.keys(this.uploadedFiles).map(attachmentType => {
      const fileData = this.uploadedFiles[attachmentType];
      return this.studentApplicationService.uploadAttachment(
        applicationId, 
        fileData.name, 
        fileData.file
      );
    });

    // Utiliser forkJoin pour attendre tous les uploads
    forkJoin(uploadObservables).subscribe({
      next: () => {
        console.log('✅ [FORMATIONS] Tous les fichiers uploadés');
        
        // Soumettre la candidature (lance le paiement)
        this.submitApplication(applicationId);
      },
      error: (error: any) => {
        console.error('❌ [FORMATIONS] Erreur upload fichiers:', error);
        this.submitting = false;
        this.error = `Erreur lors de l'upload des fichiers: ${error.message}`;
      }
    });
  }

  /**
   * Soumettre la candidature (lance le paiement)
   */
  submitApplication(applicationId: number) {
    this.studentApplicationService.submitApplication(applicationId).subscribe({
      next: (response: any) => {
        console.log('✅ [FORMATIONS] Candidature soumise, paiement initié:', response);
        this.submitting = false;
        this.success = 'Candidature soumise avec succès ! Redirection vers le paiement...';
        
        // Rediriger vers le paiement
        if (response.data && response.data.payment_link) {
          setTimeout(() => {
            window.open(response.data.payment_link, '_blank');
            this.closeApplicationModal();
          }, 2000);
        } else {
          this.error = 'Lien de paiement non disponible';
        }
      },
      error: (error: any) => {
        console.error('❌ [FORMATIONS] Erreur soumission candidature:', error);
        this.submitting = false;
        this.error = `Erreur lors de la soumission: ${error.error?.message || error.message}`;
      }
    });
  }

  /**
   * Formater la date
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formater le prix
   */
  formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + currency;
  }
}
