import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslateInitializerService {

  constructor(private translate: TranslateService) {
    this.initializeTranslation();
  }

  private initializeTranslation(): void {
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
}
