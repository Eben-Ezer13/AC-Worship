import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

const cookieName = "acw_session";
export function hashPassword(password: string) { return scryptSync(password, process.env.SESSION_SECRET ?? "ac-worship-development-salt", 64).toString("hex"); }
export function verifyPassword(password: string, hash: string) { try { return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(hashPassword(password), "hex")); } catch { return false; } }
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({ data: { userId, tokenHash: createHash("sha256").update(token).digest("hex"), expiresAt: new Date(Date.now() + 30 * 86400000) } });
  (await cookies()).set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: new Date(Date.now() + 30 * 86400000) });
}
export async function currentUser() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  return prisma.user.findFirst({ where: { sessions: { some: { tokenHash: createHash("sha256").update(token).digest("hex"), expiresAt: { gt: new Date() } } } }, select: { id: true, name: true, email: true, role: true } });
}
