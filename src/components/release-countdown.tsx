"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function ReleaseCountdown({ releaseAt, onElapsed, showDate = false }: { releaseAt: string; onElapsed?: () => void; showDate?: boolean }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [localDate, setLocalDate] = useState<string | null>(null);
  const elapsedNotified = useRef(false);
  const router = useRouter();
  const refreshCurrentPage = useCallback(() => router.refresh(), [router]);
  const handleElapsed = onElapsed ?? refreshCurrentPage;

  useEffect(() => {
    const update = () => {
      const next = Date.parse(releaseAt) - Date.now();
      setRemaining(Math.max(0, next));
      if (showDate) setLocalDate(new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(releaseAt)));
      if (next <= 0 && !elapsedNotified.current) {
        elapsedNotified.current = true;
        handleElapsed();
      }
    };

    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [handleElapsed, releaseAt, showDate]);

  if (remaining === null) return <span className="release-countdown" aria-live="polite">Calcul du compte à rebours…</span>;
  if (remaining === 0) return <span className="release-countdown release-countdown-ready" aria-live="polite">Disponible maintenant</span>;

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const label = days > 0
    ? `${days} j ${String(hours).padStart(2, "0")} h ${String(minutes).padStart(2, "0")} min ${String(seconds).padStart(2, "0")} s`
    : `${String(hours).padStart(2, "0")} h ${String(minutes).padStart(2, "0")} min ${String(seconds).padStart(2, "0")} s`;

  return <span className="release-countdown" aria-live="off">{showDate && localDate ? `Sortie le ${localDate} · ` : ""}{label}</span>;
}
