import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { TrainingService } from '../../../services/training.service';
import { TrainingFilterService, TrainingFilters } from '../../../services/training-filter.service';
import { StudentApplicationService } from '../../../services/student-application.service';
import { Training, TrainingSession } from '../../../models/training.models';
import { StudentApplicationCreateInput } from '../../../models/student-application.models';
import { Observable, interval, Subscription, of } from 'rxjs';
import { forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-formations-section-1',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslatePipe],
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
  // Suppression des propriétés liées aux fichiers pour simplifier le processus

  private refreshSubscription: Subscription | undefined;
  private filterSubscription: Subscription | undefined;
  private readonly REFRESH_INTERVAL = 30000; // 30 secondes

  constructor(
    private trainingService: TrainingService,
    private filterService: TrainingFilterService,
    private studentApplicationService: StudentApplicationService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.applicationForm = this.fb.group({
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
    if (this.featuredTrainings.length === 0) {
      this.filteredTrainings = [];
      return;
    }

    // Optimisation : vérifier d'abord si des filtres sont actifs
    const hasActiveFilters = (filters.searchTerm && filters.searchTerm.trim() !== '') ||
      (filters.specialties && filters.specialties.length > 0) ||
      (filters.locations && filters.locations.length > 0) ||
      (filters.types && filters.types.length > 0) ||
      (filters.durations && filters.durations.length > 0);

    if (!hasActiveFilters) {
      this.filteredTrainings = [...this.featuredTrainings];
      return;
    }

    this.filteredTrainings = this.featuredTrainings.filter(training => {
      // Vérifier d'abord si la formation a des sessions disponibles
      const hasSessions = this.hasAvailableSessions(training);
      if (!hasSessions) return false;

      // Filtre par terme de recherche (le plus rapide à vérifier)
      if (filters.searchTerm && filters.searchTerm.trim() !== '') {
        const searchLower = filters.searchTerm.toLowerCase().trim();
        if (!training.title.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Filtre par types (vérification directe)
      if (filters.types && filters.types.length > 0) {
        if (!filters.types.includes(training.type)) {
          return false;
        }
      }

      // Filtre par durées (vérification avec duration et duration_unit)
      if (filters.durations && filters.durations.length > 0) {
        const trainingDuration = training.duration?.toString();
        const trainingDurationUnit = training.duration_unit?.toUpperCase();
        const trainingDurationFull = `${trainingDuration} ${trainingDurationUnit}`;
        
        const matchesDuration = filters.durations.some((filterDuration: string) => {
          const filterUpper = filterDuration.toUpperCase();
          return filterDuration === trainingDuration || 
                 filterUpper === trainingDurationUnit ||
                 filterDuration === trainingDurationFull ||
                 filterUpper === trainingDurationFull.toUpperCase();
        });
        if (!matchesDuration) return false;
      }

      // Filtre par spécialités (utiliser specialty_id au lieu de id)
      if (filters.specialties && filters.specialties.length > 0) {
        const trainingSpecialtyId = training.specialty_id;
        if (!filters.specialties.includes(trainingSpecialtyId)) {
          return false;
        }
      }

      // Filtre par lieux (le plus coûteux, à la fin)
      if (filters.locations && filters.locations.length > 0) {
        const trainingCities = this.getTrainingCities(training);
        if (trainingCities.length === 0) return false; // Si pas de villes, exclure
        
        const hasMatchingLocation = trainingCities.some(city =>
          filters.locations.some((filterLocation: string) =>
            city.toLowerCase().includes(filterLocation.toLowerCase()) ||
            filterLocation.toLowerCase().includes(city.toLowerCase())
          )
        );
        if (!hasMatchingLocation) return false;
      }

      return true;
    });

    console.log('Formations filtrées:', this.filteredTrainings.length, 'sur', this.featuredTrainings.length);
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

        // Filtrer les formations sans sessions disponibles
        this.featuredTrainings = this.featuredTrainings.filter(training => {
          const count = this.trainingSessionsCount.get(training.id.toString()) || 0;
          return count > 0;
        });

        // Réappliquer les filtres actifs après le filtrage des sessions
        const currentFilters = this.filterService.getCurrentFilters();
        this.applyFilters(currentFilters);

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

        // Réappliquer les filtres après le chargement des villes (pour le filtre par lieu)
        const currentFilters = this.filterService.getCurrentFilters();
        this.applyFilters(currentFilters);

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
    if (training?.id) {
      this.router.navigate(['/application-training', training.id]);
      return;
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
    // Naviguer vers la page application-training avec l'ID de la formation
    const trainingId = this.selectedTraining?.id || session.training_id;
    if (!trainingId) return;
    window.location.href = `/application-training/${trainingId}`;
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

    // Charger les sessions disponibles
    this.loadTrainingSessions(training.id);

    // Réinitialiser le formulaire
    this.applicationForm.reset();
    this.applicationForm.patchValue({
      country_code: 'SN' // Sénégal par défaut
    });
    // S'assurer que country_code reste bloqué (Sénégal)
    this.applicationForm.get('country_code')?.disable();

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
   * Fermer le modal de candidature sans recharger la page
   */
  closeApplicationModalWithoutReload() {
    this.showApplicationModal = false;
    this.selectedTraining = null;
    this.success = false;
    this.error = null;
    this.availableSessions = [];
    this.applicationForm.reset();

    // Nettoyer l'état du modal sans recharger la page
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
    }
  }


  /**
   * Vérifier si le formulaire est valide
   */
  isFormValid(): boolean {
    return this.applicationForm.valid;
  }

  /**
   * Soumettre la candidature (processus en 2 étapes selon l'API)
   */
  onSubmitApplication() {
    console.log('🚀 [FORMATIONS] Début de la soumission de candidature');
    this.submitting = true;
    this.error = null;

    // Préparer les données de base
    const formValue = { ...this.applicationForm.value };
    
    const applicationData: StudentApplicationCreateInput = {
      email: formValue.email,
      target_session_id: this.selectedSession?.id || '',
      first_name: formValue.first_name,
      last_name: formValue.last_name,
      phone_number: formValue.phone_number,
      civility: formValue.civility,
      country_code: 'SN', // Cameroun - cohérent avec le compte CinetPay
      city: formValue.city,
      address: formValue.address,
      date_of_birth: formValue.date_of_birth,
      attachments: [] // Tableau vide comme demandé
    };

    console.log('📤 [FORMATIONS] Données de candidature à envoyer:', applicationData);

    // Étape 1: Créer la candidature
    this.studentApplicationService.createApplication(applicationData).subscribe({
      next: (response: any) => {
        console.log('✅ [FORMATIONS] Candidature créée avec succès:', response);
        
        const applicationId = response.data?.id;
        if (applicationId) {
          console.log('🔄 [FORMATIONS] Soumission de la candidature ID:', applicationId);
          
          // Étape 2: Soumettre la candidature (génère le paiement)
          this.studentApplicationService.submitApplication(applicationId).subscribe({
            next: (submitResponse: any) => {
              console.log('✅ [FORMATIONS] Candidature soumise avec succès:', submitResponse);
              console.log('🔍 [FORMATIONS] Payment info:', submitResponse.data);
              console.log('🔍 [FORMATIONS] Payment link:', submitResponse.data?.payment_link);
              
              this.success = true;
              this.submitting = false;
              
              // Redirection vers le paiement
              if (submitResponse.data && submitResponse.data.payment_link) {
                console.log('🔗 [FORMATIONS] Redirection vers le paiement...');
                window.location.href = submitResponse.data.payment_link;
              } else {
                console.log('⚠️ [FORMATIONS] Pas de lien de paiement, rechargement...');
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              }
            },
            error: (submitError: any) => {
              console.error('❌ [FORMATIONS] Erreur lors de la soumission:', submitError);
              this.error = `Erreur lors de la soumission: ${submitError.error?.message || submitError.message || 'Erreur inconnue'}`;
              this.submitting = false;
            }
          });
        } else {
          console.error('❌ [FORMATIONS] ID de candidature manquant dans la réponse');
          this.error = 'ID de candidature manquant dans la réponse';
          this.submitting = false;
        }
      },
      error: (error: any) => {
        console.error('❌ [FORMATIONS] Erreur lors de la création de la candidature:', error);
        this.error = `Erreur lors de la création de la candidature: ${error.error?.message || error.message || 'Erreur inconnue'}`;
        this.submitting = false;
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
