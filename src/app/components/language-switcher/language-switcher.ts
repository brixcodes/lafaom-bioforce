/**
 * Composant Sélecteur de Langue
 * 
 * Composant permettant de changer la langue de l'application.
 * Affiche un menu déroulant avec les langues disponibles.
 */
import { Component, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css'
})
export class LanguageSwitcher implements OnInit {
  /** Langue actuellement sélectionnée - computed depuis le service */
  public currentLanguage = computed(() => this.languageService.currentLanguage());
  
  /** État d'ouverture du menu */
  public isOpen = false;

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    console.log('🚀 LanguageSwitcher: Initialisation avec langue:', this.currentLanguage());
  }

  /**
   * Toggle l'ouverture du menu
   */
  public toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  /**
   * Fermer le menu
   */
  public closeMenu(): void {
    this.isOpen = false;
  }

  /**
   * Définir la langue de l'application
   * @param lang - Code de la langue à définir
   */
  public setLanguage(lang: string): void {
    console.log('🎯 LanguageSwitcher: Changement de langue vers:', lang);
    this.languageService.setLanguage(lang);
    this.closeMenu();
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
}
