/**
 * Configuration principale de l'application Angular
 * 
 * Ce fichier définit les providers et la configuration globale de l'application.
 */
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, NoPreloading } from '@angular/router';
import { provideClientHydration, withEventReplay, withNoHttpTransferCache } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { routes } from './app.routes';
import { TRANSLATIONS_INITIALIZER } from './initializers/translations.initializer';
import { cacheInterceptor } from './interceptors/cache.interceptor';
import { apiTranslateInterceptor } from './interceptors/api-translate.interceptor';

/**
 * Configuration de l'application
 * 
 * - Zone Change Detection : Optimisation avec coalescing des événements
 * - Router : Configuration des routes sans préchargement
 * - Client Hydration : Support SSR avec replay des événements
 * - HTTP Client : Utilisation de fetch API pour les requêtes HTTP avec cache
 * - Translations : Préchargement des traductions avant le bootstrap
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Optimisation de la détection de changement avec coalescing des événements
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // Configuration du routeur sans préchargement automatique
    provideRouter(routes, withPreloading(NoPreloading)),
    
    // Configuration SSR avec replay des événements et pas de cache HTTP
    provideClientHydration(withEventReplay(), withNoHttpTransferCache()),
    
    // Client HTTP utilisant fetch API avec intercepteurs
    // L'ordre est important : traduction d'abord, puis cache
    // Cela garantit que toutes les données sont traduites avant d'être mises en cache
    // Le cache stocke les données traduites par langue (clé inclut la langue)
    provideHttpClient(
      withFetch(),
      withInterceptors([apiTranslateInterceptor, cacheInterceptor])
    ),
    
    // Initialisation des traductions avant le bootstrap
    TRANSLATIONS_INITIALIZER
  ]
};