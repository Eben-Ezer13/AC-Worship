import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ReleaseCountdown } from "@/components/release-countdown";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  let events: { id: string; title: string; slug: string; description: string; imageUrl: string | null; startsAt: Date; venue: string | null; artists: { artist: { name: string } }[] }[] = [];
  let available = true;
  try {
    events = await prisma.event.findMany({ where: { status: "PUBLISHED", startsAt: { gt: new Date() } }, include: { artists: { include: { artist: { select: { name: true } } } } }, orderBy: { startsAt: "asc" } });
  } catch { available = false; }
  return <main className="catalog-page discovery-page">
    <header className="catalog-top"><Link href="/">← AC Worship</Link><Link href="/notifications">Notifications</Link></header>
    <span className="section-kicker">RENDEZ-VOUS</span><h1>Événements</h1>
    <p className="catalog-intro">Concerts, rencontres et temps forts des artistes AC Worship.</p>
    {!available && <div className="form-notice">Les événements seront affichés dès que la base de données sera accessible.</div>}
    {available && events.length === 0 && <div className="discovery-empty"><span>CALENDRIER · AC WORSHIP</span><h2>Les prochains rendez-vous arrivent.</h2><p>Les événements publiés par les artistes apparaîtront ici.</p><Link className="secondary-button" href="/artists">Voir les artistes</Link></div>}
    {available && events.length > 0 && (() => {
      const renderEvents = (items: typeof events) => <div className="discovery-grid event-discovery-grid">{items.map((event) => <Link className="discovery-card event-card" href={`/events/${event.slug}`} key={event.id}>
        <div className="discovery-art event-art">{event.imageUrl ? <img src={event.imageUrl} alt={`Affiche de ${event.title}`}/> : <span>{event.startsAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</span>}</div>
        <div className="discovery-copy"><span>PROCHAIN RENDEZ-VOUS</span><h2>{event.title}</h2><p>{event.venue ?? "Lieu à confirmer"}{event.artists.length ? ` · ${event.artists.map(({ artist }) => artist.name).join(", ")}` : ""}</p><div className="event-countdown-wrap"><span>LE COMPTE À REBOURS EST LANCÉ</span><ReleaseCountdown releaseAt={event.startsAt.toISOString()} showDate dateLabel="Le" readyLabel="L’événement commence maintenant"/></div><strong className="event-discover-link">Découvrir l’événement →</strong></div>
      </Link>)}</div>;
      return <>
        <section className="events-section"><div className="events-section-heading"><span className="section-kicker">À VENIR</span><h2>Les prochains rendez-vous</h2><p>Retrouvez la date, l’heure et le décompte avant chaque événement.</p></div>{renderEvents(events)}</section>
      </>;
    })()}
  </main>;
}
