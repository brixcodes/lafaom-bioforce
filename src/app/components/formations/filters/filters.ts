import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainingService } from '../../../services/training.service';
import { TrainingFilterService, TrainingFilters } from '../../../services/training-filter.service';
import { FilterOptions, Specialty } from '../../../models/training.models';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-filters',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './filters.html',
  styleUrl: './filters.css'
})
export class Filters implements OnInit, OnDestroy {
  filterOptions: FilterOptions = {
    specialties: [],
    locations: [],
    types: [],
    durations: []
  };
  
  selectedFilters: TrainingFilters = {
    specialties: [],
    locations: [],
    types: [],
    durations: [],
    searchTerm: ''
  };
  
  loading = false;
  error: string | null = null;
  private subscription: Subscription = new Subscription();
  private filterSubject = new Subject<TrainingFilters>();

  constructor(
    private trainingService: TrainingService,
    private filterService: TrainingFilterService
  ) {}

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

  onSearchChange(event: any) {
    this.selectedFilters.searchTerm = event.target.value;
    this.applyFilters();
  }

  applyFilters() {
    // Émettre les filtres vers le subject pour le debounce
    this.filterSubject.next({ ...this.selectedFilters });
  }

  applyFiltersImmediate(filters: TrainingFilters) {
    this.filterService.setSelectedSpecialties(filters.specialties);
    this.filterService.setSelectedLocations(filters.locations);
    this.filterService.setSelectedTypes(filters.types);
    this.filterService.setSelectedDurations(filters.durations);
    this.filterService.setSearchTerm(filters.searchTerm);
    
    console.log('Filtres de formations appliqués:', filters);
  }

  resetFilters() {
    this.selectedFilters = {
      specialties: [],
      locations: [],
      types: [],
      durations: [],
      searchTerm: ''
    };
    this.filterService.resetFilters();
    
    // Réinitialiser les sélections dans le DOM
    const selects = document.querySelectorAll('.s-select');
    selects.forEach((select: any) => {
      select.selectedIndex = 0;
    });
    
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
  }
}
