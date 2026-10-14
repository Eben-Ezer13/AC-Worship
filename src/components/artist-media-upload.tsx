"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";

export function ArtistMediaUpload({ artistId, name, label, kind, accept, initialUrl = "", required = false }: { artistId: string; name: string; label: string; kind: "audio" | "image"; accept: string; initialUrl?: string; required?: boolean }) {
  const [url, setUrl] = useState(initialUrl);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function uploadFile(file?: File) {
    if (!file) return;
    const limit = kind === "audio" ? 200 * 1024 * 1024 : 12 * 1024 * 1024;
    if (file.size > limit) {
      setStatus(kind === "audio" ? "Fichier trop volumineux (200 Mo maximum)." : "Image trop volumineuse (12 Mo maximum).");
      return;
    }
    setBusy(true);
    setStatus("Envoi sécurisé en cours…");
    try {
      const safeName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-");
      const blob = await upload(`artists/${artistId}/${kind}/${Date.now()}-${safeName}`, file, {
        access: "public",
        handleUploadUrl: `/api/artist-upload?kind=${kind}`,
        multipart: kind === "audio",
      });
      setUrl(blob.url);
      setStatus("Fichier prêt. Enregistrez le formulaire pour publier les changements.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Échec de l’envoi. Vérifiez le stockage média configuré.");
    } finally {
      setBusy(false);
    }
  }

  return <span className="artist-upload-field">
    <label>{label}<input type="file" accept={accept} required={required && !url} disabled={busy} onChange={(event) => void uploadFile(event.currentTarget.files?.[0])}/></label>
    <input type="hidden" name={name} value={url}/>
    {status && <small role="status" className={busy ? "upload-status is-uploading" : "upload-status"}>{status}</small>}
    {url && <small className="upload-status">Fichier sélectionné · <button type="button" onClick={() => { setUrl(""); setStatus("Sélectionnez un nouveau fichier avant d’enregistrer."); }}>Remplacer</button></small>}
  </span>;
}
