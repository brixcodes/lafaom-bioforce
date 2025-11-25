/**
 * Composant Bouton WhatsApp
 * 
 * Composant flottant permettant d'ouvrir une conversation WhatsApp
 * avec un message pré-rempli pour contacter l'équipe LAFAOM-MAO.
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-button.html',
  styleUrl: './whatsapp-button.css'
})
export class WhatsAppButton {
  /** Numéro de téléphone WhatsApp */
  private readonly WHATSAPP_NUMBER = '237673596327';
  
  /** Message pré-rempli pour la conversation WhatsApp */
  private readonly DEFAULT_MESSAGE = 'Salut équipe LAFAOM-MAO ! Je suis intéressé(e) par vos formations, mais j\'ai besoin d\'aide pour comprendre le processus de candidature. Pouvez-vous m\'expliquer comment procéder ?';
  
  /** URL complète pour ouvrir WhatsApp avec le message pré-rempli */
  readonly whatsappUrl = `https://wa.me/${this.WHATSAPP_NUMBER}?text=${encodeURIComponent(this.DEFAULT_MESSAGE)}`;

  /**
   * Ouvrir WhatsApp dans un nouvel onglet avec le message pré-rempli
   */
  openWhatsApp(): void {
    window.open(this.whatsappUrl, '_blank');
  }
}
