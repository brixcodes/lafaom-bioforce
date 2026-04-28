/**
 * Composant Section À Propos de la page d'accueil
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslatePipe } from '../../../pipes/translate.pipe';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-about-section',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterModule],
  templateUrl: './section-3.html',
  styleUrl: './section-3.css'
})
export class HomeAboutSection {

}
