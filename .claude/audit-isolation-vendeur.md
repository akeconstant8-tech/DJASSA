# Skill : audit-isolation-vendeur

Vérifier que l'isolation des données entre vendeurs est correctement implémentée dans tout le code de DJASSA. Un vendeur ne doit jamais pouvoir lire ou modifier les données d'un autre vendeur.

## Déclenchement
Utiliser quand le message contient : « isolation vendeur », « IDOR », « vendeur A accède au vendeur B », « fuite de données », « autorisation », « audit sécurité vendeur ».

## Ce que ce skill vérifie

### 1. Inventaire des ressources propriétaires
Lister toutes les tables et endpoints qui portent un `seller_id` :

```
Tables à vérifier : products, product_variants, stock_levels, stock_movements,
                    seller_orders, order_items, payouts, locations, audit_logs
```

Pour chaque table, vérifier :
- [ ] Colonne `seller_id` présente et NOT NULL.
- [ ] Index sur `seller_id`.
- [ ] Row Level Security (RLS) envisagée ou activée.

### 2. Analyse des endpoints (Grep)
Pour chaque endpoint qui prend un identifiant de ressource en paramètre (`:productId`, `:variantId`, `:orderId`…), vérifier qu'il y a une vérification explicite du propriétaire :

```
Patterns corrects à trouver :
  where: { id: params.id, seller_id: user.sellerId }
  if (resource.seller_id !== user.sellerId) throw ForbiddenException

Patterns dangereux à signaler :
  where: { id: params.id }   ← sans seller_id
  findById(params.id)         ← sans filtre propriétaire
```

Fichiers à analyser : tous les controllers, services et repositories des modules `catalogue`, `stock`, `orders`, `payouts`.

### 3. Vérification des endpoints de liste
Les endpoints qui retournent des listes (produits, mouvements, commandes) filtrent-ils toujours par `seller_id` ?

```
GET /api/v1/products          → doit retourner seulement les produits du vendeur connecté
GET /api/v1/stock-movements   → idem
GET /api/v1/orders            → idem
```

### 4. Tests d'isolation à créer si absents

```typescript
describe('Isolation vendeur', () => {
  it('vendeur B ne peut pas lire les produits du vendeur A', async () => {
    const produitVendeurA = await creerProduit(vendeurA);
    const response = await request(app)
      .get(`/api/v1/products/${produitVendeurA.id}`)
      .set('Authorization', `Bearer ${tokenVendeurB}`);
    expect(response.status).toBe(403); // ou 404 (recommandé pour ne pas révéler l'existence)
  });

  it('vendeur B ne peut pas modifier le stock du vendeur A', async () => {
    const varianteVendeurA = await creerVariante(vendeurA);
    const response = await request(app)
      .post(`/api/v1/stock-movements`)
      .set('Authorization', `Bearer ${tokenVendeurB}`)
      .send({ variantId: varianteVendeurA.id, type: 'entree', quantite: 10 });
    expect(response.status).toBe(403);
  });

  it("l'admin peut accéder aux ressources de tous les vendeurs", async () => {
    const produitVendeurA = await creerProduit(vendeurA);
    const response = await request(app)
      .get(`/api/v1/admin/products/${produitVendeurA.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(response.status).toBe(200);
  });
});
```

### 5. Élévation de privilège via le body
Vérifier qu'aucun endpoint n'accepte `seller_id` dans le body de la requête :

```
Champs à rejeter dans les DTOs vendeur :
  seller_id   (doit venir de la session, jamais du client)
  role        (ne doit jamais être modifiable par l'utilisateur)
  price       (le prix ne doit pas pouvoir être forcé à 0 côté client)
```

## Format du rapport
- **Total d'endpoints analysés** : N
- **Endpoints conformes** : N ✅
- **Endpoints à risque** : liste avec fichier, ligne, et correction recommandée ❌
- **Tests d'isolation présents** : oui / non / partiels
- **Verdict** : SÛRE / À CORRIGER AVANT PRODUCTION
