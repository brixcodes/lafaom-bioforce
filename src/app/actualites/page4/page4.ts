import { Component } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-page4',
  imports: [TranslatePipe, Header],
  templateUrl: './page4.html',
  styleUrl: './page4.css'
})
export class ActualitesPage4   {

}
