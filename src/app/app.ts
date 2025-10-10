import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footers } from './components/footers/footers';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footers],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('lafaom_website');
}
