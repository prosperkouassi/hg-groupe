# Back-office Recrutement — Partie 2

Branche `feat/nouvelle-fonctionnalite`, base validée `2c5e828`. Le module utilise le pool MySQL, la session administrative, le shell et les conventions visuelles de Hopla Groupe. L’interface applique Newsreader aux titres et Manrope aux contrôles et au texte. Les listes restent prioritaires, avec des séparateurs simples et des accents réservés aux actions et aux états. Cette approche reprend la sobriété de la référence [Awesome Design MD](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/linear.app/DESIGN.md).

## Accès et routes

| Route | Usage |
| --- | --- |
| `/admin/recrutement` | Tableau de bord |
| `/admin/recrutement/offres` | Liste, recherche, filtres, tri et pagination |
| `/admin/recrutement/offres?new=1` | Création |
| `/admin/recrutement/offres?slug=…` | Fiche et édition selon le rôle |
| `/admin/recrutement/offres?slug=…&preview=1` | Aperçu privé |
| `/admin/recrutement/candidatures` | Candidatures sur offre et détail par `?id=…` |
| `/admin/recrutement/spontanees` | Candidatures spontanées et détail par `?id=…` |
| `/admin/recrutement/recruteurs` | Profils publics réutilisables |
| `/admin/recrutement/reglages` | Configuration administrable et simulation de la conservation |
| `/api/admin/recrutement/[resource]` | Mutations, export CSV, tickets et téléchargement, aperçu de rétention |

L’identité administrative existante est résolue à chaque requête. Un compte actif doit recevoir explicitement un rôle dans `recruitment_admin_roles`. Les anciennes pages d’administration conservent leur politique actuelle.

| Rôle | Périmètre Recrutement |
| --- | --- |
| Administrateur | Toutes les sections, publication, configuration et suppression. La liste historique d’autorisation demeure requise pour ses téléchargements. |
| Recruteur | Lecture des offres attribuées dans `recruitment_admin_offer_access`, étude des candidatures validées associées, notes et documents du périmètre. |
| Gestionnaire | Dossiers des deux types, notes, statuts, export, documents des candidatures validées et demande de renvoi d’un lien expiré. |

L’adresse validée est représentée par `validated_at`. Les statuts d’étude sont indépendants. L’expiration découle du jeton. Les identités et documents restent masqués avant validation. Le renvoi administratif réutilise la file existante, avec rotation du jeton et quota. Une offre supprimée logiquement réserve son slug. L’action refuse les offres déjà reliées à des candidatures. L’action « Ajouter un recruteur » permet de créer le premier profil. Le snapshot JSON des profils associés est mis à jour dans la même transaction.

## Intégrer MySQL et SMTP

1. Confirmer la cible de recette et rétablir son accès MySQL avant toute migration. Déterminer la version, relever le schéma réel et vérifier droits, paquet MySQL, limites proxy et sauvegarde. L’accès distant de l’audit échouait avec le code 1045.
2. Comparer les trois migrations Partie 1 au schéma effectivement installé, appliquer les migrations manquantes sur recette, puis appliquer dans l’ordre `20261126_01_recruitment_admin_offers.sql`, `20261126_02_recruitment_admin_applications.sql` et `20261126_recruitment_admin_access.sql`. Vérifier les index, clés étrangères et contraintes après chaque étape. DDL MySQL peut effectuer un commit implicite.
3. Attribuer le premier rôle administrateur à un compte actif identifié par l’exploitant. Attribuer les rôles limités et les lignes d’accès par slug dans les tables dédiées. Aucune identité n’est créée par migration et aucun compte existant n’obtient automatiquement des droits Recrutement.
4. Vérifier SMTP sur recette avec Nodemailer `verify()`. L’exploitant configure la boîte principale autorisée dans `RECRUTEMENT_EMAIL_ADMIN`, obligatoire et affichée en lecture seule. Après vérification indépendante de la boîte supplémentaire, il peut renseigner `RECRUTEMENT_EMAIL_VERIFIED_ADDITIONAL_RECIPIENT` avec cette adresse unique. La notification utilise la valeur approuvée par l’exploitant uniquement si l’adresse supplémentaire enregistrée lui correspond, sans distinction de casse. Un changement vers une autre adresse la remet en attente et interrompt les envois à cette destination. Les anciens indicateurs JSON de confirmation et les anciennes adresses administrateur enregistrées ne confèrent aucun droit à recevoir les notifications. Exercer la réservation de la file, l’idempotence, le renouvellement et les cas de rejet SMTP avant d’activer la réception. Un accusé MySQL par destinataire empêche de renvoyer les messages déjà enregistrés quand un destinataire échoue. Une panne entre l’acceptation SMTP et l’écriture de cet accusé peut entraîner un réessai avec le même identifiant de message.
5. Valider sur recette la confidentialité du dossier, le contrôle des rôles sur les routes existantes et nouvelles, la désactivation du cache privé et la gestion des accès aux journaux HTTP. Les recherches sensibles utilisent des paramètres GET. Masquer les paramètres de recherche dans les journaux et outils d’observabilité.

