/**
 * Initialiseur des traductions
 * 
 * Charge les traductions avant le bootstrap de l'application
 * pour un affichage immédiat des textes traduits.
 */
import { APP_INITIALIZER } from '@angular/core';
import { SimpleTranslateService } from '../services/simple-translate.service';

/**
 * Fonction d'initialisation des traductions
 */
export function initializeTranslations(translateService: SimpleTranslateService): () => Promise<void> {
  return () => translateService.initialize();
}

/**
 * Provider pour APP_INITIALIZER
 */
export const TRANSLATIONS_INITIALIZER = {
  provide: APP_INITIALIZER,
  useFactory: initializeTranslations,
  deps: [SimpleTranslateService],
  multi: true
};

