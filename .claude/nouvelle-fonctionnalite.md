# Skill : nouvelle-fonctionnalite

Orchestrer le développement complet d'une fonctionnalité DJASSA, de la spécification aux tests, en suivant le bon enchaînement d'agents.

## Déclenchement
Utiliser quand le message contient : « nouvelle fonctionnalité », « implémenter », « développer », « ajouter la feature », « je veux que le vendeur puisse… », « je veux que l'acheteur puisse… ».

## Workflow à suivre

### Étape 1 — Spécification (agent `product-analyst`)
Avant d'écrire une ligne de code, déléguer à `product-analyst` pour produire :
- Les user stories (En tant que <rôle>…)
- Les critères d'acceptation (Given / When / Then)
- Les règles métier (RG-xx)
- Les cas limites, notamment ceux liés au stock

Afficher la spécification produite et demander une validation avant de continuer.

### Étape 2 — Impact architectural (agent `architect`)
Si la fonctionnalité touche à :
- Un nouveau module ou une nouvelle API
- La concurrence sur le stock (ex. réservation, décrémentation)
- Un flux de paiement
- L'isolation entre vendeurs

→ Déléguer à `architect` pour obtenir un ADR ou un schéma de flux.
Sinon, passer directement à l'étape 3.

### Étape 3 — Schéma et migrations (agent `database-engineer`)
Si la fonctionnalité modifie le schéma de base de données :
- Déléguer à `database-engineer` pour la conception des tables / colonnes.
- Toute modification de stock doit passer par le journal `stock_movements` + mise à jour de `stock_levels` dans la même transaction.
- Vérifier les contraintes : `qty_on_hand >= 0`, `qty_reserved >= 0`.

### Étape 4 — Implémentation (agents `backend-developer` et `frontend-developer`)
Lancer les deux en parallèle si possible :
- `backend-developer` : endpoints API, logique métier, validation, tests unitaires et d'intégration.
- `frontend-developer` : interface (mobile first), états vide / chargement / erreur, formatage FCFA.

Rappels obligatoires :
- Toute modification de stock passe par `StockService` (jamais de mise à jour directe).
- Vérifier que `seller_id` est contrôlé côté serveur sur chaque endpoint.
- Inclure un test : le vendeur A ne peut pas accéder aux données du vendeur B.

### Étape 5 — Tests (agent `qa-tester`)
- Vérifier que chaque critère d'acceptation de l'étape 1 est couvert.
- Ajouter les scénarios de stock critiques (survente, expiration, double webhook).
- Exécuter les tests et rapporter le résultat réel.

### Étape 6 — Revue sécurité (agent `security-reviewer`)
Obligatoire si la fonctionnalité touche à :
- L'authentification ou les autorisations
- Un flux de paiement
- Des uploads de fichiers
- L'accès aux données d'un vendeur

→ Déléguer à `security-reviewer` pour un rapport de sécurité avant de merger.

## Récapitulatif du flux
```
product-analyst → [architect] → [database-engineer] → backend-developer + frontend-developer → qa-tester → [security-reviewer]
```
Les étapes entre crochets sont conditionnelles.

## Règle d'or
Ne pas passer à l'étape suivante si l'étape en cours a produit des questions ouvertes non résolues ou des points **[À valider]**.
