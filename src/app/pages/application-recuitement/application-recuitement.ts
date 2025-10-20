import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { JobOffer } from '../../models/job.models';
import { JobOffersService } from '../../services/job-offers.service';

@Component({
  selector: 'app-application-recuitement',
  imports: [CommonModule],
  templateUrl: './application-recuitement.html',
  styleUrl: './application-recuitement.css'
})
export class ApplicationRecuitement implements OnInit, OnDestroy {
  jobOffer: JobOffer | null = null;
  error: string | null = null;
  private subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobOffersService: JobOffersService
  ) {}

  ngOnInit(): void {
    this.loadJobOffer();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadJobOffer(): void {
    const jobId = this.route.snapshot.paramMap.get('id');
    
    console.log('🔍 [APPLICATION-RECRUITEMENT] ID de l\'offre:', jobId);
    
    if (!jobId) {
      this.error = 'ID de l\'offre d\'emploi manquant';
      return;
    }

    this.error = null;

    console.log('🌐 [APPLICATION-RECRUITEMENT] Début du chargement de l\'offre d\'emploi...');

    // Pour le moment, utilisons des données de test
    if (jobId === 'test') {
      this.loadTestData();
      return;
    }

    this.subscription.add(
      this.jobOffersService.getJobOfferById(jobId).subscribe({
        next: (response: any) => {
          console.log('✅ [APPLICATION-RECRUITEMENT] Réponse reçue:', response);
          console.log('✅ [APPLICATION-RECRUITEMENT] Type de réponse:', typeof response);
          console.log('✅ [APPLICATION-RECRUITEMENT] Structure de la réponse:', JSON.stringify(response, null, 2));
          
          if (response && typeof response === 'object') {
            if (response.data) {
              this.jobOffer = response.data;
              console.log('✅ [APPLICATION-RECRUITEMENT] Offre chargée depuis response.data:', this.jobOffer);
            } else if (response.id) {
              // Si la réponse est directement l'objet JobOffer
              this.jobOffer = response;
              console.log('✅ [APPLICATION-RECRUITEMENT] Offre chargée directement:', this.jobOffer);
            } else {
              this.error = 'Structure de réponse inattendue';
              console.error('❌ [APPLICATION-RECRUITEMENT] Structure de réponse inattendue:', response);
            }
          } else {
            this.error = 'Réponse invalide du serveur';
            console.error('❌ [APPLICATION-RECRUITEMENT] Réponse invalide:', response);
          }
        },
        error: (error: any) => {
          console.error('❌ [APPLICATION-RECRUITEMENT] Erreur lors du chargement:', error);
          console.error('❌ [APPLICATION-RECRUITEMENT] Status:', error.status);
          console.error('❌ [APPLICATION-RECRUITEMENT] Status Text:', error.statusText);
          console.error('❌ [APPLICATION-RECRUITEMENT] Message:', error.message);
          console.error('❌ [APPLICATION-RECRUITEMENT] Error:', error.error);
          
          let errorMessage = 'Erreur lors du chargement de l\'offre d\'emploi';
          
          if (error.status === 404) {
            errorMessage = 'Offre d\'emploi non trouvée';
          } else if (error.status === 0) {
            errorMessage = 'Erreur de connexion au serveur';
          } else if (error.error && typeof error.error === 'string' && error.error.includes('<!doctype')) {
            errorMessage = 'Le serveur a retourné une page HTML au lieu de données JSON';
          } else {
            errorMessage = `Erreur ${error.status}: ${error.error?.message || error.message || 'Erreur inconnue'}`;
          }
          
          this.error = errorMessage;
        }
      })
    );
  }

  private loadTestData(): void {
    console.log('🧪 [APPLICATION-RECRUITEMENT] Chargement des données de test...');
    
    // Simuler un délai de chargement
    setTimeout(() => {
      this.jobOffer = {
        id: 'test-id',
        reference: 'REF-001',
        title: 'Assistant de Direction - Administration et Finances',
        location: 'Ziguinchor, Sénégal',
        postal_code: '12345',
        contract_type: 'CDI',
        uncertain_term: false,
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        weekly_hours: 40,
        driving_license_required: true,
        submission_deadline: '2024-12-31',
        main_mission: '<p>Assurer la gestion administrative et financière de l\'institut.</p>',
        responsibilities: '<ul><li>Gestion des dossiers administratifs</li><li>Suivi budgétaire</li><li>Coordination des équipes</li></ul>',
        competencies: '<ul><li>Maîtrise des outils de gestion</li><li>Compétences en comptabilité</li><li>Leadership et communication</li></ul>',
        profile: '<p>Profil recherché : Diplôme en gestion ou équivalent, expérience de 3 ans minimum.</p>',
        salary: 500000,
        benefits: '<ul><li>Mutuelle santé</li><li>Formation continue</li><li>Prime de performance</li></ul>',
        submission_fee: 5000,
        currency: 'FCFA',
        attachment: ['CV', 'Lettre de motivation', 'Diplômes'],
        conditions: '<p>Conditions d\'emploi selon la convention collective.</p>',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };
      
      console.log('✅ [APPLICATION-RECRUITEMENT] Données de test chargées:', this.jobOffer);
    }, 1000);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return dateString;
    }
  }

  formatSalary(salary: number, currency: string): string {
    if (!salary) return '';
    return new Intl.NumberFormat('fr-FR').format(salary) + ' ' + currency;
  }

  isApplicationDeadlinePassed(): boolean {
    if (!this.jobOffer?.submission_deadline) return false;
    
    try {
      const deadline = new Date(this.jobOffer.submission_deadline);
      const now = new Date();
      return now > deadline;
    } catch (error) {
      console.error('Erreur lors de la vérification de la date limite:', error);
      return false;
    }
  }

  applyToJob(): void {
    if (!this.jobOffer) return;
    
    // Rediriger vers la page de candidature avec l'ID de l'offre
    this.router.navigate(['/form-recuitement', this.jobOffer.id], {
      state: {
        requiredAttachments: this.jobOffer.attachment || []
      }
    });
  }

  translateAttachment(type: string): string {
    switch ((type || '').toUpperCase()) {
      case 'CV':
        return 'CV';
      case 'COVER_LETTER':
        return 'Lettre de motivation';
      case 'DIPLOMA':
        return 'Diplôme';
      default:
        return type;
    }
  }

  goBack(): void {
    this.router.navigate(['/recruitment']);
  }
}