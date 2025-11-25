/**
 * Composant Header pour la page Formations
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { HomeServicesSection } from '../../acceuil/section-4/section-4';
import { HomeAboutSection } from '../../acceuil/section-3/section-3';

@Component({
  selector: 'app-formations-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe, HomeServicesSection, HomeAboutSection],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class FormationsHeader {

}
