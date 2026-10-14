import Link from "next/link";
import { signIn } from "@/app/account-actions";
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="account-page"><section className="account-card"><Link href="/" className="account-brand">AC WORSHIP</Link><span className="section-kicker">VOTRE ESPACE MUSICAL</span><h1>Ravi de vous revoir.</h1><p>Connectez-vous pour retrouver vos chants, playlists et artistes favoris.</p>{error && <div className="form-notice">{error === "database" ? "Connexion indisponible : configurez la base de données dans .env.local." : "Adresse e-mail ou mot de passe incorrect."}</div>}<form action={signIn}><label>E-mail<input name="email" type="email" autoComplete="email" required/></label><label>Mot de passe<input name="password" type="password" autoComplete="current-password" required/></label><button className="primary-button">Se connecter</button></form><div className="account-switch">Pas encore de compte ? <Link href="/signup">Créer un compte</Link></div></section></main>;
}
