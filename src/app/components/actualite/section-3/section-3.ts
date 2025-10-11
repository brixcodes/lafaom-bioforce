import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NewsService } from '../../../services/news.service';
import { FilterService } from '../../../services/filter.service';
import { News, BlogCategory, PaginationParams, SearchFilters } from '../../../models/api.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-section-3',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './section-3.html',
  styleUrl: './section-3.css'
})
export class Section3 implements OnInit, OnDestroy {
  allNews: News[] = [];
  loading = true;
  error: string | null = null;
  categories: Map<number, string> = new Map();
  private filterSubscription: Subscription | undefined;
  private selectedCategories: number[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 16;
  totalItems = 0;
  totalPages = 0;

  constructor(
    private newsService: NewsService,
    private filterService: FilterService
  ) {}

  ngOnInit() {
    this.subscribeToFilters();
    this.loadAllNews();
  }

  ngOnDestroy() {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }

  subscribeToFilters() {
    this.filterSubscription = this.filterService.selectedCategories$.subscribe(categories => {
      this.selectedCategories = categories;
      this.currentPage = 1; // Reset à la première page quand les filtres changent
      this.loadAllNews();
    });
  }

  loadAllNews() {
    this.loading = true;
    this.error = null;

    // Charger toutes les actualités d'abord
    this.newsService.getNews({ per_page: 50 }).subscribe({
      next: (response) => {
        // Filtrer seulement les actualités qui ont une date de publication
        let filteredNews = (response.data || []).filter((news: News) => news.published_at !== null);
        
        // Appliquer les filtres de catégories côté client
        if (this.selectedCategories.length > 0) {
          filteredNews = filteredNews.filter((news: News) => 
            this.selectedCategories.includes(news.category_id)
          );
          console.log(`Filtrage section-3 par catégories: ${this.selectedCategories.join(',')} - ${filteredNews.length} résultats`);
        }
        
        // Appliquer la pagination côté client
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        
        this.allNews = filteredNews.slice(startIndex, endIndex);
        
        // Mettre à jour la pagination
        this.totalItems = filteredNews.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        
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
    const categoryIds = [...new Set(this.allNews.map(news => news.category_id))];
    
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

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAllNews();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
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
    // Si l'image existe et est une URL complète
    if (news.cover_image && news.cover_image.startsWith('http')) {
      return news.cover_image;
    }
    
    // Si l'image existe mais n'est pas une URL complète
    if (news.cover_image && !news.cover_image.startsWith('http')) {
      return `https://lafaom.vertex-cam.com${news.cover_image}`;
    }
    
    // Image par défaut
    return '/assets/images/default-news.svg';
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
