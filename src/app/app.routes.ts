import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { News } from './pages/news-main/news';
import { Formations } from './pages/training/formations';
import { Recrutements } from './pages/recruitment/recrutements';
import { Contact } from './pages/contact/contact';
import { Section1 } from './components/recrutements/section-1/section-1';
import { RecrutementsSuccess } from './pages/recrutements-success/recrutements-success';
import { FormJoboffert } from './pages/form-joboffert/form-joboffert';

import { CoordinatorMessage } from './pages/specializations/coordinator-message/coordinator-message';
import { AssistanceTechnician } from './pages/specializations/assistance-technician/assistance-technician';
import { PenitentiarySupport } from './pages/specializations/penitentiary-support/penitentiary-support';
import { WelcomeSupport } from './pages/specializations/welcome-support/welcome-support';
import { TrainingSchedule } from './pages/specializations/training-schedule/training-schedule';
import { AdmissionProcess } from './pages/specializations/admission-process/admission-process';

import { KeyDates } from './pages/news/key-dates/key-dates';
import { OrganizationalChart } from './pages/news/organizational-chart/organizational-chart';
import { BudgetDiscussion } from './pages/news/budget-discussion/budget-discussion';
import { BoardMeeting } from './pages/news/board-meeting/board-meeting';

import { ProcessRecruitment } from './pages/process-recruitment/process-recruitment';
import { ProcessTraining } from './pages/process-training/process-training';
import { ApplicationRecuitement } from './pages/application-recuitement/application-recuitement';
import { FormRecuitement } from './pages/form-recuitement/form-recuitement';
import { FormCabinet } from './pages/form-cabinet/form-cabinet';
import { ApplicationTraining } from './pages/application-training/application-training';
import { FormTraining } from './pages/form-training/form-training';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'form-joboffert/:id', component: FormJoboffert },
  { path: 'news', component: News },
        { 
          path: 'actualite/:id', 
          loadComponent: () => import('./pages/actualite-details/actualite-details').then(m => m.ActualiteDetails)
        },
  { path: 'training', component: Formations },
  { path: 'recruitment', component: Recrutements },
  { 
    path: 'recruitment/candidature/:id', 
    component: Section1
  },
  { path: 'application-training/:id', component: ApplicationTraining },
  { path: 'form-training/:id', component: FormTraining },
  { 
    path: 'form-recuitement/:id', 
    component: FormRecuitement
  },
  { 
    path: 'form-cabinet', 
    component: FormCabinet
  },
  { 
    path: 'recruitment/success', 
    component: RecrutementsSuccess
  },
  { path: 'contact', component: Contact },
  { path: 'process-recruitment', component: ProcessRecruitment },
  { path: 'process-training', component: ProcessTraining },
  { path: 'application-recuitement/:id', component: ApplicationRecuitement },
  // Pages spécialisées
  { path: 'coordinator-message', component: CoordinatorMessage },
  { path: 'assistance-technician', component: AssistanceTechnician },
  { path: 'penitentiary-support', component: PenitentiarySupport },
  { path: 'welcome-support', component: WelcomeSupport },
  { path: 'training-schedule', component: TrainingSchedule },
  { path: 'admission-process', component: AdmissionProcess },

  // Pages d'actualités
  { path: 'key-dates', component: KeyDates },
  { path: 'organizational-chart', component: OrganizationalChart },
  { path: 'budget-discussion', component: BudgetDiscussion },
  { path: 'board-meeting', component: BoardMeeting },
  
  { path: '**', redirectTo: '' } // Redirection vers la page d'accueil pour les routes non trouvées
];