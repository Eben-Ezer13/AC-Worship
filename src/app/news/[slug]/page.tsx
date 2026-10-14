import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await prisma.article.findFirst({ where: { slug, status: "PUBLISHED" }, include: { artist: { select: { name: true, slug: true } } } });
  if (!article) notFound();
  return <main className="catalog-page content-detail-page"><header className="catalog-top"><Link href="/notifications">← Notifications</Link><Link href="/">AC Worship</Link></header>{article.imageUrl && <div className="detail-image"><Image src={article.imageUrl} alt="" fill sizes="(max-width:800px) 100vw, 900px"/></div>}<span className="section-kicker">{article.category ?? "ACTUALITÉ"}{article.artist ? ` · ${article.artist.name}` : ""}</span><h1>{article.title}</h1>{article.summary && <p className="detail-summary">{article.summary}</p>}<p className="detail-date">{(article.publishedAt ?? article.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p><div className="article-body">{article.body.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div>{article.artist && <Link className="secondary-button" href={`/artists/${article.artist.slug}`}>Voir le profil de {article.artist.name}</Link>}</main>;
}
