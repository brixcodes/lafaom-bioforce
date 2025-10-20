import { Component } from '@angular/core';
import { Filters } from '../../../components/formations/filters/filters';
import { Section1 } from '../../../components/formations/section-1/section-1';

@Component({
  selector: 'app-admission-process',
  imports: [Filters, Section1],
  templateUrl: './admission-process.html',
  styleUrl: './admission-process.css'
})
export class AdmissionProcess {

}
