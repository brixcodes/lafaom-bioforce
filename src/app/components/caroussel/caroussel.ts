/**
 * Composant Carousel
 * Affiche un carrousel d'images sur la page d'accueil
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './caroussel.html',
  styleUrl: './caroussel.css'
})
export class Carousel {

}
