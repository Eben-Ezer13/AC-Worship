"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/account-actions";

function ProfileIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    profile: <><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.5-3.2 2.8-5 6.5-5s6 1.8 6.5 5"/></>,
    library: <><path d="M5 4v16M10 7v13M15 5l3 15M21 4v16"/></>,
    playlist: <><path d="M4 6h13M4 11h13M4 16h8"/><path d="m16 15 5 3-5 3z"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    studio: <><path d="m12 3 2.4 5.1 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8z"/></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/></>,
  };
  return <svg className="profile-menu-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function ProfileMenu({ name, email, role, unread = 0 }: { name: string; email: string; role: string; unread?: number }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const closeOutside = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", closeOutside); document.removeEventListener("keydown", closeOnEscape); };
  }, []);

  return <div className="profile-menu" ref={root}>
    <button className="profile-menu-trigger" type="button" aria-label="Ouvrir le menu du profil" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      <span className="profile-menu-avatar">{name.slice(0, 1).toUpperCase()}</span><span className="profile-menu-chevron" aria-hidden="true">⌄</span>
    </button>
    {open && <section className="profile-menu-popover" role="menu" aria-label="Menu du profil">
      <header className="profile-menu-heading"><span className="profile-menu-avatar">{name.slice(0, 1).toUpperCase()}</span><span><b>{name}</b><small>{email}</small><i>{role === "ARTIST" ? "Espace artiste" : role === "ADMIN" ? "Administration" : "Auditeur"}</i></span></header>
      <div className="profile-menu-links">
        <Link role="menuitem" href="/profile" onClick={() => setOpen(false)}><ProfileIcon name="profile"/>Mon profil <span className="profile-menu-arrow">›</span></Link>
        <Link role="menuitem" href="/library" onClick={() => setOpen(false)}><ProfileIcon name="library"/>Ma bibliothèque <span className="profile-menu-arrow">›</span></Link>
        <Link role="menuitem" href="/library#playlists" onClick={() => setOpen(false)}><ProfileIcon name="playlist"/>Mes playlists <span className="profile-menu-arrow">›</span></Link>
        <Link role="menuitem" href="/notifications" onClick={() => setOpen(false)}><ProfileIcon name="bell"/>Notifications{unread > 0 && <em>{unread > 9 ? "9+" : unread}</em>}<span className="profile-menu-arrow">›</span></Link>
        {role === "ARTIST" && <Link role="menuitem" href="/artist/dashboard" onClick={() => setOpen(false)}><ProfileIcon name="studio"/>Studio artiste <span className="profile-menu-arrow">›</span></Link>}
      </div>
      <form action={signOut} onSubmit={() => { try { window.localStorage.removeItem("acw-account-display"); } catch { /* Storage can be disabled. */ } }}><button type="submit"><ProfileIcon name="logout"/>Se déconnecter</button></form>
    </section>}
  </div>;
}
