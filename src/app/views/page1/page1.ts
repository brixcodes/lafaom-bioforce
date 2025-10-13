import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-page1',
  imports: [Header, TranslatePipe],
  templateUrl: './page1.html',
  styleUrl: './page1.css'
})
export class Page1 {

}
