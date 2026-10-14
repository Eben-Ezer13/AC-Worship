import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addSongToPlaylist, createPlaylist, toggleFavorite } from "@/app/account-actions";
import { tracks as catalogTracks } from "@/lib/catalog";
import Image from "next/image";
export default async function Library({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const { saved, error } = await searchParams;
  let favorites: { songId: string; song: { title: string; artworkUrl: string | null; album: { artworkUrl: string | null } | null; artists: { artist: { name: string; imageUrl: string | null } }[] } }[] = [];
  let playlists: { id: string; title: string; tracks: { song: { id: string } }[] }[] = [];
  let topArtists: { artist: { id: string; name: string; slug: string }; listens: number }[] = [];
  let ready = true;
  try {
    const [favoriteRows, playlistRows, history] = await Promise.all([
      prisma.favorite.findMany({ where: { userId: user.id }, include: { song: { include: { album: { select: { artworkUrl: true } }, artists: { include: { artist: true } } } } }, orderBy: { createdAt: "desc" } }),
      prisma.playlist.findMany({ where: { ownerId: user.id }, include: { tracks: { include: { song: true }, orderBy: { position: "asc" } } }, orderBy: { updatedAt: "desc" } }),
      prisma.listeningHistory.findMany({ where: { userId: user.id }, select: { song: { select: { artists: { select: { artist: true } } } } } }),
    ]);
    favorites = favoriteRows;
    playlists = playlistRows;
    const counts = new Map<string, { artist: { id: string; name: string; slug: string }; listens: number }>();
    for (const row of history) for (const { artist } of row.song.artists) { const old = counts.get(artist.id); counts.set(artist.id, { artist, listens: (old?.listens ?? 0) + 1 }); }
    topArtists = [...counts.values()].sort((a,b) => b.listens - a.listens).slice(0, 5);
  } catch { ready = false; }
  return <main className="catalog-page library-page"><header className="catalog-top"><Link href="/">← AC Worship</Link><Link href="/profile">{user.name} · Mon profil</Link></header><span className="section-kicker">VOTRE ESPACE</span><h1>Votre bibliothèque</h1><p className="catalog-intro">Vos favoris, vos playlists et les artistes que vous écoutez.</p>{!ready && <div className="form-notice">La bibliothèque attend la connexion de la base de données (DATABASE_URL).</div>}{saved && <div className="form-notice">{saved === "playlist" ? "Playlist créée." : saved === "playlist-track" ? "Chant ajouté à la playlist." : "Favori mis à jour."}</div>}{error && <div className="form-notice">Donnez au moins deux caractères à votre playlist.</div>}<section className="library-section"><div className="library-heading"><div><span className="section-kicker">COLLECTION</span><h2>Titres likés <small>{favorites.length}</small></h2></div></div>{favorites.length ? favorites.map((fav) => { const cover = fav.song.artworkUrl ?? fav.song.album?.artworkUrl ?? fav.song.artists.find((a) => a.artist.imageUrl)?.artist.imageUrl; return <div className="library-song" key={fav.songId}>{cover ? <Image className="library-song-cover" src={cover} alt={`Pochette de ${fav.song.title}`} width={48} height={48}/> : <div className="song-placeholder">♫</div>}<div><b>{fav.song.title}</b><small>{fav.song.artists.map((a) => a.artist.name).join(", ")}</small></div><form action={toggleFavorite}><input type="hidden" name="songId" value={fav.songId}/><button aria-label="Retirer le titre">♥</button></form></div>; }) : <p className="empty-library">Aucun favori pour le moment. Parcourez le <Link href="/">catalogue</Link> et ajoutez les chants qui vous plaisent.</p>}</section><section className="library-section" id="playlists"><div className="library-heading"><div><span className="section-kicker">À VOTRE IMAGE</span><h2>Playlists</h2></div></div><form className="playlist-form" action={createPlaylist}><input name="title" placeholder="Nom de la nouvelle playlist" minLength={2} required/><button className="primary-button">Créer</button></form>{playlists.map((playlist) => <article className="playlist-row" key={playlist.id}><Link className="playlist-open-link" href={`/playlists/${playlist.id}`}><b>{playlist.title}</b><span>{playlist.tracks.length} titres · privée</span><strong>Ouvrir et écouter →</strong></Link><form action={addSongToPlaylist}><input type="hidden" name="playlistId" value={playlist.id}/><select name="trackSlug" aria-label={`Ajouter un chant dans ${playlist.title}`}>{catalogTracks.map((track) => <option key={track.id} value={track.id}>{track.title}</option>)}</select><button>Ajouter</button></form></article>)}</section><section className="library-section"><span className="section-kicker">D’APRÈS VOTRE ÉCOUTE</span><h2>Artistes les plus écoutés</h2>{topArtists.length ? topArtists.map(({ artist, listens }) => <Link className="popular-artist" href={`/artists/${artist.slug}`} key={artist.id}><span>{artist.name}</span><small>{listens} écoutes</small></Link>) : <p className="empty-library">L’historique se remplira au fil de vos écoutes.</p>}</section></main>;
}
