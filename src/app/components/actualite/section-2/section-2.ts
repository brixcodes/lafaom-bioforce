import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { NewsService } from '../../../services/news.service';
import { FilterService } from '../../../services/filter.service';
import { News, BlogCategory, SearchFilters } from '../../../models/api.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-section-2',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './section-2.html',
  styleUrl: './section-2.css'
})
export class Section2 implements OnInit, OnDestroy {
  recentNews: News[] = [];
  loading = false;
  error: string | null = null;
  categories: Map<number, string> = new Map();
  private filterSubscription: Subscription | undefined;
  private selectedCategories: number[] = [];

  constructor(
    private newsService: NewsService,
    private filterService: FilterService
  ) {}

  ngOnInit() {
    this.subscribeToFilters();
    this.loadRecentNews();
  }

  ngOnDestroy() {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }

  subscribeToFilters() {
    this.filterSubscription = this.filterService.selectedCategories$.subscribe(categories => {
      this.selectedCategories = categories;
      this.loadRecentNews();
    });
  }

  loadRecentNews() {
    this.loading = false; // Pas de loading automatique
    this.error = null;

    // Charger toutes les actualités d'abord
    this.newsService.getNews({ per_page: 10 }).subscribe({
      next: (response) => {
        // Filtrer seulement les actualités qui ont une date de publication
        let filteredNews = (response.data || []).filter((news: News) => news.published_at !== null);
        
        // Appliquer les filtres de catégories côté client
        if (this.selectedCategories.length > 0) {
          filteredNews = filteredNews.filter((news: News) => 
            this.selectedCategories.includes(news.category_id)
          );
          console.log(`Filtrage par catégories: ${this.selectedCategories.join(',')} - ${filteredNews.length} résultats`);
          
          // Si aucun résultat avec les filtres, vider la section-2
          if (filteredNews.length === 0) {
            this.recentNews = [];
            console.log('Section-2 masquée - aucun résultat avec les filtres');
            this.loading = false;
            return;
          }
        }
        
        this.recentNews = filteredNews.slice(0, 2);
        
        // Charger les catégories
        this.loadCategories();
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des actualités:', error);
        this.error = 'Impossible de charger les actualités';
        this.loading = false;
      }
    });
  }

  loadAllNewsWithoutFilters() {
    this.newsService.getNews({ per_page: 2 }).subscribe({
      next: (response) => {
        // Filtrer seulement les actualités qui ont une date de publication
        this.recentNews = (response.data || []).filter((news: News) => news.published_at !== null);
        
        // Limiter à exactement 2 actualités
        this.recentNews = this.recentNews.slice(0, 2);
        
        // Charger les catégories
        this.loadCategories();
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des actualités:', error);
        this.error = 'Impossible de charger les actualités';
        this.loading = false;
      }
    });
  }

  loadCategories() {
    const categoryIds = [...new Set(this.recentNews.map(news => news.category_id))];
    
    categoryIds.forEach(categoryId => {
      this.newsService.getCategoryById(categoryId).subscribe({
        next: (response) => {
          this.categories.set(categoryId, response.data.title);
        },
        error: (error) => {
          console.error(`Erreur lors du chargement de la catégorie ${categoryId}:`, error);
        }
      });
    });
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getImageUrl(news: News): string {
    return news.cover_image || '/https://theangarabucket.s3.eu-north-1.amazonaws.com/public/job-applications/20251012_065311_l1_s3.jpg';
  }

  getCategory(news: News): string {
    return this.categories.get(news.category_id) || `Catégorie ${news.category_id}`;
  }

  getSummary(news: News): string {
    if (!news.summary) return '';
    
    let cleanSummary = news.summary
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
    
    cleanSummary = cleanSummary
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '<br>')
      .replace(/<strong>/g, '<b>')
      .replace(/<\/strong>/g, '</b>')
      .replace(/<em>/g, '<i>')
      .replace(/<\/em>/g, '</i>');
    
    return cleanSummary;
  }
}
