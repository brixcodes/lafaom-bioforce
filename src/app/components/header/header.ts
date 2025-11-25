/**
 * Composant Header Global
 * 
 * Composant d'en-tête principal de l'application avec gestion du scroll
 * pour changer l'apparence quand l'utilisateur fait défiler la page.
 */
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

@Component({
  selector: 'app-global-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe, LanguageSwitcher],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class GlobalHeader implements OnInit {
  /** Indique si la page a été défilée (pour changer le style du header) */
  isScrolled = false;

  /**
   * Seuil de scroll en pixels pour activer le style "scrolled"
   */
  private readonly SCROLL_THRESHOLD = 50;

  ngOnInit(): void {
    this.checkScroll();
  }

  /**
   * Écouteur d'événement de scroll de la fenêtre
   */
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScroll();
  }

  /**
   * Vérifier la position du scroll et mettre à jour l'état
   */
  private checkScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.isScrolled = scrollTop > this.SCROLL_THRESHOLD;
  }
}
