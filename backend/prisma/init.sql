-- Contraintes CHECK sur stock_levels
-- Appliquées après les migrations Prisma via ce script d'init PostgreSQL.
-- Ces contraintes garantissent l'intégrité du stock (RG-01).

-- Note : ce fichier est exécuté automatiquement par Docker au premier démarrage.
-- En production, appliquer ces contraintes via une migration Prisma raw SQL.

DO $$
BEGIN
  -- qty_on_hand ne peut jamais être négatif
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_qty_on_hand_non_negative'
  ) THEN
    ALTER TABLE stock_levels
      ADD CONSTRAINT check_qty_on_hand_non_negative CHECK (qty_on_hand >= 0);
  END IF;

  -- qty_reserved ne peut jamais être négatif
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_qty_reserved_non_negative'
  ) THEN
    ALTER TABLE stock_levels
      ADD CONSTRAINT check_qty_reserved_non_negative CHECK (qty_reserved >= 0);
  END IF;

  -- qty_reserved ne peut pas dépasser qty_on_hand
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_reserved_lte_on_hand'
  ) THEN
    ALTER TABLE stock_levels
      ADD CONSTRAINT check_reserved_lte_on_hand CHECK (qty_reserved <= qty_on_hand);
  END IF;
EXCEPTION WHEN others THEN
  -- Les contraintes seront ajoutées par les migrations si les tables n'existent pas encore
  NULL;
END $$;
