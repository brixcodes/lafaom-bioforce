import { Component } from '@angular/core';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-training-center-presentation',
  imports: [TranslatePipe, CommonModule],
  templateUrl: './training-center-presentation.html',
  styleUrl: './training-center-presentation.css'
})
export class TrainingCenterPresentation {

}
