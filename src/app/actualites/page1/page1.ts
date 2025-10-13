import { Component } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-page1',
  imports: [TranslatePipe, Header],
  templateUrl: './page1.html',
  styleUrl: './page1.css'
})
export class ActualitesPage1 {

}
