import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Filters } from '../../components/formations/filters/filters';
import { Section1 } from '../../components/formations/section-1/section-1';

@Component({
  selector: 'app-page6',
  imports: [Header, TranslatePipe, Filters, Section1],
  templateUrl: './page6.html',
  styleUrl: './page6.css'
})
export class Page6 {

}
