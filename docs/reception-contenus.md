# Réception des premiers contenus

## Contenus repérés

Les dossiers `Yoann Adopo` et `June Grogui` transmis dans Téléchargements ont été inventoriés et leurs contenus audio sont maintenant publiés dans la plateforme :

- 2 fichiers de biographie (celui de June est un court texte de présentation, à compléter si souhaité) ;
- 22 fichiers audio MP3 pour Yoann et 6 pour June ;
- 2 photos de profil, des bannières et des pochettes ;
- certaines pistes portent dans leur nom les mentions reprise, adaptation, cover ou medley.

Le catalogue d’entrée se trouve dans [`prisma/content-intake.json`](../prisma/content-intake.json), et les métadonnées utilisées par le lecteur dans [`src/data/tracks.json`](../src/data/tracks.json). L’utilisateur a confirmé détenir les droits et autorisé l’écoute publique le 13 octobre 2026. Les 28 pistes sont donc marquées publiées. Les noms d’origine sont conservés là où les titres, dates, albums ou crédits restent à compléter.

## Ce qui est visible dans le prototype

Les portraits et pochettes reçus sont copiés dans `public/media/` et affichés sur l’accueil. Les 28 pistes sont recherchables et jouables avec le lecteur persistant.

Les MP3 se trouvent dans `public/audio/` et sont servis publiquement par Next.js. Leur taille cumulée est d’environ 244 Mo. Ils sont inclus dans Git ; chaque piste dispose d’une URL `/audio/<identifiant>.mp3`. `sourceAudio` dans le manifeste conserve le chemin relatif d’origine pour faciliter le contrôle des fichiers.

## Métadonnées à compléter

La confirmation de droits a été donnée par l’utilisateur. Pour compléter les fiches, renseigner si disponible :

1. les auteurs, compositeurs, éditeurs et crédits d’interprétation ;
2. les détails des autorisations pour les adaptations, traductions, reprises, medleys ou arrangements tiers ;
3. les territoires et éventuelles limites de diffusion ;
4. l’album et la date de sortie ;
5. la durée des titres et les paroles autorisées.

Les noms de fichiers sont utilisés comme titres provisoires lorsque la métadonnée précise n’a pas été fournie. Aucun album, date ou crédit n’est déduit automatiquement.

## Mise en ligne future

Le projet ne comporte pas encore de formulaire de téléversement artiste ni de stockage objet/CDN séparé. Les MP3 sont servis depuis le dépôt pour ce premier catalogue ; pour un catalogue en croissance, déplacer les fichiers vers un stockage objet avec CDN réduira la taille du dépôt et améliorera la distribution.
