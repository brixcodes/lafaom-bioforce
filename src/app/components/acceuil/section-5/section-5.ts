import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService } from '../../../services/news.service';
import { News, BlogCategory } from '../../../models/api.models';
import { Observable, interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-section-5',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-5.html',
  styleUrl: './section-5.css'
})
export class Section5 implements OnInit, OnDestroy {
  recentNews$: Observable<any> | undefined;
  recentNews: News[] = [];
  loading = true;
  error: string | null = null;
  categories: Map<number, string> = new Map();
  private refreshSubscription: Subscription | undefined;
  private readonly REFRESH_INTERVAL = 30000; // 30 secondes

  constructor(private newsService: NewsService) {}

  ngOnInit() {
    this.loadRecentNews();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  startAutoRefresh() {
    // Vérifier si nous sommes dans un environnement de build (SSR)
    if (typeof window === 'undefined') {
      return; // Ne pas démarrer le rechargement automatique en SSR
    }
    
    // Recharger les actualités toutes les 30 secondes
    this.refreshSubscription = interval(this.REFRESH_INTERVAL).subscribe(() => {
      console.log('Rechargement automatique des actualités...');
      this.loadRecentNews(false); // Pas d'indicateur de chargement pour les rechargements automatiques
    });
  }

  loadRecentNews(showLoading: boolean = true) {
    if (showLoading) {
      this.loading = true;
    }
    this.error = null;
    
    this.recentNews$ = this.newsService.getRecentNews(4);
    
    this.recentNews$.subscribe({
      next: (response) => {
        // Filtrer seulement les actualités qui ont une date de publication
        this.recentNews = (response.data || []).filter((news: News) => news.published_at !== null);
        
        // Charger les catégories pour chaque actualité
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
    return news.cover_image || '/l1.jpg';
  }

  loadCategories() {
    // Récupérer les IDs uniques des catégories
    const categoryIds = [...new Set(this.recentNews.map(news => news.category_id))];
    
    // Charger chaque catégorie
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

  getCategory(news: News): string {
    return this.categories.get(news.category_id) || `Catégorie ${news.category_id}`;
  }

  getSummary(news: News): string {
    if (!news.summary) return '';
    
    // Nettoyer le HTML et décoder les entités HTML
    let cleanSummary = news.summary
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
    
    // Supprimer les balises HTML non désirées et garder seulement les balises de formatage
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
