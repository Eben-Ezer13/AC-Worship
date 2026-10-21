import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const tracks = require("../src/data/tracks.json");
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const artistRecords = [
  { name: "June Grogui", slug: "june-grogui", bio: "Que les coeurs se tournent vers le Créateur au travers de la louange.", imageUrl: "/media/artists/june-grogui.jpg" },
  { name: "Yoann Adopo", slug: "yoann-adopo", bio: "Je suis Yoann Adopo, le disciple que Jésus aime.\n\nÉpoux d’une seule femme, je sers le Seigneur Jésus-Christ au sein de la Famille des Assemblées Chrétiennes, notamment comme conducteur de louange.\n\nÀ travers des chants que je compose ou que j’interprète, je désire célébrer Jésus, édifier Son peuple et faire connaître l’Évangile aux nations. Je crois qu’une génération se lève : des vies transformées pour adorer Dieu pleinement, et des adorateurs façonnés à Son image.\n\nVous n’êtes pas obligés de vous abonner, d’aimer, de commenter ou de partager. Mais chacun de ces gestes aide ces chants à toucher plus de personnes et à faire entendre le plein Évangile en musique.\n\nDIEU est avec vous.\n\n#UneGénérationSeLèveIci", imageUrl: "/media/artists/yoann-adopo.jpg" },
];

try {
  for (const data of artistRecords) await prisma.artist.upsert({ where: { slug: data.slug }, create: { ...data, status: "PUBLISHED" }, update: { bio: data.bio } });
  for (const track of tracks) {
    const artist = artistRecords.find((entry) => entry.name === track.artist);
    if (!artist) continue;
    const dbArtist = await prisma.artist.findUniqueOrThrow({ where: { slug: artist.slug }, select: { id: true } });
    await prisma.song.upsert({
      where: { slug: track.id },
      create: { id: track.id, slug: track.id, title: track.title, audioKey: track.audio, artworkUrl: track.cover, durationSec: track.duration || null, status: "PUBLISHED", rightsConfirmedAt: new Date(), artists: { create: { artistId: dbArtist.id } } },
      update: { title: track.title, audioKey: track.audio, artworkUrl: track.cover, status: "PUBLISHED", rightsConfirmedAt: new Date() },
    });
    await prisma.songArtist.upsert({ where: { songId_artistId: { songId: track.id, artistId: dbArtist.id } }, create: { songId: track.id, artistId: dbArtist.id }, update: {} });
  }
  console.log(`Seeded ${tracks.length} tracks and ${artistRecords.length} artists.`);
} finally {
  await prisma.$disconnect();
}
