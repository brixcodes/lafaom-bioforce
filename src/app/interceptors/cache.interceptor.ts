/**
 * Intercepteur HTTP pour le cache
 * 
 * Met en cache les réponses GET pour améliorer les performances
 * et réduire le nombre de requêtes réseau.
 */
import { HttpInterceptorFn, HttpRequest, HttpEvent, HttpResponse, HttpHandlerFn } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/** Durée de validité du cache en millisecondes (5 minutes) */
const CACHE_DURATION = 5 * 60 * 1000;

/** Clé de préfixe pour le cache localStorage */
const CACHE_PREFIX = 'LAFAOM_API_CACHE_';

/** Version du cache (incrémenter pour invalider tout le cache) */
const CACHE_VERSION = '1.0.0';

interface CacheEntry {
  data: any;
  timestamp: number;
  version: string;
}

/**
 * Générer une clé de cache à partir d'une requête
 * Inclut la langue actuelle pour que les traductions soient mises en cache séparément
 */
function getCacheKey(request: HttpRequest<any>): string {
  // Récupérer la langue actuelle depuis localStorage
  const currentLang = localStorage.getItem('LAFAOM-language') || 'fr';
  return `${CACHE_PREFIX}${currentLang}_${request.method}_${request.urlWithParams}`;
}

/**
 * Vérifier si une entrée de cache est valide
 */
function isCacheValid(entry: CacheEntry | null): boolean {
  if (!entry) return false;
  if (entry.version !== CACHE_VERSION) return false;
  const now = Date.now();
  return (now - entry.timestamp) < CACHE_DURATION;
}

/**
 * Obtenir une entrée du cache
 */
function getFromCache(key: string): CacheEntry | null {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Erreur lors de la lecture du cache:', error);
  }
  return null;
}

/**
 * Sauvegarder une entrée dans le cache
 */
function saveToCache(key: string, data: any): void {
  try {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du cache:', error);
    // Si le localStorage est plein, nettoyer les anciennes entrées
    clearOldCache();
  }
}

/**
 * Nettoyer les anciennes entrées du cache
 */
function clearOldCache(): void {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    let cleared = 0;

    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        const entry = getFromCache(key);
        if (!entry || (now - entry.timestamp) >= CACHE_DURATION || entry.version !== CACHE_VERSION) {
          localStorage.removeItem(key);
          cleared++;
        }
      }
    });

    if (cleared > 0) {
      console.log(`🧹 ${cleared} entrées de cache nettoyées`);
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage du cache:', error);
  }
}

/**
 * Invalider tout le cache de l'API
 * Utilisé lors du changement de langue pour forcer le rechargement des données
 */
export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage);
    let cleared = 0;

    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
        cleared++;
      }
    });

    console.log(`🧹 [CACHE] Cache invalidé complètement (${cleared} entrées supprimées)`);
  } catch (error) {
    console.error('❌ [CACHE] Erreur lors de l\'invalidation du cache:', error);
  }
}

/**
 * Invalider le cache pour une langue spécifique
 */
export function clearCacheForLanguage(lang: string): void {
  try {
    const keys = Object.keys(localStorage);
    let cleared = 0;
    const langPrefix = `${CACHE_PREFIX}${lang}_`;

    keys.forEach(key => {
      if (key.startsWith(langPrefix)) {
        localStorage.removeItem(key);
        cleared++;
      }
    });

    console.log(`🧹 [CACHE] Cache invalidé pour la langue "${lang}" (${cleared} entrées supprimées)`);
  } catch (error) {
    console.error(`❌ [CACHE] Erreur lors de l\'invalidation du cache pour "${lang}":`, error);
  }
}

/**
 * Intercepteur HTTP pour le cache
 * 
 * Met en cache uniquement les requêtes GET qui ne sont pas des traductions
 * (les traductions ont leur propre système de cache)
 */
export const cacheInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  // Ne pas mettre en cache les requêtes POST, PUT, DELETE, PATCH
  if (req.method !== 'GET') {
    return next(req);
  }

  // Ne pas mettre en cache les traductions (elles ont leur propre cache)
  if (req.url.includes('/assets/i18n/')) {
    return next(req);
  }

  // Ne pas mettre en cache les uploads de fichiers
  if (req.url.includes('/attachments') || req.url.includes('/upload')) {
    return next(req);
  }

  const cacheKey = getCacheKey(req);
  const cached = getFromCache(cacheKey);

  // Si le cache est valide, retourner les données en cache
  // IMPORTANT: Les données en cache sont déjà traduites pour la langue actuelle
  // car la clé de cache inclut la langue. Donc on peut les retourner directement.
  // L'intercepteur de traduction a déjà été appelé avant (ordre: apiTranslateInterceptor puis cacheInterceptor)
  // donc les données sont déjà traduites.
  if (isCacheValid(cached)) {
    if (!environment.production) {
      console.log('📦 [CACHE] Données récupérées du cache (déjà traduites) pour:', req.url, 'langue:', localStorage.getItem('LAFAOM-language') || 'fr');
    }
    // Retourner directement les données en cache (déjà traduites pour cette langue)
    return of(new HttpResponse({ body: cached!.data, status: 200 }));
  }

  // Sinon, faire la requête et mettre en cache la réponse
  // Note: La réponse sera traduite par apiTranslateInterceptor après
  return next(req).pipe(
    tap((event: HttpEvent<any>) => {
      // Ne mettre en cache que les réponses HTTP réussies
      if (event instanceof HttpResponse && event.status === 200) {
        saveToCache(cacheKey, event.body);
        if (!environment.production) {
          console.log('💾 [CACHE] Données mises en cache pour:', req.url, 'langue:', localStorage.getItem('LAFAOM-language') || 'fr');
        }
      }
    })
  );
};

