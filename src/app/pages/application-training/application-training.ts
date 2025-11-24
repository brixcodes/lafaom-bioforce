import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingService } from '../../services/training.service';

@Component({
  selector: 'app-application-training',
  imports: [CommonModule],
  templateUrl: './application-training.html',
  styleUrl: './application-training.css'
})
export class ApplicationTraining implements OnInit {
  training: any = null;
  sessions: any[] = [];
  error: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private trainingService: TrainingService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'ID de formation manquant'; return; }
    
    // Charger d'abord les sessions pour vérifier s'il y en a
    this.trainingService.getSessionsByTrainingId(id).subscribe({
      next: (res: any) => { 
        this.sessions = res?.data || [];
        
        // Vérifier s'il y a des sessions disponibles
        const today = new Date();
        const availableSessions = this.sessions.filter((session: any) => {
          if (session.start_date && session.status === 'OPEN_FOR_REGISTRATION') {
            const startDate = new Date(session.start_date);
            return startDate > today;
          }
          return false;
        });

        // Si aucune session disponible, afficher une erreur
        if (availableSessions.length === 0) {
          this.error = 'Aucune session disponible pour cette formation';
          return;
        }

        // Charger la formation seulement s'il y a des sessions
        this.trainingService.getTrainingById(id).subscribe({
          next: (res: any) => { this.training = res?.data || res; },
          error: () => { this.error = 'Erreur de chargement de la formation'; }
        });
      },
      error: () => {
        this.error = 'Erreur de chargement des sessions';
      }
    });
  }

  // Obtenir les frais d'inscription (depuis la première session disponible)
  getRegistrationFee(): number | null {
    const sessionWithFee = this.sessions.find(s => s.registration_fee != null);
    return sessionWithFee?.registration_fee || null;
  }

  // Obtenir les frais de formation (depuis la première session disponible)
  getTrainingFee(): number | null {
    const sessionWithFee = this.sessions.find(s => s.training_fee != null);
    return sessionWithFee?.training_fee || null;
  }

  // Obtenir la devise (depuis la première session disponible)
  getCurrency(): string {
    const sessionWithCurrency = this.sessions.find(s => s.currency);
    return sessionWithCurrency?.currency || 'EUR';
  }

  // Formater un montant avec la devise
  formatAmount(amount: number | null): string {
    if (amount == null) return 'Non spécifié';
    const currency = this.getCurrency();
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Traduire l'unité de durée
  translateDurationUnit(unit: string | null | undefined): string {
    if (!unit) return '';
    const translations: { [key: string]: string } = {
      'MONTHS': 'Mois',
      'DAYS': 'Jours',
      'HOURS': 'Heures',
      'YEARS': 'Années',
      'MONTH': 'Mois',
      'DAY': 'Jour',
      'HOUR': 'Heure',
      'YEAR': 'Année'
    };
    return translations[unit.toUpperCase()] || unit;
  }

  // Traduire le statut
  translateStatus(status: string | null | undefined): string {
    if (!status) return '';
    if (status.toUpperCase() === 'ACTIVE') {
      return 'En cours';
    }
    const translations: { [key: string]: string } = {
      'INACTIVE': 'Inactif',
      'ACTIVE': 'En cours'
    };
    return translations[status.toUpperCase()] || status;
  }

  apply(): void {
    if (!this.training?.id) return;
    this.router.navigate(['/form-training', this.training.id]);
  }
}

// duplicate removed
