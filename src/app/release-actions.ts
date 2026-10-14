"use server";

import { prisma } from "@/lib/prisma";

export type ReleaseShowcaseData = {
  upcoming: Array<{ id: string; title: string; artistName: string; artistSlug: string; artworkUrl: string | null; releaseAt: string }>;
  latestByArtist: Array<{ artistName: string; artistSlug: string; songs: Array<{ id: string; title: string; artworkUrl: string | null; releaseAt: string }> }>;
};

export async function getReleaseShowcase(): Promise<ReleaseShowcaseData> {
  try {
    const now = new Date();
    const artistRecords = await prisma.artist.findMany({
      where: { status: "PUBLISHED" },
      select: {
        name: true,
        slug: true,
        imageUrl: true,
        songLinks: {
          where: { song: { status: "PUBLISHED" } },
          select: {
            song: {
              select: {
                id: true,
                title: true,
                createdAt: true,
                releaseDate: true,
                artworkUrl: true,
                album: { select: { artworkUrl: true, releaseDate: true } },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const upcomingBySong = new Map<string, ReleaseShowcaseData["upcoming"][number]>();
    const latestByArtist: ReleaseShowcaseData["latestByArtist"] = [];

    for (const artist of artistRecords) {
      const released: ReleaseShowcaseData["latestByArtist"][number]["songs"] = [];
      for (const { song } of artist.songLinks) {
        const songRelease = song.releaseDate ?? song.createdAt;
        const albumRelease = song.album?.releaseDate;
        const releaseAt = albumRelease && albumRelease > songRelease ? albumRelease : songRelease;
        const item = {
          id: song.id,
          title: song.title,
          artistName: artist.name,
          artistSlug: artist.slug,
          artworkUrl: song.artworkUrl ?? song.album?.artworkUrl ?? artist.imageUrl,
          releaseAt: releaseAt.toISOString(),
        };

        if (releaseAt > now) {
          if (!upcomingBySong.has(song.id)) upcomingBySong.set(song.id, item);
        } else {
          released.push({ id: song.id, title: song.title, artworkUrl: item.artworkUrl, releaseAt: item.releaseAt });
        }
      }

      released.sort((a, b) => Date.parse(b.releaseAt) - Date.parse(a.releaseAt));
      if (released.length) latestByArtist.push({ artistName: artist.name, artistSlug: artist.slug, songs: released.slice(0, 3) });
    }

    const upcoming = [...upcomingBySong.values()].sort((a, b) => Date.parse(a.releaseAt) - Date.parse(b.releaseAt)).slice(0, 6);
    latestByArtist.sort((a, b) => a.artistName.localeCompare(b.artistName, "fr"));
    return { upcoming, latestByArtist };
  } catch {
    return { upcoming: [], latestByArtist: [] };
  }
}
