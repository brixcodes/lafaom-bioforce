import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    TranslateModule.forRoot({
      defaultLanguage: 'fr'
    })
  ],
  exports: [TranslateModule]
})
export class TranslateConfigModule { }
