import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { SimpleTranslateService } from '../../../services/simple-translate.service';

@Component({
  selector: 'app-welcome-support',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './welcome-support.html',
  styleUrl: './welcome-support.css'
})
export class WelcomeSupport implements OnInit {
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
    const title = this.translateService.instant('systemicEngineering.title');
    this.titleService.setTitle(`${title} | LAFAOM-MAO`);
  }
}
