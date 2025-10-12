import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
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
    console.log('🎯 LanguageSwitcher: Changement de langue demandé vers:', lang);
    console.log('🎯 LanguageSwitcher: Langue actuelle avant:', this.currentLanguage());
    console.log('🎯 LanguageSwitcher: Langues supportées:', this.getSupportedLanguages());
    
    this.languageService.setLanguage(lang);
    this.closeDropdown();
    
    // Attendre un peu pour voir le changement
    setTimeout(() => {
      console.log('🎯 LanguageSwitcher: Langue après changement:', this.currentLanguage());
    }, 200);
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
