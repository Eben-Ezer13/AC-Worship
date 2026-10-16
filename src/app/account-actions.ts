"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { access } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";

export async function signUp(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 10) redirect("/signup?error=invalid");
  try {
    const alreadyExists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (alreadyExists) redirect("/signup?error=exists");
    const user = await prisma.user.create({ data: { name, email, passwordHash: hashPassword(password), role: "MEMBER" } });
    await createSession(user.id);
  } catch (error) { if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) throw error; redirect("/signup?error=database"); }
  redirect("/");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) redirect("/login?error=credentials");
    await createSession(user.id);
  } catch (error) { if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) throw error; redirect("/login?error=database"); }
  redirect("/");
}

export async function getAccountSummary() {
  const { currentUser } = await import("@/lib/auth");
  try {
    const user = await currentUser();
    return user ? { name: user.name, email: user.email, role: user.role } : null;
  } catch {
    return null;
  }
}

export async function updateAccountProfile(formData: FormData) {
  const { currentUser } = await import("@/lib/auth");
  const user = await currentUser();
  if (!user) redirect("/login");
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 80) redirect("/profile?error=name");
  await prisma.user.update({ where: { id: user.id }, data: { name } });
  redirect("/profile?saved=profile");
}

export async function signOut() {
  const token = (await cookies()).get("acw_session")?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: createHash("sha256").update(token).digest("hex") } });
  (await cookies()).delete("acw_session");
  redirect("/");
}

export async function updateArtistProfile(formData: FormData) {
  const { currentUser } = await import("@/lib/auth");
  const user = await currentUser();
  if (!user || user.role !== "ARTIST") redirect("/login");
  const membership = await prisma.artistMember.findFirst({ where: { userId: user.id }, select: { artistId: true } });
  if (!membership) redirect("/artist/dashboard?error=missing-profile");
  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const genre = String(formData.get("genre") ?? "").trim();
  if (name.length < 2) redirect("/artist/dashboard?error=invalid");
  const imageUrl = validateMediaUrl(String(formData.get("imageUrl") ?? "").trim(), "image");
  await prisma.artist.update({ where: { id: membership.artistId }, data: { name, bio, genre, imageUrl, status: "PUBLISHED" } });
  revalidatePath(`/artists/${(await prisma.artist.findUniqueOrThrow({ where: { id: membership.artistId }, select: { slug: true } })).slug}`);
  redirect("/artist/dashboard?saved=profile");
}

function validateMediaUrl(value: string, kind: "audio" | "image") {
  if (!value) return null;
  if (kind === "audio" && value.startsWith("/audio/")) return value;
  if (kind === "image" && value.startsWith("/media/")) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com")) return url.toString();
  } catch { /* validation below */ }
  redirect("/artist/dashboard?error=invalid-media");
}

function parseReleaseDate(value: string) {
  if (!value) return null;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) redirect("/artist/dashboard?error=invalid-release-date");
  return parsed;
}

function parseSongReleaseDate(formData: FormData) {
  const mode = String(formData.get("releaseMode") ?? "immediate");
  if (mode === "immediate") return null;
  if (mode !== "scheduled") redirect("/artist/dashboard?error=invalid-release-date");

  const value = String(formData.get("releaseDate") ?? "");
  const offsetValue = String(formData.get("releaseDateOffset") ?? "");
  const offset = Number(offsetValue);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) || !offsetValue || !Number.isInteger(offset) || Math.abs(offset) > 14 * 60) {
    redirect("/artist/dashboard?error=invalid-release-date");
  }

  // datetime-local carries no timezone, so apply the browser's offset explicitly.
  const localAsUtc = new Date(`${value}:00Z`);
  if (!Number.isFinite(localAsUtc.getTime()) || localAsUtc.toISOString().slice(0, 16) !== value) redirect("/artist/dashboard?error=invalid-release-date");
  const scheduledAt = new Date(localAsUtc.getTime() + offset * 60_000);
  if (scheduledAt <= new Date()) redirect("/artist/dashboard?error=release-date-past");
  return scheduledAt;
}

