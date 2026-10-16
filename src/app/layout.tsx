import type { Metadata } from "next";
import "./globals.css";
import "./premium.css";
import "./responsive.css";
import "./studio.css";
import { PwaRegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  metadataBase: new URL("https://ac-worship.vercel.app"),
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "AC Worship" },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/ac-worship-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: "/icons/ac-worship-192.png",
  },
  title: "AC Worship — La musique de l’Assemblée Chrétienne",
  description: "Découvrez les artistes, les sorties et les playlists de l’Assemblée Chrétienne.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "AC Worship",
    title: "AC Worship — La musique qui nous rassemble",
    description: "Découvrez les artistes, écoutez les chants et retrouvez les nouvelles sorties sur AC Worship.",
    url: "/",
    images: [{
      url: "/icons/ac-worship-512.png",
      width: 512,
      height: 512,
      type: "image/png",
      alt: "Logo AC Worship",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AC Worship — La musique qui nous rassemble",
    description: "Découvrez les artistes, écoutez les chants et retrouvez les nouvelles sorties sur AC Worship.",
    images: ["/icons/ac-worship-512.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}<PwaRegister /></body>
    </html>
  );
}
