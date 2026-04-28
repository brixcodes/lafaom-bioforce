import { Component } from '@angular/core';
import { ActualiteHeader } from '../../components/actualite/header/header';

import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [ActualiteHeader, CommonModule, TranslatePipe],
  templateUrl: './news.html',
  styleUrl: './news.css'
})
export class News {
  // Component for news page
}
