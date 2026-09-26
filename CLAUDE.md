# DJASSA — Contexte projet pour Claude Code

Marketplace web multi-vendeurs avec gestion de stock en temps réel.  
Vendeurs gèrent leurs boutiques et stocks ; acheteurs commandent auprès de plusieurs vendeurs en un seul paiement (Mobile Money, FCFA, Afrique de l'Ouest).

> Cahier des charges complet : [README.md](README.md)

---

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend | NestJS + TypeScript — monolithe modulaire |
| Base de données | PostgreSQL (ACID obligatoire pour le stock) |
| ORM | Prisma (migrations versionnées) |
| Cache / files | Redis + BullMQ |
| Infra | Docker + GitHub Actions |

---

## Règles absolues à respecter dans tout le code

### Stock
- Toute modification de stock passe **exclusivement** par `StockService` — jamais de mise à jour directe de `stock_levels`.
- `StockService` écrit le mouvement (`stock_movements`) **et** met à jour le niveau (`stock_levels`) dans **une seule transaction**.
- `qty_available` ne peut jamais être négatif (`CHECK qty_on_hand >= 0`, `CHECK qty_reserved >= 0`).
- Cycle : **réservation** (commande validée) → **décrément** (paiement confirmé) → **libération** (annulation ou expiration après 30 min).

### Isolation multi-vendeurs
- Chaque table propriétaire d'un vendeur contient `seller_id` (NOT NULL, indexé).
- Tout endpoint qui prend un identifiant de ressource vérifie **côté serveur** que `resource.seller_id === user.sellerId`.
- Jamais de `seller_id` accepté dans le body d'une requête client.

### Paiements
- Seul un webhook signé du fournisseur (ou un appel de vérification à son API) confirme un paiement — jamais la redirection navigateur.
- Chaque webhook est traité de façon **idempotente** (l'`event_id` est stocké).

### Données
- Montants en **entiers** (FCFA, pas de subdivision). Jamais de `float` pour l'argent.
- Suppression **logique** (`deleted_at`) pour produits et vendeurs — jamais de `DELETE` SQL sur ces entités.

---

## Modules backend

```
auth · users · sellers · catalogue · stock · orders · payments · payouts · notifications · admin · audit
```

---

## Agents disponibles

| Quand | Agent à utiliser |
|-------|----------------|
| Avant de coder une fonctionnalité | `product-analyst` |
| Décision technique structurante | `architect` |
| Modification du schéma PostgreSQL | `database-engineer` |
| Endpoint API ou logique métier | `backend-developer` |
| Interface (vitrine, espace vendeur, admin) | `frontend-developer` |
| Paiement, webhook, commission, reversement | `payments-integrator` |
| Avant chaque mise en production | `security-reviewer` |
| Tests et reproduction de bugs | `qa-tester` |
| Docker, CI/CD, déploiement | `devops-engineer` |

---

## Skills disponibles

| Situation | Skill |
|-----------|-------|
| Développer une nouvelle fonctionnalité | `nouvelle-fonctionnalite` |
| Créer un endpoint API | `nouvel-endpoint` |
| Créer une migration de base de données | `nouvelle-migration` |
| Vérifier la cohérence du stock | `verifier-stock` |
| Auditer l'isolation entre vendeurs | `audit-isolation-vendeur` |
| Vérifier si le déploiement est prêt | `checklist-deploiement` |
| Diagnostiquer un bug de commande/paiement | `debug-commande` |
| Implémenter l'inscription d'un vendeur | `onboarding-vendeur` |
| Générer un rapport de stock | `rapport-stock` |

---

## Conventions de code

- **Branches** : `feat/nom`, `fix/description`, `chore/tache`
- **Commits** : Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`)
- **Routes API** : `/api/v1/<ressource>` — noms au pluriel, kebab-case
- **Tests** : unitaires sur la logique métier + intégration sur les endpoints. Toujours inclure : vendeur A ne peut pas accéder aux données du vendeur B.
- **Migrations** : une modification par fichier, réversible, jamais modifier une migration déjà appliquée.
