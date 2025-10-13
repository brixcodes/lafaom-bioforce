import { Routes } from '@angular/router';
import { Acceuil } from './pages/acceuil/acceuil';
import { Actualites } from './pages/actualites/actualites';
import { Formations } from './pages/formations/formations';
import { Recrutements } from './pages/recrutements/recrutements';
import { Contact } from './pages/contact/contact';
import { Section1 } from './components/recrutements/section-1/section-1';
import { RecrutementsSuccess } from './pages/recrutements-success/recrutements-success';
import { FormJoboffert } from './pages/form-joboffert/form-joboffert';

import { Page1 } from './views/page1/page1';
import { Page2 } from './views/page2/page2';
import { Page3 } from './views/page3/page3';
import { Page4 } from './views/page4/page4';
import { Page5 } from './views/page5/page5';
import { Page6 } from './views/page6/page6';


import { ActualitesPage1 } from './actualites/page1/page1';
import { ActualitesPage2 } from './actualites/page2/page2';
import { ActualitesPage3 } from './actualites/page3/page3';


export const routes: Routes = [
  { path: '', component: Acceuil },
  { path: 'acceuil', component: Acceuil },
  { path: 'form-joboffert/:id', component: FormJoboffert },
  { path: 'actualites', component: Actualites },
        { 
          path: 'actualite/:id', 
          loadComponent: () => import('./pages/actualite-details/actualite-details').then(m => m.ActualiteDetails)
        },
  { path: 'formations', component: Formations },
  { path: 'recrutements', component: Recrutements },
  { 
    path: 'recrutements/candidature/:id', 
    component: Section1
  },
  { 
    path: 'recrutements/success', 
    component: RecrutementsSuccess
  },
  { path: 'contact', component: Contact },
  { path: 'page1', component: Page1 },
  { path: 'page2', component: Page2 },
  { path: 'page3', component: Page3 },
  { path: 'page4', component: Page4 },
  { path: 'page5', component: Page5 },
  { path: 'page6', component: Page6 },

  { path: 'actualites1', component: ActualitesPage1 },
  { path: 'actualites2', component: ActualitesPage2 },
  { path: 'actualites3', component: ActualitesPage3 },
  { path: '**', redirectTo: '' } // Redirection vers la page d'accueil pour les routes non trouvées
];