"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";

export function ArtistMediaUpload({ artistId, name, label, kind, accept, initialUrl = "", required = false }: { artistId: string; name: string; label: string; kind: "audio" | "image"; accept: string; initialUrl?: string; required?: boolean }) {
  const [url, setUrl] = useState(initialUrl);
  const [selectedFileName, setSelectedFileName] = useState("");
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
      setSelectedFileName(file.name);
      setStatus("Fichier prêt. Enregistrez le formulaire pour publier les changements.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Échec de l’envoi. Vérifiez le stockage média configuré.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="artist-upload-field">
    <label>{label}<input type="file" accept={accept} required={required && !url} disabled={busy} onChange={(event) => void uploadFile(event.currentTarget.files?.[0])}/></label>
    <input type="hidden" name={name} value={url}/>
    {status && <small role="status" className={busy ? "upload-status is-uploading" : "upload-status"}>{status}</small>}
    {url && <div className={`artist-media-preview artist-media-preview-${kind}`}>
      {kind === "image" ? <img src={url} alt="Aperçu de l’image envoyée"/> : <div className="artist-audio-preview"><span>ÉCOUTER L’APERÇU</span><audio controls preload="metadata" src={url}>La lecture audio n’est pas prise en charge par ce navigateur.</audio></div>}
      <small>{selectedFileName || "Fichier prêt à publier"}</small>
    </div>}
    {url && <small className="upload-status">Fichier sélectionné · <button type="button" onClick={() => { setUrl(""); setStatus("Sélectionnez un nouveau fichier avant d’enregistrer."); }}>Remplacer</button></small>}
  </div>;
}
