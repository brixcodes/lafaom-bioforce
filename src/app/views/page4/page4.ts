import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-page4',
  imports: [Header, TranslatePipe],
  templateUrl: './page4.html',
  styleUrl: './page4.css'
})
export class Page4 {

}
