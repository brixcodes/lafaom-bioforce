/**
 * Service de traduction simple
 * 
 * Ce service gère le chargement et l'utilisation des traductions
 * pour l'application. Il supporte le français, l'anglais et l'allemand.
 */
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SimpleTranslateService {
  /** Dictionnaire des traductions par langue */
  private translations: { [key: string]: any } = {};
  
  /** Langue actuelle (signal réactif) */
  private currentLang = signal<string>('fr');
  
  /** Clé de stockage pour la langue dans localStorage */
  private readonly STORAGE_KEY = 'LAFAOM-language';
  
  /** Clé de stockage pour les traductions en cache */
  private readonly TRANSLATIONS_CACHE_KEY = 'LAFAOM-translations-cache';
  
  /** Clé de stockage pour la version du cache */
  private readonly CACHE_VERSION_KEY = 'LAFAOM-translations-version';
  
  /** Version actuelle du cache (incrémenter pour invalider le cache) */
  private readonly CACHE_VERSION = '3.0.6';
  
  /** Langues supportées */
  private readonly SUPPORTED_LANGUAGES = ['fr', 'en', 'de'];
  
  /** Promesse de chargement initial */
  private loadPromise: Promise<void> | null = null;

  constructor(private http: HttpClient) {
    // Ne pas charger automatiquement, sera fait par APP_INITIALIZER
  }

  /**
   * Initialiser les traductions (appelé par APP_INITIALIZER)
   * Charge uniquement la langue actuelle au démarrage pour un chargement rapide
   */
  public initialize(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Force clear cache pour debug
    if (!environment.production) {
      console.log('🔄 Initialisation des traductions - vidage du cache...');
      this.clearCache();
    }

    this.loadPromise = new Promise((resolve) => {
      // Récupérer la langue sauvegardée ou utiliser 'fr' par défaut
      const savedLang = localStorage.getItem(this.STORAGE_KEY) || 'fr';
      const lang = this.SUPPORTED_LANGUAGES.includes(savedLang) ? savedLang : 'fr';
      
      if (!environment.production) {
        console.log(`🌐 Chargement des traductions pour la langue: ${lang}`);
      }
      
      // Essayer de charger depuis le cache d'abord
      const cached = this.loadFromCache(lang);
      if (cached) {
        this.translations[lang] = cached;
        this.currentLang.set(lang);
        this.setDocumentLang(lang);
        
        if (!environment.production) {
          console.log(`✅ Traductions ${lang} chargées depuis le cache`);
          console.log(`📊 Sections disponibles:`, Object.keys(cached));
        }
        
        // Précharger les autres langues en arrière-plan
        this.preloadOtherLanguages(lang);
        
        resolve();
        return;
      }
      
      // Charger depuis le serveur
      this.http.get(`./assets/i18n/${lang}.json`).subscribe({
        next: (data: any) => {
          this.translations[lang] = data;
          this.currentLang.set(lang);
          this.setDocumentLang(lang);
          
          // Mettre en cache
          this.saveToCache(lang, data);
          
          if (!environment.production) {
            console.log(`✅ Traductions ${lang} chargées depuis le serveur`);
            console.log(`📊 Sections disponibles:`, Object.keys(data));
            console.log(`🔍 Section recruitment existe:`, 'recruitment' in data);
          }
          
          // Précharger les autres langues en arrière-plan
          this.preloadOtherLanguages(lang);
          
          resolve();
        },
        error: (error: any) => {
          console.error(`❌ Erreur lors du chargement des traductions ${lang}:`, error);
          // Utiliser des traductions vides en cas d'erreur
          this.translations[lang] = {};
          this.currentLang.set(lang);
          resolve();
        }
      });
    });

    return this.loadPromise;
  }

  /**
   * Charger depuis le cache localStorage
   */
  private loadFromCache(lang: string): any | null {
    try {
      const cachedVersion = localStorage.getItem(this.CACHE_VERSION_KEY);
      if (cachedVersion !== this.CACHE_VERSION) {
        // Version du cache invalide, nettoyer
        this.clearCache();
        return null;
      }

      const cached = localStorage.getItem(`${this.TRANSLATIONS_CACHE_KEY}-${lang}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du cache:', error);
    }
    return null;
  }

  /**
   * Sauvegarder dans le cache localStorage
   */
  private saveToCache(lang: string, data: any): void {
    try {
      localStorage.setItem(`${this.TRANSLATIONS_CACHE_KEY}-${lang}`, JSON.stringify(data));
      localStorage.setItem(this.CACHE_VERSION_KEY, this.CACHE_VERSION);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cache:', error);
      // Si le localStorage est plein, nettoyer les anciennes entrées
      this.clearCache();
    }
  }

  /**
   * Nettoyer le cache
   */
  private clearCache(): void {
    try {
      this.SUPPORTED_LANGUAGES.forEach(lang => {
        localStorage.removeItem(`${this.TRANSLATIONS_CACHE_KEY}-${lang}`);
      });
      localStorage.removeItem(this.CACHE_VERSION_KEY);
    } catch (error) {
      console.error('Erreur lors du nettoyage du cache:', error);
    }
  }

  /**
   * Forcer le rechargement des traductions (méthode publique pour debug)
   */
  public forceReload(): void {
    this.clearCache();
    this.translations = {};
    this.loadPromise = null;
    this.initialize();
  }

  /**
   * Vider complètement le cache et forcer un rechargement immédiat
   */
  public clearAllCache(): void {
    try {
      // Vider tout le localStorage lié aux traductions
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('LAFAOM-translations') || key.startsWith('LAFAOM_API_CACHE')) {
          localStorage.removeItem(key);
        }
      });
      
      // Réinitialiser les traductions en mémoire
      this.translations = {};
      this.loadPromise = null;
      
      console.log('🗑️ Cache complètement vidé, rechargement forcé...');
      
      // Forcer le rechargement immédiat
      this.initialize().then(() => {
        console.log('✅ Traductions rechargées. Sections disponibles:', Object.keys(this.translations[this.getCurrentLanguage()] || {}));
      });
    } catch (error) {
      console.error('Erreur lors du vidage complet du cache:', error);
    }
  }

  /**
   * Méthode de debug pour afficher l'état des traductions
   */
  public debugTranslations(): void {
    const lang = this.getCurrentLanguage();
    console.log('=== DEBUG TRADUCTIONS ===');
    console.log('Langue actuelle:', lang);
    console.log('Langues chargées:', Object.keys(this.translations));
    console.log('Sections disponibles pour', lang, ':', Object.keys(this.translations[lang] || {}));
    
    if (this.translations[lang]?.recruitment) {
      console.log('Section recruitment trouvée:', Object.keys(this.translations[lang].recruitment));
      if (this.translations[lang].recruitment.cabinetRecruitment) {
        console.log('Section cabinetRecruitment trouvée:', Object.keys(this.translations[lang].recruitment.cabinetRecruitment));
      }
    } else {
      console.log('❌ Section recruitment manquante !');
    }
  }

  /**
   * Précharger les autres langues en arrière-plan
   */
  private preloadOtherLanguages(currentLang: string): void {
    const otherLangs = this.SUPPORTED_LANGUAGES.filter(lang => lang !== currentLang);
    
    otherLangs.forEach(lang => {
      // Vérifier d'abord le cache
      const cached = this.loadFromCache(lang);
      if (cached) {
        this.translations[lang] = cached;
        return;
      }

      // Charger depuis le serveur en arrière-plan
      this.http.get(`./assets/i18n/${lang}.json`).subscribe({
        next: (data: any) => {
          this.translations[lang] = data;
          this.saveToCache(lang, data);
          if (!environment.production) {
            console.log(`✅ Traductions ${lang} préchargées`);
          }
        },
        error: (error: any) => {
          if (!environment.production) {
            console.error(`❌ Erreur lors du préchargement des traductions ${lang}:`, error);
          }
        }
      });
    });
  }

  /**
   * Définir l'attribut lang du document
   */
  private setDocumentLang(lang: string): void {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }

  /**
   * Définir la langue actuelle
   * @param lang - Code de la langue (fr, en, de)
   */
  public setLanguage(lang: string): void {
    if (!this.SUPPORTED_LANGUAGES.includes(lang)) {
      if (!environment.production) {
        console.warn(`⚠️ Langue non supportée: ${lang}`);
      }
      return;
    }
    
    const oldLang = this.getCurrentLanguage();
    
    if (!environment.production) {
      console.log('🔄 Changement de langue vers:', lang);
    }
    
    // Vider l'ancienne langue du localStorage si elle est différente
    if (oldLang && oldLang !== lang) {
      try {
        localStorage.removeItem(`${this.TRANSLATIONS_CACHE_KEY}-${oldLang}`);
        
        // Vider le cache API pour forcer la retraduction des données
        // Même si le cache est séparé par langue, on doit vider l'ancien cache
        // pour s'assurer que les données sont retraduites avec la nouvelle langue
        this.clearApiCache();
        
        if (!environment.production) {
          console.log(`🗑️ Ancienne langue "${oldLang}" supprimée du localStorage`);
          console.log('🗑️ Cache API vidé pour forcer la retraduction avec la nouvelle langue');
          console.log('✅ Cache traductions Lingva conservé pour toutes les langues');
        }
      } catch (error) {
        if (!environment.production) {
          console.warn('⚠️ Erreur lors de la suppression de l\'ancienne langue:', error);
        }
      }
    }
    
    // Vérifier si les traductions sont chargées
    if (!this.translations[lang]) {
      // Essayer de charger depuis le cache
      const cached = this.loadFromCache(lang);
      if (cached) {
        this.translations[lang] = cached;
      } else {
        // Charger depuis le serveur
        this.http.get(`./assets/i18n/${lang}.json`).subscribe({
          next: (data: any) => {
            this.translations[lang] = data;
            this.saveToCache(lang, data);
            this.currentLang.set(lang);
            this.setDocumentLang(lang);
            localStorage.setItem(this.STORAGE_KEY, lang);
            if (!environment.production) {
              console.log(`✅ Traductions "${lang}" chargées et enregistrées dans le localStorage`);
            }
          },
          error: (error: any) => {
            console.error(`❌ Erreur lors du chargement des traductions ${lang}:`, error);
          }
        });
        return;
      }
    }
    
    // Si les traductions sont déjà en mémoire, les enregistrer dans le localStorage
    if (this.translations[lang]) {
      this.saveToCache(lang, this.translations[lang]);
      if (!environment.production) {
        console.log(`✅ Traductions "${lang}" enregistrées dans le localStorage`);
      }
    }
    
    this.currentLang.set(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
    this.setDocumentLang(lang);
  }

  /**
   * Obtenir la langue actuelle
   * @returns Le code de la langue actuelle
   */
  public getCurrentLanguage(): string {
    return this.currentLang();
  }

  /**
   * Traduire une clé
   * @param key - La clé de traduction (peut être une clé imbriquée avec des points)
   * @returns La traduction ou la clé si non trouvée
   */
  public translate(key: string): string {
    const lang = this.getCurrentLanguage();
    const translation = this.translations[lang];
    
    if (!translation) {
      if (!environment.production) {
        console.warn(`Traductions non chargées pour la langue: ${lang}`);
        console.log('Langues chargées:', Object.keys(this.translations));
      }
      return key;
    }

    // Debug: afficher la taille de l'objet de traduction
    if (!environment.production && Object.keys(translation).length === 0) {
      console.warn(`Objet de traduction vide pour la langue: ${lang}`);
      return key;
    }

    // Debug spécial pour les clés recruitment
    if (!environment.production && key.startsWith('recruitment.')) {
      console.log(`🔍 Debug pour ${key}:`);
      console.log(`  - Langue actuelle: ${lang}`);
      console.log(`  - Sections disponibles:`, Object.keys(translation));
      console.log(`  - Section recruitment existe:`, 'recruitment' in translation);
      if ('recruitment' in translation) {
        console.log(`  - Clés dans recruitment:`, Object.keys(translation.recruitment));
      }
    }

    // Navigation dans l'objet de traduction
    const keys = key.split('.');
    let result: any = translation;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        if (!environment.production) {
          console.warn(`Clé de traduction non trouvée: ${key}`);
          // Debug: afficher les clés disponibles au niveau actuel
          if (result && typeof result === 'object') {
            console.log(`Clés disponibles au niveau "${keys.slice(0, keys.indexOf(k)).join('.')}":`, Object.keys(result));
          } else {
            console.log(`Résultat au niveau "${keys.slice(0, keys.indexOf(k)).join('.')}" n'est pas un objet:`, typeof result, result);
          }
        }
        return key;
      }
    }
    
    return typeof result === 'string' ? result : key;
  }

  /**
   * Obtenir la liste des langues supportées
   * @returns Tableau des codes de langues supportées
   */
  public getSupportedLanguages(): string[] {
    return [...this.SUPPORTED_LANGUAGES];
  }

  /**
   * Obtenir le nom d'une langue
   * @param lang - Code de la langue
   * @returns Le nom de la langue dans sa propre langue
   */
  public getLanguageName(lang: string): string {
    const names: { [key: string]: string } = {
      'fr': 'Français',
      'en': 'English',
      'de': 'Deutsch'
    };
    return names[lang] || lang;
  }

  /**
   * Vérifier si les traductions d'une langue sont chargées
   * @param lang - Code de la langue
   * @returns true si les traductions sont chargées, false sinon
   */
  public isTranslationLoaded(lang: string): boolean {
    return !!this.translations[lang];
  }

  /**
   * Obtenir la liste des langues chargées
   * @returns Tableau des codes de langues chargées
   */
  public getLoadedLanguages(): string[] {
    return Object.keys(this.translations);
  }

  /**
   * Vider le cache API pour forcer la retraduction des données
   */
  private clearApiCache(): void {
    try {
      const keys = Object.keys(localStorage);
      const apiCacheKeys = keys.filter(key => key.startsWith('LAFAOM_API_CACHE_'));
      apiCacheKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      if (!environment.production && apiCacheKeys.length > 0) {
        console.log(`🗑️ ${apiCacheKeys.length} entrées de cache API supprimées`);
      }
    } catch (error) {
      if (!environment.production) {
        console.warn('⚠️ Erreur lors du vidage du cache API:', error);
      }
    }
  }
}
