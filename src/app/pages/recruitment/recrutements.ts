import { Component } from '@angular/core';
import { Header } from '../../components/recrutements/header/header';

@Component({
  selector: 'app-recrutements',
  standalone: true,
  imports: [Header],
  templateUrl: './recrutements.html',
  styleUrl: './recrutements.css'
})
export class Recrutements {
}
