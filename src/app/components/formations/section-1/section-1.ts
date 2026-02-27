import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { TrainingService } from '../../../services/training.service';
import { TrainingFilterService, TrainingFilters } from '../../../services/training-filter.service';
import { StudentApplicationService } from '../../../services/student-application.service';
import { LanguageService } from '../../../services/language.service';
import { Training, TrainingSession, Specialty } from '../../../models/training.models';
import { StudentApplicationCreateInput } from '../../../models/student-application.models';
import { Observable, interval, Subscription, of } from 'rxjs';
import { forkJoin } from 'rxjs';
import { map, catchError, debounceTime } from 'rxjs/operators';

/**
 * Composant Section Liste des Formations
 * Affiche la liste des formations avec filtres et candidatures
 */
@Component({
  selector: 'app-formations-list-section',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './section-1.html',
  styleUrl: './section-1.css'
})
export class FormationsListSection implements OnInit, OnDestroy {
  featuredTrainings$: Observable<any> | undefined;
  featuredTrainings: Training[] = [];
  trainingSessions: Map<string, TrainingSession[]> = new Map(); // ID de formation -> sessions disponibles
  trainingSessionsCount: Map<string, number> = new Map(); // ID de formation -> nombre de sessions disponibles
  trainingCities: Map<string, string[]> = new Map(); // ID de formation -> liste des villes
  trainingSpecialties: Map<string, Specialty> = new Map(); // ID de formation -> spécialité
  trainingDurations: Map<string, string[]> = new Map(); // ID de formation -> durées calculées depuis les sessions
  trainingFees: Map<string, number> = new Map(); // ID de formation -> frais total (inscription + formation)
  allSpecialties: Specialty[] = []; // Toutes les spécialités
  filteredTrainings: Training[] = []; // Formations filtrées
  hasFiltersApplied = false; // Indique si des filtres ont été appliqués
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
  private languageSubscription: Subscription | undefined;
  private readonly REFRESH_INTERVAL = 30000; // 30 secondes

  constructor(
    private trainingService: TrainingService,
    private filterService: TrainingFilterService,
    private studentApplicationService: StudentApplicationService,
    private languageService: LanguageService,
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
    // Charger les spécialités et les formations en parallèle pour optimiser le temps de chargement
    this.loadSpecialtiesAndTrainings();
    this.startAutoRefresh();
    this.subscribeToFilters();
    this.subscribeToLanguageChanges();
  }

  // Charger les spécialités et les formations en parallèle
  loadSpecialtiesAndTrainings() {
    this.loading = true;
    this.error = null;

    // Utiliser forkJoin pour charger en parallèle
    // Récupérer toutes les formations (pas seulement featured) avec une limite élevée
    forkJoin({
      specialties: this.trainingService.getSpecialties(),
      trainings: this.trainingService.getTrainings({ per_page: 100, page: 1 })
    }).subscribe({
      next: ({ specialties, trainings }: { specialties: Specialty[], trainings: any }) => {
        // Traiter les spécialités
        this.allSpecialties = specialties;

        // Traiter les formations - récupérer toutes les formations (ACTIVE et INACTIVE)
        this.featuredTrainings = trainings.data || [];
        this.filteredTrainings = []; // Ne rien afficher initialement

        // Associer les spécialités aux formations
        this.loadSpecialtiesForTrainings();

        // Charger les sessions pour chaque formation
        this.loadSessionsForTrainings();

        // Appliquer les filtres initiaux
        const currentFilters = this.filterService.getCurrentFilters();
        this.applyFilters(currentFilters);

        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des données:', error);
        this.error = 'Impossible de charger les données';
        this.loading = false;
      }
    });
  }

