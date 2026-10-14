import { prisma } from "@/lib/prisma";

/** Counts distinct signed-in listeners during the rolling 30-day window. */
export async function getMonthlyListenerCounts(artistIds: string[]) {
  const counts = new Map<string, number>();
  if (!artistIds.length) return counts;
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const plays = await prisma.listeningHistory.findMany({
    where: { playedAt: { gte: since }, song: { artists: { some: { artistId: { in: artistIds } } } } },
    select: { userId: true, song: { select: { artists: { select: { artistId: true } } } } },
  });
  const listeners = new Map<string, Set<string>>();
  for (const play of plays) {
    for (const { artistId } of play.song.artists) {
      if (!artistIds.includes(artistId)) continue;
      const artistListeners = listeners.get(artistId) ?? new Set<string>();
      artistListeners.add(play.userId);
      listeners.set(artistId, artistListeners);
    }
  }
  for (const [artistId, uniqueListeners] of listeners) counts.set(artistId, uniqueListeners.size);
  return counts;
}

export function formatListenerCount(count: number | null) {
  if (count === null) return "—";
  return new Intl.NumberFormat("fr-FR").format(count);
}
