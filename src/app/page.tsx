"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import pendingTrackData from "@/data/pending-tracks.json";

type Track = { title: string; artist: string; album: string; color: string; duration: string; cover?: string };

const palette = ["cover-olive", "cover-clay", "cover-blue", "cover-plum"];
const tracks: Track[] = pendingTrackData.value.map((track, index) => ({ title: track.title, artist: track.artist, album: track.album, duration: track.duration, cover: track.cover ?? undefined, color: palette[index % palette.length] }));

const releases = [
  { title: "Oint pour délivrer", artist: "June Grogui", detail: "Chant · À valider", color: "cover-clay", mark: "OINT", cover: "/media/releases/june-oint-pour-delivrer.avif" },
  { title: "Ressuscité", artist: "June Grogui", detail: "Chant · À valider", color: "cover-blue", mark: "RESSUSCITÉ", cover: "/media/releases/june-ressuscite.avif" },
  { title: "Une génération se lève", artist: "Yoann Adopo", detail: "Chant · À valider", color: "cover-olive", mark: "GÉNÉRATION", cover: "/media/releases/yoann-une-generation-se-leve.jpg" },
  { title: "Doxologie", artist: "Yoann Adopo", detail: "Chant · À valider", color: "cover-plum", mark: "DOXOLOGIE", cover: "/media/releases/yoann-doxologie.jpg" },
];

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
  const filteredTracks = useMemo(() => tracks.filter((track) => `${track.title} ${track.artist}`.toLowerCase().includes(query.toLowerCase())), [query]);

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
            <div className="hero-text"><div className="eyebrow"><span className="eyebrow-line"/> À LA UNE <span className="eyebrow-date">PREMIERS CONTENUS · 2 ARTISTES</span></div>
              <h1 id="hero-title">La musique<br/><em>qui nous rassemble.</em></h1>
              <p>Découvrez les voix, les chants et les histoires<br className="desktop-break"/> de l’Assemblée Chrétienne.</p>
              <div className="hero-actions"><a className="primary-button" href="#releases"><Icon name="search" size={17}/>Découvrir les chants</a><a className="text-button" href="#artists">Explorer les artistes <Icon name="arrow" size={16}/></a></div>
              <div className="hero-credit">JUNE GROGUI <span>·</span> OINT POUR DÉLIVRER</div>
            </div>
            <div className="hero-art-wrap"><Artwork color="cover-clay" mark="OINT" cover="/media/releases/june-oint-pour-delivrer.avif" className="hero-art"/><span className="hero-index">01 — 02</span><span className="hero-side-note">CHANTS DE LOUANGE · ASSEMBLÉE CHRÉTIENNE</span></div>
          </section>

          <section className="section-block" id="releases">
            <div className="section-heading"><div><div className="section-kicker">CATALOGUE REÇU · PUBLICATION EN ATTENTE</div><h2>Les chants des artistes</h2></div><a href="#music" className="see-all">Catalogue <Icon name="arrow" size={15}/></a></div>
            {query && <div className="search-result-label">Résultats musique pour « {query} »</div>}
            <div className="release-grid">{(query ? filteredTracks.map((track) => ({ title: track.title, artist: track.artist, detail: "Chant · À valider", color: track.color, mark: track.cover ? "" : "AC", cover: track.cover })) : releases).map((release, index) => <article className="release-card" key={`${release.artist}-${release.title}-${index}`}><div className="release-cover-wrap"><Artwork color={release.color} mark={release.mark} cover={release.cover}/></div><span className="release-title">{release.title}</span><span className="release-meta">{release.artist}</span><span className="release-detail">{release.detail}</span></article>)}</div>
            {query && filteredTracks.length === 0 && <p className="empty-search">Aucun titre ne correspond à cette recherche.</p>}
          </section>

          <section className="section-block tracks-section" id="explore">
            <div className="section-heading"><div><div className="section-kicker">CATALOGUE EN REVUE</div><h2>Quelques chants reçus</h2></div><a href="#music" className="see-all">4 titres présentés</a></div>
            <div className="track-list">{(query ? filteredTracks : tracks.slice(0, 3)).map((track, index) => <div key={track.title} className="track-row"><span className="track-number">{String(index + 1).padStart(2, "0")}</span><Artwork color={track.color} mark="AC" cover={track.cover} className="track-thumb"/><span className="track-info"><b>{track.title}</b><small>{track.artist}</small></span><span className="track-album">{track.album}</span><span className="track-duration">À valider</span></div>)}</div>
          </section>

          <section className="section-block artist-section" id="artists">
            <div className="section-heading"><div><div className="section-kicker">LES VOIX DE L’AC</div><h2>Artistes à découvrir</h2></div><span className="catalogue-count">2 profils reçus</span></div>
            <div className="artist-grid">{artists.map((artist) => <article className="artist-card" key={artist.name}><div className={`artist-portrait ${artist.color}`}><Image src={artist.image} alt={`Portrait de ${artist.name}`} fill sizes="(max-width: 760px) 45vw, 220px"/><i className="portrait-ring"/></div><b>{artist.name}</b><small>{artist.role}</small><p>{artist.bio}</p></article>)}</div>
          </section>

          <section className="editorial-strip" id="events"><div><div className="section-kicker">RENDEZ-VOUS</div><h2>La musique se vit<br/>aussi ensemble.</h2><p>Concerts, rencontres et temps forts de la communauté.</p></div><a className="editorial-link" href="#events-list">Découvrir les événements <Icon name="arrow" size={16}/></a><div className="editorial-number">AC <span>·</span> ENSEMBLE</div></section>
          <footer className="footer"><a className="footer-brand" href="#home">AC WORSHIP</a><span>La musique de l’Assemblée Chrétienne</span><div><a href="#about">À propos</a><a href="#contact">Contact</a></div></footer>
        </div>
      </section>

      <aside className="now-playing" aria-label="Lecteur musical">
        <div className="now-track"><span className="player-pending-mark">♫</span><div className="now-track-meta"><b>Lecteur en préparation</b><span>Les titres seront activés après validation</span></div></div>
        <div className="player-center"><p className="playback-note">Fichiers audio reçus · lecture non activée</p></div>
        <div className="player-extra"><span className="status-dot"/><span className="player-status">À valider</span></div>
      </aside>

      <nav className="mobile-nav" aria-label="Navigation mobile"><a className="mobile-selected" href="#home"><Icon name="home" size={20}/><span>Accueil</span></a><a href="#explore"><Icon name="search" size={20}/><span>Explorer</span></a><a href="#library"><Icon name="library" size={20}/><span>Bibliothèque</span></a><a href="#events"><Icon name="calendar" size={20}/><span>Événements</span></a></nav>
    </main>
  );
}
