import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-training-schedule',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './training-schedule.html',
  styleUrl: './training-schedule.css'
})
export class TrainingSchedule {

}
