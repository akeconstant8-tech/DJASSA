# 🛍️ DJASSA

**Marketplace web multi-vendeurs avec gestion de stock en temps réel**

> Plateforme e-commerce où des vendeurs gèrent leurs boutiques et leurs stocks, et où des acheteurs peuvent commander auprès de plusieurs vendeurs en un seul paiement.

![Version](https://img.shields.io/badge/version-0.1.0--alpha-blue)
![Statut](https://img.shields.io/badge/statut-en%20développement-orange)
![Langue](https://img.shields.io/badge/langue-Français-green)
![Devise](https://img.shields.io/badge/devise-FCFA%20%2F%20XOF-yellow)

---

## Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités principales](#-fonctionnalités-principales)
- [Architecture et stack](#-architecture-et-stack)
- [Démarrage rapide](#-démarrage-rapide)
- [Structure du projet](#-structure-du-projet)
- [Agents et skills Claude Code](#-agents-et-skills-claude-code)
- [Cahier des charges](#-cahier-des-charges)
  - [Acteurs et rôles](#acteurs-et-rôles)
  - [Module de stock](#module-de-stock--cœur-du-système)
  - [Règles métier](#règles-métier)
  - [Modèle de données](#modèle-de-données)
  - [Exigences non fonctionnelles](#exigences-non-fonctionnelles)
  - [Planning](#planning)
  - [Critères de recette](#critères-de-recette)
- [Questions ouvertes](#-questions-ouvertes)
- [Contribuer](#-contribuer)

---

## 🌍 À propos

DJASSA est une marketplace web pensée pour **l'Afrique de l'Ouest francophone**. Elle répond à deux besoins :

1. **Pour les vendeurs** — un espace pour publier leurs produits et gérer leur stock en temps réel, depuis un téléphone ou un ordinateur, sans avoir besoin de formation technique.
2. **Pour les acheteurs** — un catalogue unique pour trouver des produits auprès de plusieurs vendeurs et payer en un seul geste (Mobile Money, carte, paiement à la livraison).

### Objectifs mesurables

| Objectif | Indicateur |
|----------|-----------|
| Stock fiable | Zéro vente d'un produit en rupture (pas de survente) |
| Prise en main rapide | Création d'un produit + saisie du stock en moins de 3 minutes |
| Expérience achat fluide | Panier → paiement en 5 étapes maximum |
| Revenus plateforme | Commission prélevée automatiquement sur chaque vente |

---

## ✨ Fonctionnalités principales

### Pour les vendeurs
- 🏪 **Boutique personnalisée** — profil, logo, description, horaires
- 📦 **Catalogue produits** — variantes (taille, couleur), photos, SKU, prix promotionnels
- 📊 **Gestion de stock en temps réel** — entrées, sorties, historique des mouvements, alertes de stock bas
- 🧾 **Gestion des commandes** — réception, préparation, expédition, retours
- 💰 **Tableau de bord finances** — chiffre d'affaires, commissions, reversements

### Pour les acheteurs
- 🔍 **Recherche et catalogue** — filtres par catégorie, prix, vendeur, disponibilité
- 🛒 **Panier multi-vendeurs** — un seul paiement pour plusieurs vendeurs
- 📱 **Paiement Mobile Money** — Orange Money, MTN MoMo, Moov, Wave
- 📬 **Suivi de commande** — notifications à chaque étape

### Pour les administrateurs
- ✅ **Validation des vendeurs** — KYC, activation, suspension
- ⚖️ **Litiges et modération** — produits, avis, commandes
- 📈 **Statistiques globales** — plateforme, vendeurs, catégories

---

## 🏗️ Architecture et stack

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT                           │
│         Next.js · React · TypeScript                │
│         Tailwind CSS · Mobile First                 │
│   ┌──────────────┬──────────────┬────────────────┐  │
│   │ Vitrine      │ Espace       │ Back-office    │  │
│   │ acheteur     │ vendeur      │ admin          │  │
│   └──────────────┴──────────────┴────────────────┘  │
└─────────────────────────┬───────────────────────────┘
                          │ REST API /api/v1
┌─────────────────────────▼───────────────────────────┐
│                    SERVEUR                          │
│          NestJS · Node.js · TypeScript              │
│  ┌────────┬──────────┬────────┬────────┬─────────┐  │
│  │ auth   │ catalog  │ stock  │ orders │payments │  │
│  │ users  │ sellers  │ levels │ items  │payouts  │  │
│  └────────┴──────────┴────────┴────────┴─────────┘  │
│  ┌───────────────────┐  ┌──────────────────────────┐ │
│  │ notifications     │  │ admin · audit            │ │
│  └───────────────────┘  └──────────────────────────┘ │
└───────────┬───────────────────────────┬─────────────┘
            │                           │
┌───────────▼──────────┐   ┌────────────▼────────────┐
│    PostgreSQL         │   │    Redis + BullMQ        │
│  Données + Stock      │   │  Cache · Files · Jobs    │
└──────────────────────┘   └─────────────────────────┘
```

### Stack technique

| Couche | Technologie | Rôle |
|--------|------------|------|
| Frontend | Next.js 14 + TypeScript | Rendu serveur (SEO), espace vendeur, admin |
| Styles | Tailwind CSS | Design system, mobile first |
| Backend | NestJS + TypeScript | API REST, logique métier |
| Base de données | PostgreSQL | ACID — indispensable pour l'intégrité du stock |
| ORM | Prisma | Migrations versionnées, typage |
| Cache / files | Redis + BullMQ | Expiration des réservations, jobs async |
| Recherche | PostgreSQL full-text → Meilisearch | Simple au départ, scalable ensuite |
| Fichiers | S3-compatible + CDN | Photos produits |
| Paiement | Agrégateur Mobile Money | Couverture multi-opérateurs |
| Infra | Docker + GitHub Actions | Dev local reproductible, CI/CD |

---

## 🚀 Démarrage rapide

> ⚠️ Pré-requis : Docker Desktop, Node.js 20+, pnpm

```bash
# 1. Cloner le dépôt
git clone https://github.com/djassa/djassa.git
cd djassa

# 2. Copier les variables d'environnement
cp .env.example .env
# → Remplir les valeurs dans .env

# 3. Démarrer l'infrastructure locale
docker compose up -d

# 4. Installer les dépendances
pnpm install

# 5. Appliquer les migrations
pnpm db:migrate

# 6. Insérer les données de test
pnpm db:seed

# 7. Lancer l'application
pnpm dev
```

| Service | URL locale |
|---------|-----------|
| Vitrine acheteur | http://localhost:3000 |
| Espace vendeur | http://localhost:3000/vendeur |
| Back-office admin | http://localhost:3000/admin |
| API REST | http://localhost:3001/api/v1 |
| Documentation API | http://localhost:3001/api/docs |
| Interface base de données | http://localhost:5555 (Prisma Studio) |
| Interface mails (dev) | http://localhost:8025 (Mailhog) |

### Commandes utiles

```bash
pnpm dev              # Lancer en mode développement
pnpm test             # Tests unitaires et d'intégration
pnpm test:e2e         # Tests bout en bout
pnpm db:migrate       # Appliquer les migrations
pnpm db:migrate:dev   # Créer une migration (développement)
pnpm db:seed          # Insérer les données de test
pnpm lint             # Vérifier le code
pnpm build            # Build de production
```

---

## 📁 Structure du projet

```
djassa/
├── apps/
│   ├── web/              # Frontend Next.js
│   │   ├── app/          # Pages et layouts (App Router)
│   │   ├── components/   # Composants réutilisables
│   │   └── lib/          # Utilitaires, hooks, API client
│   └── api/              # Backend NestJS
│       ├── src/
│       │   ├── auth/
│       │   ├── catalogue/
│       │   ├── stock/        ← Module central
│       │   ├── orders/
│       │   ├── payments/
│       │   ├── notifications/
│       │   └── admin/
│       └── prisma/
│           ├── schema.prisma
│           └── migrations/
├── docs/
│   ├── adr/              # Architecture Decision Records
│   └── runbooks/         # Procédures opérationnelles
├── .claude/
│   ├── agents/           # Sous-agents Claude Code spécialisés
│   └── *.md              # Skills (workflows Claude Code)
└── docker-compose.yml
```

---

## 🤖 Agents et skills Claude Code

Ce projet intègre des **agents** et des **skills** Claude Code pour assister le développement.

### Agents — experts spécialisés

Chaque agent a un rôle précis et est invoqué automatiquement par Claude selon le contexte.

| Agent | Rôle | Quand l'utiliser |
|-------|------|-----------------|
| [`product-analyst`](.claude/agents/product-analyst.md) | User stories, critères d'acceptation, règles métier | Avant de développer une fonctionnalité |
| [`architect`](.claude/agents/architect.md) | Architecture, ADR, concurrence sur le stock | Décisions techniques structurantes |
| [`database-engineer`](.claude/agents/database-engineer.md) | Schéma PostgreSQL, migrations, intégrité du stock | Toute modification de la base |
| [`backend-developer`](.claude/agents/backend-developer.md) | API REST, logique métier, StockService | Implémentation côté serveur |
| [`frontend-developer`](.claude/agents/frontend-developer.md) | Vitrine, espace vendeur, admin (mobile first) | Implémentation des interfaces |
| [`payments-integrator`](.claude/agents/payments-integrator.md) | Mobile Money, webhooks, commissions, reversements | Tout ce qui touche à l'argent |
| [`security-reviewer`](.claude/agents/security-reviewer.md) | Audit sécurité — lecture seule, rapport uniquement | Après modification sensible, avant chaque déploiement |
| [`qa-tester`](.claude/agents/qa-tester.md) | Tests, scénarios de stock et de paiement | Après chaque fonctionnalité, à chaque bug |
| [`devops-engineer`](.claude/agents/devops-engineer.md) | Docker, CI/CD, sauvegardes, supervision | Infrastructure et déploiements |

### Skills — workflows métier

Invoquables en décrivant l'action souhaitée dans le chat.

| Skill | Usage typique |
|-------|--------------|
| [`nouvelle-fonctionnalite`](.claude/nouvelle-fonctionnalite.md) | *« Ajouter la gestion des retours »* |
| [`nouvel-endpoint`](.claude/nouvel-endpoint.md) | *« Créer l'endpoint de mouvements de stock »* |
| [`nouvelle-migration`](.claude/nouvelle-migration.md) | *« Ajouter la colonne seuil_alerte »* |
| [`verifier-stock`](.claude/verifier-stock.md) | *« Le stock semble incohérent »* |
| [`audit-isolation-vendeur`](.claude/audit-isolation-vendeur.md) | *« Audit sécurité avant la mise en production »* |
| [`checklist-deploiement`](.claude/checklist-deploiement.md) | *« On est prêts à déployer ? »* |
| [`debug-commande`](.claude/debug-commande.md) | *« Paiement confirmé mais commande bloquée »* |
| [`onboarding-vendeur`](.claude/onboarding-vendeur.md) | *« Implémenter l'inscription vendeur »* |
| [`rapport-stock`](.claude/rapport-stock.md) | *« Générer un bilan de stock »* |

### Flux de développement recommandé

```
1. product-analyst   → Spécification (user stories + règles métier)
2. architect         → Décision technique si impact structurant
3. database-engineer → Migration si le schéma change
4. backend-developer │
   frontend-developer│ → Implémentation (en parallèle)
5. qa-tester         → Tests (couvrir les scénarios de stock)
6. security-reviewer → Audit avant mise en production
```

---

## 📋 Cahier des charges

> Version 0.1 · 26/09/2026 — Les points **[À valider]** sont des hypothèses à confirmer.

### Acteurs et rôles

| Rôle | Description | Accès |
|------|-------------|-------|
| **Visiteur** | Non connecté | Catalogue en lecture |
| **Acheteur** | Client inscrit | Panier, commandes, avis |
| **Vendeur** | Commerçant validé | Boutique, produits, stock, commandes, finances |
| **Employé vendeur** *(P2)* | Collaborateur d'un vendeur | Stock et commandes uniquement |
| **Administrateur** | Équipe DJASSA | Back-office complet |

---

### Module de stock — cœur du système

#### Principes

Le stock est géré **par variante de produit** et **par emplacement**. Chaque variation est un **mouvement horodaté** avec auteur et motif — l'historique est toujours consultable et le stock courant est toujours recalculable.

Trois quantités sont suivies :

```
qty_on_hand    — stock physique réel
qty_reserved   — engagé dans des commandes non finalisées
qty_available  — ce qui est affiché aux acheteurs (= on_hand − reserved)
```

> La règle absolue : **`qty_available` ne peut jamais être négatif.**

#### Types de mouvements

| Type | Déclencheur | Effet |
|------|-------------|-------|
| **Entrée** | Vendeur : réception marchandise | + physique |
| **Sortie manuelle** | Vendeur : casse, perte, vente hors plateforme | − physique |
| **Réservation** | Commande validée par l'acheteur | + réservé |
| **Libération** | Annulation ou paiement expiré | − réservé |
| **Vente** | Paiement confirmé (ou expédition si paiement à la livraison) | − physique, − réservé |
| **Retour** | Retour client accepté | + physique (si revendable) |
| **Ajustement** | Comptage physique par le vendeur | ± physique (écart tracé) |
| **Transfert** *(P2)* | Déplacement entre emplacements | − origine, + destination |

---

### Règles métier

| Réf. | Règle |
|------|-------|
| **RG-01** | Le stock disponible ne peut jamais être négatif. Une commande dépassant le disponible est refusée. |
| **RG-02** | Deux acheteurs commandent la dernière unité au même moment → une seule commande est acceptée (verrou transactionnel). |
| **RG-03** | Stock réservé à la validation. Sans paiement dans les **30 min** *(À valider)* → libération automatique et commande annulée. |
| **RG-04** | Stock décrémenté au paiement confirmé (en ligne) ou à l'expédition (paiement à la livraison). |
| **RG-05** | Seule la notification serveur du fournisseur de paiement (webhook signé) ou un appel de vérification fait foi. |
| **RG-06** | Toute annulation avant expédition libère automatiquement le stock réservé. |
| **RG-07** | Un retour n'est remis en stock que si le vendeur déclare le produit revendable. |
| **RG-08** | Tout ajustement manuel exige un motif et enregistre son auteur. |
| **RG-09** | Un vendeur n'accède qu'à ses propres données. Contrôle du `seller_id` côté serveur, jamais côté client. |
| **RG-10** | Panier multi-vendeurs → une sous-commande par vendeur, un seul paiement pour l'acheteur. |
| **RG-11** | Commission calculée sur le montant produits hors livraison *(À valider)*, prélevée avant reversement. |
| **RG-12** | Produit supprimé → archivé (`deleted_at`). Visible dans l'historique, masqué du catalogue. |
| **RG-13** | Vendeur suspendu → produits masqués. Commandes en cours à honorer ou annuler. |
| **RG-14** | Alerte stock bas envoyée une seule fois au franchissement du seuil, réarmée après réapprovisionnement. |

---

### Modèle de données

```sql
users           — id, email, téléphone, mot_de_passe_hashé, rôle, statut
sellers         — id, user_id, nom_boutique, statut, taux_commission
categories      — id, parent_id, nom, slug
products        — id, seller_id, category_id, titre, statut, deleted_at
product_variants— id, product_id, seller_id, sku, attributs, prix, coût_achat, seuil_alerte
locations       — id, seller_id, nom, adresse
stock_levels    — variant_id, location_id, seller_id,
                  qty_on_hand, qty_reserved, qty_available
                  CHECK (qty_on_hand >= 0)
                  CHECK (qty_reserved >= 0)
                  CHECK (qty_available = qty_on_hand - qty_reserved)
stock_movements — id, variant_id, location_id, seller_id, type, quantité,
                  motif, référence_source, auteur_id, created_at
orders          — id, buyer_id, total, statut, clé_idempotence
seller_orders   — id, order_id, seller_id, sous_total, commission, statut
order_items     — id, seller_order_id, variant_id, quantité, prix_unitaire_figé
payments        — id, order_id, fournisseur, référence_externe, montant, statut
payouts         — id, seller_id, montant, période, statut
audit_logs      — id, acteur_id, action, entité, avant, après, created_at
```

> **Convention** : tous les montants sont en **entiers** (le FCFA n'a pas de subdivision). Jamais de `float` pour l'argent.

---

### Exigences non fonctionnelles

| Domaine | Exigence |
|---------|---------|
| **Performance** | Pages vitrine < 2 s sur 3G · API < 300 ms au p95 |
| **Mobile** | Mobile first — espace vendeur utilisable sur smartphone |
| **Disponibilité** | 99,5 % · maintenance planifiée annoncée |
| **Sécurité** | HTTPS partout · argon2/bcrypt · OWASP Top 10 · isolation vendeurs · rate limiting |
| **Données personnelles** | Conformité réglementation locale · consentement · droit d'accès et suppression |
| **Sauvegardes** | Quotidiennes · rétention 30 jours · restauration testée chaque mois |
| **Traçabilité** | Journal d'audit sur les actions sensibles (stock, prix, droits) |
| **Accessibilité** | WCAG 2.1 AA visé |
| **SEO** | Rendu serveur des pages catalogue · URLs lisibles · sitemap |
| **Qualité** | CI obligatoire avant fusion · tests automatisés sur stock et paiement |

---

### Planning

| Lot | Contenu | Durée |
|-----|---------|-------|
| **Lot 0 — Cadrage** | Validation du cahier des charges, maquettes, choix prestataires, ADR d'architecture | 2 sem. |
| **Lot 1 — Socle** | Docker, CI, authentification, rôles, onboarding vendeur, back-office minimal | 3 sem. |
| **Lot 2 — Catalogue et stock** | Produits, variantes, photos, mouvements de stock, alertes, historique | 4 sem. |
| **Lot 3 — Vitrine et commandes** | Catalogue public, recherche, panier multi-vendeurs, réservation de stock | 4 sem. |
| **Lot 4 — Paiements et finances** | Mobile Money, paiement à la livraison, commissions, soldes, reversements | 3 sem. |
| **Lot 5 — MVP et lancement** | Recette, tests de charge, audit sécurité, production, vendeurs pilotes | 2 sem. |
| **Lot 6 — Évolutions** | Inventaires, multi-emplacements, CSV, avis, statistiques avancées… | Continu |

---

### Critères de recette

Le MVP est accepté lorsque :

- [ ] Toutes les fonctions **P1** sont livrées et testées
- [ ] Test de concurrence : 50 commandes simultanées sur un produit à 10 unités → exactement 10 acceptées, stock final = 0
- [ ] Webhook de paiement reçu deux fois → un seul décrément de stock
- [ ] Réservations expirées libérées automatiquement dans le délai configuré
- [ ] Le vendeur A ne peut accéder à aucune donnée du vendeur B (tests automatisés)
- [ ] Audit de sécurité : aucune faille critique ou haute non corrigée
- [ ] Objectifs de performance atteints en préproduction
- [ ] Restauration d'une sauvegarde testée avec succès

---

## ❓ Questions ouvertes

| # | Question | Impact |
|---|----------|--------|
| Q1 | Pays de lancement exact ? Devise(s) et langue(s) additionnelles ? | Localisation, réglementation |
| Q2 | Qui assure la livraison — vendeur, partenaire logistique, plateforme ? | Module livraison, frais |
| Q3 | Modèle économique — commission seule, abonnement, ou les deux ? Taux ? | Module finances |
| Q4 | Quel agrégateur Mobile Money retenir ? | Lot 4, intégration paiement |
| Q5 | Les vendeurs vendent-ils aussi en physique (synchronisation caisse) ? | Module stock |
| Q6 | Application mobile native ou site responsive / PWA suffit au lancement ? | Architecture frontend |
| Q7 | Politique de retour et de remboursement ? | RG-07, module commandes |
| Q8 | Délai d'expiration des réservations et délai de reversement vendeurs ? | RG-03, module paiements |

---

## 🤝 Contribuer

### Avant de commencer

1. Lire ce README et les [ADR](docs/adr/) pour comprendre les décisions prises.
2. Pour chaque fonctionnalité, commencer par la spécification avec l'agent `product-analyst`.
3. Respecter le flux : **spec → architecture → migration → code → tests → sécurité**.

### Conventions de code

- **Branches** : `feat/nom-fonctionnalite`, `fix/description-bug`, `chore/tache`
- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/fr) (`feat:`, `fix:`, `chore:`, `test:`)
- **PR** : description du changement + lien vers la user story + tests passants en CI obligatoire
- **Montants** : toujours en entiers (FCFA), jamais en float
- **Stock** : toujours via `StockService`, jamais de mise à jour directe de `stock_levels`
- **Isolation** : `seller_id` vérifié côté serveur sur tout endpoint vendeur

### Ressources

- [Documentation API](http://localhost:3001/api/docs) (Swagger — en local)
- [Architecture Decision Records](docs/adr/)
- [Runbooks opérationnels](docs/runbooks/)
- [Agents Claude Code](.claude/agents/)
- [Skills Claude Code](.claude/)

---

<div align="center">
  <sub>DJASSA — Marketplace multi-vendeurs · Afrique de l'Ouest · v0.1.0-alpha</sub>
</div>
