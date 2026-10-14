"use client";

export type SharedTrack = {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  duration: number;
  audio: string;
  cover?: string | null;
};

type SharedAudioElement = HTMLAudioElement & { __acWorshipTrack?: SharedTrack };

let sharedAudio: SharedAudioElement | null = null;

export function getSharedAudio() {
  if (typeof window === "undefined") return null;
  if (!sharedAudio) {
    sharedAudio = new Audio() as SharedAudioElement;
    sharedAudio.preload = "metadata";
  }
  return sharedAudio;
}

export function setSharedTrack(track: SharedTrack, audio = getSharedAudio()) {
  if (!audio) return;
  audio.__acWorshipTrack = track;
  if (audio.src !== new URL(track.audio, window.location.href).href) audio.src = track.audio;
}

export function getSharedTrack(audio = getSharedAudio()) {
  return audio?.__acWorshipTrack ?? null;
}
