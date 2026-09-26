# Skill : rapport-stock

Générer un rapport de stock pour un vendeur : état des stocks, produits en rupture, produits en stock bas, valeur totale du stock, mouvements récents.

## Déclenchement
Utiliser quand le message contient : « rapport stock », « état du stock », « bilan stock », « valorisation stock », « produits en rupture », « stock bas », « inventaire vendeur ».

## Données à collecter et calculer

### 1. Vue d'ensemble par variante

```sql
SELECT
  p.titre AS produit,
  pv.sku,
  pv.attributs,
  sl.qty_on_hand AS stock_physique,
  sl.qty_reserved AS stock_réservé,
  sl.qty_available AS stock_disponible,
  pv.seuil_alerte,
  CASE
    WHEN sl.qty_available = 0 THEN 'RUPTURE'
    WHEN sl.qty_available <= pv.seuil_alerte THEN 'BAS'
    ELSE 'OK'
  END AS statut,
  pv.cout_achat,
  (sl.qty_on_hand * pv.cout_achat) AS valorisation
FROM stock_levels sl
JOIN product_variants pv ON pv.id = sl.variant_id
JOIN products p ON p.id = pv.product_id
WHERE sl.seller_id = '<seller_id>'
  AND p.deleted_at IS NULL
ORDER BY statut DESC, produit;
```

### 2. Totaux du rapport

| Indicateur | Calcul |
|-----------|--------|
| Nombre de références | `COUNT(DISTINCT variant_id)` |
| Références en rupture | `COUNT WHERE qty_available = 0` |
| Références en stock bas | `COUNT WHERE qty_available <= seuil_alerte AND qty_available > 0` |
| Valeur totale du stock | `SUM(qty_on_hand * cout_achat)` en FCFA |
| Réservations en cours | `SUM(qty_reserved)` |

### 3. Mouvements des 30 derniers jours (par type)

```sql
SELECT
  type,
  COUNT(*) AS nb_mouvements,
  SUM(ABS(quantite)) AS total_unites
FROM stock_movements
WHERE seller_id = '<seller_id>'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY type
ORDER BY nb_mouvements DESC;
```

### 4. Top 5 produits les plus vendus (30 derniers jours)

```sql
SELECT pv.sku, p.titre, SUM(sm.quantite) AS unites_vendues
FROM stock_movements sm
JOIN product_variants pv ON pv.id = sm.variant_id
JOIN products p ON p.id = pv.product_id
WHERE sm.seller_id = '<seller_id>'
  AND sm.type = 'vente'
  AND sm.created_at >= NOW() - INTERVAL '30 days'
GROUP BY pv.sku, p.titre
ORDER BY unites_vendues DESC
LIMIT 5;
```

### 5. Alertes à mettre en évidence

Lister de façon prioritaire :
1. 🔴 **Ruptures** : produits avec `qty_available = 0` et `qty_reserved > 0` (commandes en attente de stock).
2. 🟠 **Stock bas** : produits sous le seuil d'alerte.
3. 🟡 **Réservations longues** : réservations datant de plus de 2 × le délai d'expiration (possibles zombies).

## Format du rapport

Présenter le rapport dans cet ordre :
1. **En-tête** : vendeur, date de génération, période analysée.
2. **Chiffres clés** (tableau de bord en haut).
3. **Alertes** (ruptures et stocks bas en priorité).
4. **Tableau complet** par produit/variante.
5. **Mouvements récents** (30 jours).
6. **Top ventes** (30 jours).

Si exporté en CSV : une ligne par variante, colonnes dans l'ordre ci-dessus, montants en FCFA, dates en ISO 8601.
