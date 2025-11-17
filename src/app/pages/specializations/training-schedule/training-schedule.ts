import { Component } from '@angular/core';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-training-schedule',
  imports: [TranslatePipe],
  templateUrl: './training-schedule.html',
  styleUrl: './training-schedule.css'
})
export class TrainingSchedule {

}