Variables côté serveur. MySQL `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`. Administration `ADMIN_SESSION_SECRET`. SMTP `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`. Recrutement `RECRUTEMENT_ORIGIN`, `RECRUTEMENT_TOKEN_KEY`, `RECRUTEMENT_OUTBOX_SECRET`, `RECRUTEMENT_EMAIL_FROM`, `RECRUTEMENT_EMAIL_ADMIN`, `RECRUTEMENT_DOCUMENT_ADMIN_IDS`, éventuellement `RECRUTEMENT_EMAIL_VERIFIED_ADDITIONAL_RECIPIENT` et, selon le proxy, `RECRUTEMENT_TRUSTED_IP_HEADER`. Les interrupteurs `RECRUTEMENT_OFFRES_ENABLED` et `RECRUTEMENT_CANDIDATURES_ENABLED` pilotent l’activation publique.

## Conditions de mise en production

### Recette protégée avant activation

Sur le site public, garder `RECRUTEMENT_OFFRES_ENABLED=false` et `RECRUTEMENT_CANDIDATURES_ENABLED=false`. Pour tester les parcours complets, utiliser une instance séparée avec une origine HTTPS soumise à un contrôle d’accès et des données fictives. Protéger aussi les API publiques Recrutement derrière ce contrôle. Activer les interrupteurs sur cette instance uniquement et utiliser un collecteur SMTP sans relais pour le double opt-in. Vérifier les accès administrateur et recruteur, les deux routes de téléchargement, les rejets anonymes, la publication et le rendu des sections et du profil stockés en JSON.

Le téléchargement privé exige toujours une clé `RECRUTEMENT_TOKEN_KEY` valide, une session, une autorisation et un ticket. Il reste disponible pour les comptes habilités lorsque la réception publique est suspendue. Le renvoi du lien de validation et le traitement de la file restent suspendus avec la réception.

Appliquer les interrupteurs au build et au démarrage. Le menu des pages statiques utilise la valeur au build. Après un changement d’interrupteur, reconstruire avant de vérifier le menu desktop et mobile, le sitemap, les métadonnées et les accès directs.

- Faire valider la recette MySQL et SMTP, puis obtenir l’autorisation de déploiement. Garder les interrupteurs publics désactivés jusqu’à cette validation.
- Les deux autorisations reçues couvrent le lien partagé et les raccords publics. Le moteur utilise les paramètres validés pour le consentement, les documents, les quotas de soumission et les prochains jetons. La notification d’administration préserve l’adresse existante et ajoute la destination confirmée, dédupliquée. La rétention fournit une estimation sans suppression planifiée.
- Les deux routes de documents partagent la session active, le rôle explicite, les règles de périmètre et le journal des téléchargements. L’ancienne route conserve son URL, le ticket dans le fragment remis par le `POST` et la lecture par en-tête `Authorization: Bearer`. Les tickets de l’ancien format doivent être renouvelés après la mise à jour. Les migrations Partie 2 qui installent les rôles, les affectations et les événements sont des prérequis de l’ancienne route sur cette version.
- Valider le texte de consentement, les durées de conservation et d’audit, la collecte de la nationalité et les informations de confidentialité avant activation. La politique existante reste en vigueur.

## Retour arrière

1. Désactiver les interrupteurs publics et suspendre les tâches de traitement côté exploitant si elles ont été activées.
2. Restaurer l’application au commit validé `2c5e828` selon la procédure Git de l’exploitant. Laisser les ajouts SQL en place pour préserver les données et les associations. Le code Partie 1 continue de lire les colonnes historiques et le snapshot recruteur.
3. Si un retrait SQL est nécessaire, sauvegarder et contrôler la restauration de toutes les données Partie 2 avant une nouvelle migration de retrait validée. Retirer les tables d’accès et dépendances avant les colonnes d’offres, puis archiver les notes, les événements, les réglages et le workflow avant de retirer leurs structures. Les suppressions de dossiers déjà effectuées exigent une restauration depuis sauvegarde.

## Revue différentielle

| Contrôle | Résultat |
| --- | --- |
| Accès direct, IDOR | La session et le compte actif sont vérifiés avant le rôle. Les recruteurs sont filtrés par offre dans les requêtes de lecture, de mutation sur dossiers et de documents. La revue a conduit à réserver l’export aux administrateurs et gestionnaires et toutes les mutations d’offres aux administrateurs. |
| Données et production | Les SQL sont paramétrés. Les opérations sensibles s’exécutent en transaction. Les erreurs imprévues remontent un message générique. Les exports et téléchargements privés sont servis avec `no-store`. |
| Candidatures privées | Les données personnelles et documents des dossiers non validés restent masqués, les cellules CSV susceptibles d’être interprétées comme formules sont neutralisées et les téléchargements utilisent un ticket temporaire et un journal. |
| Publication et contenu | Les brouillons restent filtrés côté serveur, y compris dans l’accès direct. Les chemins médias sont locaux et validés et le front rend le texte via React. |
| Raccords Partie 1 | La garde d’activation précède le chargement des réglages. Les restrictions configurables n’assouplissent ni la validation des pièces ni les plafonds existants. Les adresses additionnelles nécessitent confirmation. |
| Contrôles restant à valider sur recette | Application et retour arrière des migrations, plans de requêtes, verrous réels, volume de documents, politique de l’ancienne route et délivrabilité. |

