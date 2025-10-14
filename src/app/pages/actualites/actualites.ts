import { Component } from '@angular/core';
import { Header } from '../../components/actualite/header/header';
import { Section1 } from '../../components/actualite/section-1/section-1';
import { Section2 } from '../../components/actualite/section-2/section-2';
import { Section3 } from '../../components/actualite/section-3/section-3';

@Component({
  selector: 'app-actualites',
  standalone: true,
  imports: [Header, Section1, Section2, Section3],
  templateUrl: './actualites.html',
  styleUrl: './actualites.css'
})
export class Actualites {
  // Component for actualites page
}
