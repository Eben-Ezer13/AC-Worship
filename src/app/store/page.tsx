import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function whatsappPurchaseLink(phone: string, productName: string) {
  const message = `Bonjour, je souhaite acheter 1 exemplaire de « ${productName} ». Pouvez-vous m’indiquer la disponibilité et les modalités de paiement ?`;
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export default async function StorePage() {
  let products: { id: string; name: string; slug: string; description: string; imageUrl: string | null; priceLabel: string | null; whatsappPhone: string | null; artist: { name: string; slug: string } }[] = [];
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
      <div className="discovery-copy"><span><Link href={`/artists/${product.artist.slug}`}>{product.artist.name}</Link></span><h2>{product.name}</h2><p>{product.description}</p><strong>{product.priceLabel ?? "Contacter l’artiste"}</strong>
        {product.whatsappPhone ? <a className="store-buy-link" href={whatsappPurchaseLink(product.whatsappPhone, product.name)} target="_blank" rel="noopener noreferrer">Acheter 1 article sur WhatsApp <span aria-hidden="true">↗</span></a> : <Link className="store-buy-link store-contact-link" href={`/artists/${product.artist.slug}`}>Contacter l’artiste <span aria-hidden="true">→</span></Link>}
      </div>
    </article>)}</div>
  </main>;
}
