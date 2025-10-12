import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe, LanguageSwitcher],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

}
