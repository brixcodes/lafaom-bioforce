# Services API - Documentation

Ce dossier contient tous les services Angular pour consommer les endpoints de votre backend.

## Structure des Services

### 1. ApiService (`api.service.ts`)
Service de base qui fournit les méthodes génériques pour les requêtes HTTP :
- `get<T>(endpoint, params?)` - Requêtes GET
- `post<T>(endpoint, data)` - Requêtes POST
- `put<T>(endpoint, data)` - Requêtes PUT
- `delete<T>(endpoint)` - Requêtes DELETE
- `patch<T>(endpoint, data)` - Requêtes PATCH
- `uploadFile<T>(endpoint, formData)` - Upload de fichiers

### 2. NewsService (`news.service.ts`)
Service pour gérer les actualités :
- `getNews(params?)` - Récupérer toutes les actualités
- `getNewsById(id)` - Récupérer une actualité par ID
- `getPublishedNews(params?)` - Récupérer les actualités publiées
- `getNewsByCategory(category, params?)` - Récupérer par catégorie
- `searchNews(searchTerm, params?)` - Rechercher des actualités
- `getRecentNews(limit)` - Récupérer les actualités récentes
- `getPopularNews(limit)` - Récupérer les actualités populaires
- `getNewsByDateRange(dateFrom, dateTo, params?)` - Récupérer par période
- `getNewsByTags(tags, params?)` - Récupérer par tags

### 3. JobOffersService (`job-offers.service.ts`)
Service pour gérer les offres d'emploi :
- `getJobOffers(params?)` - Récupérer toutes les offres
- `getJobOfferById(id)` - Récupérer une offre par ID
- `getActiveJobOffers(params?)` - Récupérer les offres actives
- `searchJobOffers(searchTerm, params?)` - Rechercher des offres
- `getJobOffersByLocation(location, params?)` - Récupérer par localisation
- `getJobOffersByEmploymentType(type, params?)` - Récupérer par type d'emploi
- `getJobOffersByExperienceLevel(level, params?)` - Récupérer par niveau
- `getJobOffersByDepartment(department, params?)` - Récupérer par département
- `getRecentJobOffers(limit)` - Récupérer les offres récentes
- `submitJobApplication(data)` - Soumettre une candidature
- `uploadJobAttachment(formData)` - Uploader un fichier
- `getUserApplications(userId?)` - Récupérer les candidatures utilisateur
- `getJobApplicationById(id)` - Récupérer une candidature par ID
- `updateApplicationStatus(id, status)` - Mettre à jour le statut
- `getJobOffersWithFilters(filters, params?)` - Filtrage avancé

### 4. CabinetOffersService (`cabinet-offers.service.ts`)
Service pour gérer les offres du cabinet :
- `getCabinetOffers(params?)` - Récupérer toutes les offres
- `getCabinetOfferById(id)` - Récupérer une offre par ID
- `getActiveCabinetOffers(params?)` - Récupérer les offres actives
- `searchCabinetOffers(searchTerm, params?)` - Rechercher des offres
- `getCabinetOffersByLocation(location, params?)` - Récupérer par localisation
- `getCabinetOffersByServiceType(type, params?)` - Récupérer par type de service
- `getCabinetOffersByExperienceLevel(level, params?)` - Récupérer par niveau
- `getCabinetOffersByDepartment(department, params?)` - Récupérer par département
- `getRecentCabinetOffers(limit)` - Récupérer les offres récentes
- `getCabinetOffersWithFilters(filters, params?)` - Filtrage avancé
- `getCabinetOffersBySkills(skills, params?)` - Récupérer par compétences
- `getCabinetOffersByDuration(duration, params?)` - Récupérer par durée
- `getCabinetOffersByDateRange(dateFrom, dateTo, params?)` - Récupérer par période

### 5. ConfigService (`config.service.ts`)
Service de configuration centralisé :
- URLs de base et endpoints
- Configuration de pagination par défaut
- Limites et contraintes
- Statuts et types prédéfinis
- Méthodes utilitaires

## Modèles de Données (`models/api.models.ts`)

### Interfaces principales :
- `News` - Modèle pour les actualités
- `JobOffer` - Modèle pour les offres d'emploi
- `CabinetOffer` - Modèle pour les offres du cabinet
- `JobApplication` - Modèle pour les candidatures
- `JobAttachment` - Modèle pour les pièces jointes

### Interfaces utilitaires :
- `PaginationParams` - Paramètres de pagination
- `SearchFilters` - Filtres de recherche
- `ApiResponse<T>` - Réponse API générique

## Utilisation dans les Composants

### Import des services :
```typescript
import { NewsService, JobOffersService, CabinetOffersService } from '../services';
```

### Injection dans le constructeur :
```typescript
constructor(
  private newsService: NewsService,
  private jobOffersService: JobOffersService,
  private cabinetOffersService: CabinetOffersService
) {}
```

### Exemples d'utilisation :

#### Récupérer les actualités récentes :
```typescript
this.news$ = this.newsService.getRecentNews(5);
```

#### Rechercher des offres d'emploi :
```typescript
this.jobOffers$ = this.jobOffersService.searchJobOffers('développeur', {
  page: 1,
  per_page: 10
});
```

#### Filtrer les offres du cabinet :
```typescript
this.cabinetOffers$ = this.cabinetOffersService.getCabinetOffersWithFilters({
  location: 'Dakar',
  service_type: 'formation',
  experience_level: 'mid'
}, {
  page: 1,
  per_page: 10
});
```

#### Soumettre une candidature :
```typescript
const applicationData = {
  job_offer_id: '123',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  // ... autres champs
};

this.jobOffersService.submitJobApplication(applicationData).subscribe(
  response => console.log('Candidature soumise', response),
  error => console.error('Erreur', error)
);
```

## Configuration

### URL de base :
L'URL de base est configurée dans `ApiService` : `https://lafaom.vertex-cam.com/api/v1`

### Endpoints disponibles :
- `news` - Actualités
- `job-offers` - Offres d'emploi
- `job-applications` - Candidatures
- `job-attachments` - Pièces jointes
- `cabinet-offers` - Offres du cabinet

### Pagination par défaut :
- Page : 1
- Par page : 10
- Tri : `created_at desc`

## Gestion des Erreurs

Tous les services retournent des Observables. Il est recommandé de gérer les erreurs :

```typescript
this.newsService.getNews().subscribe({
  next: (data) => console.log('Données reçues', data),
  error: (error) => console.error('Erreur API', error),
  complete: () => console.log('Requête terminée')
});
```

## Types TypeScript

Tous les services sont entièrement typés avec TypeScript pour une meilleure expérience de développement et une détection d'erreurs à la compilation.
