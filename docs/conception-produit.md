# AC Worship — Dossier de conception produit

**Version :** 0.1 · **État :** proposition à valider · **Périmètre :** conception du MVP

Ce document précise la proposition produit, les parcours, les règles métier et l’architecture de départ. Il sert de référence avant d’engager la construction des fonctions connectées. La page d’accueil actuelle est un prototype visuel avec des contenus fictifs.

## 1. Vision produit

AC Worship est la plateforme musicale et culturelle de l’Assemblée Chrétienne. Elle rassemble les œuvres, artistes, playlists, événements, articles et produits de son écosystème dans une expérience où la musique reste le point d’entrée.

**Promesse :** découvrir la musique de l’AC, écouter les contenus autorisés et rester proche des artistes et de leurs actualités depuis un espace unique.

**Positionnement :** une plateforme musicale chrétienne professionnelle, avec des repères de navigation connus des utilisateurs de streaming, une identité propre et une sélection éditoriale ancrée dans l’Assemblée Chrétienne.

### Résultats recherchés

- Les visiteurs trouvent rapidement une sortie ou un artiste pertinent.
- Les membres peuvent conserver et organiser leurs découvertes.
- Les artistes disposent d’un profil fiable et d’un processus clair pour soumettre leurs contenus.
- L’équipe éditoriale peut publier et modérer un catalogue cohérent.

Les indicateurs initiaux à instrumenter sont la découverte vers la lecture, les lectures qualifiées, les retours à la plateforme, les abonnements aux artistes et le délai de validation. Les seuils de succès seront fixés après établissement d’une mesure de référence et échanges avec les responsables de l’AC.

## 2. Utilisateurs et besoins

| Profil | Besoin | Capacités MVP |
|---|---|---|
| Visiteur | Découvrir sans friction | Parcourir et rechercher les contenus publics, écouter les contenus autorisés, consulter événements et catalogue |
| Membre | Retrouver ses choix | Favoris, artistes suivis, playlists privées ou publiques, historique, événements enregistrés |
| Artiste | Présenter et soumettre son travail | Profil, sorties, événements et produits ; suivi de statut ; statistiques agrégées simples |
| Éditeur / administrateur | Maintenir qualité, droits et cohérence | Gestion des contenus, validation, archivage, gestion des comptes et catégories |

### Principes d’accès

- La consultation publique ne requiert pas de compte.
- Un compte est requis pour sauvegarder, suivre, créer des playlists ou consulter un historique personnel.
- Un artiste gère uniquement les profils qui lui sont explicitement associés.
- Les actions d’administration sont réservées aux comptes administrateurs et journalisées.
- Un utilisateur peut cumuler le rôle de membre et un accès artiste ; les permissions sont attribuées séparément.

## 3. Architecture de l’information

### Navigation publique

1. **Accueil** — sélection éditoriale, sorties récentes, artistes et rendez-vous.
2. **Explorer** — recherche, catégories de découverte, nouveautés et sélections.
3. **Musique** — titres, albums, singles, EP, playlists et pages de lecture.
4. **Artistes** — répertoire filtrable et profils.
5. **Événements** — prochaines dates, détails et inscriptions externes éventuelles.
6. **Actualités** — annonces, interviews, portraits et récits.
7. **Store** — catalogue consultatif, sans panier ni transaction.

### Espaces personnels

- **Ma bibliothèque :** playlists, favoris, artistes suivis, historique et événements sauvegardés.
- **Espace artiste :** vue d’ensemble, musique, albums, événements, articles, produits, statistiques, profil et paramètres.
- **Administration :** vue d’ensemble, utilisateurs, artistes, musique, albums, playlists, événements, articles, catalogue, catégories, modération et paramètres.

### Pages de contenu

