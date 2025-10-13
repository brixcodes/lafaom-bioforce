import { Component } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-page3',
  imports: [TranslatePipe, Header],
  templateUrl: './page3.html',
  styleUrl: './page3.css'
})
export class ActualitesPage3 {

}
