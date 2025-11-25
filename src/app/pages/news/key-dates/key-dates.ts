import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-key-dates',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './key-dates.html',
  styleUrl: './key-dates.css'
})
export class KeyDates {

}
