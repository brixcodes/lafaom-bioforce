/**
 * Composant Section Services de la page d'accueil
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-home-services-section',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './section-4.html',
  styleUrl: './section-4.css'
})
export class HomeServicesSection {

}
