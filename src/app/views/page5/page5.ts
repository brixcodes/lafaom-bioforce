import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-page5',
  imports: [Header, TranslatePipe],
  templateUrl: './page5.html',
  styleUrl: './page5.css'
})
export class Page5 {

}