- **Titre :** artwork, titre, artistes, album, durée, date, description, paroles autorisées, actions, titres associés.
- **Album / single / EP :** artwork, nom, artiste, date, description, liste ordonnée des titres et durée totale.
- **Artiste :** identité, biographie courte, styles, liens officiels, abonnés, bouton Suivre, titres populaires, sorties, playlists, événements, articles et catalogue.
- **Playlist :** identité, propriétaire ou éditeur, visibilité, ordre des titres, durée, lecture et partage.
- **Événement :** date avec fuseau explicite, lieu, artistes, informations pratiques, inscription externe facultative et partage.
- **Article :** titre, résumé, auteur, catégorie, date, contenu, temps de lecture et contenus associés.
- **Produit :** images, description, artiste, disponibilité, prix indicatif facultatif et contact ou lien externe.

## 4. Parcours principaux

### Découvrir et écouter

Accueil ou Explorer → sortie → page album / titre → lecture → artiste → Suivre.

Le clic sur lecture crée une file de lecture et conserve le titre actif lors de la navigation. Le lecteur persistant expose pause, précédent, suivant, progression, volume, mode aléatoire, répétition, file et favoris. Les contrôles doivent refléter l’état réel du média ; le prototype actuel est seulement visuel.

### Rechercher

Recherche globale → suggestions classées par type → résultats regroupés (titres, artistes, albums, playlists, événements, articles, produits) → page de détail.

Les résultats publics ne révèlent que les contenus publiés. Les recherches récentes restent locales à l’appareil tant qu’un compte ou un besoin explicite de synchronisation ne justifie leur stockage.

### Créer une playlist

Titre ou menu d’action → Ajouter à une playlist → sélectionner une liste ou créer → confirmation sans perdre la lecture en cours.

Le propriétaire peut renommer, réordonner, retirer des titres, définir la visibilité et supprimer la playlist. Une suppression ne supprime jamais les titres eux-mêmes.

### Soumettre une sortie

Espace artiste → Musique → brouillon → métadonnées et fichier → déclaration des droits → soumission → revue éditoriale → publication ou retour motivé.

L’artiste voit le statut et l’historique des décisions. Une modification substantielle d’un titre publié repasse en revue avant prise en compte publique.

### Consulter un événement ou un produit

Profil artiste ou accueil → fiche → sauvegarder / partager. Une inscription ou un contact peut renvoyer vers un service externe. Aucun paiement, panier, commande ou billetterie payante n’est traité dans le MVP.

## 5. Périmètre et exclusions

### V1 — MVP

- Pages publiques responsives, recherche et catalogue musical.
- Lecture des fichiers autorisés, lecteur persistant et file de lecture.
- Comptes et sessions, favoris, suivis, bibliothèque, playlists et historique.
- Profils artistes, albums, titres, événements, articles et produits.
- Espace artiste avec soumission et statistiques de base.
- Administration, modération, statuts et gestion des catégories.
- Recommandations déterministes : nouveautés, popularité agrégée et artistes suivis.

### Hors V1

- Paiements, panier, commandes, dons, commissions, versements et billetterie payante.
- Téléchargement hors ligne, application native, chat, commentaires ou réseau social.
- Recommandations par apprentissage automatique.
- Diffusion en direct et licences géographiques complexes.

### V2 / V3

- **V2 :** notifications, personnalisation, analytique artiste plus riche, amélioration de la recherche et fonctions communautaires validées par les usages.
- **V3 :** commerce et paiements, soutien financier, billetterie, application native et recommandations avancées après validation juridique et opérationnelle.

## 6. Règles métier et modération

### Cycle de publication

`DRAFT → PENDING_REVIEW → APPROVED → PUBLISHED → ARCHIVED`

Un contenu refusé passe à `REJECTED`, avec motif et possibilité de correction puis nouvelle soumission. `APPROVED` signifie que la revue est favorable ; la publication peut être programmée ou réalisée par l’éditeur selon le processus retenu.

La musique, les paroles, les images, les articles, événements et produits suivent un statut contrôlé. L’API publique ne renvoie que les éléments `PUBLISHED` et dont la date de publication est atteinte.

### Droits et confiance

- L’artiste confirme disposer des droits ou autorisations nécessaires pour le master, la composition, les paroles, les images et les contributions tierces.
- La soumission conserve l’identité du déclarant, l’horodatage, la version du formulaire et l’état de revue.
- L’équipe peut suspendre un contenu contesté pendant vérification et consigner la décision.
- Les paroles sont facultatives et publiées uniquement si leur affichage est autorisé.
- Les administrateurs peuvent corriger les métadonnées ; les modifications critiques restent traçables.

