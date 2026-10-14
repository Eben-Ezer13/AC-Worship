import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findFirst({ where: { slug, status: "PUBLISHED" }, include: { artists: { include: { artist: { select: { name: true, slug: true } } } } } });
  if (!event) notFound();
  return <main className="catalog-page content-detail-page"><header className="catalog-top"><Link href="/notifications">← Notifications</Link><Link href="/">AC Worship</Link></header>{event.imageUrl && <div className="detail-image"><Image src={event.imageUrl} alt="" fill sizes="(max-width:800px) 100vw, 900px"/></div>}<span className="section-kicker">ÉVÉNEMENT · {event.artists.map(({ artist }) => artist.name).join(" · ")}</span><h1>{event.title}</h1><p className="detail-summary">{event.description}</p><div className="event-detail-meta"><span>{event.startsAt.toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" })}</span>{event.venue && <span>{event.venue}{event.address ? ` · ${event.address}` : ""}</span>}</div>{event.registrationUrl && <a className="primary-button" href={event.registrationUrl} target="_blank" rel="noreferrer">Informations et inscription →</a>}</main>;
}
