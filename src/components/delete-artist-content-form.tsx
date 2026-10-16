"use client";

import { deleteArtistEvent, deleteArtistNews, deleteArtistProduct } from "@/app/account-actions";

const actions = {
  product: { action: deleteArtistProduct, field: "productId", label: "Supprimer l’article" },
  event: { action: deleteArtistEvent, field: "eventId", label: "Supprimer l’évènement" },
  news: { action: deleteArtistNews, field: "articleId", label: "Supprimer l’actualité" },
};

export function DeleteArtistContentForm({ kind, id, title }: { kind: keyof typeof actions; id: string; title: string }) {
  const config = actions[kind];
  return <form action={config.action} className="song-delete-form" onSubmit={(event) => {
    if (!window.confirm(`Supprimer « ${title} » ? Cette action est définitive.`)) event.preventDefault();
  }}>
    <input type="hidden" name={config.field} value={id}/>
    <button className="song-delete-button" type="submit">{config.label}</button>
  </form>;
}
