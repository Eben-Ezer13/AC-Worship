import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArtistMediaUpload } from "@/components/artist-media-upload";
import { ReleaseScheduleField } from "@/components/release-schedule-field";
import { ReleaseCountdown } from "@/components/release-countdown";
import { DeleteSongForm } from "@/components/delete-song-form";
import { submitAlbum, submitArtistEvent, submitArtistNews, submitProduct, submitSong, updateArtistAlbum, updateArtistProfile, updateArtistSong } from "@/app/account-actions";

function localDateValue(date: Date | null) {
  if (!date) return "";
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return shifted.toISOString().slice(0, 16);
}

const notices: Record<string, string> = {
  profile: "Profil mis à jour.", song: "Chant ajouté au catalogue.", "song-updated": "Chant mis à jour.", "song-deleted": "Le chant a été retiré de votre catalogue.", album: "Album créé. Ajoutez-y des chants depuis le catalogue.", "album-updated": "Album mis à jour.", news: "Actualité publiée.", event: "Événement publié.", product: "Produit publié.",
};

const errors: Record<string, string> = {
  "audio-missing": "Le fichier audio local est introuvable.", "invalid-media": "Le fichier envoyé doit provenir du stockage média AC Worship.", "invalid-release-date": "La date de sortie n’est pas valide.", "release-date-past": "Choisissez une date et une heure futures, ou sélectionnez la publication immédiate.", "invalid-album": "Vérifiez le nom de l’album et son type.", "invalid-song": "Vérifiez le titre, le fichier audio et l’autorisation de publication.", "missing-profile": "Aucun profil artiste n’est lié à ce compte.",
};