export async function submitSong(formData: FormData) {
  const { currentUser } = await import("@/lib/auth");
  const user = await currentUser();
  if (!user || user.role !== "ARTIST") redirect("/login");
  const link = await prisma.artistMember.findFirst({ where: { userId: user.id }, select: { artistId: true } });
  if (!link) redirect("/artist/dashboard?error=missing-profile");
  const title = String(formData.get("title") ?? "").trim();
  const uploadedAudio = String(formData.get("audioUrl") ?? "").trim();
  const legacyAudio = String(formData.get("audioKey") ?? "").trim();
  const audioKey = validateMediaUrl(uploadedAudio || legacyAudio, "audio");
  if (title.length < 2 || !audioKey || formData.get("rightsConfirmed") !== "on") redirect("/artist/dashboard?error=invalid-song");
  if (audioKey.startsWith("/audio/")) {
    const audioPath = path.resolve(process.cwd(), "public", audioKey.replace(/^\/+/, ""));
    const audioRoot = path.resolve(process.cwd(), "public", "audio") + path.sep;
    if (!audioPath.startsWith(audioRoot)) redirect("/artist/dashboard?error=invalid-song");
    try { await access(audioPath); } catch { redirect("/artist/dashboard?error=audio-missing"); }
  }
  const albumId = String(formData.get("albumId") ?? "").trim() || null;
  if (albumId && !await prisma.album.findFirst({ where: { id: albumId, artistId: link.artistId }, select: { id: true } })) redirect("/artist/dashboard?error=invalid-album");
  const artworkUrl = validateMediaUrl(String(formData.get("artworkUrl") ?? "").trim(), "image");
  const releaseDate = parseSongReleaseDate(formData);
  const slug = `${title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
  await prisma.song.create({ data: { title, slug, audioKey, artworkUrl, releaseDate, albumId, rightsConfirmedAt: new Date(), status: "PUBLISHED", artists: { create: { artistId: link.artistId } } } });
  revalidatePath(`/artists/${(await prisma.artist.findUniqueOrThrow({ where: { id: link.artistId }, select: { slug: true } })).slug}`);
  redirect("/artist/dashboard?saved=song");
}

export async function updateArtistSong(formData: FormData) {
  const { currentUser } = await import("@/lib/auth");
  const user = await currentUser();
  if (!user || user.role !== "ARTIST") redirect("/login");
  const membership = await prisma.artistMember.findFirst({ where: { userId: user.id }, select: { artistId: true } });
  if (!membership) redirect("/artist/dashboard?error=missing-profile");
  const id = String(formData.get("songId") ?? "");
  const owned = await prisma.song.findFirst({ where: { id, artists: { some: { artistId: membership.artistId } } }, select: { id: true } });
  if (!owned) redirect("/artist/dashboard?error=invalid-song");
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2) redirect("/artist/dashboard?error=invalid-song");
  const albumId = String(formData.get("albumId") ?? "").trim() || null;
  if (albumId && !await prisma.album.findFirst({ where: { id: albumId, artistId: membership.artistId }, select: { id: true } })) redirect("/artist/dashboard?error=invalid-album");
  const audioUrl = String(formData.get("audioUrl") ?? "").trim();
  const audioKey = audioUrl ? validateMediaUrl(audioUrl, "audio") : undefined;
  if (audioKey?.startsWith("/audio/")) {
    const audioPath = path.resolve(process.cwd(), "public", audioKey.replace(/^\/+/, ""));
    const audioRoot = path.resolve(process.cwd(), "public", "audio") + path.sep;
    if (!audioPath.startsWith(audioRoot)) redirect("/artist/dashboard?error=invalid-song");
    try { await access(audioPath); } catch { redirect("/artist/dashboard?error=audio-missing"); }
  }
  const artworkUrl = validateMediaUrl(String(formData.get("artworkUrl") ?? "").trim(), "image");
  const releaseDate = parseSongReleaseDate(formData);
  await prisma.song.update({ where: { id }, data: { title, albumId, artworkUrl, releaseDate, ...(audioKey ? { audioKey } : {}) } });
  const artist = await prisma.artist.findUniqueOrThrow({ where: { id: membership.artistId }, select: { slug: true } });
  revalidatePath(`/artists/${artist.slug}`);
  redirect("/artist/dashboard?saved=song-updated");
}

export async function deleteArtistSong(formData: FormData) {
  const { currentUser } = await import("@/lib/auth");
  const user = await currentUser();
  if (!user || user.role !== "ARTIST") redirect("/login");
  const membership = await prisma.artistMember.findFirst({ where: { userId: user.id }, select: { artistId: true } });
  if (!membership) redirect("/artist/dashboard?error=missing-profile");
  const id = String(formData.get("songId") ?? "");
  const owned = await prisma.song.findFirst({
    where: { id, artists: { some: { artistId: membership.artistId } } },
    select: { id: true, artists: { select: { artistId: true } } },
  });
  if (!owned) redirect("/artist/dashboard?error=invalid-song");

  // Retain listening history, favorites and playlist references. Archive a solo
  // release; for a collaboration, remove only this artist's association.
  await prisma.$transaction(async (tx) => {
    await tx.songArtist.delete({ where: { songId_artistId: { songId: id, artistId: membership.artistId } } });
    if (owned.artists.length === 1) {
      await tx.song.update({ where: { id }, data: { status: "ARCHIVED" } });
    }
  });

  const artist = await prisma.artist.findUniqueOrThrow({ where: { id: membership.artistId }, select: { slug: true } });
  revalidatePath("/");
  revalidatePath("/artists");
  revalidatePath(`/artists/${artist.slug}`);
  revalidatePath("/artist/dashboard");
  redirect("/artist/dashboard?saved=song-deleted");
}

export async function submitAlbum(formData: FormData) {
  const { currentUser } = await import("@/lib/auth");
  const user = await currentUser();
  if (!user || user.role !== "ARTIST") redirect("/login");
  const membership = await prisma.artistMember.findFirst({ where: { userId: user.id }, select: { artistId: true } });
  if (!membership) redirect("/artist/dashboard?error=missing-profile");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "ALBUM");
  if (title.length < 2 || !["ALBUM", "EP", "SINGLE"].includes(type)) redirect("/artist/dashboard?error=invalid-album");
  const slug = makeSlug(title);
  await prisma.album.create({ data: { title, slug, description, type: type as "ALBUM" | "EP" | "SINGLE", artworkUrl: validateMediaUrl(String(formData.get("artworkUrl") ?? "").trim(), "image"), releaseDate: parseReleaseDate(String(formData.get("releaseDate") ?? "")), artistId: membership.artistId, status: "PUBLISHED" } });
  const artist = await prisma.artist.findUniqueOrThrow({ where: { id: membership.artistId }, select: { slug: true } });
  revalidatePath(`/artists/${artist.slug}`);
  redirect("/artist/dashboard?saved=album");
}

export async function updateArtistAlbum(formData: FormData) {
  const { currentUser } = await import("@/lib/auth");
  const user = await currentUser();
  if (!user || user.role !== "ARTIST") redirect("/login");
  const membership = await prisma.artistMember.findFirst({ where: { userId: user.id }, select: { artistId: true } });
  if (!membership) redirect("/artist/dashboard?error=missing-profile");
  const id = String(formData.get("albumId") ?? "");
  if (!await prisma.album.findFirst({ where: { id, artistId: membership.artistId }, select: { id: true } })) redirect("/artist/dashboard?error=invalid-album");
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "ALBUM");
  if (title.length < 2 || !["ALBUM", "EP", "SINGLE"].includes(type)) redirect("/artist/dashboard?error=invalid-album");
  await prisma.album.update({ where: { id }, data: { title, description: String(formData.get("description") ?? "").trim(), type: type as "ALBUM" | "EP" | "SINGLE", artworkUrl: validateMediaUrl(String(formData.get("artworkUrl") ?? "").trim(), "image"), releaseDate: parseReleaseDate(String(formData.get("releaseDate") ?? "")) } });
  const artist = await prisma.artist.findUniqueOrThrow({ where: { id: membership.artistId }, select: { slug: true } });
  revalidatePath(`/artists/${artist.slug}`);
  redirect("/artist/dashboard?saved=album-updated");
}

export async function toggleTrackFavorite(trackId: string) {
  const { currentUser } = await import("@/lib/auth");
  const user = await currentUser();
  if (!user) redirect("/login");
  const song = await prisma.song.findUnique({ where: { slug: trackId }, select: { id: true } });
  if (!song) redirect("/library?error=catalog");
  const current = await prisma.favorite.findUnique({ where: { userId_songId: { userId: user.id, songId: song.id } } });
  if (current) await prisma.favorite.delete({ where: { userId_songId: { userId: user.id, songId: song.id } } });
  else await prisma.favorite.create({ data: { userId: user.id, songId: song.id } });
}

export async function getFavoriteTrackIds() {
  const { currentUser } = await import("@/lib/auth");
  const user = await currentUser();
  if (!user) return [];
  try { return (await prisma.favorite.findMany({ where: { userId: user.id }, select: { song: { select: { slug: true } } } })).map(({ song }) => song.slug); }
  catch { return []; }
}

export async function recordListening(trackId: string, listenedSec: number) {
  const { currentUser } = await import("@/lib/auth");
  const user = await currentUser();
  if (!user) return;
  const song = await prisma.song.findUnique({ where: { slug: trackId }, select: { id: true } });
  if (!song) return;
  await prisma.listeningHistory.create({ data: { userId: user.id, songId: song.id, listenedSec: Math.max(0, Math.min(86400, Math.round(listenedSec))) } });
}

export async function submitProduct(formData: FormData) {
  const { currentUser } = await import("@/lib/auth");
  const user = await currentUser();
  if (!user || user.role !== "ARTIST") redirect("/login");
  const link = await prisma.artistMember.findFirst({ where: { userId: user.id }, select: { artistId: true } });
  if (!link) redirect("/artist/dashboard?error=missing-profile");
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) redirect("/artist/dashboard?error=invalid-product");
  const slug = `${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
  await prisma.product.create({ data: { name, slug, description: String(formData.get("description") ?? "").trim(), imageUrl: validateMediaUrl(String(formData.get("imageUrl") ?? "").trim(), "image"), priceLabel: String(formData.get("price") ?? "").trim() || null, whatsappPhone: parseWhatsAppPhone(String(formData.get("whatsappPhone") ?? "")), status: "PUBLISHED", artistId: link.artistId } });
  revalidatePath("/store");
  revalidatePath("/artist/dashboard");
  redirect("/artist/dashboard?saved=product");
}

async function requireArtistId() {
  const { currentUser } = await import("@/lib/auth");
  const user = await currentUser();
  if (!user || user.role !== "ARTIST") redirect("/login");
  const membership = await prisma.artistMember.findFirst({ where: { userId: user.id }, select: { artistId: true } });
  if (!membership) redirect("/artist/dashboard?error=missing-profile");
  return membership.artistId;
}

function parseWhatsAppPhone(value: string) {
  if (!value.trim()) return null;
  const normalized = value.trim().replace(/[\s().-]/g, "");
  if (!/^(?:\+\d{8,15}|00\d{8,15})$/.test(normalized)) redirect("/artist/dashboard?error=invalid-whatsapp");
  return normalized.startsWith("00") ? normalized.slice(2) : normalized.slice(1);
}

function parseOptionalHttpsUrl(value: string, error = "invalid-event") {
  if (!value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol === "https:") return url.toString();
  } catch { /* invalid URL */ }
  redirect(`/artist/dashboard?error=${error}`);
}

