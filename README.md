# Maison Panthera

Version recommandée prête à déployer sur un seul service Render, avec le site et le backend sur la même URL.

## Déploiement

1. Mets ce dossier dans un repository GitHub.
2. Sur Render, crée un nouveau service depuis ce repo.
3. Render détectera [render.yaml](/Users/lng/Desktop/PANTHERA-SITE/render.yaml).
4. Déploie le service.
5. Le site et l'API seront servis ensemble sur la même URL.

## Pourquoi cette solution

- un seul déploiement
- aucun problème de CORS entre le site et l'API
- même rendu que celui construit localement
- compatible avec domaine personnalisé ensuite
- plus simple que GitHub Pages + backend séparé

## Fichiers clés

- [render.yaml](/Users/lng/Desktop/PANTHERA-SITE/render.yaml)
- [backend/app.py](/Users/lng/Desktop/PANTHERA-SITE/backend/app.py)
- [site-config.js](/Users/lng/Desktop/PANTHERA-SITE/site-config.js)

`site-config.js` bascule automatiquement :

- en mode local statique sans backend sur `localhost:4173/4174`
- en mode API same-origin une fois le site déployé

## Aperçu local

```bash
cd /Users/lng/Desktop/PANTHERA-SITE
python3 -m http.server 4173
```

Puis ouvre `http://localhost:4173`.
