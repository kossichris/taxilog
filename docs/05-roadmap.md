# Roadmap de développement

## Lot 0 — Initialisation & Auth
**Objectif** : Projet fonctionnel avec inscription/connexion

### Backend
- [ ] `nest new backend` — config de base
- [ ] TypeORM + PostgreSQL (connexion, migrations)
- [ ] Entité `User` (phone, password_hash, name, role)
- [ ] Entité `RefreshToken`
- [ ] `AuthModule` complet :
  - `POST /auth/register` (OWNER)
  - `POST /auth/login` (phone + password)
  - `POST /auth/refresh`
  - `POST /auth/logout`
  - `GET /auth/me`
- [ ] `JwtAuthGuard` + `RolesGuard` + décorateur `@Roles()`
- [ ] Filtre d'exceptions global
- [ ] Validation class-validator sur tous les DTOs

### Frontend
- [ ] `create-next-app frontend` — config App Router + TypeScript
- [ ] Tailwind CSS
- [ ] PWA : `next-pwa` + `manifest.json`
- [ ] Store Zustand (`useAuthStore`)
- [ ] Client API (`lib/api.ts`) avec intercepteur JWT
- [ ] Page `/login` (phone + password)
- [ ] Page `/register`
- [ ] Middleware de protection des routes (`middleware.ts`)
- [ ] Redirection automatique OWNER → `/dashboard` / DRIVER → `/`

---

## Lot 1 — Véhicules
**Objectif** : Un propriétaire peut gérer ses véhicules

### Backend
- [ ] Entité `Vehicle`
- [ ] `VehiclesModule` : CRUD complet
- [ ] Guard ownership (on ne peut voir que ses propres véhicules)

### Frontend
- [ ] Page `/vehicles` (liste)
- [ ] Page `/vehicles/new` (formulaire)
- [ ] Page `/vehicles/[id]` (détail)
- [ ] Composant `VehicleCard`

---

## Lot 2 — Chauffeurs
**Objectif** : Créer des comptes chauffeurs liés aux véhicules

### Backend
- [ ] Entité `Driver`
- [ ] `DriversModule` : CRUD + création User DRIVER (transaction)
- [ ] `POST /auth/login` étendu pour les DRIVER

### Frontend
- [ ] Page `/vehicles/[id]/driver`
- [ ] Formulaire création chauffeur
- [ ] Gestion connexion chauffeur → layout DRIVER

---

## Lot 3 — Recettes
**Objectif** : Enregistrer les recettes et permettre la signature chauffeur

### Backend
- [ ] Entité `RevenueEntry`
- [ ] `RevenuesModule` : CRUD + `PATCH /:id/sign`
- [ ] Endpoints chauffeur : `my-pending`, `my-history`

### Frontend (OWNER)
- [ ] Page `/vehicles/[id]/revenues`
- [ ] Formulaire ajout recette
- [ ] Filtre période + statut signature
- [ ] Badge ✅ Signé / ⏳ En attente

### Frontend (DRIVER)
- [ ] Page `/` driver — lignes en attente
- [ ] Composant `SignButton` avec dialog confirmation
- [ ] Page `/history` driver

---

## Lot 4 — Dépenses
**Objectif** : Enregistrer les dépenses par véhicule

### Backend
- [ ] Entité `ExpenseEntry`
- [ ] `ExpensesModule` : CRUD complet

### Frontend
- [ ] Page `/vehicles/[id]/expenses`
- [ ] Formulaire ajout dépense

---

## Lot 5 — Dashboard & Stats
**Objectif** : Vue synthétique des finances

### Backend
- [ ] `DashboardModule` : agrégations SQL (totaux, par mois)
- [ ] `GET /dashboard/summary`
- [ ] `GET /dashboard/vehicle/:id`

### Frontend
- [ ] Page `/dashboard`
- [ ] Composants `StatCard`, `PeriodFilter`
- [ ] Tableau récapitulatif par véhicule

---

## Lot 6 — Finitions PWA
**Objectif** : Application installable et fluide sur mobile

- [ ] Icônes PWA (192x192, 512x512)
- [ ] Manifest couleurs et thème
- [ ] Service Worker (cache offline pour lecture)
- [ ] Optimisation mobile (touch targets, responsive)
- [ ] Toast notifications (succès/erreur)
- [ ] Skeleton loaders

---

## Décisions techniques notables

| Décision | Raison |
|----------|--------|
| Login par téléphone | Plus adapté au contexte (pas tous les chauffeurs ont un email) |
| Soft delete véhicules (`active=false`) | Conserver l'historique des recettes |
| `signed_at` nullable | Distingue simplement signé/non signé sans table séparée |
| Transaction create driver | Garantit la cohérence User + Driver en cas d'erreur |
| Refresh token en base | Permet la révocation immédiate à la déconnexion |
