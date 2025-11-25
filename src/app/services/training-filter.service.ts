/**
 * Service de gestion des filtres de formation
 * 
 * Ce service permet de gérer l'état des filtres sélectionnés
 * et de les partager entre les composants de filtrage et d'affichage.
 * 
 * Utilise le pattern Observer (BehaviorSubject) pour permettre
 * une communication réactive entre composants non-parents.
 * 
 * Architecture de communication :
 * - Filters Component → setFilters() → BehaviorSubject
 * - Section1 Component → subscribe(selectedFilters$) → Applique les filtres
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Interface définissant la structure des filtres de formation
 */
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
  /** Subject privé pour gérer l'état des filtres */
  private selectedFiltersSubject = new BehaviorSubject<TrainingFilters>({
    specialties: [],
    locations: [],
    types: [],
    durations: [],
    fees: [],
    searchTerm: ''
  });

  /** Observable public pour s'abonner aux changements de filtres */
  public selectedFilters$: Observable<TrainingFilters> = this.selectedFiltersSubject.asObservable();

  constructor() {}

  /**
   * Mettre à jour les filtres (méthode générique)
   * @param filters - Objet partiel contenant les filtres à mettre à jour
   */
  setFilters(filters: Partial<TrainingFilters>): void {
    const currentFilters = this.selectedFiltersSubject.value;
    this.selectedFiltersSubject.next({
      ...currentFilters,
      ...filters
    });
  }

  /**
   * Mettre à jour les spécialités sélectionnées
   * @deprecated Utiliser setFilters() à la place
   */
  setSelectedSpecialties(specialties: number[]): void {
    this.setFilters({ specialties });
  }

  /**
   * Mettre à jour les lieux sélectionnés
   * @deprecated Utiliser setFilters() à la place
   */
  setSelectedLocations(locations: string[]): void {
    this.setFilters({ locations });
  }

  /**
   * Mettre à jour les types sélectionnés
   * @deprecated Utiliser setFilters() à la place
   */
  setSelectedTypes(types: string[]): void {
    this.setFilters({ types });
  }

  /**
   * Mettre à jour les durées sélectionnées
   * @deprecated Utiliser setFilters() à la place
   */
  setSelectedDurations(durations: string[]): void {
    this.setFilters({ durations });
  }

  /**
   * Mettre à jour les frais sélectionnés
   * @deprecated Utiliser setFilters() à la place
   */
  setSelectedFees(fees: string[]): void {
    this.setFilters({ fees });
  }

  /**
   * Mettre à jour le terme de recherche
   * @deprecated Utiliser setFilters() à la place
   */
  setSearchTerm(searchTerm: string): void {
    this.setFilters({ searchTerm });
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
