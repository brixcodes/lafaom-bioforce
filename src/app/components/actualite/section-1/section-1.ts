import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { NewsService } from '../../../services/news.service';
import { FilterService } from '../../../services/filter.service';
import { BlogCategory } from '../../../models/api.models';
import { Subscription } from 'rxjs';

/**
 * Composant Section Liste des Actualités
 * Affiche les filtres de catégories pour les actualités
 */
@Component({
  selector: 'app-news-list-section',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './section-1.html',
  styleUrl: './section-1.css'
})
export class NewsListSection implements OnInit, OnDestroy {
  categories: BlogCategory[] = [];
  selectedCategories: number[] = [];
  loading = false;
  private refreshSubscription: any;
  private readonly REFRESH_INTERVAL = 30000; // 30 secondes

  constructor(
    private newsService: NewsService,
    private filterService: FilterService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      clearInterval(this.refreshSubscription);
    }
  }

  startAutoRefresh() {
    // Vérifier si nous sommes dans un environnement de build (SSR)
    if (typeof window === 'undefined') {
      return;
    }
    
    // Recharger les catégories toutes les 30 secondes seulement si aucun filtre n'est actif
    this.refreshSubscription = setInterval(() => {
      if (this.selectedCategories.length === 0) {
        console.log('Rechargement automatique des catégories...');
        this.loadCategories();
      } else {
        console.log('Rechargement automatique suspendu - filtres actifs');
      }
    }, this.REFRESH_INTERVAL);
  }

  loadCategories() {
    this.loading = false; // Pas de loading automatique
    
    // Charger toutes les catégories disponibles
    // Pour l'instant, on utilise des catégories statiques basées sur les IDs qu'on a vus
    this.categories = [
      { id: 8, title: 'gouvernance', slug: 'gouvernance', description: 'gouvernance', created_at: '', updated_at: '' },
      { id: 9, title: 'Formation', slug: 'formation', description: 'Formation', created_at: '', updated_at: '' },
      { id: 10, title: 'Organisation', slug: 'organisation', description: 'Organisation', created_at: '', updated_at: '' }
    ];
    
    this.loading = false;
  }

  onCategoryChange(event: any) {
    const selectedOptions = Array.from(event.target.selectedOptions);
    this.selectedCategories = selectedOptions.map((option: any) => parseInt(option.value));
    
    // Appliquer les filtres en temps réel
    this.applyFilters();
  }

  applyFilters() {
    this.filterService.setSelectedCategories(this.selectedCategories);
    console.log('Filtres appliqués en temps réel:', this.selectedCategories);
  }

  resetFilters() {
    this.selectedCategories = [];
    this.filterService.setSelectedCategories([]);
    
    // Réinitialiser le select
    const selectElement = document.querySelector('select[name="categories"]') as HTMLSelectElement;
    if (selectElement) {
      // Désélectionner toutes les options
      Array.from(selectElement.options).forEach(option => {
        option.selected = false;
      });
    }
    
    console.log('Filtres réinitialisés');
  }
}
