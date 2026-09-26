# Skill : verifier-stock

Auditer la cohérence et la fiabilité du module de gestion de stock dans le code existant.

## Déclenchement
Utiliser quand le message contient : « vérifier le stock », « audit stock », « le stock est incohérent », « stock négatif », « bug de quantité », « double décrément », « stock pas mis à jour ».

## Ce que ce skill vérifie

### 1. Cohérence des données (SQL / Prisma)
Exécuter ou générer les requêtes suivantes pour vérifier l'état en base :

```sql
-- Stock négatif (ne doit jamais arriver)
SELECT * FROM stock_levels WHERE qty_on_hand < 0 OR qty_reserved < 0 OR qty_available < 0;

-- Incohérence available = on_hand - reserved
SELECT * FROM stock_levels WHERE qty_available != qty_on_hand - qty_reserved;

-- Réservations orphelines (commandes annulées mais stock toujours réservé)
SELECT sl.* FROM stock_levels sl
JOIN order_items oi ON oi.variant_id = sl.variant_id
JOIN seller_orders so ON so.id = oi.seller_order_id
WHERE so.statut IN ('annulée', 'expirée') AND sl.qty_reserved > 0;

-- Niveaux reconstituables depuis le journal
SELECT variant_id, location_id,
  SUM(CASE WHEN type = 'entree' THEN quantite
           WHEN type IN ('sortie', 'vente') THEN -quantite
           WHEN type = 'ajustement' THEN quantite
           ELSE 0 END) AS qty_calculee
FROM stock_movements
GROUP BY variant_id, location_id;
```

### 2. Audit du code source
Chercher avec Grep les endroits qui modifient le stock SANS passer par StockService :

```
Patterns suspects à chercher :
- qty_on_hand =    (mise à jour directe)
- qty_reserved =   (mise à jour directe)
- UPDATE stock_levels  (en dehors du StockService)
- quantity--  ou  quantity++  hors service
```

Chercher les appels à StockService et vérifier qu'ils sont toujours dans une transaction.

### 3. Vérification des jobs planifiés
- Le job de libération des réservations expirées existe-t-il ?
- Est-il actif et configuré avec le bon délai (défaut 30 min) ?
- Est-il idempotent (peut tourner deux fois sans double libération) ?

### 4. Vérification de l'idempotence des webhooks
- Les webhooks de paiement enregistrent-ils l'identifiant d'événement pour éviter le double traitement ?
- Tester : si le même webhook est reçu deux fois, le stock est-il décrémenté une seule fois ?

### 5. Vérification de l'isolation vendeur
- Chaque query sur stock_levels filtre-t-elle par seller_id ?
- Aucun endpoint ne permet-il de lire le stock d'un autre vendeur ?

## Format du rapport
Produire un rapport structuré :
- ✅ Points conformes
- ⚠️ Points à surveiller (risque potentiel)
- ❌ Anomalies confirmées (avec fichier, ligne et correction recommandée)

Finir par un score de confiance global sur l'intégrité du stock.
