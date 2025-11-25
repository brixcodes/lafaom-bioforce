import { Component } from '@angular/core';
import { TrainingFiltersComponent } from '../../../components/formations/filters/filters';
import { FormationsListSection } from '../../../components/formations/section-1/section-1';

@Component({
  selector: 'app-admission-process',
  imports: [TrainingFiltersComponent, FormationsListSection],
  templateUrl: './admission-process.html',
  styleUrl: './admission-process.css'
})
export class AdmissionProcess {

}