### Suppression et archivage

Archiver retire un élément des parcours publics sans effacer l’historique d’écoute ou les journaux de modération. Les suppressions définitives relèvent d’une procédure distincte, notamment pour les comptes et données personnelles.

## 7. UX, contenu et direction visuelle

- Réutiliser les modèles compris des services musicaux : navigation persistante, recherche, listes, cartes, bibliothèque, mini-player, Now Playing et file.
- Conserver une identité AC Worship indépendante : palette minérale et olive, typographie éditoriale lisible, pochettes et portraits authentiques.
- Faire de la musique le contenu prioritaire ; actualités, événements et catalogue enrichissent les profils et la découverte.
- Limiter l’accueil à quelques modules éditoriaux utiles, personnalisés seulement quand les données du membre le permettent.
- Sur mobile : navigation courte, contrôles tactiles, mini-player au-dessus de la barre d’onglets, recherche accessible et pages adaptées au pouce.
- Prévoir focus clavier, libellés accessibles, contraste, états vides et `prefers-reduced-motion`.
- Le ton est humain, précis et culturel ; aucune promesse marketing générique ni emoji dans l’interface.

### Règles d’interface

- Ne pas afficher une statistique sans préciser sa définition (lecture qualifiée, période, source).
- Les actions qui exigent un compte expliquent le bénéfice au moment où elles sont déclenchées.
- Une action de lecture reste disponible sans inscription si les droits du contenu le permettent.
- Distinguer clairement « enregistrer un événement » et « s’inscrire à l’événement ».
- Afficher les disponibilités de produits comme informations de catalogue, sans suggérer un achat intégré.

## 8. Architecture technique proposée

### Architecture de départ

Monolithe modulaire Next.js avec App Router, TypeScript strict, modules métier côté serveur et PostgreSQL. Cette forme réduit les opérations à gérer pour une équipe MVP et permet d’extraire un service si une charge mesurée le justifie.

| Domaine | Proposition de départ | Arbitrage / évolution |
|---|---|---|
| Web | Next.js + React + TypeScript | Rendu serveur pour les pages publiques, interactions ciblées côté client |
| API | Server Actions ou handlers validés par Zod | Endpoints explicites pour les intégrations, webhooks et usages mobiles futurs |
| Données | PostgreSQL + Prisma | Relations et contraintes fortes ; migrations versionnées |
| Identité | Sessions opaques en base, cookie `HttpOnly`, `Secure`, `SameSite` | Bibliothèque ou fournisseur géré à comparer selon exigences de récupération et de courriel |
| Fichiers | Stockage objet privé compatible S3 avec URLs signées | Images publiques dérivées/optimisées ; audio original non exposé en écriture publique |
| Audio | Fichiers encodés adaptés au web servis par CDN, lecture progressive au départ | Étudier HLS si qualité réseau, poids ou trafic le justifie |
| Recherche | PostgreSQL full-text/trigrammes au MVP | Service dédié si volume, fautes, facettes ou pertinence multilingue le nécessitent |
| Analytique | Événements minimisés et agrégats par période | Définir consentement, rétention et méthode de comptage avant dashboard artiste |
| Déploiement | Hébergement Next géré, PostgreSQL managé, stockage/CDN séparé | Éviter de servir les gros fichiers audio depuis les fonctions web |
| Opérations | Logs structurés, suivi d’erreurs, alertes, sauvegardes et restauration testée | Définir disponibilité cible et responsables de l’exploitation |

### Critères de choix encore ouverts

Les fournisseurs définitifs ne sont pas fixés. Comparer coût total, limites de transfert audio, résidence et export des données, contrôle d’accès privé, sauvegarde/restauration, facilité de migration, capacité de l’équipe et support. Les tarifs évoluent ; établir une comparaison à la date du choix avec des hypothèses de stockage, lectures mensuelles et taille de catalogue.

### Sécurité minimale