export default async function ArtistDashboard({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "ARTIST" && user.role !== "ADMIN") redirect("/library");
  const { saved, error } = await searchParams;
  let profile = null;
  let ready = true;
  try {
    profile = await prisma.artist.findFirst({
      where: { members: { some: { userId: user.id } } },
      include: {
        songLinks: { include: { song: { include: { album: true } } }, orderBy: { song: { createdAt: "desc" } } },
        albums: { include: { _count: { select: { songs: true } } }, orderBy: { createdAt: "desc" } },
        products: { orderBy: { createdAt: "desc" } }, articles: { orderBy: { createdAt: "desc" } }, events: { include: { event: true } },
      },
    });
  } catch { ready = false; }
  if (ready && !profile) return <main className="catalog-page"><Link href="/">← Accueil</Link><h1>Profil artiste en préparation</h1><p>Aucun profil artiste n’est encore associé à ce compte. Contactez l’équipe AC Worship pour relier votre profil.</p></main>;
  const blobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN));
  return <main className="catalog-page dashboard-page">
    <header className="catalog-top"><Link href="/">← AC Worship</Link><Link href="/artists">Voir les artistes</Link></header>
    <span className="section-kicker">STUDIO ARTISTE · {user.name}</span><h1>Votre espace artiste</h1>
    <p className="catalog-intro">Gérez votre profil, vos albums et vos sorties depuis votre téléphone ou votre ordinateur.</p>
    {!ready && <div className="form-notice">La base de données est inaccessible. Configurez DATABASE_URL.</div>}
    {saved && notices[saved] && <div className="form-notice">{notices[saved]}</div>}
    {error && <div className="form-notice">{errors[error] ?? "Vérifiez les informations saisies et réessayez."}</div>}
    {!blobConfigured && <div className="form-notice upload-setup-note">Le stockage audio et image doit être connecté dans Vercel Storage → Blob, puis synchronisé dans les variables d’environnement du projet.</div>}
    {profile && <>
      <section className="dashboard-section">
        <span className="section-kicker">IDENTITÉ ARTISTE</span><h2>Profil public</h2>
        <form className="dashboard-form" action={updateArtistProfile}>
          <label>Nom affiché<input name="name" defaultValue={profile.name} required minLength={2}/></label>
          <label>Biographie<textarea name="bio" defaultValue={profile.bio} rows={5} maxLength={2000}/></label>
          <label>Style musical<input name="genre" defaultValue={profile.genre ?? ""} placeholder="Louange, gospel…"/></label>
          <ArtistMediaUpload artistId={profile.id} name="imageUrl" label="Photo de profil (JPG, PNG ou WebP)" kind="image" accept="image/jpeg,image/png,image/webp" initialUrl={profile.imageUrl ?? ""}/>
          <button className="primary-button">Enregistrer le profil</button>
        </form>
      </section>

      <section className="dashboard-section">
        <span className="section-kicker">DISCOGRAPHIE · {profile.albums.length} ALBUMS</span><h2>Créer un album ou un EP</h2>
        <p className="dashboard-help">Choisissez son nom, son visuel et sa date. Vous pourrez ensuite rattacher chaque chant à cet album.</p>
        <form className="dashboard-form" action={submitAlbum}>
          <label>Nom de l’album<input name="title" required minLength={2}/></label>
          <label>Format<select name="type" defaultValue="ALBUM"><option value="ALBUM">Album</option><option value="EP">EP</option><option value="SINGLE">Single</option></select></label>
          <label>Description<textarea name="description" rows={3}/></label>
          <ArtistMediaUpload artistId={profile.id} name="artworkUrl" label="Pochette de l’album (facultatif)" kind="image" accept="image/jpeg,image/png,image/webp"/>
          <label>Programmer la sortie (facultatif)<input type="datetime-local" name="releaseDate"/></label>
          <button className="primary-button">Créer l’album</button>
        </form>
        {profile.albums.map((album) => <form className="album-editor" action={updateArtistAlbum} key={album.id}>
          <input type="hidden" name="albumId" value={album.id}/>
          <div className="album-editor-heading">{album.artworkUrl ? <img src={album.artworkUrl} alt=""/> : <span className="album-editor-placeholder">AC</span>}<div><b>{album.title}</b><small>{album._count.songs} chants · {album.status === "PUBLISHED" ? "Publié" : "Brouillon"}</small></div></div>
          <div className="dashboard-form album-editor-fields">
            <label>Nom<input name="title" defaultValue={album.title} required/></label>
            <label>Format<select name="type" defaultValue={album.type}><option value="ALBUM">Album</option><option value="EP">EP</option><option value="SINGLE">Single</option></select></label>
            <label>Description<textarea name="description" defaultValue={album.description} rows={2}/></label>
            <ArtistMediaUpload artistId={profile.id} name="artworkUrl" label="Pochette" kind="image" accept="image/jpeg,image/png,image/webp" initialUrl={album.artworkUrl ?? ""}/>
            <label>Date de sortie<input type="datetime-local" name="releaseDate" defaultValue={localDateValue(album.releaseDate)}/></label>
          </div>
          <button className="secondary-button">Enregistrer l’album</button>
        </form>)}
      </section>

      <section className="dashboard-section">
        <span className="section-kicker">SORTIES · {profile.songLinks.length} CHANTS</span><h2>Publier un nouveau chant</h2>
        <p className="dashboard-help">Envoyez un fichier MP3, WAV, FLAC ou AAC jusqu’à 200 Mo. Publiez-le tout de suite ou choisissez une date de sortie.</p>
        <form className="dashboard-form" action={submitSong}>
          <label>Titre du chant<input name="title" required minLength={2}/></label>
          <ArtistMediaUpload artistId={profile.id} name="audioUrl" label="Fichier audio" kind="audio" accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/flac,audio/aac,audio/mp4,audio/x-m4a" required/>
          <ArtistMediaUpload artistId={profile.id} name="artworkUrl" label="Pochette du chant (facultatif — celle de l’album sera utilisée sinon)" kind="image" accept="image/jpeg,image/png,image/webp"/>
          <label>Album<select name="albumId" defaultValue=""><option value="">Single / sans album</option>{profile.albums.map((album) => <option key={album.id} value={album.id}>{album.title}</option>)}</select></label>
          <ReleaseScheduleField />
          <label className="rights-confirm"><input type="checkbox" name="rightsConfirmed" required/>Je confirme posséder les droits et autorisations nécessaires à cette publication.</label>
          <button className="primary-button">Programmer / publier</button>
        </form>
        <div className="song-edit-list">{profile.songLinks.map(({ song }) => {
          const releaseAt = [song.releaseDate, song.album?.releaseDate].filter((date): date is Date => date !== null && date !== undefined).sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
          const isUpcoming = releaseAt !== null && releaseAt > new Date();
          return <div className="song-editor-wrap" key={song.id}>
            <form className="song-editor" action={updateArtistSong}>
              <input type="hidden" name="songId" value={song.id}/>
              <div className="song-editor-heading">{song.artworkUrl || song.album?.artworkUrl || profile.imageUrl ? <img src={song.artworkUrl ?? song.album?.artworkUrl ?? profile.imageUrl ?? ""} alt=""/> : <span className="album-editor-placeholder">♫</span>}<div><b>{song.title}</b><small>{song.status === "PUBLISHED" ? (isUpcoming ? `Sortie prévue le ${releaseAt.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}` : "Publié") : song.status}</small>{isUpcoming && <ReleaseCountdown releaseAt={releaseAt.toISOString()}/>}</div></div>
              <div className="dashboard-form album-editor-fields">
                <label>Titre<input name="title" defaultValue={song.title} required/></label>
                <label>Album<select name="albumId" defaultValue={song.albumId ?? ""}><option value="">Single / sans album</option>{profile.albums.map((album) => <option key={album.id} value={album.id}>{album.title}</option>)}</select></label>
                <ArtistMediaUpload artistId={profile.id} name="audioUrl" label="Remplacer l’audio" kind="audio" accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/flac,audio/aac,audio/mp4,audio/x-m4a" initialUrl={song.audioKey ?? ""}/>
                <ArtistMediaUpload artistId={profile.id} name="artworkUrl" label="Pochette du chant" kind="image" accept="image/jpeg,image/png,image/webp" initialUrl={song.artworkUrl ?? song.album?.artworkUrl ?? ""}/>
                <ReleaseScheduleField initialMode={song.releaseDate && song.releaseDate > new Date() ? "scheduled" : "immediate"} initialValue={song.releaseDate && song.releaseDate > new Date() ? localDateValue(song.releaseDate) : ""} />
              </div>
              <button className="secondary-button">Enregistrer le chant</button>
            </form>
            <DeleteSongForm songId={song.id} title={song.title}/>
          </div>;
        })}</div>
      </section>

      <section className="dashboard-section">
        <span className="section-kicker">BOUTIQUE · {profile.products.length} PRODUITS</span><h2>Mettre à jour le store</h2>
        <form className="dashboard-form" action={submitProduct}><label>Nom du produit<input name="name" required/></label><label>Description<textarea name="description" rows={3}/></label><label>Prix affiché<input name="price" placeholder="Ex. 15 € · contacter l’artiste"/></label><button className="primary-button">Publier le produit</button></form>
        {profile.products.map((product) => <div className="submission-row" key={product.id}>{product.name}<span>{product.status === "PENDING_REVIEW" ? "En attente de validation" : product.status}</span></div>)}
      </section>
      <section className="dashboard-section">
        <span className="section-kicker">ACTUALITÉS · {profile.articles.length}</span><h2>Partager une actualité</h2>
        <form className="dashboard-form" action={submitArtistNews}><label>Titre<input name="title" required minLength={3}/></label><label>Résumé<textarea name="summary" rows={2}/></label><label>Texte<textarea name="body" rows={5} required minLength={10}/></label><label>Image (URL ou chemin)<input name="imageUrl" placeholder="/media/..."/></label><button className="primary-button">Publier l’actualité</button></form>
      </section>
      <section className="dashboard-section">
        <span className="section-kicker">ÉVÉNEMENTS · {profile.events.length}</span><h2>Annoncer un événement</h2>
        <form className="dashboard-form" action={submitArtistEvent}><label>Nom de l’événement<input name="title" required minLength={3}/></label><label>Description<textarea name="description" rows={4} required minLength={10}/></label><label>Date et heure<input type="datetime-local" name="startsAt" required/></label><label>Lieu<input name="venue"/></label><label>Lien d’inscription<input type="url" name="registrationUrl"/></label><button className="primary-button">Publier l’événement</button></form>
      </section>
    </>}
  </main>;
}
