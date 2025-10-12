import { Injectable, signal } from '@angular/core';
import { SimpleTranslateService } from './simple-translate.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'lafaom-language';
  private readonly DEFAULT_LANG = 'fr';
  private readonly SUPPORTED_LANGS = ['fr', 'en'];

  // Signal pour l'état de la langue actuelle
  public currentLanguage = signal<string>(this.DEFAULT_LANG);

  constructor(private simpleTranslateService: SimpleTranslateService) {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    // Récupérer la langue sauvegardée ou utiliser la langue par défaut
    const savedLang = localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_LANG;
    
    // Vérifier que la langue est supportée
    const lang = this.SUPPORTED_LANGS.includes(savedLang) ? savedLang : this.DEFAULT_LANG;
    
    this.setLanguage(lang);
  }

  public setLanguage(lang: string): void {
    if (this.SUPPORTED_LANGS.includes(lang)) {
      this.simpleTranslateService.setLanguage(lang);
      this.currentLanguage.set(lang);
      localStorage.setItem(this.STORAGE_KEY, lang);
    }
  }

  public getCurrentLanguage(): string {
    return this.currentLanguage();
  }

  public getSupportedLanguages(): string[] {
    return [...this.SUPPORTED_LANGS];
  }

  public getLanguageName(lang: string): string {
    const languageNames: { [key: string]: string } = {
      'fr': 'Français',
      'en': 'English'
    };
    return languageNames[lang] || lang;
  }

  public toggleLanguage(): void {
    const currentLang = this.getCurrentLanguage();
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    this.setLanguage(newLang);
  }
}
