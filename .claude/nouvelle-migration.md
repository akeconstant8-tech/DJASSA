# Skill : nouvelle-migration

Créer une migration de base de données PostgreSQL de façon sûre et réversible pour DJASSA.

## Déclenchement
Utiliser quand le message contient : « migration », « modifier le schéma », « ajouter une colonne », « nouvelle table », « alter table », « changer la base ».

## Règles impératives

1. **Une modification = une migration** — jamais de groupement non lié dans une même migration.
2. **Toujours réversible** — fournir `up` (appliquer) ET `down` (annuler).
3. **Ne jamais modifier** une migration déjà exécutée en production — créer une nouvelle.
4. **Tester en staging** avant production.
5. **Sauvegarder** avant d'appliquer en production.

## Checklist avant de créer la migration

- [ ] La modification est justifiée par une règle métier documentée dans le README.
- [ ] La migration est réversible sans perte de données (si `down` supprime des données, l'indiquer explicitement).
- [ ] Les contraintes d'intégrité du stock sont préservées : `qty_on_hand >= 0`, `qty_reserved >= 0`, `qty_available = qty_on_hand - qty_reserved`.
- [ ] Les index nécessaires sont créés (colonnes de filtrage : `seller_id`, `variant_id`, `created_at`…).
- [ ] La suppression logique est utilisée si applicable (`deleted_at` plutôt que `DELETE`).

## Checklist spécifique au stock
Si la migration touche `stock_levels` ou `stock_movements` :
- [ ] Le journal `stock_movements` reste la source de vérité — ne pas supprimer de données historiques.
- [ ] `stock_levels` reste recalculable depuis `stock_movements`.
- [ ] Les contraintes `CHECK` sont maintenues ou ajoutées.
- [ ] Ajouter `seller_id` avec un index sur toute nouvelle table propriétaire d'un vendeur.

## Template de migration (Prisma)

```sql
-- Migration: YYYYMMDD_description_courte
-- Description: [ce que fait cette migration et pourquoi]
-- Réversible: oui / attention (préciser si non)

-- UP
ALTER TABLE stock_levels
  ADD COLUMN IF NOT EXISTS seuil_alerte INTEGER NOT NULL DEFAULT 0
    CHECK (seuil_alerte >= 0);

CREATE INDEX IF NOT EXISTS idx_stock_levels_seller_id ON stock_levels(seller_id);

-- DOWN
DROP INDEX IF EXISTS idx_stock_levels_seller_id;
ALTER TABLE stock_levels DROP COLUMN IF EXISTS seuil_alerte;
```

## Procédure d'application en production

1. Annoncer une fenêtre de maintenance si la migration est destructive ou longue.
2. Créer une sauvegarde de la base.
3. Appliquer en staging et vérifier.
4. Appliquer en production via CI/CD (jamais manuellement).
5. Vérifier les métriques après application (erreurs, temps de réponse).
6. En cas de problème : exécuter `down` et investiguer.

## Pièges courants à éviter

| Piège | Alternative sûre |
|-------|-----------------|
| `NOT NULL` sans `DEFAULT` sur une table existante | Ajouter `DEFAULT` ou migrer en deux temps |
| `DROP COLUMN` sans vérifier les dépendances | Chercher toutes les références dans le code |
| `ALTER TYPE` d'une enum | Créer un nouveau type, migrer les données, supprimer l'ancien |
| Index sans `CONCURRENTLY` sur grande table | `CREATE INDEX CONCURRENTLY` (hors transaction) |
| Renommer une colonne sans adapter le code | Faire en deux déploiements |
