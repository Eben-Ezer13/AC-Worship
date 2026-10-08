"use client";

import { useMemo, useState } from "react";

type Track = { title: string; artist: string; album: string; color: string; duration: string };

const tracks: Track[] = [
  { title: "Dans ta présence", artist: "Équipe de louange AC", album: "Auprès de toi", color: "cover-olive", duration: "4:32" },
  { title: "Tu es fidèle", artist: "Sarah N. & le collectif", album: "Tu es fidèle", color: "cover-clay", duration: "3:58" },
  { title: "Un seul nom", artist: "David Mbuyi", album: "Un seul nom", color: "cover-blue", duration: "5:12" },
  { title: "Reste avec nous", artist: "Chorale Nouvelle Alliance", album: "Chemin de paix", color: "cover-plum", duration: "4:07" },
];

const releases = [
  { title: "Auprès de toi", artist: "Équipe de louange AC", detail: "Album · 2025", color: "cover-olive", mark: "AC" },
  { title: "Tu es fidèle", artist: "Sarah N. & le collectif", detail: "Single · 2025", color: "cover-clay", mark: "FIDÈLE" },
  { title: "Un seul nom", artist: "David Mbuyi", detail: "EP · 2025", color: "cover-blue", mark: "UN SEUL NOM" },
  { title: "Chemin de paix", artist: "Chorale Nouvelle Alliance", detail: "Album · 2024", color: "cover-plum", mark: "PAIX" },
];

