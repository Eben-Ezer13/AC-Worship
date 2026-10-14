"use client";

import { useEffect, useState } from "react";
import { getSharedAudio, getSharedTrack, setSharedTrack } from "@/lib/shared-audio";

function timeLabel(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  return `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, "0")}`;
}

export function AudioPlayer({ src, title, trackId, artist, album, cover, duration: trackDuration = 0 }: { src: string; title: string; trackId: string; artist: string; album: string | null; cover: string | null; duration?: number }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = getSharedAudio();
    if (!audio) return;
    const update = () => {
      const active = getSharedTrack(audio);
      const selected = active?.id === trackId;
      setPlaying(selected && !audio.paused);
      if (selected) {
        setCurrentTime(audio.currentTime || 0);
        setDuration(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : trackDuration);
      } else {
        setCurrentTime(0);
        setDuration(0);
      }
    };
    audio.addEventListener("timeupdate", update);
    audio.addEventListener("loadedmetadata", update);
    audio.addEventListener("durationchange", update);
    audio.addEventListener("play", update);
    audio.addEventListener("pause", update);
    audio.addEventListener("ended", update);
    update();
    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("loadedmetadata", update);
      audio.removeEventListener("durationchange", update);
      audio.removeEventListener("play", update);
      audio.removeEventListener("pause", update);
      audio.removeEventListener("ended", update);
    };
  }, [trackId, trackDuration]);

  function togglePlayback() {
    const audio = getSharedAudio();
    if (!audio) return;
    if (getSharedTrack(audio)?.id !== trackId) {
      setSharedTrack({ id: trackId, title, artist, album, duration: trackDuration, audio: src, cover }, audio);
      setCurrentTime(0);
    }
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
          const audio = getSharedAudio();
          if (audio && getSharedTrack(audio)?.id === trackId) audio.currentTime = next;
        }}
      />
      <span className="mini-audio-time">{timeLabel(currentTime)} <i>/</i> {timeLabel(duration)}</span>
    </div>
  );
}
