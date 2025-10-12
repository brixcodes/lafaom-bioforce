import { Pipe, PipeTransform } from '@angular/core';
import { SimpleTranslateService } from '../services/simple-translate.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Pour que le pipe se mette à jour quand la langue change
})
export class TranslatePipe implements PipeTransform {
  constructor(private translateService: SimpleTranslateService) {}

  transform(key: string): string {
    return this.translateService.translate(key);
  }
}
