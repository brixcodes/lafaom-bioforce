import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-section-2',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './section-2.html',
  styleUrl: './section-2.css'
})
export class Section2 {

}