- Autorisation côté serveur à chaque lecture ou écriture ; rôle et association artiste vérifiés en base.
- Validation Zod à chaque frontière, requêtes paramétrées via ORM, limitation de débit sur connexion et recherche.
- Cookies de session sécurisés, secrets hors dépôt, rotation et invalidation des sessions.
- Téléversements limités en taille/type, analyse MIME réelle, noms générés, accès privé et URL signées à durée limitée.
- Protection contre CSRF selon le mécanisme d’action/API, en-têtes de sécurité et politique CSP adaptée.
- Journaux de modération sans mot de passe, jeton de session ou URL signée.
- Sauvegardes chiffrées, procédure de restauration, suppression et export des données personnelles.

## 9. Modèle de données de référence

Le schéma Prisma de départ couvre les entités listées ci-dessous. Les cardinalités multiples passent par des tables d’association explicites.

| Entité | Relations essentielles | Notes |
|---|---|---|
| User / Session | utilisateur 1—N sessions | Sessions révocables, secret stocké sous forme de hash |
| Artist / ArtistMember | artistes N—N utilisateurs | Rôle d’accès distinct du profil public |
| Song / SongArtist / Album | chansons N—N artistes ; album 1—N titres | Un titre peut être publié sans album |
| Playlist / PlaylistTrack | propriétaire 1—N playlists ; listes N—N titres ordonnés | Playlist éditoriale sans propriétaire membre |
| Favorite / Follow | membre N—N titres et artistes | Clés composées pour éviter les doublons |
| ListeningHistory | membre N—N titres via événements d’écoute | Définir une écoute qualifiée et limiter rétention |
| Event / EventArtist / EventSave | événements N—N artistes ; membres N—N événements enregistrés | Aucun objet de paiement/billet en V1 |
| Article | auteur éditorial et artiste facultatif | Auteur utilisateur à ajouter si besoin de byline liée à un compte |
| Product / Category | artiste 1—N produits ; catégories 1—N produits | Catalogue seulement, pas de commande |
| Notification | utilisateur 1—N notifications | Préparer les types, activation différée possible |

Tous les contenus modérés devraient partager un statut, une date de publication, un créateur, un dernier éditeur et un historique de revue. Le schéma actuel devra être revu avant les migrations de production, en particulier pour l’audit des statuts, les métadonnées de droits, les auteurs d’articles et le comptage analytique.

## 10. Mesure produit

Définir un dictionnaire d’événements avant d’activer les statistiques : `search_submitted`, `content_opened`, `play_started`, `play_progress`, `play_completed`, `artist_followed`, `playlist_created`, `event_saved` et `content_submitted`. Chaque événement indique la source, l’identifiant de contenu pseudonymisé si nécessaire et l’heure ; ne pas enregistrer le texte libre de recherche sans justification.

Une lecture qualifiée doit avoir une règle stable (par exemple un seuil de temps d’écoute défini avec l’équipe), traiter les reprises et exclure les préécoutes/tests. Les tableaux artistes utilisent des agrégats, des périodes explicites et des seuils qui évitent de révéler les comportements individuels.

## 11. Décisions de validation

Avant le design détaillé et les fonctions connectées, les responsables produit de l’AC doivent confirmer :

1. Les contenus et langues disponibles au lancement, ainsi que les variantes de français/localisation nécessaires.
2. Qui peut créer un profil artiste et comment l’association artiste-utilisateur est approuvée.
3. Qui possède la décision finale de validation et si un contenu approuvé est publié automatiquement ou par un éditeur.
4. Les droits territoriaux et les conditions d’écoute hors connexion réseau, notamment l’autorisation de diffusion des masters et paroles.
5. La définition de « lecture » et les statistiques visibles aux artistes.
6. L’hébergement, la résidence et la durée de conservation des comptes, historiques et journaux.
7. La priorité entre l’espace artiste complet et les fonctions utilisateur si les ressources du MVP sont limitées.

Ces réponses influencent les permissions, le schéma de données, les écrans de gestion et les coûts de diffusion. Elles doivent être documentées avant la mise en production.
