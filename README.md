# TaxiLog

Application PWA de gestion de recettes et dépenses pour propriétaires de véhicules Yango.

## Stack technique

| Couche        | Technologie                          |
|---------------|--------------------------------------|
| Backend       | NestJS + TypeORM                     |
| Frontend      | Next.js 14 (App Router) + PWA        |
| Base de données | PostgreSQL                          |
| Auth          | JWT (access token + refresh token)   |
| Styles        | Tailwind CSS                         |

## Structure du projet

```
yango-fleet/
├── backend/      NestJS API
├── frontend/     Next.js PWA
└── docs/         Documentation architecture
```

## Documentation

- [Architecture générale](docs/01-architecture.md)
- [Schéma base de données](docs/02-database.md)
- [Endpoints API](docs/03-api.md)
- [Pages frontend](docs/04-frontend.md)
- [Roadmap de développement](docs/05-roadmap.md)

## Rôles utilisateurs

| Rôle    | Accès |
|---------|-------|
| OWNER   | Gestion complète : véhicules, recettes, dépenses, chauffeurs |
| DRIVER  | Signature (confirmation) de ses lignes de recettes uniquement |

## Lancer le projet (après installation)

```bash
# Backend
cd backend && npm run start:dev

# Frontend
cd frontend && npm run dev
```
