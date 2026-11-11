# Activer la rédaction avec ChatGPT et la programmation

Ces fonctions s’ajoutent au blog existant. Les couleurs, les polices, les cartes, le bouton de lecture et les corrections de prévisualisation sont conservés. Les styles existants du site ne sont pas remplacés : un module spécifique est ajouté pour les nouveaux encarts administratifs.

## 1. Installer les fichiers et la dépendance

Arrêter `npm run dev` avec Ctrl+C avant de remplacer les fichiers. Copier l’archive à la racine de `hg-groupe` en conservant les dossiers, puis lancer :

```powershell
npm ci
```

L’archive contient les versions complètes de package.json et package-lock.json avec Cheerio, utilisé pour analyser les titres de l’article de référence. Si vous avez ajouté d’autres dépendances depuis notre dernière version, conserver votre package.json et lancer `npm install cheerio` à la place pour fusionner l’ajout.

## 2. Ajouter les deux tables

La connexion existante de `.env.local` est réutilisée. Depuis le dossier du projet :

```powershell
node --env-file=.env.local scripts/migrate-blog.mjs 20261111_blog_ai_schedule.sql
```

Le script ajoute `blog_publication_jobs` et `blog_ai_requests`. Il ne modifie ni les tables existantes ni les articles. Comme pour toute migration, conserver une sauvegarde de la base.

## 3. Configurer OpenAI côté serveur

Ajouter dans `.env.local` sans supprimer les variables existantes :

```dotenv
OPENAI_API_KEY=VOTRE_CLE_API_OPENAI
OPENAI_BLOG_MODEL=gpt-5.4-mini
BLOG_AI_DAILY_LIMIT=20
BLOG_SITE_URL=http://localhost:3000
BLOG_CRON_SECRET=A_GENERER
```

La clé se crée dans votre compte API OpenAI : https://platform.openai.com/api-keys. Ne jamais la partager dans la conversation ni ajouter de préfixe `NEXT_PUBLIC_`. Vérifier que votre compte API peut utiliser le modèle configuré.

Générer un secret de programmation sur votre ordinateur :

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copier le résultat comme valeur de `BLOG_CRON_SECRET`, à la place de `A_GENERER`. Le secret doit contenir au moins 32 caractères. La génération IA et la programmation sont indépendantes : OPENAI_API_KEY n’est pas nécessaire pour programmer un article rédigé manuellement.

Les mêmes variables devront être ajoutées à l’environnement du serveur Hostinger lors du déploiement. Sur le serveur, `BLOG_SITE_URL` doit être l’adresse HTTPS réelle du site. Conserver aussi le dossier persistant BLOG_MEDIA_DIR déjà prévu pour les images.

## 4. Compiler et démarrer

```powershell
npm run build
npm run dev
```

Ouvrir `/admin/blog`, puis un article. Deux encarts sont disponibles : « Rédiger avec ChatGPT » et « Programmer la publication ».

## 5. Utiliser la rédaction assistée

1. Préciser le sujet, la cible, le ton et la longueur souhaitée (600, 900 ou 1 200 mots environ).
2. Facultativement, coller l’URL HTTPS publique d’un article et/ou un plan textuel.
3. Ajouter les faits autorisés, les mots-clés et les consignes de rédaction. Le brouillon existant n’est pas envoyé automatiquement à l’IA.
4. Cliquer « Générer une proposition » et relire le résultat ainsi que les points à vérifier.
5. Cliquer « Insérer dans le brouillon », puis confirmer. Le titre, le résumé, le contenu et les métadonnées SEO de l’éditeur sont remplacés. L’auteur, la catégorie et la couverture sont conservés.
6. Relire, enregistrer, prévisualiser, puis publier ou programmer.

La génération n’enregistre ni ne publie automatiquement un article. Écarter une proposition laisse l’éditeur intact. Une nouvelle proposition n’est pas insérée sans clic explicite. L’API n’a aucun outil lui permettant de publier.

L’analyse du lien ne transmet que le titre, les H2/H3 et des compteurs de paragraphes/listes, pas le corps de l’article. L’IA est invitée à s’inspirer de cette organisation en rédigeant des textes et des titres originaux. Les pages privées, payantes, bloquées, exclusivement rendues en JavaScript ou inaccessibles peuvent échouer : retirer le lien et coller le plan manuellement.

