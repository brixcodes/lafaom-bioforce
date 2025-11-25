/**
 * Page d'accueil
 * 
 * Page principale de l'application LAFAOM-MAO.
 * Affiche le carrousel et les sections principales de la page d'accueil.
 */
import { Component } from '@angular/core';
import { Carousel } from '../../components/caroussel/caroussel';
import { HomeHeroSection } from '../../components/acceuil/section-1/section-1';
import { HomeFeaturesSection } from '../../components/acceuil/section-2/section-2';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Carousel, HomeHeroSection, HomeFeaturesSection],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  // Le composant home est principalement un conteneur pour les sections
}
