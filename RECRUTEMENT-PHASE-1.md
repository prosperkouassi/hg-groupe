Crée pour le site **Hopla**, développé avec **Next.js**, un module « Offres d’emploi » et une page de présentation des offres, en respectant strictement la charte graphique de **HoplaGroupe**.

**CONTRAINTE ABSOLUE — PRÉSERVATION DES FONCTIONNALITÉS EXISTANTES**

- Ne modifie, ne supprime et ne remplace aucune fonctionnalité, page, route, composant, menu, formulaire, intégration, configuration, contenu ou style actuellement présent sur le site Hopla.
- Le site doit continuer à fonctionner exactement comme avant, sans régression.
- Les fonctionnalités actuelles doivent rester intactes : navigation, pages existantes, formulaires, boutons, liens, processus de contact, contenus, SEO, performances, sécurité et expérience utilisateur.
- N’apporte que des ajouts nécessaires à la mise en place du module « Offres d’emploi » et des candidatures.
- N’utilise aucune modification destructive du code existant, des dépendances, des variables d’environnement, de la base de données ou des configurations de déploiement.
- Crée le module de manière additive, dans un dossier dédié, par exemple `src/modules/recrutement/` ou `src/features/jobs/`.
- Avant toute modification, analyse l’existant et identifie les éventuels conflits.
- Si une modification d’un fichier ou d’une configuration existante est absolument nécessaire, demande d’abord une validation explicite avant de l’appliquer.
- Après la mise en place, vérifie que toutes les fonctionnalités existantes fonctionnent toujours correctement.
- Fournis une liste claire des fichiers modifiés, des fichiers ajoutés et des éléments volontairement non modifiés.
- Prévois une possibilité de retour arrière ou de restauration en cas de problème.
- Avant toute action sur l’environnement de production, présente un récapitulatif des modifications prévues, de leur impact et de la procédure de retour arrière. Ne modifie aucun fichier, réglage ou contenu de production sans validation explicite.

**CONTRAINTE ABSOLUE — CHARTE GRAPHIQUE HOPLAGROUPE**

- Respecter strictement la charte graphique de **HoplaGroupe**.
- Ne pas altérer, remplacer, modifier ou contourner les couleurs, typographies, logos, icônes, boutons, espacements, rayons, ombres, composants, styles ou principes visuels déjà utilisés par HoplaGroupe.
- Utiliser exclusivement le design system, les variables CSS, les tokens, les composants, les polices et les éléments graphiques déjà présents dans le projet HoplaGroupe.
- Si un composant nécessaire n’existe pas, le créer en respectant exactement les mêmes principes visuels, l’accessibilité, les proportions et le langage graphique de HoplaGroupe.
- Ne pas importer ni reproduire le design, les couleurs, la typographie, les icônes, les logos, les illustrations ou les composants visuels de LinkedIn.
- LinkedIn sert uniquement d’inspiration fonctionnelle et structurelle pour l’organisation des blocs : liste d’offres à gauche, détail de l’offre à droite, pagination, bouton d’action fixe et modale de candidature.
- Le rendu final doit être 100 % HoplaGroupe, avec l’identité visuelle, le ton, la hiérarchie visuelle et les composants propres au site.
- Ne jamais copier l’apparence de LinkedIn.
- Avant de livrer, vérifier que tous les nouveaux blocs respectent la charte graphique de HoplaGroupe et s’intègrent visuellement aux pages existantes.

**OBJECTIF DE CETTE PREMIÈRE PARTIE**

Créer uniquement les pages publiques du module recrutement :
- la page d’archive des offres d’emploi ;
- la liste des offres à gauche ;
- le détail de l’offre sélectionnée à droite ;
- la modale de candidature ;
- le mécanisme de double opt-in visible pour le candidat.

Ne crée pas encore le back-office complet. Prépare seulement les structures, types, API et composants nécessaires pour que la Partie 2 puisse gérer les offres, les candidatures, les documents et les e-mails.

**STACK TECHNIQUE**

- Next.js avec App Router.
- TypeScript.
- React Server Components lorsque cela est pertinent.
- Server Actions ou Route Handlers pour la soumission du formulaire et la validation de l’e-mail.
- Validation côté serveur avec Zod ou une solution équivalente.
- Base de données et ORM déjà utilisés par le projet, sans imposer de changement de stack.
- Stockage de fichiers sécurisé : système de fichiers privé, S3 compatible avec accès privé, ou service de stockage déjà utilisé par le projet.
- Envoi d’e-mails via le service déjà utilisé par le projet, ou via un fournisseur transactionnel compatible.

