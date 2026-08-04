# Schéma Base de Données

## Diagramme des relations

```
users (1) ──────────────── (N) vehicles
  │                               │
  │ (1:1)                         │ (1:1)
  ▼                               ▼
drivers ◄─────────────────── (lié à)
  │
  │ (1:N)
  ▼
revenue_entries


users (1) ──── (N) refresh_tokens
vehicles (1) ── (N) revenue_entries
vehicles (1) ── (N) expense_entries
```

## Tables

### `users`

| Colonne        | Type                    | Contraintes              |
|----------------|-------------------------|--------------------------|
| id             | UUID                    | PK, default uuid_generate_v4() |
| phone          | VARCHAR(20)             | UNIQUE, NOT NULL         |
| password_hash  | VARCHAR(255)            | NOT NULL                 |
| name           | VARCHAR(100)            | NOT NULL                 |
| role           | ENUM('OWNER','DRIVER')  | NOT NULL, default 'OWNER' |
| created_at     | TIMESTAMP               | default NOW()            |
| updated_at     | TIMESTAMP               | auto-update              |

---

### `vehicles`

| Colonne    | Type         | Contraintes               |
|------------|--------------|---------------------------|
| id         | UUID         | PK                        |
| owner_id   | UUID         | FK → users.id, NOT NULL   |
| plate      | VARCHAR(20)  | NOT NULL                  |
| brand      | VARCHAR(50)  |                           |
| model      | VARCHAR(50)  |                           |
| color      | VARCHAR(30)  |                           |
| active     | BOOLEAN      | default true              |
| created_at | TIMESTAMP    | default NOW()             |
| updated_at | TIMESTAMP    | auto-update               |

---

### `drivers`

| Colonne    | Type        | Contraintes                     |
|------------|-------------|---------------------------------|
| id         | UUID        | PK                              |
| user_id    | UUID        | FK → users.id, UNIQUE, NOT NULL |
| vehicle_id | UUID        | FK → vehicles.id, NOT NULL      |
| name       | VARCHAR(100)| NOT NULL                        |
| phone      | VARCHAR(20) | NOT NULL                        |
| created_at | TIMESTAMP   | default NOW()                   |
| updated_at | TIMESTAMP   | auto-update                     |

> `user_id` est UNIQUE : un compte user = un seul profil chauffeur

---

### `revenue_entries`

| Colonne    | Type          | Contraintes                    |
|------------|---------------|--------------------------------|
| id         | UUID          | PK                             |
| vehicle_id | UUID          | FK → vehicles.id, NOT NULL     |
| driver_id  | UUID          | FK → drivers.id, NOT NULL      |
| date       | DATE          | NOT NULL                       |
| amount     | DECIMAL(10,2) | NOT NULL                       |
| signed_at  | TIMESTAMP     | NULL (null = non signé)        |
| note       | TEXT          |                                |
| created_by | UUID          | FK → users.id (propriétaire)   |
| created_at | TIMESTAMP     | default NOW()                  |
| updated_at | TIMESTAMP     | auto-update                    |

> `signed_at IS NULL` → en attente de signature  
> `signed_at IS NOT NULL` → confirmé par le chauffeur

---

### `expense_entries`

| Colonne    | Type          | Contraintes                  |
|------------|---------------|------------------------------|
| id         | UUID          | PK                           |
| vehicle_id | UUID          | FK → vehicles.id, NOT NULL   |
| date       | DATE          | NOT NULL                     |
| amount     | DECIMAL(10,2) | NOT NULL                     |
| label      | VARCHAR(200)  | NOT NULL                     |
| note       | TEXT          |                              |
| created_by | UUID          | FK → users.id                |
| created_at | TIMESTAMP     | default NOW()                |
| updated_at | TIMESTAMP     | auto-update                  |

---

### `refresh_tokens`

| Colonne    | Type         | Contraintes            |
|------------|--------------|------------------------|
| id         | UUID         | PK                     |
| user_id    | UUID         | FK → users.id          |
| token_hash | VARCHAR(255) | NOT NULL               |
| expires_at | TIMESTAMP    | NOT NULL               |
| created_at | TIMESTAMP    | default NOW()          |

---

## Extensions PostgreSQL requises

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```
