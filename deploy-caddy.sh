#!/bin/bash

# Script de déploiement pour configurer Caddy avec l'application LAFAOM

echo "🚀 Configuration de Caddy pour LAFAOM API..."

# Vérifier si Caddy est installé
if ! command -v caddy &> /dev/null; then
    echo "❌ Caddy n'est pas installé. Installation en cours..."
    
    # Ajouter la clé GPG de Caddy
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    
    # Ajouter le repository Caddy
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    
    # Mettre à jour et installer Caddy
    apt update
    apt install -y caddy
else
    echo "✅ Caddy est déjà installé"
fi

# Créer le répertoire de logs
mkdir -p /var/log/caddy
chown caddy:caddy /var/log/caddy

# Copier la configuration Caddy
echo "📝 Configuration de Caddy..."
cp Caddyfile /etc/caddy/Caddyfile

# Tester la configuration
echo "🔍 Test de la configuration Caddy..."
caddy validate --config /etc/caddy/Caddyfile

if [ $? -eq 0 ]; then
    echo "✅ Configuration Caddy valide"
    
    # Redémarrer Caddy
    echo "🔄 Redémarrage de Caddy..."
    systemctl restart caddy
    systemctl enable caddy
    
    # Vérifier le statut
    systemctl status caddy --no-pager
    
    echo "🎉 Configuration terminée !"
    echo "📋 Votre API est accessible sur : https://api.lafaom-mao.org"
    echo "📖 Documentation API : https://api.lafaom-mao.org/docs"
else
    echo "❌ Erreur dans la configuration Caddy"
    exit 1
fi
