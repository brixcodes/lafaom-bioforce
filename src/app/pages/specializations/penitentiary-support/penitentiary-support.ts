import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { SimpleTranslateService } from '../../../services/simple-translate.service';

@Component({
  selector: 'app-penitentiary-support',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './penitentiary-support.html',
  styleUrl: './penitentiary-support.css'
})
export class PenitentiarySupport implements OnInit {
  private titleService = inject(Title);
  private translateService = inject(SimpleTranslateService);

  ngOnInit() {
    this.updateTitle();
    // Mettre à jour le titre quand la langue change
    this.translateService.currentLang$.subscribe(() => {
      this.updateTitle();
    });
  }

  private updateTitle() {
    const title = this.translateService.instant('operationalFramework.title');
    this.titleService.setTitle(`${title} | LAFAOM-MAO`);
  }
}
