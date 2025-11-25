/**
 * Composant racine de l'application LAFAOM-MAO
 * 
 * Ce composant sert de point d'entrée principal de l'application.
 * Il initialise les services globaux et définit la structure de base de l'application.
 */
import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalHeader } from './components/header/header';
import { Footers } from './components/footers/footers';
import { WhatsAppButton } from './components/whatsapp-button/whatsapp-button';
import { SimpleTranslateService } from './services/simple-translate.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalHeader, Footers, WhatsAppButton],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  /** Titre de l'application */
  protected readonly title = signal('LAFAOM_website');

  constructor(private simpleTranslateService: SimpleTranslateService) {}

  /**
   * Initialisation du composant
   * L'initialisation de la traduction se fait automatiquement dans le constructeur du service
   */
  ngOnInit(): void {
    // L'initialisation se fait automatiquement dans le constructeur du service
  }
}
