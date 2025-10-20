import { Component } from '@angular/core';
import { Header } from '../../components/formations/header/header';
import { Filters } from '../../components/formations/filters/filters';
import { Section1 } from '../../components/formations/section-1/section-1';
import { TrainingProcess } from '../../components/recruitment-process/training-process/training-process';

@Component({
  selector: 'app-formations',
  standalone: true,
  imports: [Header, Filters, Section1, TrainingProcess],
  templateUrl: './formations.html',
  styleUrl: './formations.css'
})
export class Formations {

}
