import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "ARTIST") return NextResponse.json({ error: "Connexion artiste requise." }, { status: 401 });
    const membership = await prisma.artistMember.findFirst({ where: { userId: user.id }, select: { artistId: true } });
    if (!membership) return NextResponse.json({ error: "Aucun profil artiste n’est associé à ce compte." }, { status: 403 });
    const kind = new URL(request.url).searchParams.get("kind");
    if (kind !== "audio" && kind !== "image") return NextResponse.json({ error: "Type de fichier non autorisé." }, { status: 400 });
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(`artists/${membership.artistId}/${kind}/`)) throw new Error("Chemin de téléversement invalide.");
        return {
          allowedContentTypes: kind === "image"
            ? ["image/jpeg", "image/png", "image/webp", "image/avif"]
            : ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/flac", "audio/aac", "audio/mp4", "audio/x-m4a"],
          maximumSizeInBytes: kind === "audio" ? 200 * 1024 * 1024 : 12 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ artistId: membership.artistId, kind }),
        };
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Le téléversement a échoué." }, { status: 400 });
  }
}
