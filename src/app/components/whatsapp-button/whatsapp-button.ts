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
  // Lien WhatsApp direct avec message pré-rempli
  whatsappUrl = 'https://wa.me/237673596327?text=Salut%20équipe%20LAFAOM-MAO%20!%20Je%20suis%20intéressé(e)%20par%20vos%20formations,%20mais%20j\'ai%20besoin%20d\'aide%20pour%20comprendre%20le%20processus%20de%20candidature.%20Pouvez-vous%20m\'expliquer%20comment%20procéder%20%3F';

  openWhatsApp(): void {
    window.open(this.whatsappUrl, '_blank');
  }
}
