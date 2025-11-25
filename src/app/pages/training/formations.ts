import { Component } from '@angular/core';
import { FormationsHeader } from '../../components/formations/header/header';
import { TrainingFiltersComponent } from '../../components/formations/filters/filters';
import { FormationsListSection } from '../../components/formations/section-1/section-1';
import { TrainingProcess } from '../../components/recruitment-process/training-process/training-process';

@Component({
  selector: 'app-formations',
  standalone: true,
  imports: [FormationsHeader, TrainingFiltersComponent, FormationsListSection, TrainingProcess],
  templateUrl: './formations.html',
  styleUrl: './formations.css'
})
export class Formations {

}