export async function updateArtistProduct(formData: FormData) {
  const artistId = await requireArtistId();
  const id = String(formData.get("productId") ?? "");
  const product = await prisma.product.findFirst({ where: { id, artistId }, select: { id: true } });
  if (!product) redirect("/artist/dashboard?error=invalid-product");
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) redirect("/artist/dashboard?error=invalid-product");
  await prisma.product.update({ where: { id }, data: { name, description: String(formData.get("description") ?? "").trim(), imageUrl: validateMediaUrl(String(formData.get("imageUrl") ?? "").trim(), "image"), priceLabel: String(formData.get("price") ?? "").trim() || null, whatsappPhone: parseWhatsAppPhone(String(formData.get("whatsappPhone") ?? "")) } });
  revalidatePath("/store");
  revalidatePath("/artist/dashboard");
  redirect("/artist/dashboard?saved=product-updated");
}

export async function deleteArtistProduct(formData: FormData) {
  const artistId = await requireArtistId();
  const id = String(formData.get("productId") ?? "");
  const result = await prisma.product.deleteMany({ where: { id, artistId } });
  if (!result.count) redirect("/artist/dashboard?error=invalid-product");
  revalidatePath("/store");
  revalidatePath("/artist/dashboard");
  redirect("/artist/dashboard?saved=product-deleted");
}

