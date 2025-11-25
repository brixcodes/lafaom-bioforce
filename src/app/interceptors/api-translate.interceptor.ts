/**
 * Intercepteur HTTP pour traduire automatiquement les réponses de l'API
 * 
 * Cet intercepteur traduit automatiquement les champs texte des réponses
 * de l'API backend du français vers la langue sélectionnée par l'utilisateur.
 */
import { HttpInterceptorFn, HttpRequest, HttpEvent, HttpResponse, HttpHandlerFn } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { LingvaTranslateService } from '../services/lingva-translate.service';
import { SimpleTranslateService } from '../services/simple-translate.service';
import { environment } from '../../environments/environment';

/**
 * Champs à traduire pour chaque type de modèle
 */
const TRANSLATABLE_FIELDS: { [key: string]: string[] } = {
  // Formations
  'Training': ['title', 'presentation', 'target_skills', 'program', 'target_audience', 'enrollment', 'prerequisites'],
  // Spécialités
  'Specialty': ['name', 'description'],
  // Offres d'emploi
  'JobOffer': ['title', 'main_mission', 'responsibilities', 'competencies', 'profile', 'benefits', 'conditions'],
  // Centres d'organisation
  'OrganizationCenter': ['name', 'description'],
  // Sessions de formation
  'TrainingSession': [], // Pas de champs texte à traduire
};

/**
 * Détecter le type de données dans une réponse
 */
function detectDataType(data: any): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  // Si c'est un tableau, vérifier le premier élément
  if (Array.isArray(data)) {
    if (data.length > 0) {
      return detectDataType(data[0]);
    }
    return null;
  }

  // Vérifier les champs pour identifier le type
  if (data.title && data.presentation) {
    return 'Training';
  }
  if (data.name && data.description && data.id) {
    // Peut être Specialty ou OrganizationCenter
    if (data.city || data.address) {
      return 'OrganizationCenter';
    }
    return 'Specialty';
  }
  if (data.title && data.main_mission) {
    return 'JobOffer';
  }
  // Vérifier si c'est une session avec un objet training imbriqué
  if (data.training_id && (data.start_date || data.end_date)) {
    // C'est une TrainingSession, mais on ne traduit pas les sessions elles-mêmes
    // On traduira l'objet training s'il est présent
    return null; // Les sessions n'ont pas de champs à traduire directement
  }

  // Si la réponse contient un champ 'data', vérifier son contenu
  if (data.data) {
    return detectDataType(data.data);
  }

  return null;
}

/**
 * Traduire un objet selon son type
 */
function translateObject(
  obj: any,
  type: string | null,
  translateService: LingvaTranslateService,
  targetLang: 'en' | 'de' | 'fr'
): Observable<any> {
  if (!obj || typeof obj !== 'object' || !type) {
    return of(obj);
  }

  const fields = TRANSLATABLE_FIELDS[type] || [];

  // Collecter tous les textes à traduire et les objets imbriqués
  const textsToTranslate: { field: string; value: string }[] = [];
  const nestedObjects: { field: string; nestedObj: any; nestedType: string | null }[] = [];

  // Si l'objet a des champs à traduire, les collecter
  if (fields.length > 0) {
    console.log(`🔍 [API-TRANSLATE] Champs à vérifier pour ${type}:`, fields);
    console.log(`🔍 [API-TRANSLATE] Objet reçu:`, obj);

    fields.forEach(field => {
      if (obj[field] && typeof obj[field] === 'string' && obj[field].trim()) {
        console.log(`✅ [API-TRANSLATE] Champ "${field}" ajouté pour traduction (${obj[field].length} chars)`);
        textsToTranslate.push({ field, value: obj[field] });
      } else {
        console.log(`❌ [API-TRANSLATE] Champ "${field}" ignoré:`, {
          exists: !!obj[field],
          type: typeof obj[field],
          value: obj[field]
        });
      }

      if (obj[field] && typeof obj[field] === 'object' && !Array.isArray(obj[field])) {
        // Si c'est un objet imbriqué (comme session.training), le traduire aussi
        const nestedType = detectDataType(obj[field]);
        if (nestedType) {
          nestedObjects.push({ field, nestedObj: obj[field], nestedType });
        }
      }
    });
  }

  // Vérifier aussi les objets imbriqués communs même si l'objet principal n'a pas de champs à traduire
  // Par exemple, une session peut avoir un objet 'training' imbriqué
  if (obj.training && typeof obj.training === 'object' && !Array.isArray(obj.training)) {
    const nestedType = detectDataType(obj.training);
    if (nestedType && !nestedObjects.find(n => n.field === 'training')) {
      nestedObjects.push({ field: 'training', nestedObj: obj.training, nestedType });
    }
  }

  // Si aucun texte ni objet imbriqué à traduire, retourner l'objet original
  if (textsToTranslate.length === 0 && nestedObjects.length === 0) {
    return of(obj);
  }

  // Optimisation: Utiliser translateBatch pour traduire tous les textes en une seule fois
  // Cela réduit le nombre d'appels API et améliore les performances
  const textsToTranslateArray = textsToTranslate.map(({ value }) => value);

  // Traduire les objets imbriqués en parallèle
  const nestedTranslations = nestedObjects.map(({ nestedObj, nestedType }) =>
    translateObject(nestedObj, nestedType, translateService, targetLang).pipe(
      catchError(() => of(nestedObj))
    )
  );

  // Combiner les traductions de textes et d'objets imbriqués
  const allTranslations = [
    ...(textsToTranslateArray.length > 0 ? [translateService.translateBatch(textsToTranslateArray, targetLang)] : [of([])]),
    ...nestedTranslations
  ];

  return forkJoin(allTranslations).pipe(
    map((results: any[]) => {
      // Créer une copie de l'objet avec les traductions
      const translatedObj = { ...obj };

      // Appliquer les traductions de textes
      const translatedTexts = results[0] || [];
      textsToTranslate.forEach(({ field }, index) => {
        translatedObj[field] = translatedTexts[index] || textsToTranslate[index].value;
      });

      // Appliquer les traductions d'objets imbriqués
      nestedObjects.forEach(({ field }, index) => {
        const nestedIndex = textsToTranslateArray.length > 0 ? index + 1 : index;
        translatedObj[field] = results[nestedIndex] || nestedObjects[index].nestedObj;
      });

      return translatedObj;
    }),
    catchError((error: any) => {
      console.error('❌ [API-TRANSLATE] Erreur lors de la traduction:', error);
      // En cas d'erreur, retourner l'objet original
      return of(obj);
    })
  );
}

