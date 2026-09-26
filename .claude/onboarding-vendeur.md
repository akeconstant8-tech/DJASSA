# Skill : onboarding-vendeur

Implémenter ou vérifier le parcours complet d'inscription et d'activation d'un vendeur sur DJASSA, de la demande d'ouverture de boutique à la première mise en ligne d'un produit.

## Déclenchement
Utiliser quand le message contient : « onboarding vendeur », « inscription vendeur », « demande boutique », « activation vendeur », « KYC vendeur », « valider un vendeur ».

## Parcours complet

### Phase 1 — Inscription du compte utilisateur
1. L'utilisateur crée un compte (email ou téléphone + mot de passe).
2. Vérification du téléphone par OTP SMS.
3. Compte `users` créé avec `rôle = acheteur` par défaut.

### Phase 2 — Demande d'ouverture de boutique
L'utilisateur soumet :
- Nom de la boutique
- Description de l'activité
- Adresse physique
- Pièce justificative d'identité (upload sécurisé)
- Numéro de Mobile Money pour les reversements **[À valider]**

Un enregistrement `sellers` est créé avec `statut = pending`.
L'admin reçoit une notification.

**Règles de validation** :
- Le nom de boutique est unique sur la plateforme.
- L'upload est limité en type (PDF, JPG, PNG) et en taille (max 5 Mo).
- Le fichier est stocké hors racine web, pas accessible publiquement.

### Phase 3 — Validation par l'admin
L'admin examine la demande dans le back-office :
- Consulter les pièces justificatives.
- Valider → `statut = active` + notification email/SMS au vendeur.
- Rejeter avec motif → `statut = rejected` + notification avec motif.

### Phase 4 — Premier accès à l'espace vendeur
À l'activation, le vendeur est guidé vers :
1. Compléter le profil boutique (logo, horaires).
2. Créer son premier produit (wizard simplifié).
3. Saisir son stock initial.

Un emplacement par défaut (`location`) est créé automatiquement pour le vendeur.

### Phase 5 — Premier produit en ligne
Vérifications avant mise en ligne :
- Le vendeur a un emplacement actif.
- Le produit a au moins une variante.
- La variante a un prix > 0.
- Le stock disponible est ≥ 0 (peut être 0, affiché « Rupture de stock »).

### Règles métier de l'onboarding
| Réf. | Règle |
|------|-------|
| RG-V01 | Un utilisateur ne peut ouvrir qu'une seule boutique **[À valider]**. |
| RG-V02 | Un `seller_id` est généré à la création de la demande, pas à la validation. |
| RG-V03 | Un vendeur en statut `pending` ou `rejected` ne peut pas publier de produits. |
| RG-V04 | Un vendeur suspendu (`suspended`) voit ses produits masqués mais peut consulter son historique. |
| RG-V05 | Un emplacement par défaut est créé automatiquement à la validation du vendeur. |

## Points de sécurité à vérifier
- [ ] Les pièces justificatives sont-elles accessibles uniquement à l'admin ?
- [ ] Le `seller_id` ne peut pas être choisi par l'utilisateur.
- [ ] Le rôle `vendeur` est attribué côté serveur, jamais via un champ du formulaire.
- [ ] Un vendeur non validé ne peut pas accéder aux endpoints vendeur.

## Tests à couvrir
- [ ] Demande avec nom de boutique déjà pris → erreur claire.
- [ ] Upload d'un fichier invalide (mauvais type, trop volumineux) → rejeté.
- [ ] Admin valide → vendeur reçoit la notification et peut se connecter à son espace.
- [ ] Admin rejette avec motif → vendeur peut corriger et renvoyer une demande.
- [ ] Vendeur `pending` tente d'accéder à `/api/v1/products` → 403.
- [ ] L'emplacement par défaut est créé automatiquement à la validation.
