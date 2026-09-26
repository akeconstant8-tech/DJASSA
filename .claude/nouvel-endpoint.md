# Skill : nouvel-endpoint

Créer un endpoint API REST en respectant toutes les conventions du projet DJASSA.

## Déclenchement
Utiliser quand le message contient : « créer un endpoint », « nouvelle route », « nouvelle API », « ajouter un endpoint », « GET /… », « POST /… ».

## Checklist de création

### 1. Avant d'écrire le code
- [ ] La fonctionnalité est spécifiée (user stories + règles métier). Si non → lancer le skill `nouvelle-fonctionnalite`.
- [ ] Vérifier qu'un endpoint similaire n'existe pas déjà (`Grep` sur les routes existantes).
- [ ] Identifier le module concerné : `auth | catalogue | stock | orders | payments | notifications | admin`.

### 2. Structure de l'endpoint

**URL** : `/api/v1/<ressource>` — noms au pluriel, kebab-case.

**Méthodes HTTP** :
- `GET` : lecture (pas d'effets de bord).
- `POST` : création d'une ressource.
- `PATCH` : modification partielle.
- `DELETE` : suppression logique (mettre `deleted_at`, jamais de DELETE SQL).

**Format de réponse succès** :
```json
{
  "data": { ... },
  "meta": { "page": 1, "total": 42 }   // pour les listes
}
```

**Format de réponse erreur** :
```json
{
  "error": {
    "code": "STOCK_INSUFFICIENT",
    "message": "Le stock disponible est insuffisant pour cette commande.",
    "details": { "available": 2, "requested": 5 }
  }
}
```

### 3. Sécurité — à vérifier sur chaque endpoint

- [ ] **Authentification** : le middleware vérifie que l'utilisateur est connecté.
- [ ] **Autorisation par rôle** : l'endpoint est accessible uniquement aux rôles autorisés (acheteur / vendeur / admin).
- [ ] **Isolation vendeur** : si l'endpoint accède à une ressource d'un vendeur, vérifier `seller_id === user.sellerId` côté serveur (jamais côté client).
- [ ] **Validation des entrées** : schéma strict (aucun champ non déclaré accepté, types vérifiés, longueurs max).
- [ ] **Pas de données sensibles** dans les logs ou les messages d'erreur.

### 4. Si l'endpoint modifie le stock
- [ ] Passer exclusivement par `StockService` (jamais de mise à jour directe de `stock_levels`).
- [ ] L'opération entière (mouvement + mise à jour niveau) est dans une transaction.
- [ ] Vérifier la contrainte `qty_available >= quantite_demandée` avant toute réservation ou décrément.
- [ ] Endpoint idempotent si création de commande : utiliser une clé d'idempotence.

### 5. Documentation OpenAPI
Ajouter les décorateurs / annotations OpenAPI :
- Description de l'endpoint
- Paramètres (path, query, body) avec types et exemples
- Réponses possibles (200, 201, 400, 401, 403, 404, 409, 500)

### 6. Tests à fournir avec l'endpoint
- [ ] Cas nominal (données valides → réponse attendue).
- [ ] Cas d'erreur de validation (données invalides → 400).
- [ ] Cas non autorisé (rôle incorrect → 403).
- [ ] Cas d'isolation : vendeur A n'accède pas aux données du vendeur B (→ 403 ou 404).
- [ ] Si stock : scénario de concurrence et de double appel.

## Convention de nommage
| Élément | Convention | Exemple |
|---------|-----------|---------|
| Route | kebab-case | `/api/v1/stock-movements` |
| Controller | PascalCase + Controller | `StockMovementsController` |
| Service | PascalCase + Service | `StockService` |
| DTO | PascalCase + Dto | `CreateStockMovementDto` |
| Test | `*.spec.ts` | `stock-movements.controller.spec.ts` |
