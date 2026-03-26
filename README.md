# Maison Panthera — Conciergerie Full Services

Site vitrine luxe pour **Maison Panthera**, conciergerie full service basée à Paris.

## Stack
- HTML5 / CSS3 / JavaScript vanilla
- PWA (Progressive Web App) — installable sur iOS & Android
- Aucune dépendance externe

## Déploiement

### GitHub Pages (gratuit)
```bash
# 1. Créer le repo sur github.com/new
# 2. Pousser le code
git remote add origin https://github.com/TON_USERNAME/maison-panthera.git
git push -u origin main

# 3. Activer GitHub Pages : Settings → Pages → Source: main branch
```

### Vercel (recommandé — HTTPS + domaine custom)
```bash
npm i -g vercel
vercel --prod
```

### Netlify (drag & drop)
Glisser le dossier sur app.netlify.com

## PWA — Installation App Store
Pour publier sur l'App Store iOS / Google Play, wrapper avec **Capacitor** :
```bash
npm install -g @capacitor/cli
npx cap init "Maison Panthera" fr.maisonpanthera.app
npx cap add ios
npx cap add android
npx cap open ios    # Ouvre Xcode → Archive → App Store Connect
```

## Contact
- +33 6 68 73 11 09
- maisonpanthera@outlook.com
