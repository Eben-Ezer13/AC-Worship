import Link from "next/link";
import { signIn } from "@/app/account-actions";
import { PasswordInput } from "@/components/password-input";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="account-page">
      <section className="account-card">
        <Link href="/" className="account-brand">AC WORSHIP</Link>
        <span className="section-kicker">VOTRE ESPACE MUSICAL</span>
        <h1>Ravi de<br />vous revoir.</h1>
        <p>Retrouvez vos chants, vos playlists et les artistes que vous aimez.</p>
        {error && <div className="form-notice">{error === "database" ? "Connexion indisponible. R&eacute;essayez dans un instant." : "Adresse e-mail ou mot de passe incorrect."}</div>}
        <form action={signIn}>
          <label>Adresse e-mail<input name="email" type="email" autoComplete="email" required /></label>
          <label>Mot de passe<PasswordInput name="password" autoComplete="current-password" /></label>
          <button className="primary-button">Se connecter</button>
        </form>
        <div className="account-switch">Nouveau sur AC Worship ? <Link href="/signup">Cr&eacute;er un compte</Link></div>
      </section>
    </main>
  );
}
