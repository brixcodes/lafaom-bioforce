/**
 * Composant Sélecteur de Langue
 * 
 * Composant permettant de changer la langue de l'application.
 * Affiche un menu déroulant avec les langues disponibles.
 */
import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css'
})
export class LanguageSwitcher {
  /** Langue actuellement sélectionnée */
  public currentLanguage = signal<string>('fr');
  
  /** État d'ouverture du menu déroulant */
  public isOpen = signal<boolean>(false);

  constructor(private languageService: LanguageService) {
    // Écouter les changements de langue avec un effet réactif
    effect(() => {
      this.currentLanguage.set(this.languageService.currentLanguage());
    });
  }

  /**
   * Basculer l'état d'ouverture du menu déroulant
   */
  public toggleDropdown(): void {
    this.isOpen.set(!this.isOpen());
  }

  /**
   * Fermer le menu déroulant
   */
  public closeDropdown(): void {
    this.isOpen.set(false);
  }

  /**
   * Définir la langue de l'application
   * @param lang - Code de la langue à définir
   */
  public setLanguage(lang: string): void {
    if (!environment.production) {
      console.log('🎯 LanguageSwitcher: Changement de langue vers:', lang);
    }
    
    this.languageService.setLanguage(lang);
    this.closeDropdown();
  }

  /**
   * Obtenir la liste des langues supportées
   * @returns Tableau des codes de langues supportées
   */
  public getSupportedLanguages(): string[] {
    return this.languageService.getSupportedLanguages();
  }

  /**
   * Obtenir le nom d'une langue
   * @param lang - Code de la langue
   * @returns Le nom de la langue
   */
  public getLanguageName(lang: string): string {
    return this.languageService.getLanguageName(lang);
  }

  /**
   * Obtenir le nom de la langue actuelle
   * @returns Le nom de la langue actuelle
   */
  public getCurrentLanguageName(): string {
    return this.getLanguageName(this.currentLanguage());
  }
}
