# Dashboard Projets — Guide d'installation

## Vue d'ensemble

Ce dashboard permet de gérer tes projets avec accès rapide aux conversations Claude et dépôts GitHub associés. Il inclut un assistant Claude intégré pour gérer les projets en langage naturel.

---

## Étape 1 — Prérequis à installer sur la tablette

### 1.1 Installer Termux (terminal Android)
1. Ouvre le **Play Store** sur ta Galaxy Tab S10 Lite
2. Cherche **Termux** et installe-le (version F-Droid recommandée via navigateur)
3. Ou via Play Store : accepte l'installation depuis source inconnue si nécessaire

### 1.2 Installer Node.js dans Termux
Ouvre Termux et tape ces commandes une par une :

```bash
pkg update && pkg upgrade -y
pkg install nodejs git -y
node -v    # doit afficher v18 ou supérieur
npm -v     # doit afficher 9 ou supérieur
git --version
```

### 1.3 Configurer Git avec ton compte GitHub
```bash
git config --global user.name "Alexandre Gordien"
git config --global user.email "ton.email@gmail.com"
```

---

## Étape 2 — Créer le repo GitHub

1. Ouvre **github.com** dans Chrome sur la tablette
2. Connecte-toi à ton compte (`alexandregordien-pixel`)
3. Clique **New repository**
4. Nom du repo : `pi-dashboard`
5. Visibilité : **Public** (requis pour GitHub Pages gratuit)
6. Ne coche rien d'autre → **Create repository**

---

## Étape 3 — Déployer le dashboard

### 3.1 Récupérer les fichiers du projet
Dans Termux :

```bash
# Créer le dossier de travail
mkdir -p ~/projects && cd ~/projects

# Cloner ce repo (remplace l'URL par celle de ton repo)
git clone https://github.com/alexandregordien-pixel/pi-dashboard.git
cd pi-dashboard
```

Si tu pars de zéro (fichiers fournis par Claude) :
```bash
mkdir -p ~/projects/pi-dashboard
cd ~/projects/pi-dashboard
# Copie les fichiers depuis le fichier ZIP fourni
```

### 3.2 Lancer le script de déploiement
```bash
chmod +x deploy.sh
bash deploy.sh
```

Le script va te demander :
- Ton nom d'utilisateur GitHub : `alexandregordien-pixel`
- Le nom du repo : `pi-dashboard`

Il fait tout automatiquement : install → build → push → déploiement.

### 3.3 Activer GitHub Pages
1. Va sur **github.com/alexandregordien-pixel/pi-dashboard**
2. Clique **Settings** (onglet en haut)
3. Menu gauche → **Pages**
4. Source : **Deploy from a branch**
5. Branch : **gh-pages** → **/ (root)**
6. Clique **Save**

⏱ Attends 2-3 minutes, puis ouvre :
**https://alexandregordien-pixel.github.io/pi-dashboard/**

---

## Étape 4 — Configurer l'assistant Claude

1. Ouvre le dashboard dans Chrome
2. Clique le bouton **○ API KEY** en haut à droite
3. Entre ta clé API Anthropic (format `sk-ant-api03-...`)
   - Trouve-la sur : **console.anthropic.com → API Keys**
4. La clé est stockée en mémoire de session uniquement (sécurisé)

### Exemples de commandes
Une fois la clé configurée, tape dans la barre en bas :

```
Crée un nouveau projet "WireGuard VPN" avec les tags Réseau et Pi, statut en attente
```
```
Ajoute la conversation "Installation Pi-hole" au projet Pi Dashboard
```
```
Passe le projet RIFC AFGSU en archivé
```
```
Résume l'état de tous mes projets actifs
```
```
Ajoute le tag "Perso" à tous les projets actifs
```

---

## Étape 5 — Migration vers le Raspberry Pi (à réception)

Quand tu reçois le Pi 3B+, la migration prend 15 minutes :

```bash
# Sur le Pi (après installation OS Lite + Node.js)
git clone https://github.com/alexandregordien-pixel/pi-dashboard.git
cd pi-dashboard
npm install
npm run build
# Nginx sert le dossier dist/
```

Le code ne change pas. Seule différence : persistance des données via fichier JSON local.

---

## Dépannage

**"Permission denied" sur deploy.sh**
```bash
chmod +x deploy.sh
```

**Erreur GitHub "Authentication failed"**
```bash
# Utilise un Personal Access Token au lieu du mot de passe
# github.com → Settings → Developer settings → Personal access tokens → Generate new token
# Coche : repo (toutes les cases)
```

**Node.js version trop ancienne**
```bash
pkg uninstall nodejs
pkg install nodejs-lts
```

**Le dashboard s'affiche mais l'API Claude ne répond pas**
- Vérifie que ta clé API est valide sur console.anthropic.com
- Vérifie que ton compte a du crédit disponible
- La clé doit commencer par `sk-ant-`

---

## Structure du projet

```
pi-dashboard/
├── src/
│   ├── main.jsx          # Point d'entrée React
│   └── App.jsx           # Dashboard complet + assistant Claude
├── index.html            # Template HTML
├── vite.config.js        # Config build
├── package.json          # Dépendances
├── deploy.sh             # Script déploiement GitHub Pages
└── INSTALL.md            # Ce guide
```

---

## Prochaines étapes (sur Raspberry Pi)

1. **Pi-hole** — bloqueur pub réseau entier
2. **Persistance JSON** — sauvegarde des projets entre sessions
3. **WireGuard VPN** — accès sécurisé depuis n'importe où
4. **Vaultwarden** — gestionnaire mots de passe
5. **Gitea** — repos Git privés
6. **Sauvegarde iCloud** via rclone

---

*Dashboard personnel — Alexandre Gordien*
