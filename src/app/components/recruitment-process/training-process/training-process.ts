import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-training-process',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './training-process.html',
  styleUrl: './training-process.css'
})
export class TrainingProcess {
  
  steps = [
    {
      number: 1,
      title: 'Découverte des formations',
      description: 'Explorez notre catalogue de formations spécialisées',
      icon: 'fas fa-search',
      details: [
        'Consultation du catalogue des formations disponibles',
        'Informations détaillées sur chaque programme',
        'Prérequis et conditions d\'admission'
      ]
    },
    {
      number: 2,
      title: 'Candidature en ligne',
      description: 'Soumettez votre candidature via notre plateforme',
      icon: 'fas fa-file-alt',
      details: [
        'Remplissage du formulaire de candidature',
        'Upload des documents requis (CV, diplômes, etc.)',
        'Sélection de la formation souhaitée'
      ]
    },
    {
      number: 3,
      title: 'Évaluation du dossier',
      description: 'Notre équipe examine votre candidature',
      icon: 'fas fa-clipboard-check',
      details: [
        'Vérification de l\'éligibilité',
        'Évaluation des compétences et expériences',
        'Analyse de la motivation et des objectifs'
      ]
    },
    {
      number: 4,
      title: 'Entretien de sélection',
      description: 'Rencontre avec nos formateurs',
      icon: 'fas fa-user-tie',
      details: [
        'Entretien individuel ou en groupe',
        'Évaluation des compétences techniques',
        'Validation de la motivation et des objectifs'
      ]
    },
    {
      number: 5,
      title: 'Décision d\'admission',
      description: 'Notification de l\'acceptation ou du refus',
      icon: 'fas fa-check-circle',
      details: [
        'Communication de la décision par email',
        'Informations sur les prochaines étapes',
        'Documentation d\'inscription si accepté'
      ]
    },
    {
      number: 6,
      title: 'Inscription et paiement',
      description: 'Finalisation de l\'inscription',
      icon: 'fas fa-credit-card',
      details: [
        'Signature du contrat de formation',
        'Paiement des frais de formation',
        'Réception des documents d\'inscription'
      ]
    },
    {
      number: 7,
      title: 'Début de la formation',
      description: 'Intégration dans le programme de formation',
      icon: 'fas fa-graduation-cap',
      details: [
        'Session d\'accueil et présentation',
        'Remise des supports de cours',
        'Début des activités pédagogiques'
      ]
    }
  ];

  benefits = [
    {
      icon: 'fas fa-certificate',
      title: 'Certification professionnelle',
      description: 'Obtention d\'un diplôme reconnu dans le secteur'
    },
    {
      icon: 'fas fa-users',
      title: 'Réseau professionnel',
      description: 'Intégration dans une communauté d\'experts'
    },
    {
      icon: 'fas fa-briefcase',
      title: 'Débouchés professionnels',
      description: 'Accès à des opportunités d\'emploi spécialisées'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Évolution de carrière',
      description: 'Perspectives d\'évolution et de promotion'
    }
  ];

  requirements = [
    'Niveau d\'études minimum requis selon la formation',
    'Expérience professionnelle pertinente',
    'Motivation et engagement personnel',
    'Disponibilité pour la durée de la formation',
    'Maîtrise de la langue française'
  ];

  documents = [
    'CV détaillé et à jour',
    'Copie des diplômes et certificats',
    'Lettre de motivation',
    'Copie de la pièce d\'identité',
    'Photo d\'identité récente',
    'Attestations d\'expérience professionnelle'
  ];

}
