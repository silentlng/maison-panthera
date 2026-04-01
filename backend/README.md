# Backend Maison Panthera

Serveur HTTP léger qui publie à la fois :

- les pages du site
- les assets statiques
- les endpoints API `contact` et `reviews`

## Ce qu'il fait

- sert `index.html`, `services.html`, `about.html`, `contact.html`
- `POST /api/contact`
- `POST /api/reviews`
- `GET /api/health`
- validation des champs
- contrôle anti-spam via honeypot
- rate limiting mémoire par IP
- CORS sur liste blanche
- en-têtes de sécurité
- envoi email SMTP si configuré
- stockage local de secours dans `backend/data/*.log`

## Lancer en local

```bash
cd /Users/lng/Desktop/PANTHERA-SITE/backend
cp .env.example .env
python3 app.py
```

Puis ouvre `http://localhost:8080`.

## Déploiement

Solution recommandée : déployer tout le dossier racine sur Render avec [render.yaml](/Users/lng/Desktop/PANTHERA-SITE/render.yaml).

## Sécurité intégrée

- origine autorisée via `ALLOWED_ORIGINS`
- taille max des payloads
- validation email / téléphone / longueurs
- refus des soumissions répétées
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
