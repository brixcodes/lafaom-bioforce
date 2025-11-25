/**
 * Composant Footer
 * 
 * Composant de pied de page de l'application.
 * Affiche les informations de contact et les liens utiles.
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-footers',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './footers.html',
  styleUrl: './footers.css'
})
export class Footers {
  // Le composant footer est principalement statique, défini dans le template HTML
}
