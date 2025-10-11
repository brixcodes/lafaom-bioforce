import { Routes } from '@angular/router';
import { Acceuil } from './pages/acceuil/acceuil';
import { Actualites } from './pages/actualites/actualites';
import { Formations } from './pages/formations/formations';
import { Recrutements } from './pages/recrutements/recrutements';
import { Contact } from './pages/contact/contact';

export const routes: Routes = [
  { path: '', component: Acceuil },
  { path: 'acceuil', component: Acceuil },
  { path: 'actualites', component: Actualites },
  { 
    path: 'actualite/:id', 
    loadComponent: () => import('./pages/actualite-details/actualite-details').then(m => m.ActualiteDetails),
    data: { skipPrerender: true }
  },
  { path: 'formations', component: Formations },
  { path: 'recrutements', component: Recrutements },
  { path: 'contact', component: Contact },
  { path: '**', redirectTo: '' } // Redirection vers la page d'accueil pour les routes non trouvées
];