**1. STRUCTURE GÉNÉRALE DE LA PAGE**

- Créer une page d’archive des offres d’emploi, par exemple `/carrieres` ou `/offres-emploi`.
- Sur ordinateur, afficher deux colonnes :
  - Colonne gauche : liste des offres d’emploi.
  - Colonne droite : détail complet de l’offre sélectionnée.
- La colonne gauche doit rester fixe à l’écran.
- La colonne droite doit défiler verticalement pour consulter tout le contenu de l’offre.
- Sur mobile ou tablette, afficher d’abord la liste des offres. Lorsque le candidat clique sur une offre, afficher la fiche détaillée en plein écran avec un bouton « Retour aux offres ».

**2. COLONNE GAUCHE — LISTE DES OFFRES**

- Afficher les offres d’emploi publiées.
- Afficher 15 offres par page.
- Ajouter une pagination sous la liste avec deux boutons :
  - « Précédent »
  - « Suivant »
- La liste doit pouvoir défiler indépendamment de la colonne de droite.
- Lorsqu’une offre est cliquée, elle doit être marquée visuellement comme active et son détail doit s’afficher dans la colonne de droite.
- Prévoir un état visuel clair pour l’offre active : fond légèrement différent, bordure ou indicateur coloré.
- Mettre à jour l’URL lors de la sélection d’une offre si cela est compatible avec le routage existant, par exemple `/carrieres?offre=slug-de-l-offre` ou `/carrieres/[slug]`.

**3. CONTENU DE CHAQUE CARTE D’OFFRE DANS LA COLONNE GAUCHE**

Chaque carte d’offre doit afficher obligatoirement :

- **Nom de l’offre** : intitulé du poste.
- **Situation géographique** : ville du poste.

Ajouter si les informations sont disponibles :

- Nom de l’entreprise ou du service recruteur.
- Type de contrat : Sur site, Stage, Alternance, CDD, CDI, Freelance, Mission, Temporaire.
- Date de publication.
- Date limite de candidature.
- Petite icône ou badge indiquant le type de contrat.

La carte doit rester courte, lisible et cohérente. Le titre et la ville sont les informations prioritaires.

Exemple de carte :

```text
Chargé de clientèle
Abidjan
CDI
Publiée le 25 novembre 2026
```

**4. COLONNE DROITE — DÉTAIL COMPLET DE L’OFFRE**

Lorsqu’une offre est sélectionnée, afficher dans la colonne de droite une fiche complète contenant :

- Titre de l’offre.
- Nom de l’entreprise ou du service recruteur.
- Ville et pays.
- Type de contrat : Sur site, Stage, Alternance, CDD, CDI, Freelance, Mission, Temporaire.
- Mode de travail : Sur site, Hybride ou Télétravail.
- Date de publication.
- Date limite de candidature.
- Nombre de postes disponibles.
- Niveau d’expérience requis.
- Niveau d’études requis.
- Rémunération, si renseignée.
- Horaires de travail, si renseignés.
- Date de début souhaitée, si renseignée.

Afficher ensuite les sections suivantes :

- **Description du poste**
- **Missions principales**
- **Profil recherché**
- **Compétences requises**
- **Avantages**
- **Documents à fournir**
- **Processus de recrutement**, si renseigné

Ajouter un bouton fixe en haut de la colonne droite : **« Je postule »**.

- Le bouton doit rester visible pendant le défilement de la fiche.
- Au clic, ouvrir une modale de candidature.
- Si la date limite est dépassée ou si l’offre est fermée, remplacer le bouton par : « Candidatures closes ».

**5. ENCARC RECRUTEUR EN BAS DE LA FICHE**

À la fin de la fiche détaillée de l’offre, ajouter un encart « Recruteur » contenant :

- Photo ou avatar du recruteur.
- Nom et prénom du recruteur.
- Poste ou fonction du recruteur.
- Entreprise ou service.
- E-mail professionnel, si renseigné.
- Téléphone professionnel, si renseigné.
- Lien LinkedIn, si renseigné.
- Bouton « Je postule ».

Exemple :

```text
Recruteur
Awa Koné
Responsable Recrutement
Hopla
recrutement@hopla.ci
+225 XX XX XX XX XX
[Je postule]
```

**6. MODALE DE CANDIDATURE**

Lorsque le candidat clique sur « Je postule », ouvrir une fenêtre modale avec :

