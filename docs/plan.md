
<aside>
🎯

Plan de réalisation complet de **TouriBook**, plateforme de réservation d'activités touristiques. Frontend **React**, backend **Python**. Chaque phase est découpée en tâches concrètes à cocher.

</aside>

## 🧱 Stack technique recommandée

| Couche | Technologie | Rôle |
| --- | --- | --- |
| Frontend | React + Vite, React Router, TypeScript | Interface touriste & admin |
| UI | Tailwind CSS + shadcn/ui (ou MUI) | Composants et design responsive |
| État / data | React Query (TanStack) + Axios | Appels API et cache |
| i18n | react-i18next | FR / EN / AR (+ RTL) |
| Backend | Python + FastAPI | API REST |
| ORM | SQLAlchemy + Alembic | Modèles et migrations |
| Base de données | PostgreSQL | Stockage relationnel |
| Auth | JWT (python-jose) + passlib bcrypt | Authentification sécurisée |
| Paiement | Stripe (SDK Python + Stripe.js) | Paiement total / avance |
| Cartes | Google Maps ou OpenStreetMap (Leaflet) | Géolocalisation |
| E-mail | SMTP Gmail / SendGrid | Confirmations |
| QR Code | `qrcode` (Python) | Validation sur place |
| IA | scikit-learn / recommandation par règles | Recommandations personnalisées |
| Déploiement | Docker, GitHub Actions | CI/CD |

---

## 📅 Phase 0 — Initialisation du projet

