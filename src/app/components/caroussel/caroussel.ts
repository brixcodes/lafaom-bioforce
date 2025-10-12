import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-caroussel',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './caroussel.html',
  styleUrl: './caroussel.css'
})
export class Caroussel {

}
