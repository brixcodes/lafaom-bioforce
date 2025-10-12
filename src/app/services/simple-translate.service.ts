import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SimpleTranslateService {
  private translations: { [key: string]: any } = {};
  private currentLang = signal<string>('fr');
  private readonly STORAGE_KEY = 'lafaom-language';

  constructor(private http: HttpClient) {
    this.loadTranslations();
  }

  private loadTranslations(): void {
    // Charger les traductions françaises
    this.http.get('./assets/i18n/fr.json').subscribe({
      next: (data: any) => {
        this.translations['fr'] = data;
        console.log('Traductions françaises chargées:', data);
      },
      error: (error) => console.error('Erreur lors du chargement des traductions françaises:', error)
    });

    // Charger les traductions anglaises
    this.http.get('./assets/i18n/en.json').subscribe({
      next: (data: any) => {
        this.translations['en'] = data;
        console.log('Traductions anglaises chargées:', data);
      },
      error: (error) => console.error('Erreur lors du chargement des traductions anglaises:', error)
    });

    // Récupérer la langue sauvegardée
    const savedLang = localStorage.getItem(this.STORAGE_KEY) || 'fr';
    this.setLanguage(savedLang);
  }

  public setLanguage(lang: string): void {
    if (['fr', 'en'].includes(lang)) {
      this.currentLang.set(lang);
      localStorage.setItem(this.STORAGE_KEY, lang);
      
      // Mettre à jour l'attribut lang du document
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
      }
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
    return ['fr', 'en'];
  }

  public getLanguageName(lang: string): string {
    const names: { [key: string]: string } = {
      'fr': 'Français',
      'en': 'English'
    };
    return names[lang] || lang;
  }
}
