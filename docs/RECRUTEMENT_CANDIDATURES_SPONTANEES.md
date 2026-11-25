# Hopla Groupe — Candidatures spontanées

Branche `feat/nouvelle-fonctionnalite`.

## Parcours public

- Le bouton « Candidature spontanée » ouvre sa propre modale dans l’archive et sur les fiches d’offre. Le bouton reste présent quand le catalogue est vide, à droite sur ordinateur et sur toute la largeur à 480 px ou moins.
- La zone d’action occupe une ligne au-dessus des offres. Le calcul de hauteur des colonnes tient compte de cette ligne. Sur tablette étroite et mobile, le défilement reste naturel.
- Les champs exigés sont le nom, le prénom, le téléphone international, l’e-mail, la ville, la nationalité, le poste recherché, le CV et le consentement. La lettre de motivation est facultative.
- La nationalité se choisit dans une liste native filtrable, parcourable au clavier. La recherche tolère les accents et les variantes d’apostrophes et de tirets. Le serveur contrôle le code sélectionné. [Codes ISO 3166-1](https://www.iso.org/iso-3166-country-codes.html).
- Le téléphone est normalisé avec un préfixe `+` et des chiffres, au plus 15. Ce contrôle porte sur le format international. La possession du numéro n’est pas vérifiée. [Plan de numérotation E.164](https://www.itu.int/rec/T-REC-E.164/en).

## Fichiers modifiés ou ajoutés

| Fichier | Modification |
| --- | --- |
| `src/modules/recrutement/ui/Recruitment.tsx` et `recruitment.module.css` | Placement, dégradé avec contraste renforcé et intégration de la barre d’action au layout. |
| `src/modules/recrutement/application/ApplicationButton.tsx` et `application.module.css` | Variante spontanée de la modale et styles des champs. La variante « Je postule » garde ses champs et sa validation. |
| `src/modules/recrutement/application/NationalityField.tsx` et `fields.ts` | Sélecteur filtrable, liste de codes en français et validation de téléphone partagée. |
| `src/modules/recrutement/server/applications.ts` et `email.ts` | Validation et écriture selon le type, avec libellés adaptés dans les e-mails. |
| `migrations/20261125_recrutement_candidatures_spontanees.sql` | Migration additive de la table des candidatures. |
| `tests/recrutement-backend.test.mjs` | Cas dédiés au stockage, aux entrées invalides et au partage des quotas. |

## Revue de sécurité

- Le point d’entrée reste `POST /api/recrutement/candidatures`. Les demandes utilisent le même contrôle d’origine, le même honeypot, les mêmes plafonds IP et e-mail et les mêmes vérifications PDF, DOC et DOCX de 5 Mio. Le type est contrôlé côté serveur. Les champs propres à une variante sont refusés pour l’autre.
- Les paramètres SQL restent liés. La candidature, ses fichiers privés et la notification de validation sont enregistrés dans une transaction. L’identifiant de réessai est rattaché au type et, le cas échéant, à l’offre.
- Le jeton chiffré expire après 48 heures et devient inutilisable après validation. Le courriel de vérification spontané utilise un libellé fixe. Les notifications au recruteur et au candidat suivent la vérification effective. Aucun courriel ne joint les documents.
- Un état de succès nécessite une réponse explicite du serveur après enregistrement. Les formulaires restent consultables lorsque l’envoi est désactivé.

## Intégration et Partie 2

La migration ajoute `application_type` et classe les lignes existantes comme `job_application`. Les candidatures `spontaneous_application` ont des références d’offre nulles. La contrainte SQL distingue ces formes et l’index prépare le filtrage par type et état de validation. Aucune offre fictive n’est insérée.

Appliquer la migration après la migration de base des candidatures et avant d’installer le nouveau code sur tout environnement où la réception est déjà active. Les lectures de la file d’e-mails et les écritures des deux variantes dépendent du nouveau schéma. Garder la réception désactivée jusqu’à la recette MySQL et SMTP. Le réglage `RECRUTEMENT_CANDIDATURES_ENABLED` reste commun aux deux parcours. Aucun nouveau paramètre d’environnement n’est nécessaire.

Avant activation, vérifier la politique de collecte et de rétention de la nationalité, les autorisations de consultation et le traitement des documents en Partie 2. Les tests de persistance et de double opt-in utilisent des doubles locaux. Aucune migration, aucun SMTP réel et aucune écriture MySQL réelle n’ont été effectués.

## Vérifications

- Build Next.js final, TypeScript, ESLint ciblé et 26 tests automatisés réussis. Les tests serveur couvrent notamment les rejets documentaires, les champs obligatoires, les quotas partagés, l’expiration, le renouvellement et l’usage unique du lien.
- Playwright a testé les deux parcours avec offres fictives à 320, 390, 810, 1 024, 1 280 et 1 440 px. En production locale sans offre, le bouton et la modale restent accessibles. Les essais avec réponses interceptées vérifient l’absence de message de succès en cas de réponse inattendue ou de validation rejetée. Une soumission réelle sans configuration valide a reçu HTTP 503 avant toute écriture.
- La liste localisée est calculée côté serveur et sérialisée au navigateur. Ce choix corrige une différence de noms et de tri entre Node et Chrome constatée pendant la recette. Le test de production local confirme le même rendu au chargement, sans erreur d’hydratation observée, avec Manrope et Newsreader chargées.
- Accueil, Contact, Expertises, À propos et Mentions légales ont conservé leur texte principal et le nombre de bandeaux par comparaison avec la livraison précédente. Le formulaire de contact est accessible en HTTP 200.
- Trois agents ont contribué au serveur, au formulaire et aux essais, ainsi qu’à la revue indépendante. HOPLA DEV, Taste, Emil, Web Design Guidelines, Playwright et la revue différentielle ont été utilisés pour le cadrage ou les contrôles.
