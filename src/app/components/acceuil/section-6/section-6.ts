/**
 * Composant Section Contact de la page d'accueil
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-home-contact-section',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './section-6.html',
  styleUrl: './section-6.css'
})
export class HomeContactSection {

}
