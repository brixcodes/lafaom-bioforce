import { Component } from '@angular/core';
import { Header } from '../../components/formations/header/header';
import { Filters } from '../../components/formations/filters/filters';
import { Section1 } from '../../components/formations/section-1/section-1';

@Component({
  selector: 'app-formations',
  standalone: true,
  imports: [Header, Filters, Section1],
  templateUrl: './formations.html',
  styleUrl: './formations.css'
})
export class Formations {

}
