/**
 * Composant Section Héro de la page d'accueil
 * Affiche la vidéo de présentation et le contenu principal
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-home-hero-section',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './section-1.html',
  styleUrl: './section-1.css'
})
export class HomeHeroSection {
  showVideoModal = false;

  openVideoModal() {
    this.showVideoModal = true;
    // Empêcher le scroll du body quand la modal est ouverte
    document.body.style.overflow = 'hidden';
  }

  closeVideoModal() {
    this.showVideoModal = false;
    // Restaurer le scroll du body
    document.body.style.overflow = 'auto';
  }
}
