import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-job-process',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './job-process.html',
  styleUrl: './job-process.css'
})
export class JobProcess {
  
  steps = [
    {
      number: 1,
      title: 'Découverte des offres',
      description: 'Explorez nos offres d\'emploi disponibles',
      icon: 'fas fa-search',
      details: [
        'Consultation des offres d\'emploi publiées',
        'Filtrage par poste, localisation et expérience',
        'Informations détaillées sur chaque poste'
      ]
    },
    {
      number: 2,
      title: 'Candidature en ligne',
      description: 'Postulez directement via notre plateforme',
      icon: 'fas fa-file-alt',
      details: [
        'Remplissage du formulaire de candidature',
        'Upload du CV et des documents requis',
        'Lettre de motivation personnalisée'
      ]
    },
    {
      number: 3,
      title: 'Pré-sélection',
      description: 'Évaluation initiale de votre candidature',
      icon: 'fas fa-filter',
      details: [
        'Vérification des critères de base',
        'Évaluation de l\'adéquation poste-profil',
        'Analyse de la motivation et des compétences'
      ]
    },
    {
      number: 4,
      title: 'Tests et évaluations',
      description: 'Passage de tests techniques et psychologiques',
      icon: 'fas fa-clipboard-check',
      details: [
        'Tests de compétences techniques',
        'Évaluations psychologiques',
        'Tests de personnalité et d\'aptitude'
      ]
    },
    {
      number: 5,
      title: 'Entretien RH',
      description: 'Premier entretien avec les ressources humaines',
      icon: 'fas fa-user-tie',
      details: [
        'Évaluation de la motivation et des objectifs',
        'Vérification des compétences comportementales',
        'Présentation de l\'entreprise et du poste'
      ]
    },
    {
      number: 6,
      title: 'Entretien technique',
      description: 'Entretien avec le responsable hiérarchique',
      icon: 'fas fa-cogs',
      details: [
        'Évaluation des compétences techniques',
        'Mise en situation professionnelle',
        'Évaluation de l\'expérience et des projets'
      ]
    },
    {
      number: 7,
      title: 'Entretien final',
      description: 'Dernier entretien avec la direction',
      icon: 'fas fa-handshake',
      details: [
        'Validation finale de la candidature',
        'Négociation des conditions d\'emploi',
        'Présentation de l\'équipe et de l\'environnement'
      ]
    },
    {
      number: 8,
      title: 'Décision et intégration',
      description: 'Notification et début de l\'emploi',
      icon: 'fas fa-check-circle',
      details: [
        'Communication de la décision finale',
        'Signature du contrat de travail',
        'Planification de l\'intégration'
      ]
    }
  ];

  benefits = [
    {
      icon: 'fas fa-briefcase',
      title: 'Emploi stable',
      description: 'Contrat de travail avec sécurité de l\'emploi'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Évolution de carrière',
      description: 'Perspectives d\'évolution et de promotion'
    },
    {
      icon: 'fas fa-users',
      title: 'Équipe dynamique',
      description: 'Intégration dans une équipe professionnelle'
    },
    {
      icon: 'fas fa-graduation-cap',
      title: 'Formation continue',
      description: 'Accès à des programmes de formation'
    }
  ];

  requirements = [
    'Diplôme et qualifications requises pour le poste',
    'Expérience professionnelle pertinente',
    'Compétences techniques spécifiques',
    'Maîtrise des outils et technologies',
    'Capacité d\'adaptation et d\'apprentissage'
  ];

  documents = [
    'CV détaillé et à jour',
    'Lettre de motivation',
    'Copie des diplômes et certificats',
    'Attestations d\'expérience professionnelle',
    'Références professionnelles',
    'Copie de la pièce d\'identité'
  ];

  interviewTips = [
    'Préparez-vous en amont sur l\'entreprise et le poste',
    'Anticipez les questions techniques et comportementales',
    'Préparez des exemples concrets de vos réalisations',
    'Soyez authentique et montrez votre motivation',
    'Posez des questions pertinentes sur le poste et l\'équipe'
  ];

}
