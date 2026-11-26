# Revue différentielle de sécurité du recrutement

## Protection de la saisie avant validation de la Partie 2

Le formulaire d’édition et le formulaire de publication protègent chacun leurs propres valeurs, y compris la date de publication. Un seul avertissement est affiché lors d’une navigation, même si les deux formulaires ont été modifiés. L’enregistrement ne réinitialise que la référence du formulaire soumis.

Les réglages demandent confirmation lors du précédent ou du suivant dans l’historique de la même page lorsque le navigateur expose l’API Navigation. Si le navigateur a déjà engagé le déplacement, le refus rétablit l’entrée d’origine avant que Next.js ne remplace le formulaire. Les clics vers une autre page et le dialogue natif de fermeture ou de rechargement restent couverts. Sur les navigateurs dépourvus de l’API Navigation, les déplacements internes par précédent ou suivant peuvent quitter le formulaire sans confirmation. Le navigateur peut aussi supprimer le dialogue natif, notamment en l’absence d’interaction. Les valeurs en cours ne sont pas conservées après un rechargement ou une fermeture.

Les sections suivantes décrivent la revue historique du 26 novembre.

## Périmètre

Branche `feat/nouvelle-fonctionnalite`, référence `2c5e828`. Les changements de la Partie 2 étaient présents dans l’arbre de travail au démarrage. Les contrôles portent sur les nouvelles pages et API d’administration et sur leurs dépendances de recrutement. La revue se concentre sur les sessions, les rôles, les documents, les exports, les écritures et la notification de candidatures. L’exploitation des services de production et la vérification du schéma réellement en service restent hors périmètre.

| Surface | Contrôles examinés |
| --- | --- |
| Sessions et rôles | La page et l’API résolvent une session signée et un compte actif. Le rôle explicite détermine les opérations et le périmètre d’offres. |
| Écritures | L’API d’administration vérifie l’origine configurée avant la session, borne le JSON et délègue la validation à chaque opération. Les actions groupées utilisent une transaction. Chaque sauvegarde des réglages verrouille la ligne de configuration pendant la lecture et l’écriture de la catégorie. |
| Documents | Les vues de dossiers filtrent les candidatures avant de récupérer leurs documents. Les téléchargements exigent un ticket signé et court, lié au document et à l’acteur, ainsi qu’un contrôle de périmètre. La réponse est en pièce jointe, sans cache. |
| Prévisualisation | La prévisualisation relève du même contrôle d’accès que l’offre administrative. La visibilité du site public dépend toujours de l’état et de la publication de l’offre. |
| Données et CSV | Les recherches et filtres emploient des paramètres SQL. L’export ne sélectionne que les candidatures validées et neutralise les préfixes interprétés comme formules. |
| Double opt-in | Les contrôles du lien signé, de son expiration et de la transition validée précèdent la mise en file de la notification. L’envoi à l’administration utilise le transport existant. |
| Données de démonstration | Le lanceur temporaire et le processus applicatif sont isolés de la configuration réelle. Le service écoute sur la boucle locale et les écritures sont bloquées sur le port 3194. |

## Points relevés à l’inventaire

- Le modèle de réglages acceptait auparavant une valeur de confirmation du destinataire issue des données soumises. L’écriture par catégorie ignore désormais cette valeur et remet le statut à « à vérifier » si l’adresse change. Les indicateurs historiques conservés pour une adresse inchangée doivent être rapprochés d’une preuve de vérification indépendante avant de confirmer leur légitimité. La vérification d’une nouvelle adresse nécessite encore un mécanisme d’autorisation validé.
- Les documents privés restent téléchargeables via les contrôles existants. Les métadonnées d’origine absentes du schéma ne doivent pas être présentées comme des données réelles et la consultation intégrée ne doit pas ouvrir de nouvelle surface.
- Une erreur de connexion MySQL 1045 était déjà signalée. La validation en production des migrations, des permissions SQL et du flux SMTP reste à prévoir avec la configuration autorisée.

## Vérifications applicatives

Les suites Node couvrent les rôles administratifs, le périmètre du recruteur, la validation des offres, les transactions de groupe, le CSV, les tickets de document et le double opt-in. La recette Playwright vérifie le parcours d’administration sur données fictives. Le build de la copie isolée utilise les fichiers de polices locaux comme réponses de test de Next et un blocage réseau au démarrage.

Sur le serveur de test provisoire 3195, Playwright a vérifié l’ajout d’une note fictive, le changement de statut, l’enregistrement partiel des réglages de conservation, le refus d’une origine tierce, le téléchargement d’un document fictif par ticket, la création et la relecture d’un brouillon ainsi que la création et la modification d’un recruteur. Le profil a conservé le nom d’entreprise Hopla Groupe. Ce serveur a été arrêté après les tests.

Sur le port 3194, la recette a validé 55 affichages sur les onze interfaces aux largeurs 390, 768, 1024, 1280 et 1440 px. À chaque largeur, une session vierge a ouvert l’administration par `/demo` et chargé Newsreader et Manrope. Les contrôles ont constaté l’absence de débordement global et d’erreurs JavaScript ou d’hydratation. L’API des documents a retourné 401 sans session et 403 sans ticket. Une tentative d’enregistrement sur le serveur de démonstration a retourné 405. Les captures sont dans `captures-recrutement-optimisations/`.
