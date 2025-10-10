import { Component } from '@angular/core';
import { Header } from '../../components/recrutements/header/header';
import { Section1 } from '../../components/recrutements/section-1/section-1';
import { CandidatureForm } from '../../components/recrutements/candidature-form/candidature-form';

@Component({
  selector: 'app-recrutements',
  standalone: true,
  imports: [Header, Section1, CandidatureForm],
  templateUrl: './recrutements.html',
  styleUrl: './recrutements.css'
})
export class Recrutements {

  onApplicationSubmitted(response: any) {
    console.log('Candidature soumise avec succès:', response);
    
    // Afficher un message de succès
    alert('Votre candidature a été soumise avec succès ! Vous recevrez un email de confirmation.');
    
    // Optionnel : rediriger vers une page de confirmation
    // this.router.navigate(['/confirmation']);
  }

}
