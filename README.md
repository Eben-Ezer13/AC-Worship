# AC Worship

Plateforme musicale et culturelle de l’Assemblée Chrétienne : artistes, musique, playlists, événements, actualités et catalogue d’artistes.

## Démarrage local

Prérequis : Node.js 20+ et une base PostgreSQL.

```bash
npm install
cp .env.example .env
# Renseigner DATABASE_URL, DIRECT_URL et SESSION_SECRET
npm run db:generate
npm run db:migrate
npm run dev
```

L’application est alors disponible sur http://localhost:3000.

## Scripts

- `npm run dev` : serveur de développement
- `npm run build` : build de production
- `npm run lint` : analyse ESLint
- `npm run db:generate` : génération du client Prisma
- `npm run db:migrate` : migration locale
- `npm run db:deploy` : application des migrations existantes

## Produit

Le MVP couvre la découverte musicale, les profils artistes, albums et titres, playlists, un lecteur persistant, les comptes et la bibliothèque, les événements, les articles, un catalogue Store sans transactions, ainsi que les espaces de gestion artiste et administration.

La publication suit un circuit de validation et de déclaration des droits. Aucun paiement, panier, commande ni billetterie payante n’est prévu dans cette version.

La page d’accueil actuelle est un premier prototype d’interface avec des contenus de démonstration. Les contrôles du lecteur illustrent l’expérience et seront reliés au stockage audio autorisé avec les premiers contenus réels.
