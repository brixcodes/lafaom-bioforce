import { Component } from '@angular/core';
import { ActualiteHeader } from '../../components/actualite/header/header';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [ActualiteHeader],
  templateUrl: './news.html',
  styleUrl: './news.css'
})
export class News {
  // Component for news page
}
