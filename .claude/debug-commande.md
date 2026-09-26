# Skill : debug-commande

Diagnostiquer un problème lié à une commande ou à un paiement sur DJASSA — stock non mis à jour, paiement confirmé mais commande bloquée, réservation non libérée, double décrément, etc.

## Déclenchement
Utiliser quand le message contient : « bug commande », « paiement confirmé mais commande toujours en attente », « stock pas décrémenté », « double décrément », « réservation bloquée », « commande coincée », « webhook raté ».

## Méthode de diagnostic

### 1. Collecter les identifiants
Demander si non fournis :
- `order_id` ou numéro de commande
- `payment_id` ou référence du fournisseur de paiement
- Heure approximative du problème

### 2. Reconstituer la chronologie de la commande

```sql
-- Cycle de vie de la commande
SELECT id, statut, created_at, updated_at
FROM orders WHERE id = '<order_id>';

-- Sous-commandes par vendeur
SELECT id, seller_id, statut, commission, created_at
FROM seller_orders WHERE order_id = '<order_id>';

-- Articles commandés avec quantités figées
SELECT oi.*, pv.sku
FROM order_items oi
JOIN product_variants pv ON pv.id = oi.variant_id
WHERE oi.seller_order_id IN (SELECT id FROM seller_orders WHERE order_id = '<order_id>');

-- Paiements associés
SELECT id, fournisseur, reference_externe, montant, statut, created_at, updated_at
FROM payments WHERE order_id = '<order_id>';
```

### 3. Vérifier les mouvements de stock

```sql
-- Tous les mouvements liés à cette commande
SELECT sm.*, pv.sku
FROM stock_movements sm
JOIN product_variants pv ON pv.id = sm.variant_id
WHERE sm.reference_source = '<order_id>'
ORDER BY sm.created_at;

-- État actuel du stock pour les variantes concernées
SELECT sl.*, pv.sku
FROM stock_levels sl
JOIN product_variants pv ON pv.id = sl.variant_id
WHERE sl.variant_id IN (
  SELECT variant_id FROM order_items
  WHERE seller_order_id IN (SELECT id FROM seller_orders WHERE order_id = '<order_id>')
);
```

### 4. Vérifier les webhooks de paiement

```sql
-- Événements de paiement reçus
SELECT * FROM audit_logs
WHERE action LIKE '%webhook%' AND entite LIKE '%<reference_externe>%'
ORDER BY created_at;
```

Chercher dans les logs applicatifs :
- Le webhook a-t-il été reçu ?
- La signature a-t-elle été vérifiée ?
- L'événement était-il déjà traité (idempotence) ?
- Une exception a-t-elle été levée lors du traitement ?

### 5. Arbre de diagnostic selon le symptôme

**Paiement confirmé chez le fournisseur, commande toujours `pending`** :
→ Le webhook n'est pas arrivé (vérifier URL, firewall, HTTPS)
→ Le webhook est arrivé mais la signature a échoué (vérifier la clé de signature en production)
→ Le webhook a déclenché une exception (chercher l'erreur dans les logs)

**Stock non décrémenté après paiement confirmé** :
→ Le webhook a-t-il déclenché `StockService.convertReservationToSale()` ?
→ La transaction a-t-elle été commitée ?
→ Y a-t-il eu une exception silencieuse ?

**Double décrément** :
→ Le webhook a-t-il été reçu deux fois ?
→ L'idempotence est-elle implémentée (vérification de l'`event_id`) ?

**Réservation non libérée après annulation** :
→ Le job d'expiration des réservations tourne-t-il ? (`SELECT * FROM scheduled_jobs WHERE name = 'release-expired-reservations'`)
→ L'annulation a-t-elle appelé `StockService.releaseReservation()` ?

**Stock négatif** :
→ La contrainte `CHECK` est-elle en place en base ?
→ Y a-t-il eu un ajustement manuel sans contrôle ?

### 6. Correction manuelle (en dernier recours)

Si un mouvement de correction manuelle est nécessaire, documenter impérativement :

```sql
-- Insérer un mouvement de correction (à adapter)
INSERT INTO stock_movements (variant_id, location_id, seller_id, type, quantite, motif, auteur_id, created_at)
VALUES ('<variant_id>', '<location_id>', '<seller_id>', 'ajustement', <delta>, 'Correction manuelle suite au bug commande <order_id>', '<admin_id>', NOW());

-- Mettre à jour le niveau dans la même transaction
UPDATE stock_levels SET
  qty_on_hand = qty_on_hand + <delta>,
  qty_available = qty_available + <delta>,
  updated_at = NOW()
WHERE variant_id = '<variant_id>' AND location_id = '<location_id>';
```

⚠️ Toujours faire valider par un deuxième membre de l'équipe avant d'exécuter en production.

## Livrable
Produire un rapport de diagnostic avec :
1. Chronologie reconstituée de la commande
2. Cause racine identifiée
3. Impact sur le stock (écart constaté)
4. Correction appliquée ou recommandée
5. Action préventive pour éviter la récurrence
