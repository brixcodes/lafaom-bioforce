import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footers } from './components/footers/footers';
import { WhatsAppButton } from './components/whatsapp-button/whatsapp-button';
import { SimpleTranslateService } from './services/simple-translate.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footers, WhatsAppButton],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('LAFAOM_website');

  constructor(private simpleTranslateService: SimpleTranslateService) {}

  ngOnInit(): void {
    // L'initialisation se fait automatiquement dans le constructeur du service
  }
}
