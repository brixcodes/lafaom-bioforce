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

declare var $: any;

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

  /** Indique si le menu burger est ouvert */
  isMobileMenuOpen = false;

  /** Menus déroulants ouverts sur mobile */
  openMobileMenus: Set<string> = new Set();

  /** Position de scroll avant l'ouverture du menu */
  private scrollPosition = 0;

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

  /**
   * Toggle le menu mobile
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    console.log('Toggle menu:', this.isMobileMenuOpen);
    
    // Toggle classes avec DOM natif
    const burger = document.querySelector('.js-hamburger');
    const submenu = document.querySelector('.sub-menu');
    const body = document.body;
    const html = document.documentElement;

    console.log('Elements found:', { burger: !!burger, submenu: !!submenu, body: !!body });

    if (burger) {
      burger.classList.toggle('is-active');
    }
    if (submenu) {
      submenu.classList.toggle('is-open');
      console.log('Submenu classes:', submenu.className);
    }
    
    if (this.isMobileMenuOpen) {
      // Sauvegarder la position de scroll
      this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      
      // Bloquer le scroll
      body.style.top = `-${this.scrollPosition}px`;
      body.classList.add('menu-open');
      html.classList.add('menu-open');
      
      console.log('Menu opened, scroll blocked at:', this.scrollPosition);
    } else {
      // Restaurer la position de scroll
      body.classList.remove('menu-open');
      html.classList.remove('menu-open');
      body.style.top = '';
      
      window.scrollTo(0, this.scrollPosition);
      console.log('Menu closed, scroll restored to:', this.scrollPosition);
    }
  }

  /**
   * Toggle un sous-menu mobile
   */
  toggleMobileSubmenu(menuId: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (this.openMobileMenus.has(menuId)) {
      this.openMobileMenus.delete(menuId);
    } else {
      this.openMobileMenus.add(menuId);
    }
  }

  /**
   * Vérifier si un sous-menu est ouvert
   */
  isMobileSubmenuOpen(menuId: string): boolean {
    return this.openMobileMenus.has(menuId);
  }
}
