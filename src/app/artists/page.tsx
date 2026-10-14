import Image from "next/image";
import Link from "next/link";
import { artists, tracks } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { formatListenerCount, getMonthlyListenerCounts } from "@/lib/audience";
export const dynamic = "force-dynamic";
export default async function ArtistsPage() {
  const now = new Date();
  let directory: { name: string; slug: string; role?: string; bio: string; image: string; count?: number; listeners: number | null }[] = artists.map((artist) => ({ ...artist, listeners: null }));
  try {
    const published = await prisma.artist.findMany({ where: { status: "PUBLISHED" }, include: { songLinks: { where: { song: { status: "PUBLISHED" } }, select: { song: { select: { releaseDate: true, album: { select: { releaseDate: true } } } } } } }, orderBy: { name: "asc" } });
    if (published.length) {
      const monthlyCounts = await getMonthlyListenerCounts(published.map((artist) => artist.id));
      directory = published.map((artist) => ({ name: artist.name, slug: artist.slug, role: artist.genre ?? "Artiste · Assemblée Chrétienne", bio: artist.bio, image: artist.imageUrl ?? artists.find((a) => a.slug === artist.slug)?.image ?? "/media/artists/yoann-adopo.jpg", count: artist.songLinks.filter(({ song }) => (!song.releaseDate || song.releaseDate <= now) && (!song.album?.releaseDate || song.album.releaseDate <= now)).length, listeners: monthlyCounts.get(artist.id) ?? 0 }));
    }
  } catch { /* Catalogue statique disponible hors connexion à la base */ }
  return <main className="catalog-page"><header className="catalog-top"><Link href="/">← AC Worship</Link><Link href="/library">Ma biblioth&egrave;que</Link></header><span className="section-kicker">LES VOIX DE L’AC</span><h1>Les artistes</h1><p className="catalog-intro">Découvrez leurs parcours, leurs sorties et les chants qui font vivre la communauté.</p><div className="artist-directory">{directory.map((artist) => <Link className="directory-card" href={`/artists/${artist.slug}`} key={artist.slug}><div className="directory-image"><Image src={artist.image} alt={artist.name} fill sizes="(max-width:700px) 80vw, 320px"/></div><div className="directory-copy"><span>ARTISTE · {artist.count ?? tracks.filter((t) => t.artist === artist.name).length} TITRES</span><h2>{artist.name}</h2><p>{artist.bio}</p><div className="monthly-listeners"><b>{formatListenerCount(artist.listeners)}</b><small>auditeurs mensuels</small></div><b>Visiter l’espace artiste →</b></div></Link>)}</div></main>;
}
