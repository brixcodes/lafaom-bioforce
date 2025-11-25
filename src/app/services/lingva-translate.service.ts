/**
 * Service de traduction via l'API Lingva
 * 
 * Ce service utilise l'API Lingva pour traduire du texte
 * du français vers l'anglais ou l'allemand.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LingvaTranslateService {
  /** URL de base de l'API Lingva */
  private readonly LINGVA_API_URL = 'https://lingva.ml/api/v1';

  /** Limite de caractères pour un seul appel API */
  private readonly MAX_CHUNK_SIZE = 500;

  /** Cache pour les traductions (évite les appels répétés) */
  private translationCache: Map<string, string> = new Map();

  /** Durée de validité du cache (24 heures pour optimiser les performances) */
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000;

  /** Cache avec timestamp */
  private cacheTimestamps: Map<string, number> = new Map();

  /** Cache localStorage pour persister les traductions entre les sessions */
  private readonly STORAGE_PREFIX = 'LINGVA_TRANSLATION_';

  /** Taille maximale du cache en mémoire (1000 entrées) */
  private readonly MAX_CACHE_SIZE = 1000;

  constructor(private http: HttpClient) { }

  /**
   * Traduire un texte du français vers une langue cible
   * @param text - Le texte à traduire (en français)
   * @param targetLang - La langue cible ('en' ou 'de')
   * @returns Observable contenant le texte traduit
   */
  translate(text: string, targetLang: 'en' | 'de' | 'fr'): Observable<string> {
    // Si le texte est vide ou la langue cible est le français, retourner le texte original
    if (!text || !text.trim() || targetLang === 'fr') {
      return of(text);
    }

    // Vérifier le cache (mémoire puis localStorage)
    const cacheKey = `${targetLang}:${text}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return of(cached);
    }

    // Vérifier le cache localStorage
    const storageKey = `${this.STORAGE_PREFIX}${cacheKey}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.translation && parsed.timestamp) {
          const age = Date.now() - parsed.timestamp;
          if (age < this.CACHE_DURATION) {
            // Mettre en cache mémoire aussi
            this.saveToCache(cacheKey, parsed.translation);
            return of(parsed.translation);
          } else {
            // Cache expiré, le supprimer
            localStorage.removeItem(storageKey);
          }
        }
      }
    } catch (e) {
      // Ignorer les erreurs de localStorage
    }

    // Si le texte est trop long, le découper
    if (text.length > this.MAX_CHUNK_SIZE) {
      return this.translateLongText(text, targetLang).pipe(
        map((translated: string) => {
          // Mettre en cache
          this.saveToCache(cacheKey, translated);
          this.saveToLocalStorage(cacheKey, translated);

          if (!environment.production && translated !== text) {
            const preview = text.length > 50 ? text.substring(0, 50) + '...' : text;
            const translatedPreview = translated.length > 50 ? translated.substring(0, 50) + '...' : translated;
            console.log(`🌐 [LINGVA] Traduit (chunked): "${preview}" -> "${translatedPreview}"`);
          }

          return translated;
        }),
        catchError((error: any) => {
          console.error('❌ [LINGVA] Erreur lors de la traduction (chunked):', error);
          return of(text);
        })
      );
    }

    // Texte court, traduction directe
    return this.translateWithLingva(text, targetLang).pipe(
      map((translated: string) => {
        // Mettre en cache
        this.saveToCache(cacheKey, translated);
        this.saveToLocalStorage(cacheKey, translated);

        if (!environment.production && translated !== text) {
          const preview = text.length > 50 ? text.substring(0, 50) + '...' : text;
          const translatedPreview = translated.length > 50 ? translated.substring(0, 50) + '...' : translated;
          console.log(`🌐 [LINGVA] Traduit: "${preview}" -> "${translatedPreview}"`);
        }

        return translated;
      }),
      catchError((error: any) => {
        console.error('❌ [LINGVA] Erreur lors de la traduction:', error);
        return of(text);
      })
    );
  }

  /**
   * Traduire avec l'API Lingva (GET)
   */
  private translateWithLingva(text: string, targetLang: 'en' | 'de'): Observable<string> {
    const encodedText = encodeURIComponent(text);
    const url = `${this.LINGVA_API_URL}/fr/${targetLang}/${encodedText}`;

    return this.http.get<any>(url).pipe(
      map((response: any) => {
        if (response && response.translation) {
          return response.translation;
        }
        throw new Error('Invalid Lingva response');
      })
    );
  }

  /**
   * Traduire un texte long en le découpant en morceaux
   */
  private translateLongText(text: string, targetLang: 'en' | 'de'): Observable<string> {
    const chunks = this.splitTextIntoChunks(text, this.MAX_CHUNK_SIZE);

    // Traduire chaque morceau en parallèle
    const translationObservables = chunks.map(chunk =>
      this.translateWithLingva(chunk, targetLang).pipe(
        catchError(() => of(chunk)) // En cas d'erreur, garder le texte original
      )
    );

    // Attendre que tous les morceaux soient traduits et les recoller
    return forkJoin(translationObservables).pipe(
      map((translatedChunks: string[]) => translatedChunks.join(''))
    );
  }

  /**
   * Découper un texte en morceaux de taille maximale
   * Essaie de couper aux limites de phrases pour préserver le sens
   */
  private splitTextIntoChunks(text: string, maxSize: number): string[] {
    if (text.length <= maxSize) {
      return [text];
    }

    const chunks: string[] = [];
    let remainingText = text;

    while (remainingText.length > 0) {
      if (remainingText.length <= maxSize) {
        chunks.push(remainingText);
        break;
      }

      // Chercher un point de coupure naturel (phrase, virgule, espace)
      let cutPoint = maxSize;
      const searchText = remainingText.substring(0, maxSize);

      // Essayer de couper à la fin d'une phrase
      const sentenceEnd = Math.max(
        searchText.lastIndexOf('. '),
        searchText.lastIndexOf('.\n'),
        searchText.lastIndexOf('! '),
        searchText.lastIndexOf('? ')
      );

      if (sentenceEnd > maxSize * 0.5) {
        // Si on trouve une fin de phrase dans la deuxième moitié, couper là
        cutPoint = sentenceEnd + 1;
      } else {
        // Sinon, chercher une virgule ou un espace
        const commaOrSpace = Math.max(
          searchText.lastIndexOf(', '),
          searchText.lastIndexOf(' ')
        );

        if (commaOrSpace > maxSize * 0.7) {
          cutPoint = commaOrSpace + 1;
        }
      }

      chunks.push(remainingText.substring(0, cutPoint));
      remainingText = remainingText.substring(cutPoint);
    }

    return chunks;
  }

  /**
   * Traduire plusieurs textes en parallèle avec forkJoin pour optimiser les performances
   * Optimisé pour utiliser le cache localStorage en premier pour des traductions instantanées
   * @param texts - Tableau de textes à traduire
   * @param targetLang - La langue cible
   * @returns Observable contenant un tableau de textes traduits
   */
  translateBatch(texts: string[], targetLang: 'en' | 'de' | 'fr'): Observable<string[]> {
    if (!texts || texts.length === 0 || targetLang === 'fr') {
      return of(texts);
    }

    // Filtrer les textes vides et créer un mapping pour préserver l'ordre
    const textMap: { originalIndex: number; text: string; isEmpty: boolean }[] = [];
    const textsToTranslate: string[] = [];

    texts.forEach((text, index) => {
      if (text && text.trim()) {
        textMap.push({ originalIndex: index, text, isEmpty: false });
        textsToTranslate.push(text);
      } else {
        textMap.push({ originalIndex: index, text, isEmpty: true });
      }
    });

    // Si aucun texte à traduire, retourner le tableau original
    if (textsToTranslate.length === 0) {
      return of(texts);
    }

    // OPTIMISATION: Vérifier d'abord le cache localStorage pour tous les textes
    // Cela permet des traductions instantanées sans appel API
    const cachedResults: { [key: string]: string } = {};
    const textsToFetch: string[] = [];

    textsToTranslate.forEach(text => {
      const cacheKey = `${targetLang}:${text}`;

      // Vérifier le cache mémoire d'abord (le plus rapide)
      const memoryCached = this.getFromCache(cacheKey);
      if (memoryCached) {
        cachedResults[text] = memoryCached;
        return;
      }

      // Vérifier le cache localStorage (rapide aussi)
      const storageKey = `${this.STORAGE_PREFIX}${cacheKey}`;
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.translation && parsed.timestamp) {
            const age = Date.now() - parsed.timestamp;
            if (age < this.CACHE_DURATION) {
              // Mettre en cache mémoire aussi pour la prochaine fois
              this.saveToCache(cacheKey, parsed.translation);
              cachedResults[text] = parsed.translation;
              return;
            } else {
              // Cache expiré, le supprimer
              localStorage.removeItem(storageKey);
            }
          }
        }
      } catch (e) {
        // Ignorer les erreurs de localStorage
      }

      // Si pas dans le cache, ajouter à la liste des textes à récupérer
      textsToFetch.push(text);
    });

    // Si tous les textes sont en cache, retourner immédiatement (INSTANTANÉ)
    if (textsToFetch.length === 0) {
      const results: string[] = new Array(texts.length);
      let translatedIndex = 0;

      textMap.forEach(({ originalIndex, text, isEmpty }) => {
        if (isEmpty) {
          results[originalIndex] = text;
        } else {
          results[originalIndex] = cachedResults[text] || text;
          translatedIndex++;
        }
      });

      return of(results);
    }

    // Traduire uniquement les textes qui ne sont pas en cache
    // Utiliser forkJoin pour traduire tous les textes en parallèle (plus rapide)
    const translationObservables = textsToFetch.map(text =>
      this.translate(text, targetLang).pipe(
        catchError(() => of(text)) // En cas d'erreur, garder le texte original
      )
    );

    return forkJoin(translationObservables).pipe(
      map((translatedTexts: string[]) => {
        // Reconstruire le tableau dans l'ordre original
        const results: string[] = new Array(texts.length);
        let translatedIndex = 0;
        let fetchedIndex = 0;

        textMap.forEach(({ originalIndex, text, isEmpty }) => {
          if (isEmpty) {
            results[originalIndex] = text;
          } else {
            // Utiliser le cache si disponible, sinon utiliser la traduction récupérée
            if (cachedResults[text]) {
              results[originalIndex] = cachedResults[text];
            } else {
              results[originalIndex] = translatedTexts[fetchedIndex] || text;
              fetchedIndex++;
            }
            translatedIndex++;
          }
        });

        return results;
      }),
      catchError((error: any) => {
        console.error('❌ [LINGVA] Erreur lors de la traduction batch:', error);
        // En cas d'erreur, utiliser le cache si disponible, sinon retourner les textes originaux
        const results: string[] = new Array(texts.length);
        let translatedIndex = 0;

        textMap.forEach(({ originalIndex, text, isEmpty }) => {
          if (isEmpty) {
            results[originalIndex] = text;
          } else {
            results[originalIndex] = cachedResults[text] || text;
            translatedIndex++;
          }
        });

        return of(results);
      })
    );
  }

  /**
   * Obtenir une traduction depuis le cache
   */
  private getFromCache(key: string): string | null {
    const cached = this.translationCache.get(key);
    const timestamp = this.cacheTimestamps.get(key);

    if (cached && timestamp) {
      const now = Date.now();
      if ((now - timestamp) < this.CACHE_DURATION) {
        return cached;
      } else {
        // Cache expiré, supprimer
        this.translationCache.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }

    return null;
  }

  /**
   * Sauvegarder une traduction dans le cache
   */
  private saveToCache(key: string, translation: string): void {
    this.translationCache.set(key, translation);
    this.cacheTimestamps.set(key, Date.now());

    // Nettoyer le cache si trop volumineux (LRU)
    if (this.translationCache.size > this.MAX_CACHE_SIZE) {
      const sortedEntries = Array.from(this.cacheTimestamps.entries())
        .sort((a, b) => a[1] - b[1]);

      const toRemove = sortedEntries.slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.1)); // Supprimer 10%
      toRemove.forEach(([key]) => {
        this.translationCache.delete(key);
        this.cacheTimestamps.delete(key);
      });
    }
  }

  /**
   * Sauvegarder une traduction dans localStorage pour persistance
   */
  private saveToLocalStorage(key: string, translation: string): void {
    try {
      const storageKey = `${this.STORAGE_PREFIX}${key}`;
      const data = {
        translation,
        timestamp: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      // Ignorer les erreurs de localStorage (quota dépassé, etc.)
      if (!environment.production) {
        console.warn('⚠️ [LINGVA] Impossible de sauvegarder dans localStorage:', e);
      }
    }
  }

  /**
   * Vider le cache
   */
  clearCache(): void {
    this.translationCache.clear();
    this.cacheTimestamps.clear();
  }
}
