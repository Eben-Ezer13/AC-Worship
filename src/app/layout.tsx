import type { Metadata } from "next";
import "./globals.css";
import "./premium.css";

export const metadata: Metadata = {
  title: "AC Worship — La musique de l'Assemblée Chrétienne",
  description: "Découvrez les artistes, les sorties et les playlists de l'Assemblée Chrétienne.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
