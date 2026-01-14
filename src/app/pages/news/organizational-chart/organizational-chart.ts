import { Component } from '@angular/core';
import { TranslatePipe } from '../../../pipes/translate.pipe';
@Component({
  selector: 'app-organizational-chart',
  imports: [ TranslatePipe],
  templateUrl: './organizational-chart.html',
  styleUrl: './organizational-chart.css'
})
export class OrganizationalChart {

}
