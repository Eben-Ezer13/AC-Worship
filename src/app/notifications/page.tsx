import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/app/notification-actions";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/notifications");
  const notifications = await getNotifications();
  const unread = notifications.filter((item) => !item.readAt).length;
  return <main className="catalog-page notifications-page"><header className="catalog-top"><Link href="/">← AC Worship</Link><Link href="/profile">Mon profil</Link></header>
    <div className="notification-title"><div><span className="section-kicker">VOTRE FIL D’ACTUALITÉ</span><h1>Notifications</h1><p className="catalog-intro">Les nouveautés de vos artistes et de la plateforme.</p></div>{unread > 0 && <form action={markAllNotificationsRead}><button className="secondary-button">Tout marquer comme lu</button></form>}</div>
    {notifications.length ? <div className="notification-list">{notifications.map((item) => { const [kind, href] = item.type.split("|"); return <article className={`notification-item ${item.readAt ? "is-read" : "is-unread"}`} key={item.id}><span className="notification-dot"/><div className="notification-copy"><small>{kind} · {item.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</small><h2>{item.title}</h2>{item.body && <p>{item.body}</p>}<Link href={href || "/"}>Découvrir <span>→</span></Link></div>{!item.readAt && <form action={markNotificationRead}><input type="hidden" name="notificationId" value={item.id}/><button className="notification-read">Marquer comme lu</button></form>}</article>; })}</div> : <div className="notification-empty"><span>✦</span><h2>Vous êtes à jour</h2><p>Les nouvelles sorties et annonces apparaîtront ici.</p><Link className="primary-button" href="/artists">Découvrir les artistes</Link></div>}
  </main>;
}
