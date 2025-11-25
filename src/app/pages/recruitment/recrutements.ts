import { Component } from '@angular/core';
import { RecrutementsHeader } from '../../components/recrutements/header/header';

@Component({
  selector: 'app-recrutements',
  standalone: true,
  imports: [RecrutementsHeader],
  templateUrl: './recrutements.html',
  styleUrl: './recrutements.css'
})
export class Recrutements {
}
