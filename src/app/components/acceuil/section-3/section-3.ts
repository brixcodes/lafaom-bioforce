import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-section-3',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './section-3.html',
  styleUrl: './section-3.css'
})
export class Section3 {

}
