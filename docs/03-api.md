# Endpoints API

Base URL : `/api/v1`

Légende : 🔓 Public | 👑 OWNER uniquement | 🚗 DRIVER uniquement | 🔐 Les deux (authentifié)

---

## Auth

| Méthode | Endpoint            | Accès | Description |
|---------|---------------------|-------|-------------|
| POST    | `/auth/register`    | 🔓    | Inscription propriétaire (phone, password, name) |
| POST    | `/auth/login`       | 🔓    | Connexion (phone + password) → access_token + refresh_token |
| POST    | `/auth/refresh`     | 🔓    | Renouveler l'access_token via refresh_token |
| POST    | `/auth/logout`      | 🔐    | Révoquer le refresh_token |
| GET     | `/auth/me`          | 🔐    | Profil de l'utilisateur connecté |

### Corps des requêtes

**POST /auth/register**
```json
{
  "phone": "0701020304",
  "password": "motdepasse",
  "name": "Jean Dupont"
}
```

**POST /auth/login**
```json
{
  "phone": "0701020304",
  "password": "motdepasse"
}
```

**Réponse login/register**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": {
    "id": "uuid",
    "name": "Jean Dupont",
    "phone": "0701020304",
    "role": "OWNER"
  }
}
```

---

## Véhicules

| Méthode | Endpoint          | Accès | Description |
|---------|-------------------|-------|-------------|
| GET     | `/vehicles`       | 👑    | Liste des véhicules du propriétaire |
| POST    | `/vehicles`       | 👑    | Créer un véhicule |
| GET     | `/vehicles/:id`   | 👑    | Détail d'un véhicule |
| PATCH   | `/vehicles/:id`   | 👑    | Modifier un véhicule |
| DELETE  | `/vehicles/:id`   | 👑    | Désactiver un véhicule (soft delete) |

---

## Chauffeurs

| Méthode | Endpoint        | Accès | Description |
|---------|-----------------|-------|-------------|
| GET     | `/drivers`      | 👑    | Liste des chauffeurs (filtrés par owner) |
| POST    | `/drivers`      | 👑    | Créer un chauffeur + son compte User (transaction) |
| GET     | `/drivers/:id`  | 👑    | Détail d'un chauffeur |
| PATCH   | `/drivers/:id`  | 👑    | Modifier un chauffeur |

### Corps POST /drivers
```json
{
  "vehicle_id": "uuid-du-vehicule",
  "name": "Kofi Mensah",
  "phone": "0708090001",
  "password": "motdepasse"
}
```
> Crée simultanément un `User` (role=DRIVER) et un `Driver` en une seule transaction.

---

## Recettes

| Méthode | Endpoint                  | Accès | Description |
|---------|---------------------------|-------|-------------|
| GET     | `/revenues`               | 👑    | Liste des recettes (filtres: vehicle_id, date_from, date_to, signed) |
| POST    | `/revenues`               | 👑    | Créer une ligne de recette |
| GET     | `/revenues/:id`           | 🔐    | Détail d'une recette |
| PATCH   | `/revenues/:id`           | 👑    | Modifier une recette (si non signée) |
| DELETE  | `/revenues/:id`           | 👑    | Supprimer une recette (si non signée) |
| PATCH   | `/revenues/:id/sign`      | 🚗    | Chauffeur signe sa ligne ✅ |
| GET     | `/revenues/my-pending`    | 🚗    | Lignes en attente de signature pour le chauffeur connecté |
| GET     | `/revenues/my-history`    | 🚗    | Historique signé du chauffeur connecté |

### Corps POST /revenues
```json
{
  "vehicle_id": "uuid",
  "driver_id": "uuid",
  "date": "2026-08-03",
  "amount": 15000,
  "note": "Journée complète"
}
```

---

## Dépenses

| Méthode | Endpoint          | Accès | Description |
|---------|-------------------|-------|-------------|
| GET     | `/expenses`       | 👑    | Liste des dépenses (filtres: vehicle_id, date_from, date_to) |
| POST    | `/expenses`       | 👑    | Créer une dépense |
| GET     | `/expenses/:id`   | 👑    | Détail d'une dépense |
| PATCH   | `/expenses/:id`   | 👑    | Modifier une dépense |
| DELETE  | `/expenses/:id`   | 👑    | Supprimer une dépense |

### Corps POST /expenses
```json
{
  "vehicle_id": "uuid",
  "date": "2026-08-03",
  "amount": 5000,
  "label": "Carburant",
  "note": "Plein complet"
}
```

---

## Dashboard

| Méthode | Endpoint                    | Accès | Description |
|---------|-----------------------------|-------|-------------|
| GET     | `/dashboard/summary`        | 👑    | Résumé global (total recettes, dépenses, bénéfice, par véhicule) |
| GET     | `/dashboard/vehicle/:id`    | 👑    | Stats détaillées d'un véhicule (par mois) |

### Query params communs (filtres)
- `vehicle_id` — filtrer par véhicule
- `date_from` — date de début (YYYY-MM-DD)
- `date_to` — date de fin (YYYY-MM-DD)
- `signed` — `true` / `false` (recettes uniquement)

---

## Codes HTTP utilisés

| Code | Signification |
|------|---------------|
| 200  | OK |
| 201  | Créé avec succès |
| 400  | Données invalides |
| 401  | Non authentifié |
| 403  | Accès interdit (mauvais rôle ou ressource d'un autre owner) |
| 404  | Ressource introuvable |
| 409  | Conflit (ex: téléphone déjà utilisé) |
