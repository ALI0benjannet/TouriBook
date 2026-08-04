# Architecture TouriBook

## 1. Vision générale

TouriBook est une plateforme de réservation d’activités touristiques et de services locaux. Elle permet à un utilisateur de parcourir des activités, réserver, payer, gérer ses favoris et recevoir des confirmations via QR code.

L’architecture est pensée pour être moderne, scalable et maintenable, avec une séparation claire entre :
- Frontend : interface utilisateur React
- Backend : API REST avec FastAPI
- Base de données : PostgreSQL
- Authentification : JWT
- Paiements : Stripe
- Cartographie : OpenStreetMap via Leaflet

---

## 2. Architecture globale

```text
Client (Web / Mobile responsive)
          |
          v
Frontend (React + Vite)
          |
          | HTTP/HTTPS REST API
          v
Backend API (FastAPI)
          |
          +--> Authentification JWT
          +--> Business Logic
          +--> Services externes (Stripe, Mail, QR Code)
          |
          v
PostgreSQL Database
```

---

## 3. Structure du projet

```text
TouriBook/
├── backend/
│   ├─features/
│   ├── users/
│   │   ├── controller.py  
│   │   ├── service.py   
│   │   ├── repository.py   
│   │   └── schemas.py      
│   ├── orders/
│   │   ├── controller.py
│   │   ├── service.py
│   │   ├── repository.py
│   │   └── schemas.py
│   └── payments/
│       └── ...
├── core/
│   ├── database.py          # shared engine/session, injected into repos
│   ├── config.py
│   └── exceptions.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   src/
├── features/
│   ├── Auth/
│   │   ├── api/
│   │   │   ├── auth.api.ts
│   │   │   ├── auth.type.ts
│   │   │   └── index.ts         
│   │   ├── components/
│   │   │   ├── LoginForm/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── index.ts   
│   │   │   └── index.ts         
│   │   └── index.ts            
├── components/
│   ├── Buttons/
│   │   └── ButtonComponent.tsx
│   │   └── ButtonComponent.style.ts
│   │   └── index.ts
│   └── index.ts                  
├── hooks/
│   └── index.ts
└── utils/
    └── helpers/
    └── index.ts
│
├── docs/
│   └── architecture.md
└── README.md
```

---

## 4. Modèle de domaine

### 4.1 Entités principales

- Utilisateur
  - Gère l’authentification, les réservations, les favoris et les avis.

- Activité
  - Représente une offre disponible à la réservation.

- Catégorie
  - Classe les activités selon un type métier.

- Prestataire
  - Regroupe les fournisseurs ou organisateurs d’activités.

- Réservation
  - Centralise la transaction de réservation.

- DetailReservation
  - Permet d’associer plusieurs activités à une même réservation.

- Paiement
  - Suit les paiements liés à une réservation.

- Avis
  - Représente les évaluations clients.

- Favori
  - Permet de sauvegarder des activités préférées.

- Promotion
  - Définit les codes promo applicables.

- UtilisationPromotion
  - Enregistre l’utilisation d’un code promo sur une réservation.

- Disponibilite
  - Gère la capacité et les créneaux disponibles.

- QRCode
  - Génère une confirmation de réservation.

---

## 5. Règles d’architecture backend

### 5.1 Couches

1. API Layer
   - Gère les endpoints HTTP
   - Valide les entrées
   - Retourne les réponses JSON

2. Service Layer
   - Contient la logique métier
   - Coordonne les opérations complexes
   - Gère les validations métier

3. Repository / Data Layer
   - Interagit avec SQLAlchemy et PostgreSQL
   - Centralise les requêtes SQL/ORM

4. Models
   - Représente les tables et relations

5. Schemas
   - Définit les formats d’entrée/sortie

### 5.2 Bonnes pratiques

- Utiliser des routes versionnées : /api/v1/
- Séparer les responsabilités par domaine
- Utiliser des dépendances injectables avec FastAPI
- Centraliser la configuration dans core/config.py
- Ne jamais mettre la logique métier directement dans les endpoints

---

## 6. Règles d’architecture frontend

### 6.1 Organisation

- Pages pour les vues principales
- Composants réutilisables dans components/
- Services pour l’interaction avec l’API
- Store pour la gestion d’état globale
- Hooks pour la logique métier réutilisable

### 6.2 Recommandations

- Utiliser React + Vite pour une démarrage rapide
- Utiliser React Router pour la navigation
- Utiliser Zustand ou Redux Toolkit pour l’état global
- Utiliser React Query/TanStack Query pour la gestion des données distantes
- Utiliser Tailwind CSS pour un style moderne et rapide

---

## 7. Modèle de base de données

### 7.1 Relations principales

- Un utilisateur peut avoir plusieurs réservations
- Une réservation peut contenir plusieurs activités
- Une activité appartient à une catégorie et à un prestataire
- Une réservation peut avoir plusieurs paiements
- Un utilisateur peut laisser plusieurs avis et définir plusieurs favoris
- Une activité peut avoir plusieurs disponibilités
- Une réservation possède un QR code unique
- Une promotion peut être utilisée sur plusieurs réservations

---

## 8. Sécurité

- Authentification via JWT
- Hachage des mots de passe avec bcrypt/argon2
- Validation stricte des entrées
- Protection contre les injections SQL via SQLAlchemy
- Variables d’environnement dans .env
- CORS configuré proprement

---

## 9. Fonctionnalités prioritaires MVP

### Phase 1
- Inscription / connexion
- Catalogue d’activités
- Détails d’une activité
- Réservation simple
- Paiement par avance

### Phase 2
- Gestion des favoris
- Avis et notation
- Promotions et codes promo
- QR code de confirmation

### Phase 3
- Tableau de bord admin
- Gestion des disponibilités
- Notifications email
- Statistiques et rapports

---

## 10. Recommandation technique finale

Pour un projet de fin d’études, l’architecture la plus adaptée est :

- Frontend : React + Vite + Tailwind CSS
- Backend : FastAPI + SQLAlchemy + Pydantic
- Base de données : PostgreSQL
- Authentification : JWT
- Paiement : Stripe
- Mapping : Leaflet + OpenStreetMap
- Email : FastAPI-Mail
- QR Code : qrcode

Cette structure est professionnelle, moderne, claire et suffisamment robuste pour évoluer vers une application de production.