/**
 * Traduire une réponse de l'API
 */
function translateResponse(
  body: any,
  translateService: LingvaTranslateService,
  targetLang: 'en' | 'de' | 'fr'
): Observable<any> {
  if (!body) {
    return of(body);
  }

  if (targetLang === 'fr') {
    return of(body);
  }

  // Si c'est un tableau
  if (Array.isArray(body)) {
    if (body.length === 0) {
      return of(body);
    }

    const type = detectDataType(body[0]);
    const translationObservables = body.map(item =>
      translateObject(item, type, translateService, targetLang).pipe(
        catchError(() => of(item)) // En cas d'erreur, garder l'item original
      )
    );

    return forkJoin(translationObservables).pipe(
      catchError((error: any) => {
        console.error('❌ [API-TRANSLATE] Erreur lors de la traduction du tableau:', error);
        return of(body);
      })
    );
  }

  // Si c'est un objet avec un champ 'data'
  if (body.data) {
    const type = detectDataType(body.data);

    // Si data est un tableau
    if (Array.isArray(body.data)) {
      return translateResponse(body.data, translateService, targetLang).pipe(
        map((translatedData: any) => ({
          ...body,
          data: translatedData
        }))
      );
    }

    // Si data est un objet unique
    return translateObject(body.data, type, translateService, targetLang).pipe(
      map((translatedData: any) => ({
        ...body,
        data: translatedData
      }))
    );
  }

  // Si c'est un objet simple
  const type = detectDataType(body);
  return translateObject(body, type, translateService, targetLang);
}

/**
 * Intercepteur HTTP pour traduire les réponses de l'API
 */
export const apiTranslateInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  // Ne traduire que les réponses de l'API backend
  if (!req.url.includes('api.lafaom-mao.org')) {
    return next(req);
  }

  // Ne pas traduire les requêtes POST, PUT, DELETE, PATCH (sauf si c'est une réponse)
  // On traduit uniquement les réponses GET réussies
  if (req.method !== 'GET') {
    return next(req);
  }

  // Injecter les services nécessaires
  const translateService = inject(LingvaTranslateService);
  const simpleTranslateService = inject(SimpleTranslateService);

  // Obtenir la langue actuelle
  const currentLang = simpleTranslateService.getCurrentLanguage() as 'fr' | 'en' | 'de';

  if (!environment.production) {
    console.log(`🌐 [API-TRANSLATE] Requête interceptée: ${req.url}, langue actuelle: ${currentLang}`);
  }

  // Si la langue est le français, pas besoin de traduire
  if (currentLang === 'fr') {
    if (!environment.production) {
      console.log(`⏭️ [API-TRANSLATE] Langue française, pas de traduction nécessaire`);
    }
    return next(req);
  }

  // Intercepter la réponse et la traduire
  // Note: Cette fonction sera appelée même si les données viennent du cache
  // car elle intercepte toutes les réponses HTTP (y compris celles du cache)
  return next(req).pipe(
    switchMap((event: HttpEvent<any>): Observable<HttpEvent<any>> => {
      // Ne traduire que les réponses HTTP réussies avec un body
      if (event instanceof HttpResponse && event.status === 200 && event.body) {
        // Vérifier si le body contient des données à traduire
        const body = event.body;

        // Si c'est une réponse avec un champ 'data', traduire le contenu
        if (body && typeof body === 'object') {
          return translateResponse(body, translateService, currentLang).pipe(
            map((translatedBody: any): HttpEvent<any> => {
              if (!environment.production) {
                console.log(`✅ [API-TRANSLATE] Réponse traduite avec succès pour: ${req.url}, langue: ${currentLang}`);
              }
              // Cloner la réponse avec le body traduit
              return event.clone({ body: translatedBody });
            }),
            catchError((error: any) => {
              console.error('❌ [API-TRANSLATE] Erreur lors de la traduction:', error);
              // En cas d'erreur, retourner la réponse originale
              return of(event) as Observable<HttpEvent<any>>;
            })
          );
        }
      }
      // Pour les autres événements (progress, etc.), les retourner tels quels
      return of(event) as Observable<HttpEvent<any>>;
    })
  );
};

