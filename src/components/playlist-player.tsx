"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Track = { id: string; title: string; audioKey: string | null; artworkUrl: string | null; artists: { artist: { name: string; slug: string } }[] };

export function PlaylistPlayer({ title, tracks }: { title: string; tracks: Track[] }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const selected = tracks[index];
  const artist = selected?.artists.map(({ artist: a }) => a.name).join(", ") || "AC Worship";
  const select = (next: number, autoplay = true) => {
    const safe = (next + tracks.length) % tracks.length;
    setIndex(safe); setCurrent(0); setPlaying(autoplay);
    if (autoplay) window.setTimeout(() => void audio.current?.play().catch(() => setPlaying(false)), 0);
  };
  const fmt = (n: number) => `${Math.floor(n / 60)}:${Math.floor(n % 60).toString().padStart(2, "0")}`;
  if (!tracks.length) return <div className="playlist-empty"><p>Cette playlist est vide.</p><Link className="primary-button" href="/library">Ajouter des chants</Link></div>;
  return <>
    <section className="playlist-player-card">
      <div className="playlist-feature-art">{selected.artworkUrl ? <Image src={selected.artworkUrl} alt={`Pochette de ${selected.title}`} fill sizes="(max-width:700px) 70vw, 300px"/> : <span>AC<br/>WORSHIP</span>}</div>
      <div className="playlist-feature-info"><span className="section-kicker">VOTRE PLAYLIST · {tracks.length} TITRES</span><h1>{title}</h1><p>{selected.title} · {artist}</p>
        <div className="playlist-controls"><button className="primary-button" onClick={() => { if (audio.current?.paused) void audio.current.play(); else audio.current?.pause(); }} aria-label={playing ? "Mettre en pause" : "Lire la playlist"}>{playing ? "Ⅱ Pause" : "▶ Lire"}</button><button className="secondary-button" onClick={() => select(index - 1)} aria-label="Titre précédent">‹</button><button className="secondary-button" onClick={() => select(index + 1)} aria-label="Titre suivant">›</button></div>
        <div className="playlist-progress"><span>{fmt(current)}</span><input aria-label="Position du titre" type="range" min="0" max={duration || 1} step="0.1" value={Math.min(current, duration || 1)} onChange={(e) => { const time = Number(e.target.value); setCurrent(time); if (audio.current) audio.current.currentTime = time; }}/><span>{fmt(duration)}</span></div>
      </div>
    </section>
    <section className="playlist-track-list" aria-label="Titres de la playlist">{tracks.map((track, i) => <button key={track.id} className={`playlist-track ${i === index ? "playlist-track-active" : ""}`} onClick={() => select(i)}><span>{String(i + 1).padStart(2, "0")}</span>{track.artworkUrl ? <Image src={track.artworkUrl} alt="" width={48} height={48}/> : <span className="song-placeholder">AC</span>}<span className="playlist-track-meta"><b>{track.title}</b><small>{track.artists.map(({ artist: a }) => a.name).join(", ")}</small></span><span>{i === index && playing ? "Ⅱ" : "▶"}</span></button>)}</section>
    <audio ref={audio} src={selected.audioKey ?? undefined} preload="metadata" hidden onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)} onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => index < tracks.length - 1 ? select(index + 1) : setPlaying(false)}/>
  </>;
}
