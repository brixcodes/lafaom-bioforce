#!/bin/bash

echo "🚀 Déploiement de l'application LAFAOM..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le répertoire du projet."
    exit 1
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Construire l'application pour la production
echo "🔨 Construction de l'application..."
npm run build --prod

# Vérifier que le build a réussi
if [ ! -d "dist" ]; then
    echo "❌ Erreur: Le build a échoué. Le dossier dist n'existe pas."
    exit 1
fi

echo "✅ Build terminé avec succès!"

# Afficher les fichiers de configuration
echo "📋 Fichiers de configuration:"
echo "  - vercel.json: $(cat vercel.json | head -5)"
echo "  - environment.prod.ts: $(cat src/environments/environment.prod.ts)"

echo "🚀 Prêt pour le déploiement Vercel!"
echo "💡 Exécutez: vercel --prod"
