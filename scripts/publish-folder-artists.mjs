import nextEnv from "@next/env";
import { readFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

nextEnv.loadEnvConfig(process.cwd());
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const artists = [
  {
    name: "Chantal Cofie-Agama",
    slug: "chantal-cofie-agama",
    bio: "Chantal aspire à voir Christ redonner de l’éclat et restaurer les vies brisées. Les vies peuvent être transformées grâce à la puissance de la Parole de Dieu !\n\nElle est bénie d’être au service du Seigneur au sein de la Famille des Assemblées Chrétiennes au Maroc.",
    imageUrl: "/media/artists/chantal-cofie-agama.jpg",
    genre: "Gospel",
  },
  {
    name: "Chris & Grâce",
    slug: "chris-grace",
    bio: "Duo de louange chrétienne, Chris & Grâce partagent des chants de foi et d’adoration.",
    imageUrl: "/media/artists/chris-grace.jpg",
    genre: "Gospel",
  },
];

try {
  const tracks = JSON.parse(await readFile("src/data/tracks.json", "utf8"));
  const publishedAt = new Date();
  for (const artist of artists) {
    const record = await prisma.artist.upsert({
      where: { slug: artist.slug },
      create: { ...artist, status: "PUBLISHED" },
      update: { ...artist, status: "PUBLISHED" },
      select: { id: true },
    });
    for (const track of tracks.filter((item) => item.artist === artist.name)) {
      await prisma.song.upsert({
        where: { slug: track.id },
        create: {
          id: track.id,
          slug: track.id,
          title: track.title,
          audioKey: track.audio,
          artworkUrl: track.cover,
          durationSec: track.duration || null,
          rightsConfirmedAt: publishedAt,
          status: "PUBLISHED",
          artists: { create: { artistId: record.id } },
        },
        update: {
          title: track.title,
          audioKey: track.audio,
          artworkUrl: track.cover,
          durationSec: track.duration || null,
          rightsConfirmedAt: publishedAt,
          status: "PUBLISHED",
        },
      });
      await prisma.songArtist.upsert({
        where: { songId_artistId: { songId: track.id, artistId: record.id } },
        create: { songId: track.id, artistId: record.id },
        update: {},
      });
    }
  }
  console.log(`Published ${tracks.filter((track) => artists.some((artist) => artist.name === track.artist)).length} tracks across ${artists.length} artist profiles.`);
} finally {
  await prisma.$disconnect();
}
