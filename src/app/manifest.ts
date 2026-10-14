import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "AC Worship — La musique qui nous rassemble",
    short_name: "AC Worship",
    description: "Écoutez les chants, suivez les artistes et retrouvez vos playlists.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#10120e",
    theme_color: "#10120e",
    icons: [
      { src: "/icons/ac-worship-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/ac-worship-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/ac-worship-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/ac-worship-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
