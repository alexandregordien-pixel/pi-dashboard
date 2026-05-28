#!/bin/bash
# ============================================================
# deploy.sh — Déploiement automatique GitHub Pages
# Dashboard Projets — Alexandre Gordien
# Usage : bash deploy.sh
# ============================================================

set -e
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     DASHBOARD — DEPLOY SCRIPT           ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── 1. VÉRIFICATIONS ─────────────────────────────────────────
echo -e "${YELLOW}[1/6] Vérification de l'environnement...${NC}"

if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js non installé.${NC}"
  echo "  → Installe Node.js : https://nodejs.org (version LTS)"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

if ! command -v npm &> /dev/null; then
  echo -e "${RED}✗ npm non trouvé.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

if ! command -v git &> /dev/null; then
  echo -e "${RED}✗ Git non installé.${NC}"
  echo "  → Installe Git : https://git-scm.com"
  exit 1
fi
echo -e "${GREEN}✓ Git $(git --version | cut -d' ' -f3)${NC}"

# ── 2. CONFIGURATION ─────────────────────────────────────────
echo ""
echo -e "${YELLOW}[2/6] Configuration du dépôt GitHub...${NC}"
echo ""
echo -e "  Entre ton nom d'utilisateur GitHub :"
read -p "  > " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
  echo -e "${RED}✗ Nom d'utilisateur requis.${NC}"
  exit 1
fi

echo -e "  Entre le nom du repo (ex: pi-dashboard) :"
read -p "  > " REPO_NAME
REPO_NAME=${REPO_NAME:-pi-dashboard}

echo ""
echo -e "${GREEN}✓ Repo cible : github.com/${GITHUB_USER}/${REPO_NAME}${NC}"

# ── 3. MISE À JOUR vite.config.js ────────────────────────────
echo ""
echo -e "${YELLOW}[3/6] Configuration du base path Vite...${NC}"

cat > vite.config.js << EOF
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
})
EOF
echo -e "${GREEN}✓ vite.config.js mis à jour (base: './')${NC}"

# ── 4. INSTALLATION DES DÉPENDANCES ──────────────────────────
echo ""
echo -e "${YELLOW}[4/6] Installation des dépendances npm...${NC}"
npm install
echo -e "${GREEN}✓ Dépendances installées${NC}"

# ── 5. BUILD ─────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[5/6] Build de production...${NC}"
npm run build
echo -e "${GREEN}✓ Build terminé → dossier /dist${NC}"

# ── 6. DÉPLOIEMENT GIT ───────────────────────────────────────
echo ""
echo -e "${YELLOW}[6/6] Déploiement sur GitHub Pages...${NC}"

# Init repo si besoin
if [ ! -d ".git" ]; then
  git init
  git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
  echo -e "${GREEN}✓ Repo Git initialisé${NC}"
fi

# Copier les fichiers dist pour gh-pages
cp -r dist gh-pages-tmp 2>/dev/null || true

# Commit du code source sur main
git add .
git commit -m "deploy: dashboard v$(date +%Y%m%d-%H%M)" 2>/dev/null || echo "  (rien à commiter sur main)"
git branch -M main
git push -u origin main --force 2>/dev/null || true

# Déploiement branche gh-pages
git checkout --orphan gh-pages 2>/dev/null || git checkout gh-pages
git rm -rf . --quiet 2>/dev/null || true

# Restaurer le dist
if [ -d "gh-pages-tmp" ]; then
  cp -r gh-pages-tmp/. .
  rm -rf gh-pages-tmp
fi

git add .
git commit -m "gh-pages: deploy $(date +%Y-%m-%d)"
git push origin gh-pages --force

# Retour sur main
git checkout main 2>/dev/null || true

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            DÉPLOIEMENT RÉUSSI !          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  🌐 URL du dashboard :"
echo -e "  ${CYAN}https://${GITHUB_USER}.github.io/${REPO_NAME}/${NC}"
echo ""
echo -e "  ⏱  GitHub Pages met 1-3 minutes à se mettre à jour."
echo -e "  📖 Active GitHub Pages dans :"
echo -e "     Settings → Pages → Branch: gh-pages → /(root)"
echo ""
