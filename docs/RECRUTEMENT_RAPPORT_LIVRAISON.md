# Rapport de livraison Recrutement

La recette fonctionnelle en production est officiellement validée par Hopla Groupe. Ce rapport consigne la clôture technique et reste soumis à validation avant publication.

## Référence et preuves

- Après actualisation de Git, `main` et `origin/main` pointent vers `0204cbedbcec953cafe4fd9e2c52bb551f9713f8`. Divergence de zéro commit.
- Les six suites Recrutement ont été exécutées localement avec `node --test`. **55 tests réussis**, couvrant notamment rôles, offres, candidatures, accès aux documents et Cron. Les services distants sont simulés dans ces tests.
- Cette clôture s’appuie sur la recette de production déclarée. Aucun nouveau contrôle direct de hPanel, du SMTP, de la base, du contenu de l’artefact déployé ou d’une restauration réelle n’a été effectué.

## Revue différentielle de sécurité

La revue a relu le changement Cron entre `6b7d1a4` et `0204cbe` ainsi que ses interfaces avec les contrôles existants de la livraison Recrutement. Aucun point bloquant n’a été relevé dans ce périmètre.

| Surface | Contrôle observé dans les sources |
|---|---|
| Cron et traçage | Destination HTTPS fixe, secret Bearer, refus des redirections et de TLS non vérifié, délai de 90 secondes, sortie sans secret ni contenu de réponse. La route compare le jeton en temps constant. La règle de traçage cible la route Recrutement et conserve `experimental.cpus: 2`. |
| Accès aux dossiers et aux pièces | Session et compte actif, rôle explicite, affectations par offre, liste d’ID pour le rôle `admin`, confirmation de l’e-mail. Ticket temporaire lié à l’acteur et au document, réautorisation au GET, lecture privée sans cache et événement d’audit. |
| File et SMTP | Réservation temporaire, réessai et reçus par destinataire. La destination supplémentaire exige une approbation indépendante et la correspondance avec l’adresse enregistrée. |

## Dettes techniques identifiées

| Priorité proposée | Dette et suivi |
|---|---|
| Haute | Superviser l’âge des messages dus et les tentatives de l’outbox. Le succès HTTP du Cron ne confirme pas la remise des messages. La perte du reçu après acceptation SMTP peut provoquer un doublon. Inclure ce cas dans les exercices de reprise. |
| Haute | Exercicer la restauration isolée et formaliser la conservation des dossiers, pièces, journaux et sauvegardes. Le réglage actuel estime le volume de rétention. |
| Moyenne | Ajouter un test d’intégration MariaDB de bout en bout sur le téléchargement des deux types de dossier, avec refus hors périmètre et comparaison binaire. Viser l’API appelée par le bouton et vérifier aussi l’artefact standalone lors des builds de livraison. |
| Moyenne | Évaluer l’analyse antivirus des fichiers entrants. Les vérifications de format et la livraison en pièce jointe couvrent des risques distincts. |
| Moyenne | Suivre les huit vulnérabilités signalées par l’audit npm historique, dont une élevée sur `zod` 4.4.3 et sept modérées liées à `minimatch` 10.2.6 et aux paquets TypeScript ESLint qui en dépendent. Elles restent une dette de l’outillage de développement. Cette clôture n’applique aucun correctif de dépendance et ne réévalue pas ces avis. [Détail de l’audit](RECRUTEMENT_RECETTE_TECHNIQUE.md#audit-des-dépendances) |

## Fichiers proposés à la publication

- [Guide d’exploitation](RECRUTEMENT_EXPLOITATION.md), créé. Il couvre les six migrations, les variables, le Cron Hostinger, les incidents et la reprise.
- [Dossier de recette technique](RECRUTEMENT_RECETTE_TECHNIQUE.md), mis à jour avec le statut de recette et les liens vers les documents de clôture.
- Ce rapport, créé.

Le travail de clôture porte exclusivement sur la documentation. Validation de publication en attente.
