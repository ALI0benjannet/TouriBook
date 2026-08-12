
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

## Phase 3 — Backend : authentification complète 

### Service e-mail 

- [x]  Configurer le service SMTP (Gmail app password / SendGrid) via variables d'env
- [x]  Créer un `EmailService` réutilisable (envoi asynchrone / `BackgroundTasks`)
- [x]  Créer les templates HTML : confirmation de compte, réinitialisation de mot de passe

### Confirmation de compte par e-mail

- [x]  Ajouter les champs `is_active` / `is_verified` + `email_verified_at` au modèle `User` (migration Alembic)
- [x]  Modèle/table `email_verification_tokens` (token, user_id, expiration, used) — ou token JWT signé à durée courte
- [x]  Envoyer l'e-mail de confirmation à l'inscription (`POST /auth/register`)
- [x]  `GET|POST /auth/verify-email?token=...` (validation du token + activation du compte)
- [x]  `POST /auth/resend-verification` (avec rate limiting)
- [x]  Bloquer le login des comptes non vérifiés (message d'erreur explicite)

### Mot de passe oublié / réinitialisation

- [x]  Modèle/table `password_reset_tokens` (token hashé, expiration ~30 min, usage unique)
- [x]  `POST /auth/forgot-password` (réponse toujours identique pour éviter l'énumération d'e-mails)
- [x]  `POST /auth/reset-password` (token + nouveau mot de passe + politique de robustesse)
- [x]  `POST /auth/change-password` (utilisateur connecté, vérif. ancien mot de passe)
- [x]  Invalider les sessions / refresh tokens après reset

### Sessions & sécurité

- [x]  `POST /auth/refresh` (rotation du refresh token)
- [x]  `POST /auth/logout` (révocation / blacklist du refresh token)
- [x]  Rate limiting sur `/auth/login`, `/forgot-password`, `/resend-verification`
- [x]  `PATCH /auth/me` (mise à jour du profil : nom, langue préférée, téléphone)
- [x]  Créer un compte administrateur de départ (script de seed)
- [x]  Tests pytest du parcours auth complet (register → verify → login → forgot → reset)

---

## ⚛️ Phase 4 — Frontend React : fondations 

- [x]  Initialiser le projet React (Vite + TypeScript)
- [x]  Configurer le routing (React Router) + structure de dossiers (`pages/`, `components/`, `features/`, `lib/`)
- [x]  Configurer Axios + intercepteurs (injection du JWT, refresh auto sur 401)
- [x]  Configurer React Query (cache et requêtes)
- [x]  Mettre en place le design system (Tailwind + shadcn/ui, thème, tokens)
- [x]  Layout responsive (ordinateur, tablette, smartphone) + Navbar / Footer
- [x]  Configurer i18n (FR / EN / AR + gestion RTL) et le sélecteur de langue
- [x]  Contexte d'authentification (stockage token, `useAuth`, routes protégées)
- [x]  Composants de garde : `ProtectedRoute` (touriste) et `AdminRoute` (rôle admin)
- [x]  Gestion globale des erreurs + notifications (toasts) + états de chargement
- [x]  Configurer `.env` frontend (URL de l'API) et le proxy de développement

---

## 👤 Phase 5 — Frontend : parcours d'authentification complet 


### Espace client

- [x]  Page d'inscription (validation de formulaire : e-mail, mot de passe fort, confirmation)
- [x]  Écran « Vérifiez votre boîte mail » après inscription + bouton de renvoi
- [x]  Page de confirmation de compte (`/verify-email`) : succès, token expiré, token invalide
- [x]  Page de connexion (gestion des erreurs : identifiants invalides, compte non vérifié)
- [x]  Page « Mot de passe oublié » (saisie de l'e-mail + message de confirmation)
- [x]  Page « Réinitialiser le mot de passe » (`/reset-password?token=...`)
- [x]  Déconnexion + persistance de session au rechargement (refresh token)
- [x]  Page profil : informations personnelles + changement de mot de passe
- [x]  Traduction FR / EN / AR de tous les écrans d'auth (dont RTL)

### Espace administrateur

- [x]  Page de connexion admin sécurisée (`/admin/login`)
- [x]  Redirection selon le rôle après connexion (touriste → accueil, admin → dashboard)
- [ ]  Layout admin (sidebar + protection de toutes les routes `/admin/*`)
- [ ]  Page 403 / accès refusé

---

## 🧩 Phase 6 — Backend : modules métier (API REST) 

### Activités & catégories

- [ ]  CRUD catégories (`/categories`)
- [ ]  CRUD activités (`/activities`) avec photos, prix, durée, description
- [ ]  Recherche & filtrage (catégorie, localisation, prix) + pagination
- [ ]  `GET /activities/{id}` (détail)
- [ ]  Stockage des coordonnées GPS (latitude / longitude)

### Disponibilités

- [ ]  Modèle `Availability` (dates et horaires par activité)
- [ ]  Endpoints de gestion des créneaux
- [ ]  Vérification de disponibilité avant réservation

### Favoris

- [ ]  Endpoints ajouter / retirer / lister les favoris

### Réservations

- [ ]  Modèle `Booking` (activité, date, créneau, statut)
- [ ]  `POST /bookings` (création + vérification de disponibilité)
- [ ]  Historique des réservations du touriste
- [ ]  Gestion des statuts (en attente, confirmée, annulée)

### Codes promo

- [ ]  Modèle `PromoCode` (valeur, %, date d'expiration)
- [ ]  Endpoint de validation d'un code promo

### Avis & notes

- [ ]  Modèle `Review` (note + commentaire, après activité)
- [ ]  Endpoints déposer / consulter les avis

---

## 🖼️ Phase 7 — Frontend : catalogue & découverte

- [ ]  Page d'accueil + liste de toutes les activités
- [ ]  Barre de recherche et filtres (catégorie, localisation, prix)
- [ ]  Page détail d'une activité (photos, prix, durée, disponibilité)
- [ ]  Affichage de la localisation sur une carte (Leaflet / Google Maps)
- [ ]  Bouton favoris + page « Mes favoris »
- [ ]  Calendrier de sélection date & heure (créneaux disponibles)
- [ ]  Panier / sélection d'une ou plusieurs activités

---

## 💳 Phase 8 — Paiement en ligne (Stripe)

### Backend

- [ ]  Créer un compte Stripe (mode test) + clés API
- [ ]  `POST /payments/create-intent` (montant total ou avance)
- [ ]  Calcul du montant (avec code promo appliqué)
- [ ]  Webhook Stripe (`payment_intent.succeeded`)
- [ ]  Mise à jour du statut de la réservation après paiement
- [ ]  Enregistrement du paiement (complet / avance) en base
- [ ]  Sécurisation des transactions (HTTPS, vérification de signature du webhook)

### Frontend

- [ ]  Tunnel de réservation (récapitulatif → paiement → confirmation)
- [ ]  Intégration Stripe.js (total / avance) + champ code promo
- [ ]  Écran de confirmation + affichage du QR Code
- [ ]  Page historique des réservations (+ annulation)

---

## 📧 Phase 9 — Services externes (réservation)

- [ ]  E-mail automatique de confirmation de réservation après paiement (réutilise l'`EmailService` de la Phase 3)
- [ ]  Générer un QR Code de validation (lib `qrcode`) rattaché à la réservation
- [ ]  Endpoint admin de scan / validation du QR Code sur place
- [ ]  Intégration cartographie avancée (itinéraire, marqueurs multiples)

---

## 🤖 Phase 10 — Fonctionnalités intelligentes (IA) 

- [ ]  Collecter les données de préférences et l'historique de réservation
- [ ]  Moteur de recommandation v1 (par règles : catégorie, budget, durée du séjour)
- [ ]  Proposition d'activités similaires
- [ ]  Suggestions selon la saison et les activités populaires
- [ ]  `GET /recommendations`
- [ ]  Section « recommandations personnalisées » côté frontend
- [ ]  (Optionnel) Amélioration ML avec scikit-learn (filtrage collaboratif)

---

## 🛠️ Phase 11 — Frontend : Espace Administrateur 

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

## 🧪 Phase 12 — Tests & qualité

- [ ]  Tests unitaires backend (pytest)
- [ ]  Tests d'intégration des endpoints API
- [ ]  Tests frontend (Vitest / React Testing Library)
- [ ]  Tests end-to-end (Playwright ou Cypress) — parcours inscription → confirmation → réservation → paiement
- [ ]  Validation de la sécurité (JWT, tokens de reset, protection des données, HTTPS)
- [ ]  Tests de compatibilité navigateurs et responsive

---

## 🚀 Phase 13 — Déploiement & mise en production

- [ ]  Dockeriser le backend et le frontend (`Dockerfile` + `docker-compose`)
- [ ]  Mettre en place la CI/CD (GitHub Actions)
- [ ]  Configurer HTTPS (certificat SSL)
- [ ]  Déployer la base PostgreSQL (managed ou VPS)
- [ ]  Sauvegarde des données (backups planifiés)
- [ ]  Déployer backend (Render / Railway / VPS) et frontend (Vercel / Netlify)
- [ ]  Configurer les variables d'environnement de production (dont SMTP et clés Stripe live)
- [ ]  Monitoring et optimisation des temps de réponse

---

## ✅ Livrables attendus

- [ ]  Application web responsive multilingue (FR/EN/AR)
- [ ]  API REST documentée (Swagger)
- [ ]  Espace client + espace administrateur fonctionnels
- [ ]  Authentification complète (inscription, confirmation e-mail, login, mot de passe oublié)
- [ ]  Paiement Stripe opérationnel (total/avance)
- [ ]  Système de recommandation IA
- [ ]  Documentation technique et guide d'utilisation