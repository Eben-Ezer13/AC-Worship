import data from "@/data/tracks.json";

export type Track = { id: string; title: string; artist: string; album: string; duration: number; audio: string; cover: string | null; status: string };
export const tracks = data as Track[];
export const artists = [
  { name: "June Grogui", slug: "june-grogui", role: "Artiste · Assemblée Chrétienne", bio: "Que les cœurs se tournent vers le Créateur au travers de la louange.", image: "/media/artists/june-grogui.jpg" },
  { name: "Yoann Adopo", slug: "yoann-adopo", role: "Conducteur de louange", bio: "Des chants pour célébrer Jésus et édifier l’Église.", image: "/media/artists/yoann-adopo.jpg" },
];
