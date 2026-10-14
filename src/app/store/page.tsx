import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  let products: { id: string; name: string; slug: string; description: string; imageUrl: string | null; priceLabel: string | null; artist: { name: string; slug: string } }[] = [];
  let available = true;
  try {
    products = await prisma.product.findMany({ where: { status: "PUBLISHED" }, include: { artist: { select: { name: true, slug: true } } }, orderBy: { createdAt: "desc" } });
  } catch { available = false; }
  return <main className="catalog-page discovery-page">
    <header className="catalog-top"><Link href="/">← AC Worship</Link><Link href="/artists">Artistes</Link></header>
    <span className="section-kicker">BOUTIQUE DES ARTISTES</span><h1>Le store</h1>
    <p className="catalog-intro">Retrouvez les créations et produits proposés par les artistes.</p>
    {!available && <div className="form-notice">La boutique sera affichée dès que la base de données sera accessible.</div>}
    {available && products.length === 0 && <div className="discovery-empty"><span>ÉDITIONS · CRÉATIONS · AC WORSHIP</span><h2>La boutique se prépare.</h2><p>Les articles publiés par les artistes apparaîtront ici.</p><Link className="secondary-button" href="/artists">Explorer les artistes</Link></div>}
    <div className="discovery-grid">{products.map((product) => <article className="discovery-card product-card" key={product.id}>
      <div className="discovery-art product-art">{product.imageUrl ? <img src={product.imageUrl} alt={`Visuel de ${product.name}`}/> : <span>AC<br/>WORSHIP</span>}</div>
      <div className="discovery-copy"><span><Link href={`/artists/${product.artist.slug}`}>{product.artist.name}</Link></span><h2>{product.name}</h2><p>{product.description}</p><strong>{product.priceLabel ?? "Contacter l’artiste"}</strong></div>
    </article>)}</div>
  </main>;
}