  // Charger toutes les spécialités (méthode conservée pour compatibilité)
  loadSpecialties() {
    this.trainingService.getSpecialties().subscribe({
      next: (specialties: Specialty[]) => {
        this.allSpecialties = specialties;
        // Si les formations sont déjà chargées, associer les spécialités
        if (this.featuredTrainings.length > 0) {
          this.loadSpecialtiesForTrainings();
          // Réappliquer les filtres après avoir chargé les spécialités
          const currentFilters = this.filterService.getCurrentFilters();
          this.applyFilters(currentFilters);
        }
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des spécialités:', error);
      }
    });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  /**
   * S'abonner aux changements de langue pour recharger les données
   */
  private subscribeToLanguageChanges(): void {
    this.languageSubscription = this.languageService.languageChange$
      .pipe(debounceTime(100)) // Délai de 100ms pour éviter les rechargements multiples
      .subscribe((newLang: string) => {
        console.log('🔄 [FORMATIONS] Changement de langue détecté:', newLang);
        // Recharger les données pour obtenir les traductions
        this.loadSpecialtiesAndTrainings();
      });
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
    this.filterSubscription = this.filterService.selectedFilters$.subscribe((filters: TrainingFilters) => {
      this.applyFilters(filters);
    });
  }

  applyFilters(filters: TrainingFilters) {
    if (this.featuredTrainings.length === 0) return;

    // Optimisation : vérifier d'abord si des filtres sont actifs
    const hasActiveFilters = Boolean(
      (filters.searchTerm && filters.searchTerm.trim().length > 0) ||
      filters.specialties.length > 0 ||
      filters.locations.length > 0 ||
      filters.types.length > 0 ||
      filters.durations.length > 0 ||
      filters.fees.length > 0
    );

    // Mettre à jour l'état des filtres
    this.hasFiltersApplied = hasActiveFilters;

    if (!hasActiveFilters) {
      // Ne rien afficher quand aucun filtre n'est appliqué
      this.filteredTrainings = [];
      return;
    }

    this.filteredTrainings = this.featuredTrainings.filter(training => {
      // Filtre par terme de recherche (le plus rapide à vérifier)
      if (filters.searchTerm && filters.searchTerm.trim().length > 0) {
        const searchTermLower = filters.searchTerm.trim().toLowerCase();
        if (!training.title.toLowerCase().includes(searchTermLower)) {
          return false;
        }
      }

      // Filtre par types - basé sur la présence de specialty_id
      if (filters.types.length > 0) {
        // Vérifier si la formation a une spécialité (specialty_id existe et n'est pas null/undefined/0)
        const hasSpecialty = training.specialty_id != null && training.specialty_id !== 0;

        // Vérifier si "Séminaire" est sélectionné
        const isSeminarSelected = filters.types.some((type: string) => {
          const typeLower = type.toLowerCase().trim();
          return typeLower === 'séminaire' || typeLower === 'seminaire';
        });

        // Vérifier si "Formation" est sélectionné
        const isFormationSelected = filters.types.some((type: string) => {
          const typeLower = type.toLowerCase().trim();
          return typeLower === 'formation';
        });

        console.log(`Formation ${training.id} - specialty_id: ${training.specialty_id}, hasSpecialty: ${hasSpecialty}, isSeminarSelected: ${isSeminarSelected}, isFormationSelected: ${isFormationSelected}`);

        if (isSeminarSelected && isFormationSelected) {
          // Si les deux sont sélectionnés, afficher toutes les formations
          // Ne rien faire, continuer le filtrage
        } else if (isSeminarSelected) {
          // Si seulement "Séminaire" est sélectionné, afficher uniquement les formations
          // dont la durée est inférieure à 8 jours (indépendamment de la spécialité)
          const durationInDays = this.convertDurationToDays(training.duration, training.duration_unit);
          if (durationInDays >= 8) {
            console.log(`Formation ${training.id} exclue (durée de ${durationInDays} jours >= 8 jours, ce n'est pas un séminaire)`);
            return false;
          }
        } else if (isFormationSelected) {
          // Si seulement "Formation" est sélectionné, afficher uniquement les formations AVEC spécialité
          // ET dont la durée est supérieure ou égale à 8 jours
          if (!hasSpecialty) {
            console.log(`Formation ${training.id} exclue (n'a pas de spécialité, ce n'est pas une formation)`);
            return false;
          }

          // Vérifier que la durée est supérieure ou égale à 8 jours
          const durationInDays = this.convertDurationToDays(training.duration, training.duration_unit);
          if (durationInDays < 8) {
            console.log(`Formation ${training.id} exclue (durée de ${durationInDays} jours < 8 jours, ce n'est pas une formation)`);
            return false;
          }
        }
      }

      // Filtre par durées - maintenant basé sur le titre de la formation + durée
      if (filters.durations.length > 0) {
        // Le filtre contient maintenant "Titre de la formation - durée"
        // On compare le titre de la formation avec le filtre sélectionné
        const trainingTitle = training.title || '';

        const matchesDuration = filters.durations.some((filterValue: string) => {
          // Extraire le titre du filtre (tout ce qui précède " - ")
          const filterTitle = filterValue.split(' - ')[0]?.trim() || filterValue.trim();

          // Comparer les titres (insensible à la casse)
          return trainingTitle.toLowerCase() === filterTitle.toLowerCase() ||
            trainingTitle.toLowerCase().includes(filterTitle.toLowerCase()) ||
            filterTitle.toLowerCase().includes(trainingTitle.toLowerCase());
        });

        if (!matchesDuration) {
          console.log(`Formation ${training.id} exclue par durée - Titre: ${trainingTitle}, Filtres: ${filters.durations.join(', ')}`);
          return false;
        }
      }

      // Filtre par spécialités (si applicable)
      if (filters.specialties.length > 0) {
        const specialty = this.trainingSpecialties.get(training.id.toString());
        if (!specialty || !filters.specialties.includes(specialty.id)) {
          return false;
        }
      }

      // Filtre par frais - maintenant basé sur le nom de la formation + type de frais
      if (filters.fees.length > 0) {
        const trainingTitle = training.title || '';

        const matchesFee = filters.fees.some((filterValue: string) => {
          // Le filtre contient "Frais inscription : nom formation = (prix devise)" ou "Frais formation : nom formation = (prix devise)"
          // Extraire le nom de la formation du filtre (entre " : " et " = ")
          const match = filterValue.match(/Frais (inscription|formation) : (.+?) = \(/);
          if (!match) return false;

          const feeType = match[1]; // "inscription" ou "formation"
          const filterTitle = match[2]?.trim() || '';

          // Comparer le titre de la formation
          if (trainingTitle.toLowerCase() !== filterTitle.toLowerCase() &&
            !trainingTitle.toLowerCase().includes(filterTitle.toLowerCase()) &&
            !filterTitle.toLowerCase().includes(trainingTitle.toLowerCase())) {
            return false;
          }

          // Vérifier que la formation a des sessions avec les frais correspondants
          const sessions = this.trainingSessions.get(training.id.toString()) || [];
          if (sessions.length === 0) return false;

          // Vérifier si au moins une session a les frais correspondants (>= 2)
          return sessions.some((session: any) => {
            if (feeType === 'inscription') {
              const fee = session.registration_fee || 0;
              return fee >= 2;
            } else if (feeType === 'formation') {
              const fee = session.training_fee || 0;
              return fee >= 2;
            }
            return false;
          });
        });

        if (!matchesFee) {
          console.log(`Formation ${training.id} exclue par frais - Titre: ${trainingTitle}, Filtres: ${filters.fees.join(', ')}`);
          return false;
        }
      }

      // Filtre par lieux (le plus coûteux, à la fin)
      if (filters.locations.length > 0) {
        const trainingCities = this.getTrainingCities(training);
        // Si la formation n'a pas de villes (pas de sessions), on peut quand même l'afficher
        // sauf si le filtre de lieu est strictement requis
        if (trainingCities.length > 0) {
          const hasMatchingLocation = trainingCities.some(city =>
            filters.locations.some((filterLocation: string) =>
              city.toLowerCase().includes(filterLocation.toLowerCase())
            )
          );
          if (!hasMatchingLocation) return false;
        }
        // Si pas de villes mais filtre de lieu actif, on peut choisir de l'exclure ou non
        // Ici on l'exclut pour être cohérent avec le filtre
        // Mais on pourrait aussi l'inclure si on veut afficher les formations sans sessions
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

    // Récupérer toutes les formations (pas seulement featured) avec une limite élevée
    this.trainingService.getTrainings({ per_page: 100, page: 1 }).subscribe({
      next: (response: any) => {
        console.log('Réponse API formations:', response);
        this.featuredTrainings = response.data || [];
        this.filteredTrainings = []; // Ne rien afficher initialement

        // Charger les spécialités pour chaque formation (si déjà disponibles)
        if (this.allSpecialties.length > 0) {
          this.loadSpecialtiesForTrainings();
          // Réappliquer les filtres après avoir chargé les spécialités
          const currentFilters = this.filterService.getCurrentFilters();
          this.applyFilters(currentFilters);
        }

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

  // Charger les spécialités pour chaque formation
  loadSpecialtiesForTrainings() {
    this.featuredTrainings.forEach(training => {
      if (training.specialty_id && this.allSpecialties.length > 0) {
        const specialty = this.allSpecialties.find(s => s.id === training.specialty_id);
        if (specialty) {
          this.trainingSpecialties.set(training.id.toString(), specialty);
          console.log(`Formation ${training.id} - Spécialité: ${specialty.name}`);
        } else {
          console.warn(`Spécialité non trouvée pour la formation ${training.id} (specialty_id: ${training.specialty_id})`);
        }
      }
    });
    console.log('Spécialités chargées pour les formations:', this.trainingSpecialties.size);
  }

  loadSessionsForTrainings() {
    if (this.featuredTrainings.length === 0) {
      this.loading = false;
      return;
    }

    // Créer un observable pour chaque formation et les charger en parallèle avec forkJoin
    const sessionObservables = this.featuredTrainings.map(training =>
      this.trainingService.getTrainingSessions(training.id.toString(), {
        page: 1,
        page_size: 100
        // Pas de filtre de statut pour récupérer toutes les sessions
      }).pipe(
        catchError((error: any) => {
          console.error(`Erreur lors du chargement des sessions pour la formation ${training.id}:`, error);
          // Retourner un tableau vide en cas d'erreur
          return of({ data: [] });
        })
      )
    );

    // Charger toutes les sessions en parallèle
    forkJoin(sessionObservables).subscribe({
      next: (responses: any[]) => {
        // Traiter chaque réponse
        responses.forEach((response, index) => {
          const training = this.featuredTrainings[index];
          this.processSessionsForTraining(training, response.data || []);
        });

        // Ne pas filtrer les formations sans sessions - les afficher quand même
        // Les formations peuvent être affichées même sans sessions disponibles

        // S'assurer que les spécialités sont chargées pour les formations
        if (this.allSpecialties.length > 0) {
          this.loadSpecialtiesForTrainings();
        }

        // Réappliquer les filtres après avoir filtré les formations sans sessions
        const currentFilters = this.filterService.getCurrentFilters();
        this.applyFilters(currentFilters);

        // Charger les villes des centres pour chaque formation
        this.loadCitiesForTrainingsFromSessions();

        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des sessions:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Traiter les sessions pour une formation donnée
   */
  private processSessionsForTraining(training: any, sessions: any[]): void {
    const today = new Date();
    const availableSessions = sessions.filter((session: any) => {
      // Vérifier que la session n'a pas encore commencé ET qu'elle est ouverte aux inscriptions
      if (session.start_date && session.status === 'OPEN_FOR_REGISTRATION') {
        const startDate = new Date(session.start_date);
        return startDate > today;
      }
      return false;
    });

    // Stocker les sessions disponibles
    this.trainingSessions.set(training.id.toString(), availableSessions);

    // Calculer les durées et frais à partir des sessions disponibles
    const durations: string[] = [];
    let totalFee = 0;
    let feeCount = 0;

    availableSessions.forEach((session: any) => {
      // Calculer la durée
      if (session.start_date && session.end_date) {
        const startDate = new Date(session.start_date);
        const endDate = new Date(session.end_date);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Formater la durée (même logique que dans calculateDurationsFromSessions)
        let durationStr = '';
        if (diffDays < 30) {
          if (diffDays >= 2 && diffDays <= 15) {
            durationStr = `${diffDays} à ${diffDays} jours`;
          } else {
            durationStr = `${diffDays} ${diffDays === 1 ? 'jour' : 'jours'}`;
          }
        } else if (diffDays < 365) {
          const months = Math.round(diffDays / 30);
          durationStr = `${months} ${months === 1 ? 'mois' : 'mois'}`;
        } else {
          const years = Math.round(diffDays / 365);
          durationStr = `${years} ${years === 1 ? 'année' : 'années'}`;
        }

        if (durationStr) {
          durations.push(durationStr);
        }
      }

      // Calculer les frais
      const registrationFee = session.registration_fee || 0;
      const trainingFee = session.training_fee || 0;
      const total = registrationFee + trainingFee;

      if (total > 0) {
        totalFee += total;
        feeCount++;
      }
    });

    // Stocker les durées uniques
    const uniqueDurations = [...new Set(durations)];
    this.trainingDurations.set(training.id.toString(), uniqueDurations);

    // Stocker la moyenne des frais
    if (feeCount > 0) {
      this.trainingFees.set(training.id.toString(), Math.round(totalFee / feeCount));
    }

    // Stocker le compte de sessions
    this.trainingSessionsCount.set(training.id.toString(), availableSessions.length);
  }

  /**
   * Charger les villes des centres à partir des sessions stockées
   */
  loadCitiesForTrainingsFromSessions() {
    // Récupérer tous les centre_id uniques de toutes les sessions
    const centerIds = new Set<number>();
    this.trainingSessions.forEach((sessions: TrainingSession[], trainingId: string) => {
      sessions.forEach((session: any) => {
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
        this.trainingSessions.forEach((sessions: TrainingSession[], trainingId: string) => {
          const citiesForTraining = new Set<string>();
          sessions.forEach((session: any) => {
            if (session.center_id && centerIdToCity.has(session.center_id)) {
              const city = centerIdToCity.get(session.center_id);
              if (city && city !== 'N/A') {
                citiesForTraining.add(city);
              }
            }
          });
          this.trainingCities.set(trainingId, Array.from(citiesForTraining));
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
   * Convertir la durée en jours
   */
  convertDurationToDays(duration: number | string | null | undefined, durationUnit: string | null | undefined): number {
    if (!duration) return 0;

    const durationNum = typeof duration === 'string' ? parseFloat(duration) : duration;
    if (isNaN(durationNum)) return 0;

    const unit = durationUnit ? durationUnit.toUpperCase() : '';

    // Convertir en jours selon l'unité
    switch (unit) {
      case 'HOURS':
      case 'HOUR':
        return durationNum / 24; // Convertir les heures en jours
      case 'DAYS':
      case 'DAY':
        return durationNum;
      case 'WEEKS':
      case 'WEEK':
        return durationNum * 7;
      case 'MONTHS':
      case 'MONTH':
        return durationNum * 30; // Approximation : 1 mois = 30 jours
      case 'YEARS':
      case 'YEAR':
        return durationNum * 365; // Approximation : 1 année = 365 jours
      default:
        return 0;
    }
  }

  /**
   * Formater la durée pour le filtre (ex: "12 mois", "2 à 15 jours")
   * Cette méthode doit correspondre au format calculé dans calculateDurationsFromSessions
   */
  formatDurationForFilter(duration: number | string | null | undefined, durationUnit: string | null | undefined): string {
    if (!duration) return '';

    const durationNum = typeof duration === 'string' ? parseInt(duration) : duration;
    if (isNaN(durationNum)) return '';

    // Traduire l'unité
    const unitMap: { [key: string]: string } = {
      'MONTHS': 'mois',
      'DAYS': 'jours',
      'HOURS': 'heures',
      'YEARS': 'années',
      'MONTH': 'mois',
      'DAY': 'jour',
      'HOUR': 'heure',
      'YEAR': 'année'
    };

    const unit = durationUnit ? unitMap[durationUnit.toUpperCase()] || durationUnit.toLowerCase() : '';

    // Formater selon le format calculé depuis les sessions
    // Format cohérent avec calculateDurationsFromSessions
    if (unit === 'jours' && durationNum >= 2 && durationNum <= 15) {
      return `${durationNum} à ${durationNum} jours`;
    } else if (unit === 'jours') {
      return `${durationNum} ${durationNum === 1 ? 'jour' : 'jours'}`;
    } else if (unit === 'mois') {
      return `${durationNum} ${durationNum === 1 ? 'mois' : 'mois'}`;
    } else if (unit === 'années') {
      return `${durationNum} ${durationNum === 1 ? 'année' : 'années'}`;
    }

    return `${durationNum} ${unit}`;
  }

  /**
   * Vérifier si un montant correspond à une tranche de frais
   */
  feeMatchesRange(fee: number, feeRange: string): boolean {
    if (feeRange.toLowerCase() === 'gratuit') {
      return fee === 0;
    }

    // Parser la tranche (ex: "10K - 50K", "100K+")
    const rangeLower = feeRange.toLowerCase().trim();

    // Gérer les tranches avec "+" (ex: "100K+")
    if (rangeLower.includes('+')) {
      const minStr = rangeLower.replace('+', '').trim();
      const minValue = this.parseFeeValue(minStr);
      return fee >= minValue;
    }

    // Gérer les tranches avec "-" (ex: "10K - 50K")
    if (rangeLower.includes('-')) {
      const parts = rangeLower.split('-').map(p => p.trim());
      if (parts.length === 2) {
        const minValue = this.parseFeeValue(parts[0]);
        const maxValue = this.parseFeeValue(parts[1]);
        return fee >= minValue && fee <= maxValue;
      }
    }

    return false;
  }

  /**
   * Parser une valeur de frais (ex: "10K" -> 10000, "1.5M" -> 1500000)
   */
  private parseFeeValue(value: string): number {
    const cleanValue = value.trim().toLowerCase();

    if (cleanValue.endsWith('m')) {
      const num = parseFloat(cleanValue.replace('m', ''));
      return Math.round(num * 1000000);
    }

    if (cleanValue.endsWith('k')) {
      const num = parseFloat(cleanValue.replace('k', ''));
      return Math.round(num * 1000);
    }

    return parseFloat(cleanValue) || 0;
  }

  /**
   * Réinitialiser les filtres
   */
  resetFilters() {
    this.filterService.resetFilters();
    this.filteredTrainings = []; // Vider l'affichage au lieu d'afficher toutes les formations
    this.hasFiltersApplied = false;
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
      country_code: formValue.country_code || 'SN', // Utilise la valeur du formulaire
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
