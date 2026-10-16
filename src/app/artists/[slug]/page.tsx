import Link from "next/link";
import { notFound } from "next/navigation";
import { artists, tracks } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { formatListenerCount, getMonthlyListenerCounts } from "@/lib/audience";
import { AudioPlayer } from "@/components/audio-player";
import { ReleaseCountdown } from "@/components/release-countdown";
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
  let upcomingSongs: { id: string; title: string; album: string; cover: string; releaseAt: string }[] = [];
  let products: { id: string; name: string; slug: string; description: string; imageUrl: string | null; priceLabel: string | null; whatsappPhone: string | null }[] = [];
  let monthlyListeners: number | null = null;
  try {
    const record = await prisma.artist.findUnique({ where: { slug }, include: { songLinks: { where: { song: { status: "PUBLISHED" } }, include: { song: { include: { album: true } } }, orderBy: { position: "asc" } }, products: { where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } } } });
    if (record?.status === "PUBLISHED") {
      artist = { name: record.name, slug: record.slug, role: record.genre ?? "Artiste · Assemblée Chrétienne", bio: record.bio, image: record.imageUrl ?? fallback?.image ?? "/media/artists/yoann-adopo.jpg" };
      const knownTitles = new Set(songs.map((song) => normalizedTitle(song.title)));
      const coverFallback = artist?.image ?? fallback?.image ?? "/media/artists/yoann-adopo.jpg";
      const now = new Date();
      upcomingSongs = record.songLinks
        .map(({ song }) => {
          const releaseAt = [song.releaseDate, song.album?.releaseDate].filter((date): date is Date => date !== null && date !== undefined).sort((a, b) => b.getTime() - a.getTime())[0];
          return releaseAt && releaseAt > now ? { id: song.id, title: song.title, album: song.album?.title ?? "Single", cover: song.artworkUrl ?? song.album?.artworkUrl ?? coverFallback, releaseAt: releaseAt.toISOString() } : null;
        })
        .filter((song): song is NonNullable<typeof song> => song !== null)
        .filter((song) => !knownTitles.has(normalizedTitle(song.title)))
        .sort((a, b) => Date.parse(a.releaseAt) - Date.parse(b.releaseAt));
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
      products = record.products.map(({ id, name, slug, description, imageUrl, priceLabel, whatsappPhone }) => ({ id, name, slug, description, imageUrl, priceLabel, whatsappPhone }));
      monthlyListeners = (await getMonthlyListenerCounts([record.id])).get(record.id) ?? 0;
    }
  } catch { /* Les profils existants restent disponibles sans base de données */ }
  if (!artist) notFound();
  return <main className="catalog-page artist-page"><header className="catalog-top"><Link href="/artists">← Tous les artistes</Link><Link href="/library">Ma biblioth&egrave;que</Link></header><section className="artist-hero"><div className="artist-hero-image"><img src={artist.image} alt={artist.name}/></div><div><span className="section-kicker">ESPACE ARTISTE · {songs.length} CHANTS</span><h1>{artist.name}</h1><div className="artist-audience"><strong>{formatListenerCount(monthlyListeners)}</strong><span>auditeurs mensuels</span><small>sur les 30 derniers jours</small></div><p>{artist.bio}</p><a className="primary-button" href="#discography">Explorer ses compositions ↓</a></div></section>{upcomingSongs.length > 0 && <section id="upcoming-releases" className="artist-discography artist-upcoming"><span className="section-kicker">BIENTÔT DISPONIBLE</span><h2>Prochaines sorties</h2><div className="upcoming-release-grid">{upcomingSongs.map((song) => <article className="upcoming-release-card" key={song.id}><div className="upcoming-release-art"><img src={song.cover} alt={`Pochette de ${song.title}`}/></div><div className="upcoming-release-copy"><span>{song.album}</span><b>{song.title}</b><ReleaseCountdown releaseAt={song.releaseAt} showDate/></div></article>)}</div></section>}<section id="discography" className="artist-discography"><span className="section-kicker">DISCOGRAPHIE</span><h2>Ses compositions</h2><div className="song-directory">{songs.map((song, i) => <article key={song.id}><span>{String(i + 1).padStart(2, "0")}</span>{song.cover ? <img src={song.cover} alt={`Pochette de ${song.title}`} width={54} height={54}/> : <div className="song-placeholder">AC</div>}<div><b>{song.title}</b><small>{song.album === "Album à confirmer" ? "Single" : song.album}</small>{song.audio && <AudioPlayer src={song.audio} title={song.title} trackId={song.id} artist={artist.name} album={song.album} cover={song.cover} duration={song.duration}/>}</div><a href={`/?track=${song.id}`} aria-label={`Écouter ${song.title}`}>▶</a></article>)}</div></section>{products.length > 0 && <section id="store" className="artist-discography artist-store"><div className="artist-store-heading"><div><span className="section-kicker">BOUTIQUE DE L’ARTISTE</span><h2>Les créations de {artist.name}</h2></div><Link href="/store">Toute la boutique <span aria-hidden="true">↗</span></Link></div><div className="artist-product-grid">{products.map((product) => <article className="discovery-card product-card artist-product-card" key={product.id}><div className="discovery-art product-art">{product.imageUrl ? <img src={product.imageUrl} alt={`Visuel de ${product.name}`}/> : <span>AC<br/>WORSHIP</span>}</div><div className="discovery-copy"><span>{artist.name}</span><h3>{product.name}</h3>{product.description && <p>{product.description}</p>}<strong>{product.priceLabel ?? "Prix communiqué par l’artiste"}</strong>{product.whatsappPhone ? <a className="store-buy-link" href={`https://wa.me/${product.whatsappPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Bonjour, je souhaite acheter 1 exemplaire de « ${product.name} ». Pouvez-vous m’indiquer la disponibilité et les modalités de paiement ?`)}`} target="_blank" rel="noopener noreferrer">Commander sur WhatsApp <span aria-hidden="true">↗</span></a> : <Link className="store-buy-link store-contact-link" href="/store">Voir le store <span aria-hidden="true">→</span></Link>}</div></article>)}</div></section>}<footer className="catalog-footer"><Link href="/">AC WORSHIP</Link></footer></main>;
}
