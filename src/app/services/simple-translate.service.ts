import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SimpleTranslateService {
  private translations: { [key: string]: any } = {};
  private currentLang = signal<string>('fr');
  private readonly STORAGE_KEY = 'LAFAOM-language';

  constructor(private http: HttpClient) {
    this.loadTranslations();
  }

  private loadTranslations(): void {
    const languages = ['fr', 'en', 'de'];
    let loadedCount = 0;
    
    languages.forEach(lang => {
      this.http.get(`./assets/i18n/${lang}.json`).subscribe({
        next: (data: any) => {
          this.translations[lang] = data;
          loadedCount++;
          console.log(`✅ Traductions ${lang} chargées`);
          
          // Si toutes les traductions sont chargées, définir la langue
          if (loadedCount === languages.length) {
            const savedLang = localStorage.getItem(this.STORAGE_KEY) || 'fr';
            this.setLanguage(savedLang);
          }
        },
        error: (error) => {
          console.error(`❌ Erreur lors du chargement des traductions ${lang}:`, error);
          loadedCount++;
          
          // Même si une traduction échoue, continuer
          if (loadedCount === languages.length) {
            const savedLang = localStorage.getItem(this.STORAGE_KEY) || 'fr';
            this.setLanguage(savedLang);
          }
        }
      });
    });
  }

  public setLanguage(lang: string): void {
    if (['fr', 'en', 'de'].includes(lang)) {
      console.log('🔄 Changement de langue vers:', lang);
      
      // Vérifier si les traductions sont chargées
      if (!this.translations[lang]) {
        console.warn(`⚠️ Traductions non encore chargées pour ${lang}, attente...`);
        // Attendre un peu et réessayer une seule fois
        setTimeout(() => {
          if (this.translations[lang]) {
            this.setLanguage(lang);
          } else {
            console.error(`❌ Impossible de charger les traductions pour ${lang}`);
          }
        }, 1000);
        return;
      }
      
      this.currentLang.set(lang);
      localStorage.setItem(this.STORAGE_KEY, lang);
      
      // Mettre à jour l'attribut lang du document
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
        console.log('🌐 Attribut lang du document mis à jour:', document.documentElement.lang);
      }
      
      console.log('✅ Langue changée avec succès:', this.getCurrentLanguage());
      console.log('📊 Traductions disponibles:', Object.keys(this.translations));
    }
  }

  public getCurrentLanguage(): string {
    return this.currentLang();
  }

  public translate(key: string): string {
    const lang = this.getCurrentLanguage();
    const translation = this.translations[lang];
    
    if (!translation) {
      console.warn(`Traductions non chargées pour la langue: ${lang}`);
      return key;
    }

    // Navigation dans l'objet de traduction
    const keys = key.split('.');
    let result: any = translation;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        console.warn(`Clé de traduction non trouvée: ${key}`);
        return key;
      }
    }
    
    return typeof result === 'string' ? result : key;
  }

  public getSupportedLanguages(): string[] {
    return ['fr', 'en', 'de'];
  }

  public getLanguageName(lang: string): string {
    const names: { [key: string]: string } = {
      'fr': 'Français',
      'en': 'English',
      'de': 'Deutsch'
    };
    return names[lang] || lang;
  }

  public isTranslationLoaded(lang: string): boolean {
    return !!this.translations[lang];
  }

  public getLoadedLanguages(): string[] {
    return Object.keys(this.translations);
  }
}
