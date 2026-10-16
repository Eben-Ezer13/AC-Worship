"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const since = () => new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

async function syncNotifications(userId: string) {
  const cutoff = since();
  const now = new Date();
  const [songs, articles, events, products] = await Promise.all([
    prisma.song.findMany({ where: { status: "PUBLISHED", OR: [{ releaseDate: { gte: cutoff, lte: now } }, { releaseDate: null, updatedAt: { gte: cutoff, lte: now } }] }, include: { artists: { include: { artist: { select: { name: true, slug: true } } } }, album: { select: { title: true } } }, orderBy: { updatedAt: "desc" }, take: 60 }),
    prisma.article.findMany({ where: { status: "PUBLISHED", OR: [{ publishedAt: { gte: cutoff } }, { publishedAt: null, updatedAt: { gte: cutoff } }] }, include: { artist: { select: { name: true, slug: true } } }, orderBy: { publishedAt: "desc" }, take: 40 }),
    prisma.event.findMany({ where: { status: "PUBLISHED", startsAt: { gt: new Date() } }, include: { artists: { include: { artist: { select: { name: true, slug: true } } } } }, orderBy: { startsAt: "asc" }, take: 40 }),
    prisma.product.findMany({ where: { status: "PUBLISHED", createdAt: { gte: cutoff } }, include: { artist: { select: { name: true, slug: true } } }, orderBy: { createdAt: "desc" }, take: 40 }),
  ]);

  const source = [
    ...songs.flatMap((song) => song.artists.map(({ artist }) => ({ key: `song:${song.id}:${artist.slug}`, type: `SORTIE|/artists/${artist.slug}#discography`, title: `Nouveau titre : ${song.title}`, body: `${artist.name}${song.album ? ` · ${song.album.title}` : ""}`, date: song.releaseDate ?? song.updatedAt }))),
    ...articles.map((article) => ({ key: `article:${article.id}`, type: `ACTUALITE|/news/${article.slug}`, title: article.title, body: article.artist?.name ?? article.summary, date: article.publishedAt ?? article.updatedAt })),
    ...events.map((event) => ({ key: `event:${event.id}`, type: `EVENEMENT|/events/${event.slug}`, title: event.title, body: `${event.venue ?? "Événement"} · ${event.startsAt.toLocaleDateString("fr-FR")}`, date: event.createdAt })),
    ...products.map((product) => ({ key: `product:${product.id}`, type: `BOUTIQUE|/artists/${product.artist.slug}#store`, title: `Nouveau produit : ${product.name}`, body: product.artist.name, date: product.createdAt })),
  ];
  if (source.length) await prisma.notification.createMany({ data: source.map((item) => ({ id: createHash("sha256").update(`${userId}:${item.key}`).digest("hex").slice(0, 30), userId, type: item.type, title: item.title, body: item.body, createdAt: item.date })), skipDuplicates: true });
}

export async function getNotifications() {
  const user = await currentUser();
  if (!user) return [];
  try {
    await syncNotifications(user.id);
    return await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 });
  } catch { return []; }
}

export async function getUnreadNotificationCount() {
  const user = await currentUser();
  if (!user) return 0;
  try { await syncNotifications(user.id); return await prisma.notification.count({ where: { userId: user.id, readAt: null } }); }
  catch { return 0; }
}

export async function markNotificationRead(formData: FormData) {
  const user = await currentUser();
  if (!user) return;
  const id = String(formData.get("notificationId") ?? "");
  if (id) await prisma.notification.updateMany({ where: { id, userId: user.id }, data: { readAt: new Date() } });
  revalidatePath("/notifications");
}

export async function markAllNotificationsRead() {
  const user = await currentUser();
  if (!user) return;
  await prisma.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/notifications");
}
