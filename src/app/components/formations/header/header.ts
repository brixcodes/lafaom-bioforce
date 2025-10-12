import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { Section4 } from '../../acceuil/section-4/section-4';
import { Section3 } from '../../acceuil/section-3/section-3';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe, Section4, Section3],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

}
