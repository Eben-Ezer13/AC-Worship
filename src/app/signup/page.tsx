import Link from "next/link";
import { signUp } from "@/app/account-actions";
import { PasswordInput } from "@/components/password-input";

export default async function Signup({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="account-page">
      <section className="account-card">
        <Link href="/" className="account-brand">AC WORSHIP</Link>
        <span className="section-kicker">REJOIGNEZ LA COMMUNAUT&Eacute;</span>
        <h1>Votre musique,<br />votre espace.</h1>
        <p>Cr&eacute;ez votre compte pour enregistrer vos favoris et composer votre biblioth&egrave;que.</p>
        {error && <div className="form-notice">{error === "exists" ? "Un compte existe d&eacute;j&agrave; avec cet e-mail." : error === "database" ? "Base de donn&eacute;es non configur&eacute;e ou inaccessible." : "V&eacute;rifiez votre nom, votre e-mail et choisissez un mot de passe de 10 caract&egrave;res minimum."}</div>}
        <form action={signUp}>
          <label>Nom complet<input name="name" autoComplete="name" minLength={2} required /></label>
          <label>Adresse e-mail<input name="email" type="email" autoComplete="email" required /></label>
          <label>Mot de passe<PasswordInput name="password" autoComplete="new-password" minLength={10} /></label>
          <button className="primary-button">Cr&eacute;er mon espace</button>
        </form>
        <div className="account-switch">D&eacute;j&agrave; inscrit ? <Link href="/login">Se connecter</Link></div>
        <p className="account-note">Les comptes artistes sont reli&eacute;s &agrave; leur profil par l&rsquo;&eacute;quipe AC Worship.</p>
      </section>
    </main>
  );
}
