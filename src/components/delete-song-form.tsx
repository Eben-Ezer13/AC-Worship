"use client";

import { deleteArtistSong } from "@/app/account-actions";

export function DeleteSongForm({ songId, title }: { songId: string; title: string }) {
  return (
    <form
      action={deleteArtistSong}
      className="song-delete-form"
      onSubmit={(event) => {
        if (!window.confirm(`Retirer « ${title} » de votre catalogue ?`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="songId" value={songId} />
      <button className="song-delete-button" type="submit">Supprimer le chant</button>
    </form>
  );
}
