import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { TrainingService } from '../../../services/training.service';
import { TrainingFilterService, TrainingFilters } from '../../../services/training-filter.service';
import { FilterOptions, Specialty } from '../../../models/training.models';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

/**
 * Composant Filtres des Formations
 * Gère les filtres pour la recherche de formations
 */
@Component({
  selector: 'app-training-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './filters.html',
  styleUrl: './filters.css'
})
export class TrainingFiltersComponent implements OnInit, OnDestroy {
  filterOptions: FilterOptions = {
    specialties: [],
    locations: [],
    types: [],
    durations: [],
    fees: []
  };

  selectedFilters: TrainingFilters = {
    specialties: [],
    locations: [],
    types: [],
    durations: [],
    fees: [],
    searchTerm: ''
  };

  loading = false;
  error: string | null = null;
  private subscription: Subscription = new Subscription();
  private filterSubject = new Subject<TrainingFilters>();

  constructor(
    private trainingService: TrainingService,
    private filterService: TrainingFilterService
  ) { }

  ngOnInit() {
    this.loadFilterOptions();
    this.setupFilterDebounce();
  }

  setupFilterDebounce() {
    // Debounce les filtres pour éviter les appels trop fréquents
    this.subscription.add(
      this.filterSubject.pipe(
        debounceTime(300), // Attendre 300ms après le dernier changement
        distinctUntilChanged((prev, curr) =>
          JSON.stringify(prev) === JSON.stringify(curr)
        )
      ).subscribe(filters => {
        this.applyFiltersImmediate(filters);
      })
    );
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadFilterOptions() {
    this.loading = false; // Pas de loading pour les filtres
    this.error = null;

    // Charger les options de base et les lieux en parallèle
    this.subscription.add(
      this.trainingService.getFilterOptions().subscribe({
        next: (options: FilterOptions) => {
          this.filterOptions = { ...options };

          // Charger les lieux dynamiquement
          this.loadLocations();
        },
        error: (error: any) => {
          console.error('Erreur lors du chargement des options de filtres:', error);
          this.error = 'Impossible de charger les options de filtres';
          this.loading = false;
        }
      })
    );
  }

  loadLocations() {
    this.subscription.add(
      this.trainingService.getAllLocations().subscribe({
        next: (locations: string[]) => {
          this.filterOptions.locations = locations;
          this.loading = false;
          console.log('Lieux chargés:', locations);
        },
        error: (error: any) => {
          console.error('Erreur lors du chargement des lieux:', error);
          this.filterOptions.locations = ['Ziguinchor']; // Ville par défaut
          this.loading = false;
        }
      })
    );
  }

  onSpecialtyChange(event: any) {
    const selectedOptions = Array.from(event.target.selectedOptions, (option: any) => parseInt(option.value));
    this.selectedFilters.specialties = selectedOptions;
    this.applyFilters();
  }

  onLocationChange(event: any) {
    const selectedOptions = Array.from(event.target.selectedOptions, (option: any) => option.value);
    this.selectedFilters.locations = selectedOptions;
    this.applyFilters();
  }

  onTypeChange(event: any) {
    const selectedOptions = Array.from(event.target.selectedOptions, (option: any) => option.value);
    this.selectedFilters.types = selectedOptions;
    this.applyFilters();
  }

  onDurationChange(event: any) {
    const selectedOptions = Array.from(event.target.selectedOptions, (option: any) => option.value);
    this.selectedFilters.durations = selectedOptions;
    this.applyFilters();
  }

  onFeeChange(event: any) {
    const selectedOptions = Array.from(event.target.selectedOptions, (option: any) => option.value);
    this.selectedFilters.fees = selectedOptions;
    this.applyFilters();
  }

  onSearchChange(event: any) {
    this.selectedFilters.searchTerm = event.target.value;
    this.applyFilters();
  }

  applyFilters() {
    // Émettre les filtres vers le subject pour le debounce
    this.filterSubject.next({ ...this.selectedFilters });
  }

  /**
   * Appliquer les filtres immédiatement (après debounce)
   * Utilise la nouvelle méthode setFilters() pour une mise à jour atomique
   */
  applyFiltersImmediate(filters: TrainingFilters) {
    // Utilisation de la méthode générique setFilters() pour une mise à jour atomique
    this.filterService.setFilters(filters);

    if (!environment.production) {
      console.log('Filtres de formations appliqués:', filters);
    }
  }

  resetFilters() {
    this.selectedFilters = {
      specialties: [],
      locations: [],
      types: [],
      durations: [],
      fees: [],
      searchTerm: ''
    };
    this.filterService.resetFilters();

    // Réinitialiser les sélections dans le DOM
    // Pour les selects multiples, désélectionner toutes les options
    const selects = document.querySelectorAll('.s-select');
    selects.forEach((select: any) => {
      if (select.multiple) {
        // Pour les selects multiples, désélectionner toutes les options
        Array.from(select.options).forEach((option: any) => {
          option.selected = false;
        });
        // Sélectionner uniquement l'option placeholder (value="0")
        const placeholderOption = Array.from(select.options).find((option: any) => option.value === '0');
        if (placeholderOption) {
          (placeholderOption as HTMLOptionElement).selected = true;
        }
      } else {
        // Pour les selects simples, remettre à l'index 0
        select.selectedIndex = 0;
      }
      
      // Déclencher l'événement change pour mettre à jour l'état
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Réinitialiser le champ de recherche
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
      // Déclencher l'événement input pour mettre à jour l'état
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}
