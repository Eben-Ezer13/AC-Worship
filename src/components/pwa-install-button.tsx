"use client";

import { useEffect, useState } from "react";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export function PwaInstallButton() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setInstalled(standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const onPrompt = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const onInstalled = () => { setInstalled(true); setPrompt(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  if (installed) return <p className="install-status">AC Worship est installée sur cet appareil.</p>;
  if (prompt) return <button className="primary-button" onClick={async () => { await prompt.prompt(); await prompt.userChoice; setPrompt(null); }}>Installer AC Worship</button>;
  if (ios) return <div className="install-help"><button className="secondary-button" onClick={() => setShowIosHelp((open) => !open)}>Ajouter à l’écran d’accueil</button>{showIosHelp && <p>Dans Safari, touchez <b>Partager</b>, puis <b>Sur l’écran d’accueil</b>.</p>}</div>;
  return <p className="install-status">Utilisez le menu de votre navigateur puis « Installer l’application » ou « Ajouter à l’écran d’accueil ».</p>;
}