function makeSlug(value: string) {
  return `${value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
}

export async function submitArtistNews(formData: FormData) {
  const { currentUser } = await import("@/lib/auth");
  const user = await currentUser();
  if (!user || user.role !== "ARTIST") redirect("/login");
  const membership = await prisma.artistMember.findFirst({ where: { userId: user.id }, select: { artistId: true } });
  if (!membership) redirect("/artist/dashboard?error=missing-profile");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (title.length < 3 || body.length < 10) redirect("/artist/dashboard?error=invalid-news");
  await prisma.article.create({ data: { title, slug: makeSlug(title), body, summary: String(formData.get("summary") ?? "").trim(), imageUrl: validateMediaUrl(String(formData.get("imageUrl") ?? "").trim(), "image"), category: "Actualité artiste", artistId: membership.artistId, publishedAt: new Date(), status: "PUBLISHED" } });
  revalidatePath("/notifications");
  revalidatePath("/artist/dashboard");
  redirect("/artist/dashboard?saved=news");
}

export async function updateArtistNews(formData: FormData) {
  const artistId = await requireArtistId();
  const id = String(formData.get("articleId") ?? "");
  const article = await prisma.article.findFirst({ where: { id, artistId }, select: { id: true, slug: true } });
  if (!article) redirect("/artist/dashboard?error=invalid-news");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (title.length < 3 || body.length < 10) redirect("/artist/dashboard?error=invalid-news");
  await prisma.article.update({ where: { id }, data: { title, summary: String(formData.get("summary") ?? "").trim(), body, imageUrl: validateMediaUrl(String(formData.get("imageUrl") ?? "").trim(), "image") } });
  revalidatePath("/notifications");
  revalidatePath(`/news/${article.slug}`);
  revalidatePath("/artist/dashboard");
  redirect("/artist/dashboard?saved=news-updated");
}

export async function deleteArtistNews(formData: FormData) {
  const artistId = await requireArtistId();
  const id = String(formData.get("articleId") ?? "");
  const article = await prisma.article.findFirst({ where: { id, artistId }, select: { id: true, slug: true } });
  if (!article) redirect("/artist/dashboard?error=invalid-news");
  await prisma.article.delete({ where: { id } });
  revalidatePath("/notifications");
  revalidatePath(`/news/${article.slug}`);
  revalidatePath("/artist/dashboard");
  redirect("/artist/dashboard?saved=news-deleted");
}

export async function submitArtistEvent(formData: FormData) {
  const { currentUser } = await import("@/lib/auth");
  const user = await currentUser();
  if (!user || user.role !== "ARTIST") redirect("/login");
  const membership = await prisma.artistMember.findFirst({ where: { userId: user.id }, select: { artistId: true } });
  if (!membership) redirect("/artist/dashboard?error=missing-profile");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startsAt = new Date(String(formData.get("startsAt") ?? ""));
  if (title.length < 3 || description.length < 10 || !Number.isFinite(startsAt.getTime())) redirect("/artist/dashboard?error=invalid-event");
  const venue = String(formData.get("venue") ?? "").trim();
  const imageUrl = validateMediaUrl(String(formData.get("imageUrl") ?? "").trim(), "image");
  const registrationUrl = parseOptionalHttpsUrl(String(formData.get("registrationUrl") ?? ""));
  const event = await prisma.event.create({ data: { title, slug: makeSlug(title), description, imageUrl, startsAt, venue: venue || null, registrationUrl, status: "PUBLISHED", artists: { create: { artistId: membership.artistId } } } });
  revalidatePath("/events");
  revalidatePath("/artist/dashboard");
  redirect(`/artist/dashboard?saved=event&event=${event.slug}`);
}

export async function updateArtistEvent(formData: FormData) {
  const artistId = await requireArtistId();
  const id = String(formData.get("eventId") ?? "");
  const event = await prisma.event.findFirst({ where: { id, artists: { some: { artistId } } }, select: { id: true, slug: true } });
  if (!event) redirect("/artist/dashboard?error=invalid-event");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startsAt = new Date(String(formData.get("startsAt") ?? ""));
  if (title.length < 3 || description.length < 10 || !Number.isFinite(startsAt.getTime())) redirect("/artist/dashboard?error=invalid-event");
  await prisma.event.update({ where: { id }, data: { title, description, startsAt, venue: String(formData.get("venue") ?? "").trim() || null, registrationUrl: parseOptionalHttpsUrl(String(formData.get("registrationUrl") ?? "")), imageUrl: validateMediaUrl(String(formData.get("imageUrl") ?? "").trim(), "image") } });
  revalidatePath("/events");
  revalidatePath(`/events/${event.slug}`);
  revalidatePath("/artist/dashboard");
  redirect("/artist/dashboard?saved=event-updated");
}

export async function deleteArtistEvent(formData: FormData) {
  const artistId = await requireArtistId();
  const id = String(formData.get("eventId") ?? "");
  const event = await prisma.event.findFirst({ where: { id, artists: { some: { artistId } } }, select: { id: true, slug: true } });
  if (!event) redirect("/artist/dashboard?error=invalid-event");
  await prisma.event.delete({ where: { id } });
  revalidatePath("/events");
  revalidatePath(`/events/${event.slug}`);
  revalidatePath("/notifications");
  revalidatePath("/artist/dashboard");
  redirect("/artist/dashboard?saved=event-deleted");
}

export async function toggleFavorite(formData: FormData) {
  const { currentUser } = await import("@/lib/auth");
  const user = await currentUser();
  if (!user) redirect("/login");
  const songId = String(formData.get("songId") ?? "");
  const exists = await prisma.favorite.findUnique({ where: { userId_songId: { userId: user.id, songId } } });
  if (exists) await prisma.favorite.delete({ where: { userId_songId: { userId: user.id, songId } } });
  else await prisma.favorite.create({ data: { userId: user.id, songId } });
  redirect("/library");
}

export async function createPlaylist(formData: FormData) {
  const { currentUser } = await import("@/lib/auth");
  const user = await currentUser();
  if (!user) redirect("/login");
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2) redirect("/library?error=playlist");
  await prisma.playlist.create({ data: { title, ownerId: user.id } });
  redirect("/library?saved=playlist");
}

export async function addSongToPlaylist(formData: FormData) {
  const { currentUser } = await import("@/lib/auth");
  const user = await currentUser();
  if (!user) redirect("/login");
  const playlistId = String(formData.get("playlistId") ?? "");
  const trackSlug = String(formData.get("trackSlug") ?? "");
  const playlist = await prisma.playlist.findFirst({ where: { id: playlistId, ownerId: user.id }, select: { id: true, tracks: { select: { position: true }, orderBy: { position: "desc" }, take: 1 } } });
  const song = await prisma.song.findUnique({ where: { slug: trackSlug }, select: { id: true } });
  if (!playlist || !song) redirect("/library?error=playlist");
  await prisma.playlistTrack.upsert({ where: { playlistId_songId: { playlistId, songId: song.id } }, create: { playlistId, songId: song.id, position: (playlist.tracks[0]?.position ?? -1) + 1 }, update: {} });
  redirect("/library?saved=playlist-track");
}
