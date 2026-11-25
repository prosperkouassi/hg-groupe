# Recrutement Hopla Groupe · Partie 1

Branche `feat/nouvelle-fonctionnalite`.

## Fonctionnalités

- `/recrutement` affiche les offres de la plus récente à la plus ancienne, par pages de 15. À date de publication égale, le slug stabilise le tri. Chaque carte affiche la date et l’heure dans le fuseau `Africa/Abidjan`.
- `/recrutement/[slug]` ouvre une fiche individuelle. Sur ordinateur, les colonnes défilent séparément et l’action reste visible. Sur tablette et mobile, le lien de retour ramène à la page de liste de l’offre.
- La modale utilise les champs de candidature, le consentement et la validation de documents. L’adresse est confirmée depuis `/recrutement/confirmation`, avec renouvellement d’un lien expiré.
- `GET /api/recrutement/offres` et `GET /api/recrutement/offres/[slug]` exposent les offres publiques. Les écritures passent par les endpoints `POST /api/recrutement/candidatures`, `/valider` et `/renvoyer`. `POST /api/recrutement/candidatures/notifications` traite les relances SMTP.
- `POST /api/recrutement/candidatures/documents/[id]` émet un lien temporaire. Le `GET` au même emplacement sert la pièce aux administrateurs autorisés avec un jeton valable cinq minutes.
- Les fiches individuelles réelles contiennent les données structurées JobPosting lorsque le poste est ouvert aux candidatures et la réception est activée. Les données fictives sont limitées à `next dev`. La page de confirmation et les réponses API sont protégées de l’indexation.

## Inventaire

| Emplacement | Changement |
| --- | --- |
| `src/components/Header.tsx` | Ajout du lien « Recrutement » avant « Contact » dans la liste utilisée sur ordinateur et mobile. |
| `src/app/recrutement/` | Archive, détail, chargement, erreur et confirmation. |
| `src/app/api/recrutement/` | Lecture des offres et traitement des candidatures, confirmations et relances. |
| `src/modules/recrutement/` | Types, dates, données fictives, interface publique, formulaire, accès MySQL, validation, limiteurs, jetons et e-mails. |
| `migrations/20261125_recruitment_jobs.sql` | Schéma des offres. |
| `migrations/20261125_recrutement_candidatures.sql` | Schéma des candidatures, documents privés, quotas et file d’e-mails. |
| `tests/recrutement-backend.test.mjs` | Tests des documents, limites, jetons et transitions de candidature. |

- Pages ajoutées sous `src/app/recrutement/` : `page.tsx`, `[slug]/page.tsx`, `confirmation/page.tsx`, `loading.tsx` et `error.tsx`.
- Module : `types.ts`, `dates.ts`, `application/ApplicationButton.tsx`, `application/Confirmation.tsx`, `application/application.module.css`, `application/confirmation.module.css`, `ui/Recruitment.tsx`, `ui/RecruitmentFrame.tsx`, `ui/OfferList.tsx`, `ui/JobDetail.tsx`, `ui/JobPosting.tsx`, `ui/metadata.ts`, `ui/recruitment.module.css`, `server/jobs.ts`, `server/demo-jobs.ts`, `server/applications.ts`, `server/security.ts`, `server/documents.ts`, `server/downloads.ts` et `server/email.ts`.

Les pages, styles globaux, formulaires, API, variables d’environnement, dépendances et réglages de déploiement existants sont préservés. Aucune migration n’a été appliquée.

## Vérifications et anomalies

- Le build Next.js final, TypeScript et ESLint ciblé réussissent. Le lint global conserve les 7 erreurs et 18 avertissements de référence.
- Les 23 tests automatisés passent, dont 8 nouveaux sur le double opt-in, les formats de documents, les limites de requête, les jetons, les réessais et les droits de téléchargement.
- Playwright 1.65.1, exécuté via une installation temporaire et Chrome, a couvert les dispositions desktop, tablette et mobile, la navigation, la pagination, la sélection, la modale et les réponses API. Les captures locales sont sous `%TEMP%/hopla-recrutement-qa`.
- Le build final en production locale affiche une archive vide quand les offres sont désactivées, ne retourne aucune offre fictive et refuse le téléchargement sans autorisation. La page de confirmation est non indexable. Les scénarios d’expiration, de renvoi et de validation ont également été testés dans le navigateur avec des réponses interceptées.
- La comparaison des neuf routes publiques existantes sur deux tailles de fenêtre a retrouvé les mêmes statuts HTTP et textes principaux. Le contenu hors header est identique pixel à pixel dans 14 des 18 paires initiales. Les écarts restants concernent les animations d’« À propos » et le rendu d’erreur de « Cas d’études ». Les réponses 500 de `/blog` et `/cas-etudes` étaient déjà présentes avant l’intervention.
- Le lien ajouté entraîne un passage sur deux lignes de certains libellés et boutons du header à 1 150 et 1 200 px, observé en comparaison avec la référence. À 1 440 px, leur hauteur et la position des actions sont inchangées. La correction aux tailles intermédiaires exige une autorisation de modifier les styles du header.
- L’audit npm signale 7 entrées modérées autour de `minimatch` et des outils ESLint et 1 entrée élevée pour `zod`. Le module utilise ses propres vérifications serveur. Les dépendances sont celles du dépôt. [Avis minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249) et [avis Zod](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5).
- MySQL et SMTP n’ont pas été activés pour ce module. Les transitions de double opt-in sont vérifiées avec des doubles de test. Les comportements transactionnels et la délivrabilité restent à valider sur une recette autorisée.

