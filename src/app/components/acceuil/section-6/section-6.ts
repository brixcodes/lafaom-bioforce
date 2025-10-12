import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-section-6',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './section-6.html',
  styleUrl: './section-6.css'
})
export class Section6 {

}
