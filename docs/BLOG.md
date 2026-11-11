# Blog Hopla — première version

## Activation sur votre environnement

1. Sauvegarder la base, puis importer `migrations/20261111_blog.sql` dans la base Hopla avec HeidiSQL. Le script ajoute une table ; il ne modifie aucune table existante.
2. Installer les dépendances : `npm ci` avec Node 22.
3. Définir `BLOG_MEDIA_DIR` comme un **chemin absolu persistant et accessible en écriture** par Node, hors du dossier des releases (exemple à adapter : `/home/votre-compte/hopla-media/blog`). Sauvegarder ce dossier avec la base. En développement seulement, `.blog-media` sert de valeur par défaut.
4. Conserver les variables DB et `ADMIN_SESSION_SECRET` déjà utilisées par le site. Aucun nouveau service externe requis.
5. Lancer `npm run build`, redémarrer le serveur, se connecter à `/admin/blog`, créer un brouillon, enregistrer et ouvrir la prévisualisation privée.
6. Après relecture, cliquer « Publier l’article ». Vérifier `/blog`, la page de lecture, les partages et `/sitemap.xml` dans une session déconnectée.

## Comportement

- Tiptap est chargé uniquement par l’administration : gras, italique, souligné, H2/H3, listes, liens, citations, annuler/rétablir, images par sélection, collage et glisser-déposer.
- Les images sont décodées et réencodées en WebP (2 000 pixels maximum en largeur, 8 Mo maximum en entrée). Les alternatives et légendes se modifient en sélectionnant une image puis « Propriétés image ».
- L’éditeur conserve un brouillon distinct du document publié. Enregistrer ne modifie jamais la version publique. Publier remplace explicitement cette version ; dépublier la retire sans supprimer le brouillon.
- La première version utilise deux instantanés JSON (brouillon et publié), pas un historique complet de révisions. Le numéro de version détecte les sauvegardes concurrentes.
- Les URL sont figées dès la première publication. Les pages publiques et le sitemap lisent l’état courant sans cache partagé.
- Les médias uniquement présents dans les brouillons sont accessibles aux administrateurs actifs. Une image référencée dans un article publié est accessible au public. Une image utilisée par plusieurs articles reste publique tant qu’un article publié la référence. Les réponses médias ne sont pas mises en cache pour respecter les changements de visibilité.
- Le bouton Prévisualiser reste toujours visible et enregistre le brouillon avant d’ouvrir l’aperçu dans le même onglet. Si l’enregistrement échoue, l’aperçu ne s’ouvre pas et l’erreur reste affichée. La prévisualisation privée utilise le même rendu que l’article public. Les liens de partage dans cette prévisualisation pointent vers l’URL publique, qui reste introuvable tant que l’article n’est pas publié.
- Catégories fixes dans `src/lib/blog/content.ts`. Recherche, pagination (9 articles), sommaire H2/H3, articles de même catégorie, liens de partage et métadonnées SEO inclus.
- Les textes sont rendus en React, sans HTML arbitraire ; les liens et les nœuds sont validés à l’enregistrement.

## Contrôles avant lancement

Vérifier sur la base réelle : création, sauvegarde, réouverture, publication, édition du brouillon sans changement public, publication des modifications, concurrence de deux onglets, dépublication, confidentialité des prévisualisations et médias, pagination/recherche, affichage mobile, accès clavier, et persistance des images après redéploiement.

## Lots suivants

Compteur de vues avec déduplication, publicité administrable, médiathèque, redimensionnement des images dans l’éditeur et historique complet des révisions. La rédaction assistée et la programmation sont décrites dans BLOG_IA_PROGRAMMATION.md. Les citations éditoriales sont déjà disponibles dans le corps des articles ; les encarts entre cartes restent à ajouter.

L’assistance IA et la programmation nécessitent l’activation décrite dans BLOG_IA_PROGRAMMATION.md. Elles ne sont pas activées automatiquement par la seule copie des fichiers.
