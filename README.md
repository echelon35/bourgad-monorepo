![Logo de Bourgad](libs\front\assets\Logo%20bourgad.png "Logo de Bourgad").

# Bourgad

Bourgad est un réseau social local dédié au département de la **Manche** (Normandie). Il permet aux habitants de partager des publications géolocalisées, de découvrir des lieux d'intérêt et de créer du lien autour de leur territoire.

---

## Sommaire

- [Présentation](#présentation)
- [Stack technique](#stack-technique)
- [Architecture du monorepo](#architecture-du-monorepo)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancer le projet](#lancer-le-projet)
- [API — Endpoints](#api--endpoints)
- [Ingestion géographique](#ingestion-géographique)
- [Structure des librairies](#structure-des-librairies)
- [Tests](#tests)

---

## Présentation

Bourgad est centré sur le département de la Manche. Les fonctionnalités principales sont :

- **Feed géolocalisé** : publications associées à un lieu ou une ville
- **Carte interactive** : visualisation des publications et lieux sur une carte Leaflet
- **Import de photos** : ajout de médias en lot depuis un appareil
- **Découverte de lieux** : recherche et autocomplétion de lieux (OSM, IGN, WikiManche)
- **Authentification** : email/mot de passe + OAuth Google
- **Profil utilisateur** : avatar, ville de référence, historique

---

## Stack technique

### Backend
| Technologie | Rôle |
|---|---|
| [NestJS](https://nestjs.com) 11 | Framework API REST |
| [TypeORM](https://typeorm.io) | ORM PostgreSQL |
| [PostgreSQL](https://www.postgresql.org) + PostGIS | Base de données + données géospatiales |
| [Passport.js](http://www.passportjs.org) | Authentification (JWT, Local, Google OAuth2) |
| [AWS SES](https://aws.amazon.com/ses/) | Envoi d'emails transactionnels |
| [Scaleway Object Storage](https://www.scaleway.com/fr/object-storage/) | Stockage des médias (compatible S3) |
| [Mistral AI](https://mistral.ai) | Enrichissement des données de lieux |
| [@nestjs/schedule](https://docs.nestjs.com/techniques/task-scheduling) | Tâches planifiées (sync incrémentale) |

### Frontend
| Technologie | Rôle |
|---|---|
| [Angular](https://angular.dev) 20 | Framework SPA |
| [NgRx Signals](https://ngrx.io/guide/signals) | Gestion d'état réactive |
| [Leaflet.js](https://leafletjs.com) | Carte interactive |
| [TailwindCSS](https://tailwindcss.com) | Styles utilitaires |

### Infrastructure
| Technologie | Rôle |
|---|---|
| [Nx](https://nx.dev) | Monorepo tooling |
| [Jest](https://jestjs.io) | Tests unitaires |
| [Cypress](https://www.cypress.io) | Tests end-to-end |

---

## Architecture du monorepo

```
bourgad-monorepo/
├── apps/
│   ├── bourgad-api/          # Application NestJS (point d'entrée API)
│   ├── bourgad-api-e2e/      # Tests E2E de l'API (Cypress)
│   ├── bourgad-front/        # Application Angular (SPA)
│   └── bourgad-front-e2e/    # Tests E2E du frontend (Cypress)
│
└── libs/
    ├── api/                  # Librairies métier backend (NestJS modules)
    │   ├── authentication/   # Login, signup, OAuth Google, JWT
    │   ├── category/         # Catégories et sous-catégories de lieux
    │   ├── core/             # Guards, intercepteurs, utilitaires partagés
    │   ├── mail/             # Service d'envoi d'emails (AWS SES)
    │   ├── media/            # Upload et gestion des médias (Scaleway S3)
    │   ├── organisation/     # Entités organisation et types
    │   ├── post/             # Publications, commentaires, likes, localisations
    │   ├── seed/             # Données initiales (rôles, catégories)
    │   ├── territory/        # Villes, départements, lieux + ingestion OSM
    │   └── user/             # Profils utilisateurs, rôles, avatar
    │
    ├── front/                # Librairies frontend (Angular)
    │   ├── assets/           # SVG, icônes, marqueurs de carte
    │   ├── core/             # Services API, stores NgRx Signals
    │   ├── feature/          # Vues fonctionnelles
    │   │   ├── authentication/  # Login, signup, confirmation email
    │   │   ├── feed/            # Feed principal + vue d'un post
    │   │   ├── localize/        # Vue carte (Leaflet)
    │   │   ├── photo-batch/     # Import de photos en lot
    │   │   └── profile/         # Profil utilisateur
    │   ├── tailwind-preset/  # Configuration Tailwind partagée
    │   └── ui/               # Composants réutilisables (dropdown, map, toastr…)
    │
    └── shared/               # Code partagé API ↔ Frontend
        ├── dto/
        │   ├── internal/     # DTOs des domaines métier
        │   └── external/     # DTOs des APIs tierces (OSM, IGN…)
        └── model/            # Modèles de domaine partagés
```

Chaque module API suit une architecture en 3 couches :

```
libs/api/[domaine]/src/lib/
├── application/      # Services métier
├── controller/       # Contrôleurs REST
└── infrastructure/   # Entités TypeORM, repositories, stratégies
```

---

## Prérequis

- **Node.js** >= 20
- **npm** >= 10
- **PostgreSQL** >= 14 avec l'extension **PostGIS**
- Un compte **Scaleway** (stockage objet S3)
- Un compte **AWS** (SES pour les emails)
- Un projet **Google Cloud** (OAuth2)
- Une clé **Mistral AI** (optionnel, enrichissement des lieux)

---

## Installation

```bash
# Cloner le dépôt
git clone <url-du-repo>
cd bourgad-monorepo

# Installer les dépendances
npm install
```

---

## Configuration

Créer le fichier `apps/bourgad-api/.env` à partir de l'exemple ci-dessous :

```env
# Base de données PostgreSQL
BOURGAD_HOST=localhost
BOURGAD_PORT=5432
BOURGAD_USER=postgres
BOURGAD_PASSWORD=votre_mot_de_passe
BOURGAD_DATABASE=bourgad

# JWT
BOURGAD_SECRET=votre_secret_jwt

# Google OAuth2
GOOGLE_API_KEY=votre_google_api_key
GOOGLE_API=votre_google_client_id
GOOGLE_API_SECRET=votre_google_client_secret

# URLs
BOURGAD_FRONT_BASE_URI=http://localhost:4200
BASE_URI=http://localhost:4003

# AWS SES (emails)
AWS_REGION=eu-west-3
AWS_ACCESS_KEY_ID=votre_access_key
AWS_SECRET_ACCESS_KEY=votre_secret_key
MAIL_SUPPORT=votre_email_support

# Scaleway Object Storage (médias)
SCW_ACCESS_KEY_ID=votre_scw_access_key
SCW_SECRET_ACCESS_KEY=votre_scw_secret_key
SCW_REGION=fr-par
SCW_BUCKET_NAME=bourgad
SCW_ENDPOINT=https://bourgad.s3.fr-par.scw.cloud

# Mistral AI (enrichissement des lieux)
MISTRAL_API_KEY=votre_mistral_api_key
```

> La base de données se synchronise automatiquement au démarrage (`synchronize: true`). Ne pas utiliser en production sans migrations.

---

## Lancer le projet

```bash
# API NestJS (port 4003)
npx nx serve bourgad-api

# Frontend Angular (port 4200)
npx nx serve bourgad-front

# Les deux en parallèle
npx nx run-many -t serve -p bourgad-api,bourgad-front
```

### Build de production

```bash
npx nx build bourgad-api
npx nx build bourgad-front
```

### Visualiser le graphe de dépendances

```bash
npx nx graph
```

---

## API — Endpoints

Tous les endpoints sont protégés par JWT sauf mention contraire (`@Public`).

### Authentification — `/auth`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | Public | Créer un compte |
| `POST` | `/auth/login` | Public | Se connecter (email + mot de passe) |
| `POST` | `/auth/logout` | Authentifié | Se déconnecter |
| `GET` | `/auth/expiration` | Authentifié | Vérifier l'expiration du token |
| `GET` | `/auth/confirm-email` | Public | Confirmer l'email (lien reçu par mail) |
| `POST` | `/auth/resend-confirmation-mail` | Public | Renvoyer l'email de confirmation |
| `POST` | `/auth/forgot-password` | Public | Demander une réinitialisation de mot de passe |
| `POST` | `/auth/change-password` | Authentifié | Changer le mot de passe |
| `GET` | `/auth/google/signin` | Public | Initier le flux OAuth Google |
| `GET` | `/auth/google/signin/callback` | Public | Callback OAuth Google |

### Publications — `/post`

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/post` | Récupérer le feed (publications) |
| `GET` | `/post/:postId` | Récupérer une publication |
| `POST` | `/post` | Créer une publication |
| `GET` | `/post/:postId/comments` | Récupérer les commentaires d'une publication |
| `POST` | `/post/:postId/comments` | Ajouter un commentaire |

### Localisation — `/location`

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/location` | Créer une localisation pour une publication |

### Catégories — `/category`

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/category` | Lister les catégories |
| `GET` | `/category/subcategories` | Lister les sous-catégories |

### Médias — `/media`

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/media/upload` | Uploader un fichier média (Scaleway S3) |
| `GET` | `/media/imported` | Récupérer les médias importés |

### Territoire — `/territory`

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/territory/cities` | Lister les communes de la Manche |
| `GET` | `/territory/city/:cityId` | Récupérer une commune |
| `GET` | `/territory/autocomplete` | Autocomplétion des lieux |

### Utilisateur — `/user`

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/user/profile` | Récupérer son profil |
| `PATCH` | `/user/profile` | Mettre à jour son profil |
| `GET` | `/user/summary` | Récupérer le résumé de son activité |
| `POST` | `/user/change-town` | Changer sa ville de référence |
| `POST` | `/user/avatar` | Uploader son avatar |

### Ingestion — `/place` (admin)

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/place/ingest/full` | Ingestion complète depuis WikiManche + OSM |
| `POST` | `/place/ingest/overpass` | Ingestion depuis l'API Overpass (OSM) |
| `POST` | `/place/sync/incremental` | Synchronisation incrémentale des lieux |

---

## Ingestion géographique

Bourgad dispose d'un pipeline d'ingestion des points d'intérêt de la Manche depuis plusieurs sources :

- **OSM via Overpass API** : commerces, tourisme, patrimoine, loisirs
- **WikiManche** : lieux culturels et patrimoniaux normands
- **IGN** (provider configuré) : données cartographiques officielles

L'ingestion enrichit automatiquement les lieux via **Mistral AI** (description, catégorisation).

Une **synchronisation incrémentale** peut être planifiée via `@nestjs/schedule` pour maintenir les données à jour.

> Le périmètre géographique est volontairement limité au département de la **Manche** (code 50).

---

## Structure des librairies frontend

### Routes de l'application

| Route | Composant | Description |
|---|---|---|
| `/` | `FeedView` | Feed des publications |
| `/login` | `LoginView` | Connexion |
| `/signup` | `SignUpView` | Inscription |
| `/confirm-email` | `ConfirmEmailView` | Confirmation email |
| `/localize` | `LocalizeView` | Carte interactive |
| `/post/:id` | `PostView` | Détail d'une publication |
| `/import` | `PhotoBatchView` | Import de photos en lot |
| `/profile` | `ProfileView` | Profil utilisateur |

### State Management (NgRx Signals)

Trois stores réactifs centralisés dans `libs/front/core` :

| Store | Données gérées |
|---|---|
| `auth.store` | Utilisateur connecté, token JWT |
| `category.store` | Catégories et sous-catégories |
| `user.store` | Profil et préférences utilisateur |

---

## Tests

```bash
# Tests unitaires (tous les projets)
npx nx run-many -t test

# Tests unitaires d'un projet spécifique
npx nx test bourgad-api
npx nx test bourgad-front

# Tests E2E
npx nx e2e bourgad-api-e2e
npx nx e2e bourgad-front-e2e
```