## Agents et skills

- Agent design : archive, fiches, états et revue différentielle. HOPLA DEV, Emil Design Engineering, Taste et Vercel Web Design Guidelines ont servi à appliquer les conventions Hopla, notamment aux interactions et vérifications d’accessibilité. Awesome Design.md a été consulté comme catalogue, et les pages Hopla sont restées la référence graphique.
- Agent formulaire et tests : modale, clavier, captures avant/après et parcours Playwright.
- Agent backend : traitements serveur, migrations, stockage privé, e-mails et tests. La revue différentielle inspirée de Trail of Bits a couvert les frontières publiques, le partage des données, les jetons, la persistance et le changement de navigation.

## Revue de sécurité

- Les écritures publiques vérifient l’origine, le type et la taille de la requête avant le traitement. Le formulaire refuse les doublons de champs, les valeurs inattendues et les dépassements de taille. Le honeypot et les quotas MySQL limitent les tentatives. La limite IP utilise uniquement un en-tête choisi et réécrit par un proxy de confiance. Sans ce réglage, les requêtes partagent un quota. Aucun service CAPTCHA n’a été identifié dans l’existant.
- Les documents sont validés par extension, type et structure. Les PDF, DOC et DOCX sont enregistrés sous identifiants aléatoires dans une table privée. Un téléchargement exige une candidature validée, une session d’administration active, un identifiant d’administrateur autorisé et un jeton signé lié au document et à l’administrateur. La pièce est servie en téléchargement, sans mise en cache. Les vérifications de format ne constituent pas une analyse antivirus.
- Le jeton chiffré et authentifié expire après 48 heures. L’empreinte en base et le verrou transactionnel permettent une seule validation. Le jeton conservé temporairement pour l’envoi est chiffré séparément. La page reçoit le jeton dans le fragment d’URL et requiert une action explicite pour empêcher qu’un scanner d’e-mails ne valide la candidature par une simple visite.
- Le contenu apparaît en texte React. Les destinations LinkedIn utilisent HTTPS et sont contrôlées. L’encodage du JSON-LD empêche la fermeture anticipée de la balise script. Les valeurs utilisateur transmises à MySQL sont paramétrées.
- Les e-mails utilisent une file transactionnelle et des relances. Le recruteur reçoit la notification après validation uniquement. Les e-mails ne contiennent aucune pièce jointe. Le journal d’erreurs du module utilise des messages génériques. Un accusé SMTP et l’enregistrement en base sont deux opérations distinctes. Une interruption entre elles peut entraîner un second envoi. Écarter des journaux du proxy les corps de requête et les en-têtes d’autorisation.

## Activation ultérieure

1. Sur une base et un service SMTP de recette dédiés, appliquer les deux migrations dans l’ordre indiqué et valider les parcours complets avec des données de test.
2. Activer les offres réelles avec `RECRUTEMENT_OFFRES_ENABLED=true`. La publication repose sur `published_at` en UTC. Une offre non datée ou planifiée dans le futur reste privée.
3. Pour activer la réception, définir `RECRUTEMENT_CANDIDATURES_ENABLED=true`, `RECRUTEMENT_ORIGIN` (origine HTTPS exacte), `RECRUTEMENT_TOKEN_KEY` (32 octets aléatoires représentés par 64 caractères hexadécimaux), `RECRUTEMENT_EMAIL_FROM` et `RECRUTEMENT_EMAIL_ADMIN`. Le transport utilise les paramètres `SMTP_*` existants. Conserver les clés dans le gestionnaire de secrets.
4. Régler `RECRUTEMENT_TRUSTED_IP_HEADER` selon le proxy effectivement utilisé. Vérifier que le proxy peut recevoir deux fichiers de 5 Mo plus l’enveloppe multipart et que MySQL accepte l’insertion d’un document de 5 Mo. Sur une plateforme limitant les corps de requêtes en dessous de cette taille, prévoir un autre canal d’upload avant d’activer la fonctionnalité.
5. Protéger les relances avec `RECRUTEMENT_OUTBOX_SECRET` et prévoir un appel périodique avec `Authorization: Bearer …`. Les objets et corps des messages sont configurables avec `RECRUTEMENT_EMAIL_{VERIFICATION,RECRUITER,CANDIDATE}_{SUBJECT,BODY}`, et la signature avec `RECRUTEMENT_EMAIL_SIGNATURE`.
6. La Partie 2 ajoutera le CRUD des offres, la recherche des candidatures validées uniquement et l’interface d’accès aux documents. `RECRUTEMENT_ADMIN_PATH` servira à relier la notification à la future fiche authentifiée. La valeur par défaut renvoie vers `/admin`. Autoriser explicitement les comptes de téléchargement via `RECRUTEMENT_DOCUMENT_ADMIN_IDS`, une liste d’identifiants séparés par des virgules. Le futur client extraira `ticket` du fragment retourné par le POST et le transmettra au GET dans l’en-tête `Authorization` avec la même session. Prévoir l’analyse des documents avant ouverture en Partie 2.
7. Avant activation, fixer la durée de conservation de chaque statut, organiser la purge, y compris dans les sauvegardes, et valider que les mentions de confidentialité couvrent le traitement des candidatures.

## Retour arrière

Avant activation, retirer les ajouts listés dans ce document et la ligne de navigation de `Header.tsx`. Après activation, désactiver les candidatures et les offres, puis arrêter les relances avant de retirer le code. Conserver ou purger les données selon la politique de rétention validée. La suppression des tables est une opération distincte qui nécessite une autorisation.
