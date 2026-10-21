import data from "@/data/tracks.json";

export type Track = { id: string; title: string; artist: string; album: string | null; duration: number; audio: string; cover: string | null; status: string };
export const tracks = data as Track[];
export const artists = [
  { name: "Chantal Cofie-Agama", slug: "chantal-cofie-agama", role: "Artiste · Gospel", bio: "Chantal aspire à voir Christ redonner de l’éclat et restaurer les vies brisées. Les vies peuvent être transformées grâce à la puissance de la Parole de Dieu !\n\nElle est bénie d’être au service du Seigneur au sein de la Famille des Assemblées Chrétiennes au Maroc.", image: "/media/artists/chantal-cofie-agama.jpg" },
  { name: "Chris & Grâce", slug: "chris-grace", role: "Duo · Gospel", bio: "Duo de louange chrétienne, Chris & Grâce partagent des chants de foi et d’adoration.", image: "/media/artists/chris-grace.jpg" },
  { name: "June Grogui", slug: "june-grogui", role: "Artiste · Assemblée Chrétienne", bio: "Que les cœurs se tournent vers le Créateur au travers de la louange.", image: "/media/artists/june-grogui.jpg" },
  { name: "Yoann Adopo", slug: "yoann-adopo", role: "Conducteur de louange", bio: "Des chants pour célébrer Jésus et édifier l’Église.", image: "/media/artists/yoann-adopo.jpg" },
];
