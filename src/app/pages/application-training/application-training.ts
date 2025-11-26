import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingService } from '../../services/training.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { SimpleTranslateService } from '../../services/simple-translate.service';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-application-training',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './application-training.html',
  styleUrl: './application-training.css'
})
export class ApplicationTraining implements OnInit, OnDestroy {
  training: any = null;
  sessions: any[] = [];
  error: string | null = null;
  specialty: any = null;
  private languageSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trainingService: TrainingService,
    private languageService: LanguageService,
    private translateService: SimpleTranslateService
  ) {}

  ngOnInit(): void {
    this.loadTrainingData();
    this.subscribeToLanguageChanges();
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  /**
   * S'abonner aux changements de langue pour recharger les données
   */
  private subscribeToLanguageChanges(): void {
    this.languageSubscription = this.languageService.languageChange$
      .pipe(debounceTime(100))
      .subscribe((newLang: string) => {
        console.log('🔄 [APPLICATION-TRAINING] Changement de langue détecté:', newLang);
        this.loadTrainingData();
      });
  }

  /**
   * Charger les données de la formation
   */
  private loadTrainingData(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'training.error.missingId';
      return;
    }
    
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
          this.error = 'training.error.noSessionsAvailable';
          return;
        }

        // Charger la formation seulement s'il y a des sessions
        this.trainingService.getTrainingById(id).subscribe({
          next: (res: any) => { 
            this.training = res?.data || res;
            // Charger la spécialité si specialty_id est disponible
            if (this.training?.specialty_id) {
              this.loadSpecialty(this.training.specialty_id);
            } else if (this.training?.specialty) {
              // Si la spécialité est déjà incluse dans la réponse
              this.specialty = this.training.specialty;
            }
          },
          error: () => { this.error = 'training.error.loadingTraining'; }
        });
      },
      error: () => {
        this.error = 'training.error.loadingSessions';
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
    if (amount == null) return this.translateService.translate('common.notSpecified');
    const currency = this.getCurrency();
    const currentLang = this.translateService.getCurrentLanguage();
    const localeMap: { [key: string]: string } = {
      'fr': 'fr-FR',
      'en': 'en-US',
      'de': 'de-DE'
    };
    const locale = localeMap[currentLang] || 'fr-FR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Traduire l'unité de durée
  translateDurationUnit(unit: string | null | undefined): string {
    if (!unit) return '';
    const unitKey = unit.toUpperCase();
    const translationKey = `training.durationUnit.${unitKey}`;
    const translated = this.translateService.translate(translationKey);
    // Si la traduction n'existe pas, retourner l'unité originale
    return translated !== translationKey ? translated : unit;
  }

  // Traduire le statut
  translateStatus(status: string | null | undefined): string {
    if (!status) return '';
    const statusKey = status.toUpperCase();
    const translationKey = `training.status.${statusKey}`;
    const translated = this.translateService.translate(translationKey);
    // Si la traduction n'existe pas, retourner le statut original
    return translated !== translationKey ? translated : status;
  }

  // Charger la spécialité
  loadSpecialty(specialtyId: number): void {
    this.trainingService.getSpecialties().subscribe({
      next: (specialties: any[]) => {
        this.specialty = specialties.find(s => s.id === specialtyId);
      },
      error: () => {
        console.error('Erreur lors du chargement de la spécialité');
        // Ne pas afficher d'erreur à l'utilisateur, juste logger
      }
    });
  }

  // Vérifier si la spécialité est un séminaire
  isSeminar(): boolean {
    if (!this.specialty) return false;
    const specialtyName = this.specialty.name || '';
    return specialtyName.toLowerCase().includes('séminaire') || specialtyName.toLowerCase().includes('seminaire');
  }

  // Vérifier si on doit afficher les frais de formation
  // Ne pas afficher si les frais de formation sont < 5
  shouldShowTrainingFee(): boolean {
    const trainingFee = this.getTrainingFee();
    return !this.isSeminar() && trainingFee != null && trainingFee >= 5;
  }

  apply(): void {
    if (!this.training?.id) return;
    this.router.navigate(['/form-training', this.training.id]);
  }
}

// duplicate removed
