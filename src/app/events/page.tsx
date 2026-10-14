import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  let events: { id: string; title: string; slug: string; description: string; imageUrl: string | null; startsAt: Date; venue: string | null; artists: { artist: { name: string } }[] }[] = [];
  let available = true;
  try {
    events = await prisma.event.findMany({ where: { status: "PUBLISHED", startsAt: { gte: new Date() } }, include: { artists: { include: { artist: { select: { name: true } } } } }, orderBy: { startsAt: "asc" } });
  } catch { available = false; }
  return <main className="catalog-page discovery-page">
    <header className="catalog-top"><Link href="/">← AC Worship</Link><Link href="/notifications">Notifications</Link></header>
    <span className="section-kicker">RENDEZ-VOUS</span><h1>Événements</h1>
    <p className="catalog-intro">Concerts, rencontres et temps forts des artistes AC Worship.</p>
    {!available && <div className="form-notice">Les événements seront affichés dès que la base de données sera accessible.</div>}
    {available && events.length === 0 && <div className="discovery-empty"><span>CALENDRIER · AC WORSHIP</span><h2>Les prochains rendez-vous arrivent.</h2><p>Les événements publiés par les artistes apparaîtront ici.</p><Link className="secondary-button" href="/artists">Voir les artistes</Link></div>}
    <div className="discovery-grid">{events.map((event) => <Link className="discovery-card event-card" href={`/events/${event.slug}`} key={event.id}>
      <div className="discovery-art event-art">{event.imageUrl ? <img src={event.imageUrl} alt=""/> : <span>{event.startsAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</span>}</div>
      <div className="discovery-copy"><span>{event.startsAt.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span><h2>{event.title}</h2><p>{event.venue ?? "Lieu à confirmer"}{event.artists.length ? ` · ${event.artists.map(({ artist }) => artist.name).join(", ")}` : ""}</p><strong>Découvrir l’événement →</strong></div>
    </Link>)}</div>
  </main>;
}
