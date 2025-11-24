import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TrainingFilters {
  specialties: number[];
  locations: string[];
  types: string[];
  durations: string[];
  fees: string[];
  searchTerm: string;
}

@Injectable({
  providedIn: 'root'
})
export class TrainingFilterService {
  private selectedFiltersSubject = new BehaviorSubject<TrainingFilters>({
    specialties: [],
    locations: [],
    types: [],
    durations: [],
    fees: [],
    searchTerm: ''
  });

  public selectedFilters$ = this.selectedFiltersSubject.asObservable();

  constructor() {}

  /**
   * Mettre à jour les spécialités sélectionnées
   */
  setSelectedSpecialties(specialties: number[]) {
    const currentFilters = this.selectedFiltersSubject.value;
    this.selectedFiltersSubject.next({
      ...currentFilters,
      specialties
    });
  }

  /**
   * Mettre à jour les lieux sélectionnés
   */
  setSelectedLocations(locations: string[]) {
    const currentFilters = this.selectedFiltersSubject.value;
    this.selectedFiltersSubject.next({
      ...currentFilters,
      locations
    });
  }

  /**
   * Mettre à jour les types sélectionnés
   */
  setSelectedTypes(types: string[]) {
    const currentFilters = this.selectedFiltersSubject.value;
    this.selectedFiltersSubject.next({
      ...currentFilters,
      types
    });
  }

  /**
   * Mettre à jour les durées sélectionnées
   */
  setSelectedDurations(durations: string[]) {
    const currentFilters = this.selectedFiltersSubject.value;
    this.selectedFiltersSubject.next({
      ...currentFilters,
      durations
    });
  }

  /**
   * Mettre à jour les frais sélectionnés
   */
  setSelectedFees(fees: string[]) {
    const currentFilters = this.selectedFiltersSubject.value;
    this.selectedFiltersSubject.next({
      ...currentFilters,
      fees
    });
  }

  /**
   * Mettre à jour le terme de recherche
   */
  setSearchTerm(searchTerm: string) {
    const currentFilters = this.selectedFiltersSubject.value;
    this.selectedFiltersSubject.next({
      ...currentFilters,
      searchTerm
    });
  }

  /**
   * Réinitialiser tous les filtres
   */
  resetFilters() {
    this.selectedFiltersSubject.next({
      specialties: [],
      locations: [],
      types: [],
      durations: [],
      fees: [],
      searchTerm: ''
    });
  }

  /**
   * Obtenir les filtres actuels
   */
  getCurrentFilters(): TrainingFilters {
    return this.selectedFiltersSubject.value;
  }
}
