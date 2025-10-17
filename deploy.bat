@echo off
echo 🚀 Déploiement de l'application LAFAOM...

REM Vérifier que nous sommes dans le bon répertoire
if not exist "package.json" (
    echo ❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le répertoire du projet.
    pause
    exit /b 1
)

REM Installer les dépendances
echo 📦 Installation des dépendances...
call npm install

REM Construire l'application pour la production
echo 🔨 Construction de l'application...
call npm run build --prod

REM Vérifier que le build a réussi
if not exist "dist" (
    echo ❌ Erreur: Le build a échoué. Le dossier dist n'existe pas.
    pause
    exit /b 1
)

echo ✅ Build terminé avec succès!

REM Afficher les fichiers de configuration
echo 📋 Fichiers de configuration:
echo   - vercel.json: 
type vercel.json | findstr /C:"source" /C:"destination"
echo   - environment.prod.ts:
type src\environments\environment.prod.ts

echo.
echo 🚀 Prêt pour le déploiement Vercel!
echo 💡 Exécutez: vercel --prod
echo.
echo 🔍 Pour tester la configuration:
echo   1. Ouvrez: https://lafaom-bioforce-git-main-nanyang-brices-projects-daa29c6d.vercel.app/api/v1/job-offers
echo   2. Vérifiez que l'API répond correctement
echo.
pause