Les réponses sont validées puis converties vers le JSON contrôlé de Tiptap. Aucun HTML arbitraire provenant du modèle n’est rendu. Le modèle ne dispose pas d’un outil de recherche : dates, chiffres récents, citations et références doivent être fournis ou vérifiés par le rédacteur.

Le serveur limite les sorties à 9 000 tokens et les requêtes à 20 tentatives par jour et par administrateur par défaut (BLOG_AI_DAILY_LIMIT, maximum 100). Une seule génération simultanée par administrateur. Le journal conserve le modèle, l’état, la consommation et la date ; il ne conserve pas les briefs ni les réponses. `store:false` est envoyé à OpenAI ; cela ne constitue pas une garantie de conservation nulle sur l’ensemble du service OpenAI.

Documentation de l’intégration :
- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/models/gpt-5.4-mini

## 6. Programmer et tester localement

Dans l’article, sélectionner une échéance au moins une minute dans le futur, exprimée en Africa/Abidjan, puis confirmer « Programmer cet article ». Le même contrôle des champs obligatoires que pour publier s’applique. L’heure est stockée en UTC ; Abidjan est en UTC.

La version programmée est un instantané du brouillon validé. Une sauvegarde ultérieure ne la change pas. Pour programmer un nouveau contenu, remplacer explicitement la programmation. L’adresse de l’article reste figée tant qu’une programmation est active, puis après la première publication.

Pour annuler, cliquer « Annuler la programmation ». Publier ou dépublier manuellement annule aussi la programmation en attente.

En local, laisser `npm run dev` en marche. Une fois l’heure atteinte, dans un deuxième terminal du projet :

```powershell
node --env-file=.env.local scripts/blog-publish-due.mjs
```

Le résultat annonce `published: 1` si une publication est arrivée à échéance. Relancer ne republie pas le même travail. Vérifier la page publique et le sitemap dans une session déconnectée. Le cron incrémente la version de l’article : un ancien onglet d’édition doit être rechargé avant une nouvelle sauvegarde.

## 7. Activer la publication automatique sur l’hébergement

Configurer une tâche toutes les minutes qui lance le script Node avec les variables serveur, même lorsque l’administration est fermée. Exemple à adapter aux chemins réels et à la commande Node de votre hébergement :

```text
/chemin/vers/node --env-file=/chemin/hg-groupe/.env.local /chemin/hg-groupe/scripts/blog-publish-due.mjs
```

Fréquence cron : `* * * * *`.

La disponibilité d’une commande Node dans les tâches planifiées dépend de l’offre Hostinger. Si elle n’est pas disponible, un ordonnanceur externe peut appeler chaque minute :

```text
POST https://VOTRE-DOMAINE/api/internal/blog/publish-due
Authorization: Bearer VALEUR_DE_BLOG_CRON_SECRET
```

Utiliser le champ secret/en-tête du service, pas un paramètre d’URL public. La clé OpenAI n’est jamais nécessaire dans l’ordonnanceur.

Sans tâche planifiée active, la date est enregistrée mais la publication attend le prochain appel. La présence du secret ne prouve pas à elle seule que l’ordonnanceur tourne. Après une panne, les échéances dépassées sont traitées au passage suivant, par lots de 25. La précision correspond à la fréquence de passage du cron.

La sélection et la publication utilisent des verrous et des transactions : une annulation est revérifiée, deux passages simultanés ne publient pas deux fois et un échec de base annule ensemble la publication et la clôture du travail.

## Vérifications effectuées et limites

Compilation de production, TypeScript et tests automatisés du contenu, des réponses HTTP, des briefs, de la conversion JSON, des réseaux privés, de l’extraction de structure, du fuseau, des dates et du traitement des publications programmées. Les tests de publication utilisent une connexion simulée et vérifient instantané, idempotence, annulation et rollback.

Aucun appel facturé à OpenAI n’a été effectué : aucune clé utilisateur n’était disponible ici. La lecture d’un site externe n’a pas pu être vérifiée en direct dans cet environnement (résolution DNS indisponible). Aucune migration ni tâche cron n’a été exécutée sur votre base/Hostinger. Tester ces connexions réelles après configuration.
