import { Component } from '@angular/core';
import { Caroussel } from '../../components/caroussel/caroussel';
import { Section1 } from '../../components/acceuil/section-1/section-1';
import { Section2 } from '../../components/acceuil/section-2/section-2';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Caroussel, Section1, Section2],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
