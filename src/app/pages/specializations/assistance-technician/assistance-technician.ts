import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { SimpleTranslateService } from '../../../services/simple-translate.service';

@Component({
  selector: 'app-assistance-technician',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './assistance-technician.html',
  styleUrl: './assistance-technician.css'
})
export class AssistanceTechnician implements OnInit {
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
    const title = this.translateService.instant('associativeFoundation.title');
    this.titleService.setTitle(`${title} | LAFAOM-MAO`);
  }
}
