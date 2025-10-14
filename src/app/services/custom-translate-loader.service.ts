import { Injectable } from '@angular/core';
import { TranslateService, TranslationObject } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CustomTranslateLoaderService {

  private translations: { [key: string]: any } = {};

  constructor(
    private translate: TranslateService,
    private http: HttpClient
  ) {
    this.loadTranslations();
  }

  private loadTranslations(): void {
    // Charger les traductions françaises
    this.http.get('./assets/i18n/fr.json').subscribe({
      next: (data: any) => {
        this.translations['fr'] = data;
        this.translate.setTranslation('fr', data as TranslationObject);
      },
      error: (error) => console.error('Erreur lors du chargement des traductions françaises:', error)
    });

    // Charger les traductions anglaises
    this.http.get('./assets/i18n/en.json').subscribe({
      next: (data: any) => {
        this.translations['en'] = data;
        this.translate.setTranslation('en', data as TranslationObject);
      },
      error: (error) => console.error('Erreur lors du chargement des traductions anglaises:', error)
    });

    // Charger les traductions allemandes
    this.http.get('./assets/i18n/de.json').subscribe({
      next: (data: any) => {
        this.translations['de'] = data;
        this.translate.setTranslation('de', data as TranslationObject);
      },
      error: (error) => console.error('Erreur lors du chargement des traductions allemandes:', error)
    });

    // Définir la langue par défaut
    this.translate.setDefaultLang('fr');
    
    // Récupérer la langue sauvegardée ou utiliser le français par défaut
    const savedLang = localStorage.getItem('LAFAOM-language') || 'fr';
    const supportedLangs = ['fr', 'en', 'de'];
    
    // Vérifier que la langue est supportée
    const lang = supportedLangs.includes(savedLang) ? savedLang : 'fr';
    
    // Utiliser la langue
    this.translate.use(lang);
    
    // Mettre à jour l'attribut lang du document
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }

  public setLanguage(lang: string): void {
    if (this.translations[lang]) {
      this.translate.use(lang);
      localStorage.setItem('LAFAOM-language', lang);
      
      // Mettre à jour l'attribut lang du document
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
      }
    }
  }

  public getCurrentLanguage(): string {
    return this.translate.currentLang || 'fr';
  }
}
