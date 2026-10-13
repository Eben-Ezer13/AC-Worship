# Réception des premiers contenus

## Contenus repérés

Les dossiers `Yoann Adopo` et `June Grogui` transmis dans Téléchargements ont été inventoriés :

- 2 fichiers de biographie (celui de June est un court texte de présentation, à compléter si souhaité) ;
- 22 fichiers audio MP3 pour Yoann et 6 pour June ;
- 2 photos de profil, des bannières et des pochettes ;
- certaines pistes portent dans leur nom les mentions reprise, adaptation, cover ou medley.

Le catalogue d’entrée se trouve dans [`prisma/content-intake.json`](../prisma/content-intake.json). Les 28 pistes y sont en `PENDING_REVIEW`, `rightsConfirmed: false` et `published: false`. Les noms de fichiers sont conservés pour éviter d’inventer les titres, dates, albums ou crédits manquants.

## Ce qui est visible dans le prototype

Deux portraits et quelques pochettes reçues sont copiés dans `public/media/` et utilisés sur l’accueil. Les fiches présentent les deux artistes et quelques titres comme **à valider**. Cela permet de vérifier le rendu des vrais visuels.

Les MP3 ne sont **pas** copiés dans `public/`, ne sont pas inclus dans Git et ne sont pas lisibles depuis le site. Leur taille cumulée est d’environ 244 Mo. `sourceAudio` dans le manifeste est un chemin relatif au dossier Téléchargements sur l’ordinateur où les fichiers ont été reçus ; il ne s’agit pas encore d’un stockage serveur.

## Avant d’activer une piste

Pour chaque enregistrement, confirmer par écrit :

1. qui détient les droits du master et autorise sa mise en ligne ;
2. les droits sur la composition et les paroles ;
3. l’autorisation pour toute adaptation, traduction, reprise, medley ou arrangement tiers ;
4. les territoires, la durée de l’autorisation et les plateformes couvertes ;
5. l’autorisation d’utiliser la pochette et les images.

Renseigner ensuite les métadonnées vérifiées (titre, interprètes, auteurs/compositeurs, album éventuel, année, durée, langue et crédits). Aucun champ inconnu n’est déduit du nom de fichier.

## Mise en ligne future

Le projet ne comporte pas encore de formulaire de téléversement artiste ni de stockage privé connecté. Une fois les droits confirmés, l’étape technique est de créer un flux d’import authentifié qui envoie le MP3 vers un stockage objet privé, enregistre ses métadonnées en base, puis permet à un administrateur de valider et publier la piste. Les fichiers audio ne doivent pas être ajoutés au dépôt Git ni servis depuis un chemin public avant cette étape.
