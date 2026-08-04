# Pages Frontend (Next.js 14 App Router)

## Structure des routes

```
app/
├── layout.tsx                    Layout racine (fonts, providers)
├── page.tsx                      Redirection vers /login
│
├── (auth)/
│   ├── layout.tsx                Layout auth (centré, fond neutre)
│   ├── login/
│   │   └── page.tsx              Connexion (phone + password)
│   └── register/
│       └── page.tsx              Inscription propriétaire
│
├── (owner)/
│   ├── layout.tsx                Layout owner (sidebar, navbar)
│   ├── dashboard/
│   │   └── page.tsx              Vue globale — stats, résumé par véhicule
│   ├── vehicles/
│   │   ├── page.tsx              Liste des véhicules
│   │   ├── new/
│   │   │   └── page.tsx          Formulaire création véhicule
│   │   └── [id]/
│   │       ├── page.tsx          Détail du véhicule
│   │       ├── revenues/
│   │       │   └── page.tsx      Recettes du véhicule + ajout
│   │       ├── expenses/
│   │       │   └── page.tsx      Dépenses du véhicule + ajout
│   │       └── driver/
│   │           └── page.tsx      Chauffeur du véhicule + création
│   └── ...
│
└── (driver)/
    ├── layout.tsx                Layout driver (minimaliste, logo + déconnexion)
    ├── page.tsx                  Lignes en attente de signature
    └── history/
        └── page.tsx              Historique des lignes signées
```

---

## Pages détaillées

### (auth) — Accès public

#### `/login`
- Formulaire : numéro de téléphone + mot de passe
- Détecte le rôle (OWNER/DRIVER) depuis la réponse JWT
- Redirige vers `/dashboard` (OWNER) ou `/` driver layout (DRIVER)

#### `/register`
- Formulaire : nom + numéro de téléphone + mot de passe + confirmation
- Crée un compte OWNER uniquement
- Redirige vers `/dashboard` après succès

---

### (owner) — Propriétaire authentifié

#### `/dashboard`
- **Stats globales** : total recettes, total dépenses, bénéfice net
- **Tableau par véhicule** : recettes / dépenses / bénéfice du mois en cours
- **Lignes récentes** non signées (rappel au propriétaire)
- Filtre par période (mois/semaine/custom)

#### `/vehicles`
- Liste des véhicules (carte par véhicule : immatriculation, marque, chauffeur)
- Bouton "Ajouter un véhicule"
- Indicateur : nombre de recettes non signées par véhicule

#### `/vehicles/new`
- Formulaire : immatriculation, marque, modèle, couleur

#### `/vehicles/[id]`
- Fiche du véhicule (infos + stats rapides)
- Navigation rapide : Recettes | Dépenses | Chauffeur

#### `/vehicles/[id]/revenues`
- Tableau des recettes (date, montant, chauffeur, statut signature)
- Bouton "Ajouter une recette"
- Filtre : période, statut (signé / en attente)
- Badge coloré : ✅ Signé | ⏳ En attente

#### `/vehicles/[id]/expenses`
- Tableau des dépenses (date, montant, libellé)
- Bouton "Ajouter une dépense"
- Filtre : période

#### `/vehicles/[id]/driver`
- Fiche du chauffeur actuel (nom, téléphone)
- Formulaire de création si aucun chauffeur
- Bouton "Changer le mot de passe" du chauffeur

---

### (driver) — Chauffeur authentifié

#### `/` (driver home)
- Liste des lignes **en attente de sa signature**
- Chaque ligne affiche : date, montant, véhicule
- **Bouton "Je confirme"** sur chaque ligne → appel PATCH /revenues/:id/sign
- Confirmation dialog avant signature

#### `/history`
- Historique des lignes signées par le chauffeur
- Affiche : date, montant, date de signature

---

## Composants clés

| Composant          | Usage |
|--------------------|-------|
| `SignButton`       | Bouton de confirmation chauffeur avec dialog de confirmation |
| `RevenueTable`     | Tableau recettes (réutilisé owner + driver) |
| `ExpenseTable`     | Tableau dépenses |
| `VehicleCard`      | Carte véhicule dans la liste |
| `StatCard`         | Tuile statistique (montant + label + variation) |
| `PeriodFilter`     | Sélecteur de période (mois/semaine/custom) |
| `AuthGuard`        | HOC / middleware protection des routes |

---

## Gestion de l'état

| Outil             | Usage |
|-------------------|-------|
| `zustand`         | Store auth (user, tokens, logout) |
| `TanStack Query`  | Cache des données API (véhicules, recettes, dépenses) |
| `next/navigation` | Redirections après auth |

---

## PWA

| Fichier              | Description |
|----------------------|-------------|
| `public/manifest.json` | Nom, icônes, couleur thème, display: standalone |
| `next.config.js`     | Config `next-pwa` (service worker, cache) |
| Icônes               | 192x192 + 512x512 (logo Yango Fleet) |
