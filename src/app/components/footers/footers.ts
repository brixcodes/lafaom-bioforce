import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-footers',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './footers.html',
  styleUrl: './footers.css'
})
export class Footers {

}
