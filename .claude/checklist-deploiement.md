# Skill : checklist-deploiement

Vérifier que tout est prêt avant de déployer DJASSA en staging ou en production.

## Déclenchement
Utiliser quand le message contient : « déployer », « mise en production », « deploy », « release », « mettre en ligne », « passer en prod ».

## Demander d'abord : quel environnement ?
- **Staging** : appliquer toutes les étapes sauf « Communication ».
- **Production** : appliquer toutes les étapes.

---

## Étape 1 — Code et qualité

- [ ] La branche cible est à jour avec `main` (pas de conflit non résolu).
- [ ] Tous les tests passent en CI (lint, types, tests unitaires, tests d'intégration).
- [ ] Aucune faille de sécurité critique ou haute non corrigée (rapport `security-reviewer` à jour).
- [ ] La documentation OpenAPI est à jour.
- [ ] Aucun `console.log`, `TODO`, secret en dur ou `debugger` oublié dans le code.
- [ ] Les variables d'environnement requises sont documentées dans `.env.example`.

## Étape 2 — Base de données

- [ ] Toutes les migrations sont réversibles et testées en staging.
- [ ] La migration `down` a été testée manuellement au moins une fois.
- [ ] **Sauvegarde créée** juste avant le déploiement (et vérifiée restaurable).
- [ ] Vérifier que `stock_levels` est cohérent avec `stock_movements` (lancer le skill `verifier-stock`).

## Étape 3 — Configuration et secrets

- [ ] Les variables d'environnement de production sont configurées (jamais dans le dépôt).
- [ ] Les clés du fournisseur de paiement sont celles de production (pas les clés sandbox).
- [ ] Les URLs de webhook chez le fournisseur de paiement pointent vers la production.
- [ ] Les secrets sont dans le gestionnaire de secrets (pas en clair dans les variables d'environnement du CI).
- [ ] HTTPS actif et certificat valide.

## Étape 4 — Paiements (si le module paiement est modifié)

- [ ] Les webhooks ont été testés avec les outils du fournisseur (ex. CinetPay test mode).
- [ ] La signature des webhooks est vérifiée en production.
- [ ] Un paiement de bout en bout a été testé en staging avec le vrai fournisseur (mode test).
- [ ] La commission est calculée correctement sur plusieurs scénarios.

## Étape 5 — Performance

- [ ] Les pages vitrine chargent en < 2 s sur une connexion simulée 3G.
- [ ] Les endpoints API critiques répondent en < 300 ms au 95e percentile (résultat de charge ou de benchmark).
- [ ] Les index de base de données sont en place sur les colonnes de filtrage principales.
- [ ] Le CDN est configuré pour les images produits.

## Étape 6 — Supervision

- [ ] Les logs structurés sont actifs et collectés.
- [ ] Le suivi des erreurs est configuré (ex. Sentry).
- [ ] Les alertes sont actives (taux d'erreur, latence, stock, paiements).
- [ ] Un dashboard de supervision est accessible à l'équipe.

## Étape 7 — Retour arrière (rollback)

Documenter avant de déployer :
- **Version précédente** : ____________
- **Commande de rollback applicatif** : ____________
- **Commande de rollback migration** : `prisma migrate down` (ou équivalent)
- **Critère de déclenchement du rollback** : taux d'erreur > 5 % sur 5 min, ou paiements bloqués.

## Étape 8 — Communication (production uniquement)

- [ ] L'équipe est informée de l'heure de déploiement.
- [ ] Si maintenance planifiée : annonce envoyée aux vendeurs et acheteurs actifs.
- [ ] Un responsable est disponible pendant les 2 heures suivant le déploiement.

## Après le déploiement

- [ ] Vérifier les métriques pendant 15 min (erreurs, temps de réponse, paiements).
- [ ] Tester manuellement le parcours critique : création produit → ajout stock → achat → confirmation paiement.
- [ ] Confirmer que les migrations ont bien été appliquées.
- [ ] Archiver le rapport de déploiement dans `docs/releases/`.
