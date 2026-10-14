"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { access } from "node:fs/promises";
import path from "node:path";
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
    return user ? { name: user.name, role: user.role } : null;
  } catch {
    return null;
  }
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
  await prisma.artist.update({ where: { id: membership.artistId }, data: { name, bio, genre, imageUrl: String(formData.get("imageUrl") ?? "").trim() || null, status: "PUBLISHED" } });
  redirect("/artist/dashboard?saved=profile");
}

export async function submitSong(formData: FormData) {
  const { currentUser } = await import("@/lib/auth");
  const user = await currentUser();
  if (!user || user.role !== "ARTIST") redirect("/login");
  const link = await prisma.artistMember.findFirst({ where: { userId: user.id }, select: { artistId: true } });
  if (!link) redirect("/artist/dashboard?error=missing-profile");
  const title = String(formData.get("title") ?? "").trim();
  const audioKey = String(formData.get("audioKey") ?? "").trim();
  const audioPath = path.resolve(process.cwd(), "public", audioKey.replace(/^\/+/, ""));
  const audioRoot = path.resolve(process.cwd(), "public", "audio") + path.sep;
  if (title.length < 2 || !audioKey.startsWith("/audio/") || !audioPath.startsWith(audioRoot) || formData.get("rightsConfirmed") !== "on") redirect("/artist/dashboard?error=invalid-song");
  try { await access(audioPath); } catch { redirect("/artist/dashboard?error=audio-missing"); }
  const slug = `${title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
  await prisma.song.create({ data: { title, slug, audioKey, artworkUrl: String(formData.get("artworkUrl") ?? "").trim() || null, rightsConfirmedAt: new Date(), status: "PUBLISHED", artists: { create: { artistId: link.artistId } } } });
  redirect("/artist/dashboard?saved=song");
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
  await prisma.product.create({ data: { name, slug, description: String(formData.get("description") ?? ""), priceLabel: String(formData.get("price") ?? "") || null, status: "PUBLISHED", artistId: link.artistId } });
  redirect("/artist/dashboard?saved=product");
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
