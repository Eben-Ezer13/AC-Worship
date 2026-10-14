import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { PwaInstallButton } from "@/components/pwa-install-button";
import { signOut, updateAccountProfile } from "@/app/account-actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/login?next=/profile");
  const { saved, error } = await searchParams;
  return <main className="catalog-page account-page"><header className="catalog-top"><Link href="/">← AC Worship</Link><Link href="/notifications">Notifications</Link></header>
    <span className="section-kicker">VOTRE COMPTE</span><h1>Mon profil</h1><p className="catalog-intro">Retrouvez ici vos préférences et votre espace personnel.</p>
    <section className="profile-card"><div className="profile-avatar">{user.name.slice(0, 1).toUpperCase()}</div><div><span className="section-kicker">{user.role === "ARTIST" ? "COMPTE ARTISTE" : "AUDITEUR"}</span><h2>{user.name}</h2><p>{user.email}</p></div></section>
    {saved && <div className="form-notice">Votre profil a été mis à jour.</div>}{error && <div className="form-notice">Le nom doit contenir entre 2 et 80 caractères.</div>}
    <form className="profile-edit-form" action={updateAccountProfile}><label htmlFor="profile-name">Nom affiché</label><div><input id="profile-name" name="name" defaultValue={user.name} minLength={2} maxLength={80} required/><button className="secondary-button">Enregistrer</button></div></form>
    <section className="profile-options"><h2>Votre espace</h2><Link href="/library"><span>Ma bibliothèque</span><small>Favoris, historique et playlists</small><b>→</b></Link><Link href="/library#playlists"><span>Mes playlists</span><small>Accéder à vos playlists et les écouter</small><b>→</b></Link><Link href="/notifications"><span>Notifications</span><small>Sorties, actualités, événements et boutique</small><b>→</b></Link>{user.role === "ARTIST" && <Link href="/artist/dashboard"><span>Espace artiste</span><small>Gérer votre profil et vos publications</small><b>→</b></Link>}</section>
    <section className="install-card"><div><span className="section-kicker">AC WORSHIP SUR VOTRE TÉLÉPHONE</span><h2>Installez l’application</h2><p>Ajoutez AC Worship à votre écran d’accueil pour l’ouvrir comme une application.</p></div><PwaInstallButton/></section>
    <form action={signOut}><button className="secondary-button">Se déconnecter</button></form>
  </main>;
}
