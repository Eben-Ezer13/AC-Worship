import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PlaylistPlayer } from "@/components/playlist-player";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const now = new Date();
  const playlist = await prisma.playlist.findFirst({
    where: { id, ownerId: user.id },
    include: {
      tracks: {
        where: { song: { status: "PUBLISHED", OR: [{ releaseDate: null }, { releaseDate: { lte: now } }] } },
        orderBy: { position: "asc" },
        include: {
          song: {
            include: {
              album: { select: { artworkUrl: true, releaseDate: true } },
              artists: { include: { artist: { select: { name: true, slug: true, imageUrl: true } } } },
            },
          },
        },
      },
    },
  });
  if (!playlist) notFound();
  const tracks = playlist.tracks.filter(({ song }) => !song.album?.releaseDate || song.album.releaseDate <= now).map(({ song }) => ({ id: song.id, title: song.title, audioKey: song.audioKey, artworkUrl: song.artworkUrl ?? song.album?.artworkUrl ?? song.artists.find(({ artist }) => artist.imageUrl)?.artist.imageUrl ?? null, artists: song.artists.map(({ artist }) => ({ artist })) }));
  return <main className="catalog-page playlist-page"><header className="catalog-top"><Link href="/library">← Ma bibliothèque</Link><Link href="/profile">Mon profil</Link></header><span className="section-kicker">PLAYLIST PERSONNELLE</span><PlaylistPlayer title={playlist.title} tracks={tracks}/></main>;
}
