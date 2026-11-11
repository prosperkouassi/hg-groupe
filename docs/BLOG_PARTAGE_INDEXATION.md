# Partage LinkedIn et indexation du blog

## Correctif de partage

Les balises Open Graph étaient déjà présentes. Le correctif rend les URL absolues et ajoute une image JPEG de partage à 1200 × 630 pour le blog et chaque article publié. Les objets Open Graph renseignent format, dimensions, texte alternatif, titre et description ; Twitter reçoit les mêmes informations.

- Blog : `/api/blog/share-image` utilise l’image de marque fournie avec le site.
- Article : `/api/blog/share-image/SLUG?v=DATE_DE_PUBLICATION` utilise la couverture publiée, avec repli sur l’image de marque si aucun fichier exploitable n’est disponible.
- Les brouillons et les versions seulement programmées ne sont jamais exposés par la route article. Les erreurs de base renvoient 503 plutôt que de faire passer une panne temporaire pour une suppression d’article.
- La nouvelle image est servie sans connexion administrateur. Les médias privés de l’éditeur ne changent pas de statut.
- Aucun style ni contenu visible du site n’est changé. Le sitemap, les couvertures d’origine et les dates publiées restent utilisés.

Copier les fichiers en conservant les dossiers. Aucune dépendance ou migration supplémentaire. Lancer `npm run build`, puis redémarrer/déployer le site avec son stockage persistant d’images `BLOG_MEDIA_DIR`.

Le partage ne fonctionne pas vers `localhost`, une adresse de prévisualisation privée, un brouillon ou une URL renvoyant 404. Le lien de l’article et son image doivent être accessibles sur Internet sans session. Le domaine canonique utilisé par le projet est actuellement `https://hoplagroupe.com` ; vérifier qu’il correspond à l’adresse de production effective.

Un contrôle externe de `https://hoplagroupe.com/blog` a renvoyé 404 pendant l’intervention. L’URL exacte réellement partagée par l’utilisateur reste à vérifier : le correctif local ne prouve pas que les fichiers sont déjà déployés ou que le domaine pointe vers ce projet.

## Vérifier l’URL réellement déployée

```powershell
node scripts/check-blog-sharing.mjs https://hoplagroupe.com/blog/VOTRE-ARTICLE
```

Le script effectue une requête sans session avec l’agent LinkedInBot, vérifie le statut HTTP, les métadonnées dans le head et le téléchargement de l’image. Il ne lit aucune clé API. Next.js reconnaît déjà LinkedInBot dans sa liste native des robots recevant des métadonnées bloquantes ; aucune modification générale du rendu du site n’est nécessaire.

Puis ouvrir https://www.linkedin.com/post-inspector/ et inspecter l’URL publique exacte. LinkedIn peut conserver une ancienne image en cache. Selon sa documentation, le rafraîchissement concerne les nouveaux partages ; les publications existantes conservent leur ancien aperçu.

Références :
- https://www.linkedin.com/help/linkedin/answer/a521928/make-your-website-shareable-on-linkedin
- https://www.linkedin.com/help/linkedin/answer/a6233775

## Gestion de l’indexation

Le blog dispose déjà d’un sitemap dynamique : `/sitemap.xml`. Le code y ajoute `/blog` et les articles pour lesquels `published IS NOT NULL`, avec `published_at` comme date de dernière modification. Après une publication immédiate ou le passage du cron pour une publication programmée, le prochain appel du sitemap voit la nouvelle version. Un article dépublié est retiré. La simple modification d’un brouillon ne modifie pas sa version publique ni sa date SEO.

Chaque article public dispose d’une URL canonique propre, d’un titre et d’une description SEO, des dates publiques, de l’auteur et de données structurées BlogPosting et BreadcrumbList. Le code ne marque pas les articles publiés en noindex. L’administration et les prévisualisations sont privées/noindex. Les recherches et les filtres du blog restent noindex ; les pages de pagination ordinaires conservent une canonical propre et des liens HTML vers les articles.

### Mise en service dans Google Search Console

1. Vérifier la propriété correspondant au domaine réellement utilisé, idéalement une propriété Domaine.
2. Dans Sitemaps, soumettre `sitemap.xml` une fois, puis vérifier son état et les URLs découvertes.
3. Pour les premiers articles prioritaires, ouvrir Inspection de l’URL, coller l’URL canonique publique, tester en direct puis demander l’indexation.
4. Suivre le rapport Pages/Indexation : une erreur 404/5xx, un blocage, une canonical incorrecte ou un noindex doit être traité selon le diagnostic.
5. Vérifier que les articles sont reliés depuis `/blog`, la pagination et les articles similaires. Publier un contenu original, utile et relu, y compris lorsqu’il est rédigé avec l’IA.

Il n’est pas nécessaire de resoumettre tout le sitemap pour chaque article. Le sitemap facilite la découverte, mais ne garantit ni le délai ni l’acceptation dans l’index Google. Une demande d’indexation n’est pas une garantie non plus. Aucune soumission Search Console n’a été effectuée dans cette intervention.

Références :
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl

## Validation

Tests : métadonnées absolues, concordance OG/Twitter, noindex des filtres/recherche, canonical de pagination, isolation de la version publiée, image JPEG réelle 1200 × 630 sous 5 Mo, et repli lorsque la couverture manque. Les articles et le stockage du serveur réel doivent encore être contrôlés après déploiement.
