import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { artists, tracks } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { formatListenerCount, getMonthlyListenerCounts } from "@/lib/audience";
import { AudioPlayer } from "@/components/audio-player";
export const dynamic = "force-dynamic";
export function generateStaticParams() { return artists.map(({ slug }) => ({ slug })); }

function normalizedTitle(title: string) {
  return title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fallback = artists.find((candidate) => candidate.slug === slug);
  let artist = fallback;
  let songs = fallback ? tracks.filter((track) => track.artist === fallback.name).map((track) => ({ id: track.id, title: track.title, album: track.album ?? "Single", cover: track.cover ?? fallback.image, audio: track.audio, duration: track.duration })) : [];
  let products: { id: string; name: string; description: string; priceLabel: string | null }[] = [];
  let monthlyListeners: number | null = null;
  try {
    const record = await prisma.artist.findUnique({ where: { slug }, include: { songLinks: { where: { song: { status: "PUBLISHED" } }, include: { song: { include: { album: true } } }, orderBy: { position: "asc" } }, products: { where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } } } });
    if (record?.status === "PUBLISHED") {
      artist = { name: record.name, slug: record.slug, role: record.genre ?? "Artiste · Assemblée Chrétienne", bio: record.bio, image: record.imageUrl ?? fallback?.image ?? "/media/artists/yoann-adopo.jpg" };
      const knownTitles = new Set(songs.map((song) => normalizedTitle(song.title)));
      const coverFallback = artist?.image ?? fallback?.image ?? "/media/artists/yoann-adopo.jpg";
      const now = new Date();
      const additionalSongs = record.songLinks
        .filter(({ song }) => (!song.releaseDate || song.releaseDate <= now) && (!song.album?.releaseDate || song.album.releaseDate <= now))
        .map(({ song }) => ({ id: song.slug, title: song.title, album: song.album?.title ?? "Single", cover: song.artworkUrl ?? song.album?.artworkUrl ?? coverFallback, audio: song.audioKey ?? "", duration: 0 }))
        .filter((song) => {
          const normalized = normalizedTitle(song.title);
          if (!normalized || knownTitles.has(normalized)) return false;
          knownTitles.add(normalized);
          return true;
        });
      songs = [...songs, ...additionalSongs];
      products = record.products.map(({ id, name, description, priceLabel }) => ({ id, name, description, priceLabel }));
      monthlyListeners = (await getMonthlyListenerCounts([record.id])).get(record.id) ?? 0;
    }
  } catch { /* Les profils existants restent disponibles sans base de données */ }
  if (!artist) notFound();
  return <main className="catalog-page artist-page"><header className="catalog-top"><Link href="/artists">← Tous les artistes</Link><Link href="/library">Ma biblioth&egrave;que</Link></header><section className="artist-hero"><div className="artist-hero-image"><Image src={artist.image} alt={artist.name} fill priority sizes="(max-width:700px) 100vw, 420px"/></div><div><span className="section-kicker">ESPACE ARTISTE · {songs.length} CHANTS</span><h1>{artist.name}</h1><div className="artist-audience"><strong>{formatListenerCount(monthlyListeners)}</strong><span>auditeurs mensuels</span><small>sur les 30 derniers jours</small></div><p>{artist.bio}</p><a className="primary-button" href="#discography">Explorer ses compositions ↓</a></div></section><section id="discography" className="artist-discography"><span className="section-kicker">DISCOGRAPHIE</span><h2>Ses compositions</h2><div className="song-directory">{songs.map((song, i) => <article key={song.id}><span>{String(i + 1).padStart(2, "0")}</span>{song.cover ? <Image src={song.cover} alt={`Pochette de ${song.title}`} width={54} height={54}/> : <div className="song-placeholder">AC</div>}<div><b>{song.title}</b><small>{song.album === "Album à confirmer" ? "Single" : song.album}</small>{song.audio && <AudioPlayer src={song.audio} title={song.title} trackId={song.id} artist={artist.name} album={song.album} cover={song.cover} duration={song.duration}/>}</div><a href={`/?track=${song.id}`} aria-label={`Écouter ${song.title}`}>▶</a></article>)}</div></section>{products.length > 0 && <section id="store" className="artist-discography artist-store"><span className="section-kicker">BOUTIQUE</span><h2>Le store de {artist.name}</h2>{products.map((product) => <article className="artist-product" key={product.id}><div><b>{product.name}</b><p>{product.description}</p></div><span>{product.priceLabel ?? "Contacter l’artiste"}</span></article>)}</section>}<footer className="catalog-footer"><Link href="/">AC WORSHIP</Link></footer></main>;
}
