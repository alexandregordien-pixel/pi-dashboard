#!/bin/bash
MSG=${1:-"update: dashboard $(date +%Y%m%d-%H%M)"}
GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'
set -e
echo -e "${CYAN}[1/4] Build...${NC}"
npm run build
echo -e "${CYAN}[2/4] Copie sur gh-pages...${NC}"
JSFILE=$(basename dist/assets/index-*.js)
cp dist/assets/index-*.js /tmp/pi-build.js
cp dist/index.html /tmp/pi-index.html
git stash 2>/dev/null || true
git checkout gh-pages
rm -f assets/index-*.js
cp /tmp/pi-build.js assets/$JSFILE
cp /tmp/pi-index.html index.html
echo -e "${CYAN}[3/4] Commit...${NC}"
git add -A
git commit -m "$MSG" 2>/dev/null || echo "  (rien à commiter)"
echo -e "${CYAN}[4/4] Push...${NC}"
git push origin gh-pages --force
git checkout main
git stash pop 2>/dev/null || true
echo -e "${GREEN}✓ Mis à jour !${NC}"
echo "  → https://alexandregordien-pixel.github.io/pi-dashboard/"
