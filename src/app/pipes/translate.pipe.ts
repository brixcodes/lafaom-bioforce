/**
 * Pipe de traduction
 * 
 * Ce pipe permet d'utiliser le service de traduction directement dans les templates.
 * Il est impur (pure: false) pour se mettre à jour automatiquement quand la langue change.
 * 
 * Usage dans un template :
 * {{ 'key.translation' | translate }}
 */
import { Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
import { SimpleTranslateService } from '../services/simple-translate.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Pipe impur pour se mettre à jour quand la langue change
})
export class TranslatePipe implements PipeTransform {
  constructor(
    private translateService: SimpleTranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Transformer une clé de traduction en texte traduit
   * @param key - La clé de traduction
   * @returns Le texte traduit
   */
  transform(key: string): string {
    // Forcer la détection des changements pour mettre à jour le template
    this.cdr.markForCheck();
    return this.translateService.translate(key);
  }
}
