# AC Worship

Plateforme musicale de l’Assemblée Chrétienne : catalogue de chants, profils artistes, comptes, bibliothèque personnelle et espace de gestion artiste.

## Démarrage local

Prérequis : Node.js 20+ et PostgreSQL.

1. Copier `.env.example` vers `.env.local` et configurer `DATABASE_URL`, `DIRECT_URL` et `SESSION_SECRET` (une valeur aléatoire d’au moins 32 caractères). `DATABASE_URL` peut utiliser le pool de connexions de l’hébergeur ; `DIRECT_URL` doit être l’URL PostgreSQL directe.
2. Installer les dépendances : `npm install`.
3. Générer Prisma : `npm run db:generate`.
4. Appliquer le schéma avec `npm run db:migrate` (la migration initiale est déjà fournie dans `prisma/migrations`).
5. Importer les deux profils et le catalogue audio : `npm run db:seed`.
6. Lancer l’application : `npm run dev`.

Sans PostgreSQL, la découverte des profils et la lecture du catalogue restent disponibles. Comptes, bibliothèque, historique et soumissions artiste nécessitent la base de données.

## Espaces

- `/artists` et `/artists/[slug]` : répertoire et compositions des artistes.
- `/login` et `/signup` : création de compte auditeur ou artiste et sessions sécurisées.
- `/library` : favoris, playlists personnalisées, titres des playlists et artistes les plus écoutés.
- `/artist/dashboard` : mise à jour du profil, soumission de chants et de produits pour validation.
- Le lecteur de la page d’accueil permet d’agrandir la lecture avec la pochette en arrière-plan.

Les chants sont publiés après confirmation des droits et vérification du fichier. Le chemin audio doit déjà pointer vers un fichier présent dans `public/audio/`. L’envoi direct de fichiers par les artistes nécessite un stockage objet persistant à configurer avant déploiement.

## Commandes

- `npm run dev` : serveur de développement
- `npm run build` : build de production
- `npm run typecheck` : vérification TypeScript
- `npm run lint` : analyse ESLint
- `npm run db:generate` : client Prisma
- `npm run db:migrate` : migrations de développement
- `npm run db:deploy` : appliquer les migrations en déploiement
- `npm run db:seed` : importer le catalogue de départ
