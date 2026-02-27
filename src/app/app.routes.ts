/**
 * Configuration des routes de l'application
 *
 * Ce fichier définit toutes les routes de l'application LAFAOM-MAO.
 * Les routes sont organisées par catégories pour faciliter la maintenance.
 */
import { Routes } from '@angular/router';

// Pages principales
import { Home } from './pages/home/home';
import { News } from './pages/news-main/news';
import { Formations } from './pages/training/formations';
import { Recrutements } from './pages/recruitment/recrutements';
import { Contact } from './pages/contact/contact';

// Pages de candidature et formulaires
import { ApplicationTraining } from './pages/application-training/application-training';
import { ApplicationRecuitement } from './pages/application-recuitement/application-recuitement';
import { FormTraining } from './pages/form-training/form-training';
import { FormRecuitement } from './pages/form-recuitement/form-recuitement';
import { FormJoboffert } from './pages/form-joboffert/form-joboffert';
import { FormCabinet } from './pages/form-cabinet/form-cabinet';
import { RecrutementsSuccess } from './pages/recrutements-success/recrutements-success';
import { PaymentStatus } from './pages/payment-status/payment-status';

// Composants de candidature
import { JobApplicationSection } from './components/recrutements/section-1/section-1';

// Pages de processus
import { ProcessRecruitment } from './pages/process-recruitment/process-recruitment';
import { ProcessTraining } from './pages/process-training/process-training';

// Pages spécialisées
import { CoordinatorMessage } from './pages/specializations/coordinator-message/coordinator-message';
import { AssistanceTechnician } from './pages/specializations/assistance-technician/assistance-technician';
import { PenitentiarySupport } from './pages/specializations/penitentiary-support/penitentiary-support';
import { WelcomeSupport } from './pages/specializations/welcome-support/welcome-support';
import { TrainingSchedule } from './pages/specializations/training-schedule/training-schedule';
import { AdmissionProcess } from './pages/specializations/admission-process/admission-process';

// Pages d'actualités détaillées
import { KeyDates } from './pages/news/key-dates/key-dates';
import { OrganizationalChart } from './pages/news/organizational-chart/organizational-chart';
import { BudgetDiscussion } from './pages/news/budget-discussion/budget-discussion';
import { BoardMeeting } from './pages/news/board-meeting/board-meeting';

/**
 * Routes de l'application
 *
 * Organisation :
 * 1. Pages principales (accueil, formations, recrutements, etc.)
 * 2. Pages de candidature et formulaires
 * 3. Pages de processus
 * 4. Pages spécialisées
 * 5. Pages d'actualités
 * 6. Route de fallback (redirection vers l'accueil)
 */
export const routes: Routes = [
  // ===== PAGES PRINCIPALES =====
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'news', component: News },
  {
    path: 'actualite/:id',
    loadComponent: () => import('./pages/actualite-details/actualite-details').then(m => m.ActualiteDetails)
  },
  { path: 'training', component: Formations },
  { path: 'recruitment', component: Recrutements },
  { path: 'contact', component: Contact },

  // ===== PAGES DE CANDIDATURE ET FORMULAIRES =====
  { path: 'application-training/:id', component: ApplicationTraining },
  { path: 'application-recuitement/:id', component: ApplicationRecuitement },
  { path: 'form-training/:id', component: FormTraining },
  { path: 'form-recuitement/:id', component: FormRecuitement },
  { path: 'form-joboffert/:id', component: FormJoboffert },
  { path: 'form-cabinet', component: FormCabinet },
  { path: 'recruitment/candidature/:id', component: JobApplicationSection },
  { path: 'recruitment/success', component: RecrutementsSuccess },
  { path: 'training/success', component: RecrutementsSuccess },
  { path: 'payment/success', component: PaymentStatus },
  { path: 'payment/error', component: PaymentStatus },

  // ===== PAGES DE PROCESSUS =====
  { path: 'process-recruitment', component: ProcessRecruitment },
  { path: 'process-training', component: ProcessTraining },

  // ===== PAGES SPÉCIALISÉES =====
  { path: 'coordinator-message', component: CoordinatorMessage },
  { path: 'fondement-associatif', component: AssistanceTechnician },
  { path: 'cadre-operationnel', component: PenitentiarySupport },
  { path: 'ingenierie-systemique', component: WelcomeSupport },
  { path: 'training-schedule', component: TrainingSchedule },
  { path: 'admission-process', component: AdmissionProcess },

  // Redirections pour les anciennes URLs (compatibilité)
  { path: 'assistance-technician', redirectTo: 'fondement-associatif', pathMatch: 'full' },
  { path: 'penitentiary-support', redirectTo: 'cadre-operationnel', pathMatch: 'full' },
  { path: 'welcome-support', redirectTo: 'ingenierie-systemique', pathMatch: 'full' },

  // ===== PAGES D'ACTUALITÉS =====
  { path: 'key-dates', component: KeyDates },
  { path: 'organizational-chart', component: OrganizationalChart },
  { path: 'budget-discussion', component: BudgetDiscussion },
  { path: 'board-meeting', component: BoardMeeting },

  // ===== ROUTE DE FALLBACK =====
  // Redirection vers la page d'accueil pour toutes les routes non trouvées
  { path: '**', redirectTo: '' }
];
