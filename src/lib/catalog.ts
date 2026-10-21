import data from "@/data/tracks.json";

export type Track = { id: string; title: string; artist: string; album: string | null; duration: number; audio: string; cover: string | null; status: string };
export const tracks = data as Track[];
export const artists = [
  { name: "Chantal Cofie-Agama", slug: "chantal-cofie-agama", role: "Artiste · Gospel", bio: "Chantal aspire à voir Christ redonner de l’éclat et restaurer les vies brisées. Les vies peuvent être transformées grâce à la puissance de la Parole de Dieu !\n\nElle est bénie d’être au service du Seigneur au sein de la Famille des Assemblées Chrétiennes au Maroc.", image: "/media/artists/chantal-cofie-agama.jpg" },
  { name: "Chris & Grâce", slug: "chris-grace", role: "Duo · Gospel", bio: "Duo de louange chrétienne, Chris & Grâce partagent des chants de foi et d’adoration.", image: "/media/artists/chris-grace.jpg" },
  { name: "June Grogui", slug: "june-grogui", role: "Artiste · Assemblée Chrétienne", bio: "Que les cœurs se tournent vers le Créateur au travers de la louange.", image: "/media/artists/june-grogui.jpg" },
  { name: "Yoann Adopo", slug: "yoann-adopo", role: "Conducteur de louange", bio: "Je suis Yoann Adopo, le disciple que Jésus aime.\n\nÉpoux d’une seule femme, je sers le Seigneur Jésus-Christ au sein de la Famille des Assemblées Chrétiennes, notamment comme conducteur de louange.\n\nÀ travers des chants que je compose ou que j’interprète, je désire célébrer Jésus, édifier Son peuple et faire connaître l’Évangile aux nations. Je crois qu’une génération se lève : des vies transformées pour adorer Dieu pleinement, et des adorateurs façonnés à Son image.\n\nVous n’êtes pas obligés de vous abonner, d’aimer, de commenter ou de partager. Mais chacun de ces gestes aide ces chants à toucher plus de personnes et à faire entendre le plein Évangile en musique.\n\nDIEU est avec vous.\n\n#UneGénérationSeLèveIci", image: "/media/artists/yoann-adopo.jpg" },
];
