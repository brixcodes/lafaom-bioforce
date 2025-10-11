import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TrainingService } from '../../../services/training.service';
import { Training } from '../../../models/training.models';
import { Observable, interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-formations-section-1',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './section-1.html',
  styleUrl: './section-1.css'
})
export class Section1 implements OnInit, OnDestroy {
  featuredTrainings$: Observable<any> | undefined;
  featuredTrainings: Training[] = [];
  loading = true;
  error: string | null = null;
  private refreshSubscription: Subscription | undefined;
  private readonly REFRESH_INTERVAL = 30000; // 30 secondes

  constructor(private trainingService: TrainingService) {}

  ngOnInit() {
    this.loadFeaturedTrainings();
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
    
    // Recharger les formations toutes les 30 secondes
    this.refreshSubscription = interval(this.REFRESH_INTERVAL).subscribe(() => {
      console.log('Rechargement automatique des formations...');
      this.loadFeaturedTrainings(false); // Pas d'indicateur de chargement pour les rechargements automatiques
    });
  }

  loadFeaturedTrainings(showLoading: boolean = true) {
    if (showLoading) {
      this.loading = true;
    }
    this.error = null;
    
    this.trainingService.getFeaturedTrainings(5).subscribe({
      next: (response) => {
        console.log('Réponse API formations:', response);
        this.featuredTrainings = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des formations:', error);
        this.error = 'Impossible de charger les formations';
        this.loading = false;
      }
    });
  }

  formatDuration(duration: string): string {
    return duration || 'N/A';
  }

  getTrainingUrl(training: Training): string {
    return `/formation/${training.slug}`;
  }
}
