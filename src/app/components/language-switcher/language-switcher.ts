import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css'
})
export class LanguageSwitcher {
  public currentLanguage = signal<string>('fr');
  public isOpen = signal<boolean>(false);

  constructor(private languageService: LanguageService) {
    // Écouter les changements de langue avec un effet
    effect(() => {
      this.currentLanguage.set(this.languageService.currentLanguage());
    });
  }

  public toggleDropdown(): void {
    this.isOpen.set(!this.isOpen());
  }

  public closeDropdown(): void {
    this.isOpen.set(false);
  }

  public setLanguage(lang: string): void {
    this.languageService.setLanguage(lang);
    this.closeDropdown();
  }

  public getSupportedLanguages(): string[] {
    return this.languageService.getSupportedLanguages();
  }

  public getLanguageName(lang: string): string {
    return this.languageService.getLanguageName(lang);
  }

  public getCurrentLanguageName(): string {
    return this.getLanguageName(this.currentLanguage());
  }
}
