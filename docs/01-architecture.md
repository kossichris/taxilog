# Architecture générale

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT (PWA)                       │
│              Next.js 14 - App Router                 │
│                                                      │
│  ┌──────────────┐        ┌──────────────────┐        │
│  │ Layout OWNER │        │  Layout DRIVER   │        │
│  │  Dashboard   │        │  (minimaliste)   │        │
│  │  Véhicules   │        │  Lignes à signer │        │
│  │  Recettes    │        │  Historique      │        │
│  │  Dépenses    │        └──────────────────┘        │
│  │  Chauffeurs  │                                    │
│  └──────────────┘                                    │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP / JWT
┌───────────────────────▼─────────────────────────────┐
│                   BACKEND (API)                      │
│                NestJS + TypeORM                      │
│                                                      │
│  AuthModule     VehiclesModule    DriversModule      │
│  RevenuesModule ExpensesModule    DashboardModule    │
│  CommonModule (guards, decorators, filters)          │
└───────────────────────┬─────────────────────────────┘
                        │ TypeORM
┌───────────────────────▼─────────────────────────────┐
│               BASE DE DONNÉES                        │
│                  PostgreSQL                          │
│                                                      │
│  users  vehicles  drivers  revenue_entries           │
│  expense_entries  refresh_tokens                     │
└─────────────────────────────────────────────────────┘
```

## Modules NestJS

| Module           | Responsabilité |
|------------------|----------------|
| `AuthModule`     | Inscription, connexion (phone+password), refresh token, logout |
| `VehiclesModule` | CRUD véhicules — réservé au propriétaire |
| `DriversModule`  | CRUD chauffeurs + création du compte User DRIVER associé (transaction) |
| `RevenuesModule` | CRUD recettes + endpoint de signature réservé au chauffeur |
| `ExpensesModule` | CRUD dépenses — réservé au propriétaire |
| `DashboardModule`| Statistiques et totaux par véhicule/période |
| `CommonModule`   | `JwtAuthGuard`, `RolesGuard`, décorateur `@Roles()`, filtres d'exceptions globaux |

## Flux d'authentification

```
[Propriétaire]                     [Chauffeur]
     │                                  │
POST /auth/register                     │
POST /auth/login ──────────────────── POST /auth/login
     │                                  │
  access_token (15min)             access_token (15min)
  refresh_token (7j)               refresh_token (7j)
     │                                  │
  Layout OWNER                     Layout DRIVER
  (accès complet)                  (signature uniquement)
```

## Règles de sécurité

- Chaque propriétaire ne voit que ses propres données (filtre automatique via `owner_id`)
- Un chauffeur ne peut signer que les lignes qui lui sont assignées
- Les routes OWNER sont protégées par `@Roles('OWNER')`
- Les routes DRIVER sont protégées par `@Roles('DRIVER')`
- Le refresh token est stocké en base (hash bcrypt), révocable à la déconnexion
