"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import trackData from "@/data/tracks.json";
import { getAccountSummary, getFavoriteTrackIds, recordListening, signOut, toggleTrackFavorite } from "@/app/account-actions";

type Track = { id: string; title: string; artist: string; album: string; duration: number; audio: string; cover?: string; status: string; color: string };

const palette = ["cover-olive", "cover-clay", "cover-blue", "cover-plum"];
const tracks: Track[] = trackData.map((track, index) => ({ ...track, cover: track.cover ?? undefined, color: palette[index % palette.length] }));
const featuredTracks = [
  tracks.find((track) => track.title.startsWith("Oint pour délivrer")),
  tracks.find((track) => track.title.startsWith("Ressuscité")),
  tracks.find((track) => track.title.startsWith("Une Génération Se Lève")),
  tracks.find((track) => track.title.startsWith("DOXOLOGIE")),
].filter((track): track is Track => Boolean(track));

const artists = [
  { name: "June Grogui", role: "Artiste · Assemblée Chrétienne", bio: "Que les cœurs se tournent vers le Créateur au travers de la louange.", color: "portrait-two", image: "/media/artists/june-grogui.jpg" },
  { name: "Yoann Adopo", role: "Conducteur de louange", bio: "Il partage des chants auto-composés ou interprétés pour célébrer Jésus et édifier l’Église.", color: "portrait-one", image: "/media/artists/yoann-adopo.jpg" },
];

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>,
    library: <><path d="M4 4v16M9 7v13M14 5l3 15M20 4v16"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/></>,
    bag: <><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></>,
    play: <path d="m8 5 12 7-12 7V5Z" fill="currentColor" stroke="none"/>,
    pause: <><path d="M8 5h3v14H8zM15 5h3v14h-3z" fill="currentColor" stroke="none"/></>,
    next: <><path d="m5 5 10 7-10 7V5Zm12 0v14" fill="currentColor" stroke="none"/></>,
    prev: <><path d="m19 5-10 7 10 7V5ZM7 5v14" fill="currentColor" stroke="none"/></>,
    shuffle: <><path d="m3 7 2 0c5 0 8 10 13 10h3m-3-3 3 3-3 3M3 17h2c2 0 3.5-2 5-4m4-4c1-1 2.3-2 4-2h3m-3-3 3 3-3 3"/></>,
    repeat: <><path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3"/></>,
    heart: <path d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8.8 2.2Z"/>,
    more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    volume: <><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M17 9a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12"/></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name] ?? paths.more}</svg>;
}

