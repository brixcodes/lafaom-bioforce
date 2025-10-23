# 🚀 Guide de Déploiement LAFAOM

## ❌ Problème Identifié

**Mixed Content Error**: L'application frontend (HTTPS sur Vercel) ne peut pas appeler l'API backend (HTTP) directement.

```
Mixed Content: The page at 'https://lafaom-bioforce.vercel.app/recrutements' 
was loaded over HTTPS, but requested an insecure resource 
'https://api.lafaom-mao.org/api/v1/job-offers'. This request has been blocked.
```

## ✅ Solution Implémentée

### 1. **Configuration Vercel Proxy** (`vercel.json`)
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://api.lafaom-mao.org/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### 2. **Configuration Angular** (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: '/api/v1', // Utilise le proxy Vercel
  backendUrl: 'https://api.lafaom-mao.org/api/v1' // Fallback
};
```

### 3. **Services Mis à Jour**
- `JobService` utilise `configService.getApiBaseUrl()`
- `JobApplicationService` utilise `configService.getApiBaseUrl()`
- Logs ajoutés pour déboguer les URLs

## 🔄 Étapes de Déploiement

### Option 1: Script Automatique
```bash
# Windows
deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manuel
```bash
# 1. Installer les dépendances
npm install

# 2. Build de production
npm run build --prod

# 3. Déployer sur Vercel
vercel --prod
```

## 🧪 Tests de Validation

### 1. **Test du Proxy Vercel**
```
https://lafaom-bioforce-git-main-nanyang-brices-projects-daa29c6d.vercel.app/api/v1/job-offers
```

### 2. **Test de l'Application**
```
https://lafaom-bioforce-git-main-nanyang-brices-projects-daa29c6d.vercel.app/recrutements
```

### 3. **Logs à Vérifier**
Dans la console du navigateur, vous devriez voir :
```
🔧 [CONFIG] Configuration initialisée: {
  apiUrl: "/api/v1",
  backendUrl: "https://api.lafaom-mao.org/api/v1",
  production: true,
  finalUrl: "/api/v1"
}
```

## 🔍 Dépannage

### Si le proxy ne fonctionne pas :
1. Vérifiez que `vercel.json` est à la racine du projet
2. Redéployez avec `vercel --prod --force`
3. Vérifiez les logs Vercel dans le dashboard

### Si l'API ne répond pas :
1. Testez directement : `https://api.lafaom-mao.org/api/v1/job-offers`
2. Vérifiez que le backend est accessible
3. Vérifiez la configuration CORS du backend

## 📋 Fichiers Modifiés

- ✅ `vercel.json` - Configuration du proxy
- ✅ `src/environments/environment.prod.ts` - URL de production
- ✅ `src/app/services/config.service.ts` - Logs de débogage
- ✅ `src/app/services/job.service.ts` - Utilisation de la config
- ✅ `src/app/services/job-application.service.ts` - Utilisation de la config

## 🎯 Résultat Attendu

Après le déploiement, l'application devrait :
1. ✅ Charger les offres d'emploi sans erreur Mixed Content
2. ✅ Permettre l'upload de fichiers
3. ✅ Soumettre les candidatures avec succès
4. ✅ Fonctionner entièrement en HTTPS
