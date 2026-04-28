import { Component } from '@angular/core';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-research-presentation',
  imports: [TranslatePipe, CommonModule],
  templateUrl: './research-presentation.html',
  styleUrl: './research-presentation.css'
})
export class ResearchPresentation {

}