function Artwork({ color, mark, cover, className = "" }: { color: string; mark: string; cover?: string; className?: string }) {
  return <div className={`artwork ${color} ${className}`} aria-label={`Pochette ${mark}`}>{cover ? <Image src={cover} alt="" fill sizes="(max-width: 760px) 45vw, 220px" className="cover-image"/> : <><span className="artwork-grain"/><span className="artwork-mark">{mark}</span><span className="artwork-caption">AC WORSHIP · ÉDITION</span></>}</div>;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeTrack, setActiveTrack] = useState<Track>(tracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.78);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [liked, setLiked] = useState<string[]>([]);
  const [autoplay, setAutoplay] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState(false);
  const [account, setAccount] = useState<{ name: string; role: string } | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const filteredTracks = useMemo(() => tracks.filter((track) => `${track.title} ${track.artist}`.toLowerCase().includes(query.toLowerCase())), [query]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const requestedTrack = new URLSearchParams(window.location.search).get("track");
    const match = tracks.find((track) => track.id === requestedTrack);
    if (match) { setActiveTrack(match); setAutoplay(true); }
  }, []);

  useEffect(() => {
    void getFavoriteTrackIds().then(setLiked);
    void getAccountSummary().then(setAccount);
  }, []);

  useEffect(() => {
    if (!autoplay || !audioRef.current) return;
    void audioRef.current.play().catch(() => setIsPlaying(false));
    setAutoplay(false);
  }, [activeTrack, autoplay]);

  function playTrack(track: Track) {
    if (track.id === activeTrack.id) {
      if (audioRef.current?.paused) void audioRef.current.play().catch(() => setIsPlaying(false));
      else audioRef.current?.pause();
      return;
    }
    if (isPlaying && currentTime > 3) void recordListening(activeTrack.id, currentTime);
    setActiveTrack(track);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(true);
    setAutoplay(true);
  }

  function playNext() {
    const currentIndex = tracks.findIndex((track) => track.id === activeTrack.id);
    const nextIndex = shuffle ? Math.floor(Math.random() * tracks.length) : (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  }

  function playPrevious() {
    if (currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      return;
    }
    const currentIndex = tracks.findIndex((track) => track.id === activeTrack.id);
    playTrack(tracks[(currentIndex + tracks.length - 1) % tracks.length]);
  }

  function togglePlayback() {
    if (!audioRef.current) return;
    if (audioRef.current.paused) void audioRef.current.play().catch(() => setIsPlaying(false));
    else audioRef.current.pause();
  }

  function toggleLike() {
    void toggleTrackFavorite(activeTrack.id);
    setLiked((current) => current.includes(activeTrack.id) ? current.filter((id) => id !== activeTrack.id) : [...current, activeTrack.id]);
  }

  function formatTime(value: number) {
    if (!Number.isFinite(value)) return "0:00";
    return `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, "0")}`;
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" aria-label="AC Worship, accueil"><span className="brand-symbol"><i/><i/><i/></span><span>AC <b>WORSHIP</b></span></a>
        <div className="side-label">DÉCOUVRIR</div>
        <nav className="primary-nav" aria-label="Navigation principale">
          <a className="nav-item selected" href="#home"><Icon name="home"/>Accueil</a>
          <a className="nav-item" href="#explore"><Icon name="search"/>Explorer</a>
          <a className="nav-item" href="#releases"><span className="nav-music">♫</span>Musique</a>
          <Link className="nav-item" href="/artists"><span className="nav-artists">◉</span>Artistes</Link>
          <a className="nav-item" href="#events"><Icon name="calendar"/>Événements</a>
          <a className="nav-item" href="#store"><Icon name="bag"/>Store</a>
        </nav>
        <div className="side-rule"/>
        <div className="side-label library-heading">VOTRE ESPACE <button aria-label="Créer une playlist">+</button></div>
        <a className="nav-item" href="/library"><Icon name="library"/>Ma bibliothèque</a>
        <a className="nav-item sub-nav" href="/library">Titres favoris</a>
        <a className="nav-item sub-nav" href="/library#playlists">Playlists</a>
        <div className="sidebar-bottom"><span className="status-dot"/> La musique nous rassemble</div>
      </aside>

      <section className="main-column" id="home">
        <header className="topbar">
          <div className="history-controls"><button aria-label="Page précédente">‹</button><button aria-label="Page suivante">›</button></div>
          <label className="search-box"><Icon name="search" size={18}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Artistes, titres, albums…"/><kbd>⌘ K</kbd></label>
          <div className="account-actions">{account ? <><Link className="account-library-link" href="/library">Ma bibliothèque</Link>{account.role === "ARTIST" && <Link className="artist-account-link" href="/artist/dashboard">Mon espace</Link>}<span className="account-avatar" title={account.name}>{account.name.slice(0, 1).toUpperCase()}</span><form action={signOut}><button className="account-signout">Déconnexion</button></form></> : <><a href="/login">Se connecter</a><a className="signup-button" href="/signup">Créer un compte</a></>}</div>
        </header>

        <div className="content-area">
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-text"><div className="eyebrow"><span className="eyebrow-line"/> À LA UNE <span className="eyebrow-date">PREMIERS CONTENUS · 2 ARTISTES</span></div>
              <h1 id="hero-title">La musique<br/><em>qui nous rassemble.</em></h1>
              <p>Découvrez les voix, les chants et les histoires<br className="desktop-break"/> de l’Assemblée Chrétienne.</p>
              <div className="hero-actions"><button className="primary-button" onClick={() => playTrack(featuredTracks[0])}><Icon name="play" size={17}/>Écouter maintenant</button><Link className="text-button" href="/artists">Explorer les artistes <Icon name="arrow" size={16}/></Link></div>
              <div className="hero-credit">JUNE GROGUI <span>·</span> OINT POUR DÉLIVRER</div>
            </div>
            <div className="hero-art-wrap"><Artwork color="cover-clay" mark="OINT" cover="/media/releases/june-oint-pour-delivrer.avif" className="hero-art"/><span className="hero-index">01 — 02</span><span className="hero-side-note">CHANTS DE LOUANGE · ASSEMBLÉE CHRÉTIENNE</span></div>
          </section>

          <section className="section-block" id="releases">
            <div className="section-heading"><div><div className="section-kicker">ÉCOUTE EN LIGNE</div><h2>Les chants des artistes</h2></div><a href="#explore" className="see-all">Catalogue <Icon name="arrow" size={15}/></a></div>
            {query && <div className="search-result-label">Résultats musique pour « {query} »</div>}
            <div className="release-grid">{(query ? filteredTracks : featuredTracks).map((track) => <button className="release-card" key={track.id} onClick={() => playTrack(track)}><div className="release-cover-wrap"><Artwork color={track.color} mark={track.cover ? "" : "AC"} cover={track.cover}/><span className="card-play"><Icon name={activeTrack.id === track.id && isPlaying ? "pause" : "play"} size={18}/></span></div><span className="release-title">{track.title}</span><span className="release-meta">{track.artist}</span><span className="release-detail">Audio disponible</span></button>)}</div>
            {query && filteredTracks.length === 0 && <p className="empty-search">Aucun titre ne correspond à cette recherche.</p>}
          </section>

          <section className="section-block tracks-section" id="explore">
            <div className="section-heading"><div><div className="section-kicker">CATALOGUE EN REVUE</div><h2>Quelques chants reçus</h2></div><a href="#music" className="see-all">4 titres présentés</a></div>
            <div className="track-list">{(query ? filteredTracks : tracks.slice(0, 3)).map((track, index) => <button key={track.id} className={`track-row ${activeTrack.id === track.id ? "track-active" : ""}`} onClick={() => playTrack(track)}><span className="track-number">{activeTrack.id === track.id && isPlaying ? <span className="playing-bars"><i/><i/><i/></span> : String(index + 1).padStart(2, "0")}</span><Artwork color={track.color} mark="AC" cover={track.cover} className="track-thumb"/><span className="track-info"><b>{track.title}</b><small>{track.artist}</small></span><span className="track-album">{activeTrack.id === track.id && duration ? formatTime(duration) : "Audio"}</span><span className="track-duration"><Icon name={activeTrack.id === track.id && isPlaying ? "pause" : "play"} size={16}/></span></button>)}</div>
          </section>

          <section className="section-block artist-section" id="artists">
            <div className="section-heading"><div><div className="section-kicker">LES VOIX DE L’AC</div><h2>Artistes à découvrir</h2></div><span className="catalogue-count">2 profils reçus</span></div>
            <div className="artist-grid">{artists.map((artist) => <a className="artist-card" key={artist.name} href={`/artists/${artist.name.toLowerCase().replaceAll(" ", "-")}`}><div className={`artist-portrait ${artist.color}`}><Image src={artist.image} alt={`Portrait de ${artist.name}`} fill sizes="(max-width: 760px) 45vw, 220px"/><i className="portrait-ring"/></div><b>{artist.name}</b><small>{artist.role}</small><p>{artist.bio}</p><span className="artist-open">Voir ses chants →</span></a>)}</div>
          </section>

          <section className="editorial-strip" id="events"><div><div className="section-kicker">RENDEZ-VOUS</div><h2>La musique se vit<br/>aussi ensemble.</h2><p>Concerts, rencontres et temps forts de la communauté.</p></div><a className="editorial-link" href="#events-list">Découvrir les événements <Icon name="arrow" size={16}/></a><div className="editorial-number">AC <span>·</span> ENSEMBLE</div></section>
          <footer className="footer"><a className="footer-brand" href="#home">AC WORSHIP</a><span>La musique de l’Assemblée Chrétienne</span><div><a href="#about">À propos</a><a href="#contact">Contact</a></div></footer>
        </div>
      </section>

      <aside className="now-playing" aria-label="Lecteur musical">
        {queueOpen && <div className="queue-popover"><div className="queue-heading">File de lecture <span>{tracks.length} titres</span></div>{tracks.map((track) => <button className={`queue-item ${track.id === activeTrack.id ? "queue-item-active" : ""}`} key={track.id} onClick={() => playTrack(track)}><span>{track.title}</span><small>{track.artist}</small></button>)}</div>}
        <div className="now-track"><Artwork color={activeTrack.color} mark="AC" cover={activeTrack.cover} className="now-cover"/><div className="now-track-meta"><b>{activeTrack.title}</b><span>{activeTrack.artist}</span></div><button className={`icon-button favorite-button ${liked.includes(activeTrack.id) ? "is-liked" : ""}`} onClick={toggleLike} aria-label={liked.includes(activeTrack.id) ? "Retirer des favoris" : "Ajouter aux favoris"}><Icon name="heart" size={18}/></button></div>
        <div className="player-center"><div className="player-controls"><button className={shuffle ? "control-active" : ""} aria-label="Lecture aléatoire" aria-pressed={shuffle} onClick={() => setShuffle(!shuffle)}><Icon name="shuffle" size={17}/></button><button aria-label="Titre précédent" onClick={playPrevious}><Icon name="prev" size={18}/></button><button className="main-play" aria-label={isPlaying ? "Mettre en pause" : "Lire"} onClick={togglePlayback}><Icon name={isPlaying ? "pause" : "play"} size={16}/></button><button aria-label="Titre suivant" onClick={playNext}><Icon name="next" size={18}/></button><button className={repeat ? "control-active" : ""} aria-label="Répéter le titre" aria-pressed={repeat} onClick={() => setRepeat(!repeat)}><Icon name="repeat" size={17}/></button></div><div className="progress-row"><span>{formatTime(currentTime)}</span><input aria-label="Position dans le titre" type="range" min="0" max={duration || 1} step="0.1" value={Math.min(currentTime, duration || 1)} style={{ "--range-fill": `${duration ? (currentTime / duration) * 100 : 0}%` } as React.CSSProperties} onChange={(event) => { const nextTime = Number(event.target.value); setCurrentTime(nextTime); if (audioRef.current) audioRef.current.currentTime = nextTime; }}/><span>{formatTime(duration)}</span></div></div>
        <div className="player-extra"><button aria-label="Agrandir le lecteur" onClick={() => setExpandedPlayer(true)}>⤢</button><button aria-label="Afficher la file de lecture" aria-expanded={queueOpen} onClick={() => setQueueOpen(!queueOpen)}><Icon name="library" size={18}/></button><Icon name="volume" size={18}/><input aria-label="Volume" type="range" min="0" max="1" step="0.01" value={volume} style={{ "--range-fill": `${volume * 100}%` } as React.CSSProperties} onChange={(event) => setVolume(Number(event.target.value))}/></div>
      </aside>
      <audio ref={audioRef} src={activeTrack.audio} preload="metadata" loop={repeat} hidden onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onDurationChange={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={playNext}/>

      {expandedPlayer && <section className="expanded-player" style={{ "--player-art": `url("${activeTrack.cover ?? "/media/artists/june-grogui.jpg"}")` } as React.CSSProperties} aria-label="Lecteur agrandi"><div className="expanded-backdrop"/><div className="expanded-top"><a href="#home" onClick={(event) => {event.preventDefault(); setExpandedPlayer(false);}}>Reduire le lecteur</a><span>EN COURS D&apos;ECOUTE</span><button onClick={() => setExpandedPlayer(false)} aria-label="Fermer">Ã—</button></div><div className="expanded-content"><Artwork color={activeTrack.color} mark="AC WORSHIP" cover={activeTrack.cover} className="expanded-cover"/><div className="expanded-details"><div className="expanded-meta"><span>{activeTrack.artist}</span><h2>{activeTrack.title}</h2><p>{activeTrack.album}</p></div><div className="expanded-actions"><button className={liked.includes(activeTrack.id) ? "is-liked" : ""} onClick={toggleLike} aria-label={liked.includes(activeTrack.id) ? "Retirer des titres favoris" : "Ajouter aux titres favoris"}><Icon name="heart" size={20}/></button></div><div className="expanded-progress"><input aria-label="Position dans le titre" type="range" min="0" max={duration || 1} step="0.1" value={Math.min(currentTime, duration || 1)} style={{ "--range-fill": `${duration ? (currentTime / duration) * 100 : 0}%` } as React.CSSProperties} onChange={(event) => {const nextTime = Number(event.target.value); setCurrentTime(nextTime); if (audioRef.current) audioRef.current.currentTime = nextTime;}}/><div><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div></div><div className="expanded-controls"><button onClick={playPrevious} aria-label="Titre precedent"><Icon name="prev" size={22}/></button><button className="expanded-play" onClick={togglePlayback} aria-label={isPlaying ? "Mettre en pause" : "Lire le titre"}><Icon name={isPlaying ? "pause" : "play"} size={22}/></button><button onClick={playNext} aria-label="Titre suivant"><Icon name="next" size={22}/></button></div></div></div></section>}

      <nav className="mobile-nav" aria-label="Navigation mobile"><a className="mobile-selected" href="#home"><Icon name="home" size={20}/><span>Accueil</span></a><Link href="/artists"><Icon name="search" size={20}/><span>Artistes</span></Link><Link href="/library"><Icon name="library" size={20}/><span>Bibliothèque</span></Link>{account?.role === "ARTIST" && <Link href="/artist/dashboard"><Icon name="calendar" size={20}/><span>Mon espace</span></Link>}</nav>
    </main>
  );
}
