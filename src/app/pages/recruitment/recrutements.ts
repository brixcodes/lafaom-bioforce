import { Component } from '@angular/core';
import { Header } from '../../components/recrutements/header/header';
import { JobProcess } from '../../components/recruitment-process/job-process/job-process';

@Component({
  selector: 'app-recrutements',
  standalone: true,
  imports: [Header, JobProcess],
  templateUrl: './recrutements.html',
  styleUrl: './recrutements.css'
})
export class Recrutements {
}
