import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-page2',
  imports: [Header, TranslatePipe],
  templateUrl: './page2.html',
  styleUrl: './page2.css'
})
export class Page2 {

}