Les journaux de développement antérieurs contiennent notamment des erreurs d’hydratation et des refus MySQL. L’indicateur « 1 Issue » agrège les problèmes de développement. Le journal ne permet pas d’attribuer avec certitude l’instance observée à une trace précise sans la route et l’heure de la capture.

## Inventaire

| Ajouts | Rôle |
| --- | --- |
| `src/app/admin/recrutement/[[...segments]]/page.tsx`, `src/app/admin/recrutement/loading.tsx` | Pages privées et état de chargement |
| `src/app/api/admin/recrutement/[resource]/route.ts` | Point d’entrée administratif |
| `src/modules/recrutement/admin/{applications,gateway,offers,permissions,settings}.ts` | Services MySQL, permissions, routage métier et configuration |
| `src/modules/recrutement/admin/ui/{actions,applications,common,offers,overview}.tsx`, `recruitment-admin.module.css` | Tableaux, formulaires et styles isolés |
| `src/modules/recrutement/public-assets.ts` | Validation commune des chemins publics |
| `migrations/20261126_*.sql` | Trois migrations de la Partie 2 |
| `tests/recrutement-admin-{access,candidatures,offres}.test.mjs`, `tests/recrutement-offres-publiques.test.mjs` | Tests sans accès distant |

| Fichiers existants modifiés | Autorisation et raison |
| --- | --- |
| `src/components/admin/AdminShell.tsx` | Ajout du lien Recrutement autorisé pour les menus ordinateur et mobile |
| `src/app/api/recrutement/candidatures/{route.ts,valider/route.ts,renvoyer/route.ts,notifications/route.ts}` | Raccord public autorisé au lecteur des réglages |
| `src/modules/recrutement/server/{applications,email,jobs}.ts` | Raccord public autorisé pour les restrictions, la file de notifications et les données d’offres |
| `src/modules/recrutement/application/{ApplicationButton,DocumentField}.tsx` | Raccord public autorisé pour afficher le consentement et les restrictions de dépôt |
| `src/modules/recrutement/types.ts`, `src/modules/recrutement/ui/{JobDetail,Recruitment}.tsx` | Raccord public autorisé pour la mise en avant, les médias et les initiales des profils |

La route historique des documents délègue désormais au service documentaire partagé avec le module d’administration. Les migrations Partie 1, la connexion partagée, le système de session, les autres écrans d’administration et la politique de confidentialité restent hors de ce différentiel.

## Vérifications locales

HOPLA DEV a coordonné les agents Offres et recruteurs, Candidatures, Frontend et Revue de sécurité. Les travaux ont utilisé la documentation Next.js installée, les skills HOPLA DEV, Taste, Emil Design Engineering, Web Design Guidelines, Awesome Design MD, revue différentielle, revue de sécurité, migrations et Playwright. Les tests Node, TypeScript, ESLint et Chrome ont servi à la recette locale.

| Contrôle | Résultat |
| --- | --- |
| Tests Node | 49 réussis, dont 26 existants. Couverture des rôles, limites, offres, profils, candidatures classiques et spontanées, transitions, exports, téléchargement journalisé, double opt-in et transport simulé. |
| TypeScript et build Next.js | Vérifiés avec les routes administratives et publiques. |
| ESLint ciblé | Aucun défaut dans le module. Les deux avertissements `no-img-element` sur les logos du shell partagé sont reproduits à l’identique sur le commit de référence. |
| Playwright avec Chrome | Les six sections ont été parcourues sur ordinateur (1 440 × 1 050), tablette (820 × 1 180) et mobile (390 × 844). Contrôles de la navigation, des polices, du débordement, du dossier et de l’aperçu privés, du changement de statut, du CSV, des accès sans session ou hors rôle, du contrôle d’origine et des états vide et indisponible. |
| Non-régression en navigateur | Ouverture des administrations Blog, Partenaires et Projets, et ouverture du formulaire de candidature spontanée avec l’envoi désactivé. Les offres à la une, l’ordre de pagination et les chemins médias sont couverts par des tests automatisés. |
| Recette distante | Migrations, droits et comportement MySQL sur données réelles, charge et concurrence, capacité des pièces et délivrabilité à valider. Les tests locaux utilisent des fixtures dans une copie isolée du build et un transport simulé. |

Les captures sont dans `captures-recrutement-partie-2/`. Elles présentent des données de test. Le tableau de bord est illustré sur les trois tailles d’écran. Les cinq autres sections sont illustrées sur ordinateur et mobile. Le dossier et l’aperçu sont illustrés sur ordinateur.

État Git de livraison. Branche `feat/nouvelle-fonctionnalite`, HEAD `2c5e828`, modifications locales autorisées et ajouts non commités. Le dossier `captures-candidatures/` préexistait à l’intervention.
