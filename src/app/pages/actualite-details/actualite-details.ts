import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NewsService } from '../../services/news.service';
import { News, BlogCategory, ArticleSection } from '../../models/api.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-actualite-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './actualite-details.html',
  styleUrl: './actualite-details.css'
})
export class ActualiteDetails implements OnInit, OnDestroy {
  news: News | null = null;
  category: string = '';
  sections: ArticleSection[] = [];
  loading = false;
  error: string | null = null;
  private routeSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsService: NewsService
  ) {}

  ngOnInit() {
    this.routeSubscription = this.route.params.subscribe(params => {
      const id = params['id'];
      const numericId = parseInt(id);
      
      if (id && !isNaN(numericId)) {
        this.loadNewsDetails(numericId);
      } else {
        this.error = 'ID d\'actualité invalide';
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  loadNewsDetails(id: number) {
    this.loading = false; // Pas de loading automatique
    this.error = null;

    this.newsService.getNewsById(id).subscribe({
      next: (response) => {
        this.news = response.data;
        if (this.news && this.news.category_id) {
          this.loadCategory(this.news.category_id);
        }
        // Charger les sections de l'article
        this.loadArticleSections(id);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'actualité:', error);
        this.error = 'Impossible de charger l\'actualité';
        this.loading = false;
      }
    });
  }

  loadCategory(categoryId: number) {
    this.newsService.getCategoryById(categoryId).subscribe({
      next: (response) => {
        this.category = response.data.title;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la catégorie:', error);
        this.category = `Catégorie ${categoryId}`;
      }
    });
  }

  loadArticleSections(postId: number) {
    this.newsService.getArticleSections(postId).subscribe({
      next: (response) => {
        this.sections = response.data;
        console.log('Sections chargées:', this.sections);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des sections:', error);
        this.sections = [];
      }
    });
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getImageUrl(news: News | null): string {
    if (!news) return '/assets/images/default-news.jpg';
    
    if (news.cover_image && news.cover_image.startsWith('http')) {
      return news.cover_image;
    }
    
    if (news.cover_image && !news.cover_image.startsWith('http')) {
      return `https://lafaom.vertex-cam.com${news.cover_image}`;
    }
    
    return '/assets/images/default-news.jpg';
  }

  getContent(news: News | null): string {
    if (!news || !news.content) return '';
    
    let cleanContent = news.content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
    
    return cleanContent;
  }

  getSummary(news: News | null): string {
    if (!news || !news.summary) return '';
    
    let cleanSummary = news.summary
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
    
    return cleanSummary;
  }

  getTags(news: News | null): string[] {
    if (!news || !news.tags) return [];
    return news.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }

  getSectionMediaUrl(section: ArticleSection): string {
    if (!section.cover_image) return '';

    if (section.cover_image.startsWith('http')) {
      return section.cover_image;
    }

    return `https://lafaom.vertex-cam.com${section.cover_image}`;
  }

  goBack() {
    this.router.navigate(['/actualites']);
  }
}
