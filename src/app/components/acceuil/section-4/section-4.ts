import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-section-4',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './section-4.html',
  styleUrl: './section-4.css'
})
export class Section4 {

}
