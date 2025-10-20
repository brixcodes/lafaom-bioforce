import { Component } from '@angular/core';
import { Header } from '../../components/actualite/header/header';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [Header],
  templateUrl: './news.html',
  styleUrl: './news.css'
})
export class News {
  // Component for news page
}