const artists = [
  { name: "Équipe de louange AC", role: "Collectif · Assemblée Chrétienne", color: "portrait-one", initials: "LA" },
  { name: "Sarah N.", role: "Artiste · Gospel contemporain", color: "portrait-two", initials: "SN" },
  { name: "David Mbuyi", role: "Artiste · Louange", color: "portrait-three", initials: "DM" },
  { name: "Nouvelle Alliance", role: "Chorale · Kinshasa", color: "portrait-four", initials: "NA" },
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

function Artwork({ color, mark, className = "" }: { color: string; mark: string; className?: string }) {
  return <div className={`artwork ${color} ${className}`} aria-label={`Pochette ${mark}`}><span className="artwork-grain"/><span className="artwork-mark">{mark}</span><span className="artwork-caption">AC WORSHIP · ÉDITION</span></div>;
}

export default function Home() {
  const [activeTrack, setActiveTrack] = useState<Track>(tracks[0]);
  const [playing, setPlaying] = useState(false);
  const [query, setQuery] = useState("");
  const [liked, setLiked] = useState(false);
  const filteredTracks = useMemo(() => tracks.filter((track) => `${track.title} ${track.artist}`.toLowerCase().includes(query.toLowerCase())), [query]);

  function playTrack(track: Track) {
    if (activeTrack.title === track.title) setPlaying(!playing);
    else { setActiveTrack(track); setPlaying(true); setLiked(false); }
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
          <a className="nav-item" href="#artists"><span className="nav-artists">◉</span>Artistes</a>
          <a className="nav-item" href="#events"><Icon name="calendar"/>Événements</a>
          <a className="nav-item" href="#store"><Icon name="bag"/>Store</a>
        </nav>
        <div className="side-rule"/>
        <div className="side-label library-heading">VOTRE ESPACE <button aria-label="Créer une playlist">+</button></div>
        <a className="nav-item" href="#library"><Icon name="library"/>Ma bibliothèque</a>
        <a className="nav-item sub-nav" href="#library">Titres favoris</a>
        <a className="nav-item sub-nav" href="#library">Playlists</a>
        <div className="sidebar-bottom"><span className="status-dot"/> La musique nous rassemble</div>
      </aside>

      <section className="main-column" id="home">
        <header className="topbar">
          <div className="history-controls"><button aria-label="Page précédente">‹</button><button aria-label="Page suivante">›</button></div>
          <label className="search-box"><Icon name="search" size={18}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Artistes, titres, albums…"/><kbd>⌘ K</kbd></label>
          <div className="account-actions"><a href="#login">Se connecter</a><button className="signup-button" id="login">Créer un compte</button></div>
        </header>

        <div className="content-area">
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-text"><div className="eyebrow"><span className="eyebrow-line"/> À LA UNE <span className="eyebrow-date">NOUVELLE SORTIE · 2025</span></div>
              <h1 id="hero-title">La musique<br/><em>qui nous rassemble.</em></h1>
              <p>Découvrez les voix, les chants et les histoires<br className="desktop-break"/> de l’Assemblée Chrétienne.</p>
              <div className="hero-actions"><button className="primary-button" onClick={() => playTrack(tracks[0])}><Icon name={playing && activeTrack.title === tracks[0].title ? "pause" : "play"} size={17}/>{playing && activeTrack.title === tracks[0].title ? "En lecture" : "Écouter maintenant"}</button><a className="text-button" href="#releases">Explorer les sorties <Icon name="arrow" size={16}/></a></div>
              <div className="hero-credit">ÉQUIPE DE LOUANGE AC <span>·</span> AU PRÈS DE TOI</div>
            </div>
            <div className="hero-art-wrap"><Artwork color="cover-olive" mark={"AU PRÈS\nDE TOI"} className="hero-art"/><span className="hero-index">01 — 04</span><span className="hero-side-note">CHANTS DE LOUANGE · ASSEMBLÉE CHRÉTIENNE</span></div>
          </section>

          <section className="section-block" id="releases">
            <div className="section-heading"><div><div className="section-kicker">À ÉCOUTER</div><h2>Les dernières sorties</h2></div><a href="#music" className="see-all">Tout voir <Icon name="arrow" size={15}/></a></div>
            {query && <div className="search-result-label">Résultats musique pour « {query} »</div>}
            <div className="release-grid">{(query ? filteredTracks.map((track) => ({ title: track.album, artist: track.artist, detail: `Single · ${track.duration}`, color: track.color, mark: track.title.toUpperCase() })) : releases).map((release, index) => <button className="release-card" key={release.title} onClick={() => playTrack(tracks.find((track) => track.artist === release.artist) ?? tracks[index % tracks.length])}><div className="release-cover-wrap"><Artwork color={release.color} mark={release.mark}/><span className="card-play"><Icon name="play" size={18}/></span></div><span className="release-title">{release.title}</span><span className="release-meta">{release.artist}</span><span className="release-detail">{release.detail}</span></button>)}</div>
            {query && filteredTracks.length === 0 && <p className="empty-search">Aucun titre ne correspond à cette recherche.</p>}
          </section>

          <section className="section-block tracks-section" id="explore">
            <div className="section-heading"><div><div className="section-kicker">SÉLECTION AC</div><h2>Écoutés en ce moment</h2></div><a href="#music" className="see-all">Voir les titres <Icon name="arrow" size={15}/></a></div>
            <div className="track-list">{(query ? filteredTracks : tracks.slice(0, 3)).map((track, index) => <button key={track.title} className={`track-row ${activeTrack.title === track.title ? "track-active" : ""}`} onClick={() => playTrack(track)}><span className="track-number">{activeTrack.title === track.title && playing ? <span className="playing-bars"><i/><i/><i/></span> : String(index + 1).padStart(2, "0")}</span><Artwork color={track.color} mark="AC" className="track-thumb"/><span className="track-info"><b>{track.title}</b><small>{track.artist}</small></span><span className="track-album">{track.album}</span><span className="track-duration">{track.duration}</span><Icon name="more" size={18}/></button>)}</div>
          </section>

          <section className="section-block artist-section" id="artists">
            <div className="section-heading"><div><div className="section-kicker">LES VOIX DE L’AC</div><h2>Artistes à découvrir</h2></div><a href="#all-artists" className="see-all">Tous les artistes <Icon name="arrow" size={15}/></a></div>
            <div className="artist-grid">{artists.map((artist) => <a className="artist-card" href="#artist" key={artist.name}><div className={`artist-portrait ${artist.color}`}><span>{artist.initials}</span><i className="portrait-ring"/></div><b>{artist.name}</b><small>{artist.role}</small></a>)}</div>
          </section>

          <section className="editorial-strip" id="events"><div><div className="section-kicker">RENDEZ-VOUS</div><h2>La musique se vit<br/>aussi ensemble.</h2><p>Concerts, rencontres et temps forts de la communauté.</p></div><a className="editorial-link" href="#events-list">Découvrir les événements <Icon name="arrow" size={16}/></a><div className="editorial-number">AC <span>·</span> 2025</div></section>
          <footer className="footer"><a className="footer-brand" href="#home">AC WORSHIP</a><span>La musique de l’Assemblée Chrétienne</span><div><a href="#about">À propos</a><a href="#contact">Contact</a></div></footer>
        </div>
      </section>

      <aside className="now-playing" aria-label="Lecteur musical">
        <div className="now-track"><Artwork color={activeTrack.color} mark="AC" className="now-cover"/><div className="now-track-meta"><b>{activeTrack.title}</b><span>{activeTrack.artist}</span></div><button className={`icon-button favorite-button ${liked ? "is-liked" : ""}`} onClick={() => setLiked(!liked)} aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}><Icon name="heart" size={18}/></button></div>
        <div className="player-center"><div className="player-controls"><button aria-label="Lecture aléatoire"><Icon name="shuffle" size={17}/></button><button aria-label="Titre précédent" onClick={() => { const i = tracks.findIndex((track) => track.title === activeTrack.title); setActiveTrack(tracks[(i + tracks.length - 1) % tracks.length]); setPlaying(true); }}><Icon name="prev" size={18}/></button><button className="main-play" aria-label={playing ? "Mettre en pause" : "Lire"} onClick={() => setPlaying(!playing)}><Icon name={playing ? "pause" : "play"} size={16}/></button><button aria-label="Titre suivant" onClick={() => { const i = tracks.findIndex((track) => track.title === activeTrack.title); setActiveTrack(tracks[(i + 1) % tracks.length]); setPlaying(true); }}><Icon name="next" size={18}/></button><button aria-label="Répéter"><Icon name="repeat" size={17}/></button></div><div className="progress-row"><span>1:24</span><div className="progress-track"><i/></div><span>{activeTrack.duration}</span></div></div>
        <div className="player-extra"><button aria-label="File d’attente"><Icon name="library" size={18}/></button><button aria-label="Volume"><Icon name="volume" size={18}/></button><div className="volume-track"><i/></div></div>
      </aside>

      <nav className="mobile-nav" aria-label="Navigation mobile"><a className="mobile-selected" href="#home"><Icon name="home" size={20}/><span>Accueil</span></a><a href="#explore"><Icon name="search" size={20}/><span>Explorer</span></a><a href="#library"><Icon name="library" size={20}/><span>Bibliothèque</span></a><a href="#events"><Icon name="calendar" size={20}/><span>Événements</span></a></nav>
    </main>
  );
}
