import { Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
import { SimpleTranslateService } from '../services/simple-translate.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Pour que le pipe se mette à jour quand la langue change
})
export class TranslatePipe implements PipeTransform {
  constructor(
    private translateService: SimpleTranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  transform(key: string): string {
    // Forcer la détection des changements
    this.cdr.markForCheck();
    return this.translateService.translate(key);
  }
}
