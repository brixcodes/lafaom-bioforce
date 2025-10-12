import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-acceuil-section-1',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './section-1.html',
  styleUrl: './section-1.css'
})
export class Section1 {
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
