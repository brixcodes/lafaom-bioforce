import { Injectable, signal } from '@angular/core';
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

      // Si la langue a changé, invalider tout le cache
      if (oldLang !== lang) {
        console.log(`🌐 [LANGUAGE] Changement de langue: ${oldLang} → ${lang}`);
        clearAllCache();
      }

      this.simpleTranslateService.setLanguage(lang);
      this.currentLanguage.set(lang);
      localStorage.setItem(this.STORAGE_KEY, lang);

      // Émettre un événement de changement de langue si la langue a changé
      if (oldLang !== lang) {
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
}
