import { Injectable, signal, effect } from '@angular/core';
import { Subject } from 'rxjs';
import { SimpleTranslateService } from './simple-translate.service';
import { clearAllCache } from '../interceptors/cache.interceptor';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'LAFAOM-language';
  private readonly DEFAULT_LANG = 'fr';
  private readonly SUPPORTED_LANGS = ['fr', 'en', 'de'];

  // Signal pour l'état de la langue actuelle
  public currentLanguage = signal<string>(this.DEFAULT_LANG);

  // Subject pour notifier les changements de langue
  public languageChange$ = new Subject<string>();

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
      const oldLang = this.currentLanguage();

      console.log(`🌐 [LANGUAGE] Changement de langue: ${oldLang} → ${lang}`);

      // Mettre à jour le SimpleTranslateService
      this.simpleTranslateService.setLanguage(lang);
      
      // Mettre à jour notre signal
      this.currentLanguage.set(lang);
      
      // Sauvegarder dans localStorage
      localStorage.setItem(this.STORAGE_KEY, lang);

      // Si la langue a changé, invalider le cache et émettre l'événement
      if (oldLang !== lang) {
        clearAllCache();
        this.languageChange$.next(lang);
      }
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
      'en': 'English',
      'de': 'Deutsch'
    };
    return languageNames[lang] || lang;
  }

  public toggleLanguage(): void {
    const currentLang = this.getCurrentLanguage();
    const supportedLangs = this.getSupportedLanguages();
    const currentIndex = supportedLangs.indexOf(currentLang);
    const nextIndex = (currentIndex + 1) % supportedLangs.length;
    const newLang = supportedLangs[nextIndex];
    this.setLanguage(newLang);
  }

  /**
   * Méthode de debug pour vérifier l'état de synchronisation
   */
  public debugLanguageState(): void {
    console.log('=== DEBUG LANGUAGE STATE ===');
    console.log('LanguageService.currentLanguage:', this.currentLanguage());
    console.log('SimpleTranslateService.getCurrentLanguage:', this.simpleTranslateService.getCurrentLanguage());
    console.log('localStorage LAFAOM-language:', localStorage.getItem(this.STORAGE_KEY));
  }
}
