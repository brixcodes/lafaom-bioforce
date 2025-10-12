import { Routes } from '@angular/router';
import { Acceuil } from './pages/acceuil/acceuil';
import { Actualites } from './pages/actualites/actualites';
import { Formations } from './pages/formations/formations';
import { Recrutements } from './pages/recrutements/recrutements';
import { Contact } from './pages/contact/contact';
import { Section1 } from './components/recrutements/section-1/section-1';
import { RecrutementsSuccess } from './pages/recrutements-success/recrutements-success';
import { FormJoboffert } from './pages/form-joboffert/form-joboffert';

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
  { path: '**', redirectTo: '' } // Redirection vers la page d'accueil pour les routes non trouvées
];