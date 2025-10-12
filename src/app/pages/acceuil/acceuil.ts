import { Component } from '@angular/core';
import { Caroussel } from '../../components/caroussel/caroussel';
import { Section1 } from '../../components/acceuil/section-1/section-1';
import { Section2 } from '../../components/acceuil/section-2/section-2';
import { Section4 } from '../../components/acceuil/section-4/section-4';
import { Section3 } from '../../components/acceuil/section-3/section-3';
import { Section5 } from '../../components/acceuil/section-5/section-5';
import { Section6 } from '../../components/acceuil/section-6/section-6';

@Component({
  selector: 'app-acceuil',
  standalone: true,
  imports: [Caroussel, Section1, Section2, Section3, Section4, Section5, Section6],
  templateUrl: './acceuil.html',
  styleUrl: './acceuil.css'
})
export class Acceuil {

}
