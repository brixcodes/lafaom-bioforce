import { Component } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-page2',
  imports: [TranslatePipe, Header],
  templateUrl: './page2.html',
  styleUrl: './page2.css'
})
export class ActualitesPage2 {

}
