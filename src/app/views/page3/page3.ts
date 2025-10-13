import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-page3',
  imports: [Header, TranslatePipe],
  templateUrl: './page3.html',
  styleUrl: './page3.css'
})
export class Page3 {

}