- [x]  Créer le dépôt Git (monorepo `touribook/` avec `frontend/` et `backend/`)
- [x]  Définir la convention de branches (main, develop, feature/*)
- [x]  Rédiger le fichier `README.md` avec l'architecture générale
- [x]  
    - [x]  Créer les fichiers `.gitignore` (Python + Node)
- [x]  Choisir et documenter la stack définitive (ci-dessus)

---

## 🗄️ Phase 1 — Conception & base de données

- [x]  Concevoir le modèle de données (MCD / diagramme entité-association)

- [x]  Tables principales : `users`, `activities`, `categories`, `bookings`, `payments`, `reviews`, `availabilities`, `promo_codes`, `favorites`
- [x]  Définir les rôles utilisateurs (touriste, administrateur)
- [x]  Installer PostgreSQL et créer la base `touribook`
- [x]  Configurer SQLAlchemy + Alembic (première migration)
- [x]  Rédiger le dictionnaire de données

---

## ⚙️ Phase 2 — Backend Python (FastAPI) : fondations

- [x]  Initialiser le projet FastAPI (structure `app/`, `models/`, `schemas/`, `routers/`, `services/`)
- [x]  Configurer la connexion à la base (SQLAlchemy session)
- [x]  Mettre en place la configuration via variables d'environnement (Pydantic Settings)
- [x]  Configurer CORS pour le frontend React
- [x]  Mettre en place la documentation auto (Swagger `/docs`)
- [x]  Configurer le logging et la gestion centralisée des erreurs

### 🔐 Authentification

- [x]  Modèle `User` + schéma Pydantic
- [x]  Endpoint `POST /auth/register` (inscription + hash bcrypt)
- [x]  Endpoint `POST /auth/login` (génération JWT access + refresh)
- [x]  Middleware / dépendance de vérification du token JWT
- [x]  Gestion des rôles (dépendance `require_admin`)
- [x]  Endpoint `GET /auth/me` (profil courant)

---

## 🧩 Phase 3 — Backend : modules métier (API REST)

### Activités & catégories

- [ ]  CRUD catégories (`/categories`)
- [ ]  CRUD activités (`/activities`) avec photos, prix, durée, description
- [ ]  Recherche & filtrage (catégorie, localisation, prix)
- [ ]  Endpoint détail activité `GET /activities/{id}`
- [ ]  Stockage des coordonnées GPS (latitude / longitude)

### Disponibilités

- [ ]  Modèle `Availability` (dates et horaires par activité)
- [ ]  Endpoints de gestion des créneaux
- [ ]  Vérification de disponibilité avant réservation

### Favoris

- [ ]  Endpoints ajouter / retirer / lister les favoris

### Réservations

- [ ]  Modèle `Booking` (activité, date, créneau, statut)
- [ ]  Endpoint `POST /bookings` (création + vérif. disponibilité)
- [ ]  Endpoint historique des réservations du touriste
- [ ]  Gestion des statuts (en attente, confirmée, annulée)

### Codes promo

- [ ]  Modèle `PromoCode` (valeur, %, date d'expiration)
- [ ]  Endpoint de validation d'un code promo

### Avis & notes

- [ ]  Modèle `Review` (note + commentaire, après activité)
- [ ]  Endpoints déposer / consulter les avis

---

## 💳 Phase 4 — Paiement en ligne (Stripe)

- [ ]  Créer un compte Stripe (mode test) + clés API
- [ ]  Endpoint `POST /payments/create-intent` (montant total ou avance)
- [ ]  Gérer le calcul du montant (avec code promo appliqué)
- [ ]  Configurer le webhook Stripe (`payment_intent.succeeded`)
- [ ]  Mettre à jour le statut de la réservation après paiement
- [ ]  Enregistrer le paiement (complet / avance) en base
- [ ]  Sécuriser les transactions (HTTPS obligatoire)

---

## 📧 Phase 5 — Services externes

- [ ]  Configurer le service SMTP (Gmail / SendGrid)
- [ ]  E-mail automatique de confirmation après paiement
- [ ]  Générer un QR Code de validation (lib `qrcode`) rattaché à la réservation
- [ ]  Endpoint admin de scan/validation du QR Code sur place
- [ ]  Intégration cartographie (Google Maps API ou OpenStreetMap)

---

## 🤖 Phase 6 — Fonctionnalités intelligentes (IA)

- [ ]  Collecter les données de préférences et l'historique de réservation
- [ ]  Moteur de recommandation v1 (par règles : catégorie, budget, durée du séjour)
- [ ]  Proposition d'activités similaires
- [ ]  Suggestions selon la saison et les activités populaires
- [ ]  Endpoint `GET /recommendations`
- [ ]  (Optionnel) Amélioration ML avec scikit-learn (filtrage collaboratif)

---

## ⚛️ Phase 7 — Frontend React : fondations

- [ ]  Initialiser le projet React (Vite + TypeScript)
- [ ]  Configurer le routing (React Router)
- [ ]  Configurer Axios + intercepteurs (injection du token JWT)
- [ ]  Configurer React Query (cache et requêtes)
- [ ]  Mettre en place le design system (Tailwind + composants)
- [ ]  Layout responsive (ordinateur, tablette, smartphone)
- [ ]  Configurer i18n (FR / EN / AR + gestion RTL pour l'arabe)
- [ ]  Contexte d'authentification (stockage token, routes protégées)

---

## 👤 Phase 8 — Frontend : Espace Client

- [ ]  Pages inscription / connexion
- [ ]  Page d'accueil + liste de toutes les activités
- [ ]  Barre de recherche et filtres (catégorie, localisation, prix)
- [ ]  Page détail d'une activité (photos, prix, durée, disponibilité)
- [ ]  Affichage de la localisation sur une carte
- [ ]  Bouton favoris + page « Mes favoris »
- [ ]  Calendrier de sélection date & heure
- [ ]  Panier / sélection d'une ou plusieurs activités
- [ ]  Tunnel de réservation
- [ ]  Intégration paiement Stripe (total / avance) + champ code promo
- [ ]  Écran de confirmation + affichage du QR Code
- [ ]  Page historique des réservations
- [ ]  Formulaire de dépôt d'avis et de note
- [ ]  Section recommandations personnalisées
- [ ]  Sélecteur de langue

---

## 🛠️ Phase 9 — Frontend : Espace Administrateur

- [ ]  Page de connexion admin sécurisée
- [ ]  Tableau de bord avec statistiques (réservations, chiffre d'affaires, activités populaires, nb clients, paiements complets/avances)
- [ ]  Gestion des activités (ajouter / modifier / supprimer)
- [ ]  Gestion des catégories
- [ ]  Gestion des réservations
- [ ]  Gestion des paiements
- [ ]  Gestion des utilisateurs (comptes + rôles/accès)
- [ ]  Gestion des disponibilités (dates et horaires)
- [ ]  Gestion des promotions et codes de réduction
- [ ]  Gestion des avis et commentaires
- [ ]  Gestion des langues de l'application

---

## 🧪 Phase 10 — Tests & qualité

- [ ]  Tests unitaires backend (pytest)
- [ ]  Tests d'intégration des endpoints API
- [ ]  Tests frontend (Vitest / React Testing Library)
- [ ]  Tests end-to-end (Playwright ou Cypress)
- [ ]  Validation de la sécurité (JWT, protection des données, HTTPS)
- [ ]  Tests de compatibilité navigateurs et responsive

---

## 🚀 Phase 11 — Déploiement & mise en production

- [ ]  Dockeriser le backend et le frontend (`Dockerfile` + `docker-compose`)
- [ ]  Mettre en place la CI/CD (GitHub Actions)
- [ ]  Configurer HTTPS (certificat SSL)
- [ ]  Déployer la base PostgreSQL (managed ou VPS)
- [ ]  Mettre en place la sauvegarde des données (backups planifiés)
- [ ]  Déployer backend (Render / Railway / VPS) et frontend (Vercel / Netlify)
- [ ]  Configurer les variables d'environnement de production
- [ ]  Monitoring et optimisation des temps de réponse

---

## ✅ Livrables attendus

- [ ]  Application web responsive multilingue (FR/EN/AR)
- [ ]  API REST documentée (Swagger)
- [ ]  Espace client + espace administrateur fonctionnels
- [ ]  Paiement Stripe opérationnel (total/avance)
- [ ]  Système de recommandation IA
- [ ]  Documentation technique et guide d'utilisation



https://app.notion.com/p/TouriBook-Plan-de-projet-complet-React-Python-2333aab3383e4a338b5c5376ac936df2