- Titre : « Candidature — [Titre du poste] ».
- Nom.
- Prénom.
- E-mail.
- Téléphone, facultatif.
- CV obligatoire.
- Lettre de motivation obligatoire ou facultative selon la configuration de l’offre.
- Message de motivation.
- Case à cocher de consentement RGPD avec lien vers la politique de confidentialité.
- Protection anti-spam : honeypot et, si disponible, reCAPTCHA v3 ou Cloudflare Turnstile.
- Bouton : « Envoyer ma candidature ».

Règles d’upload :

- Formats acceptés : PDF, DOC, DOCX.
- Taille maximale : 5 Mo par fichier.
- Vérifier les fichiers côté serveur.
- Stocker les documents dans un espace privé, non accessible publiquement.
- Renommer les fichiers de manière sécurisée.
- Ne jamais exposer directement les CV ou lettres de motivation via une URL publique.

**7. DOUBLE OPT-IN**

- À la soumission, enregistrer la candidature avec le statut « En attente de validation ».
- Ne pas transmettre immédiatement la candidature, le CV, la lettre de motivation ou l’e-mail du candidat au recruteur.
- Envoyer automatiquement au candidat un e-mail contenant un lien de validation unique, sécurisé, chiffré et valable 48 heures.
- Afficher après envoi : « Votre candidature a été enregistrée. Un e-mail de validation vous a été envoyé. Votre candidature ne sera transmise au recruteur qu’après avoir cliqué sur le lien de validation. »
- Lorsque le candidat clique sur le lien, passer la candidature au statut « Validée ».
- Ce n’est qu’après validation que la candidature devient visible dans le back-office et qu’un e-mail de nouvelle candidature est envoyé à l’administrateur ou au recruteur.
- Si le lien expire, permettre au candidat de demander un nouveau lien.
- Empêcher la réutilisation d’un lien déjà utilisé.

**8. API ET ROUTES**

- Créer des Server Actions ou des Route Handlers Next.js pour :
  - récupérer la liste paginée des offres ;
  - récupérer le détail d’une offre ;
  - soumettre une candidature avec fichiers ;
  - valider l’e-mail via un token unique ;
  - demander un nouveau lien de validation.
- Utiliser `request.formData()` pour lire les fichiers et champs du formulaire.
- Valider toutes les données côté serveur avant enregistrement.
- Traiter les `FormData`, paramètres de requête et en-têtes comme des données non fiables.
- Valider le type de contenu, la taille des fichiers et nettoyer les données contre le XSS.
- Ne jamais exposer d’informations sensibles dans les messages d’erreur renvoyés au client.
- Vérifier le type MIME réel, la taille et l’extension des fichiers.
- Limiter le nombre de soumissions par IP, e-mail et période afin de prévenir le spam.

**9. E-MAILS AUTOMATIQUES**

E-mail au candidat après soumission :

- Objet : « Confirmez votre candidature — Hopla ».
- Contenu : rappel de l’offre, bouton ou lien « Valider mon e-mail », durée de validité du lien, mention que la candidature ne sera transmise qu’après validation.

E-mail à l’administrateur ou au recruteur après validation :

- Objet : « Nouvelle candidature validée — [Poste] ».
- Contenu : nom du candidat, offre concernée, date de candidature, lien sécurisé vers la candidature dans le back-office.

E-mail de confirmation finale au candidat après validation :

- Objet : « Votre candidature a bien été transmise — Hopla ».
- Contenu : confirmation, rappel de l’offre, délai habituel de retour.

Rendre les objets, messages, expéditeur et signature configurables via des variables d’environnement ou une table de configuration.

**10. SÉCURITÉ**

- Valider, nettoyer et échapper toutes les données reçues.
- Ne jamais faire confiance aux données du client.
- Protéger les Route Handlers comme des endpoints publics : vérifier l’origine, appliquer une limitation de débit et valider les données.
- Ne pas exposer de secrets, clés API, identifiants de base de données ou chemins de fichiers dans le client.
- Stocker les CV et lettres de motivation dans un espace privé.
- Générer des liens de téléchargement temporaires et sécurisés, accessibles uniquement aux utilisateurs autorisés.
- Journaliser les événements importants sans stocker de données sensibles inutiles dans les logs.

**11. DESIGN ET EXPÉRIENCE UTILISATEUR**

- Interface moderne, claire, professionnelle, aérée et mobile-first.
- Respecter strictement la charte graphique de HoplaGroupe.
- Prévoir les états visuels : offre active, survol, chargement, erreur, succès, expiration du lien de validation.
- Rendre la page accessible, rapide et optimisée pour le référencement.
- Assurer la compatibilité avec le thème, les composants, les dépendances et les outils déjà utilisés dans le projet Next.js.