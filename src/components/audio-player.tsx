"use client";

import { useRef, useState } from "react";

function timeLabel(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  return `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, "0")}`;
}

export function AudioPlayer({ src, title }: { src: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }

  return (
    <div className="mini-audio" aria-label={`Lecteur audio : ${title}`}>
      <button className="mini-audio-play" onClick={togglePlayback} aria-label={playing ? `Mettre en pause ${title}` : `Lire ${title}`}>
        {playing ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h3v14H8zm5 0h3v14h-3z"/></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 12 7-12 7z"/></svg>}
      </button>
      <span className={`mini-audio-wave ${playing ? "is-playing" : ""}`} aria-hidden="true"><i/><i/><i/><i/><i/></span>
      <input
        aria-label={`Position de ${title}`}
        type="range"
        min="0"
        max={duration || 1}
        step="0.1"
        value={Math.min(currentTime, duration || 1)}
        style={{ "--range-fill": `${duration ? (currentTime / duration) * 100 : 0}%` } as React.CSSProperties}
        onChange={(event) => {
          const next = Number(event.target.value);
          setCurrentTime(next);
          if (audioRef.current) audioRef.current.currentTime = next;
        }}
      />
      <span className="mini-audio-time">{timeLabel(currentTime)} <i>/</i> {timeLabel(duration)}</span>
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}
