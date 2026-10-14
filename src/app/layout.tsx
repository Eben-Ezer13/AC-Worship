import type { Metadata } from "next";
import "./globals.css";
import "./premium.css";
import { PwaRegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "AC Worship" },
  icons: { apple: "/icons/ac-worship-192.png" },
  title: "AC Worship — La musique de l'Assemblée Chrétienne",
  description: "Découvrez les artistes, les sorties et les playlists de l'Assemblée Chrétienne.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}<PwaRegister /></body>
    </html>
  );
}
