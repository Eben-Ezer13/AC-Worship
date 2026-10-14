"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getReleaseShowcase, type ReleaseShowcaseData } from "@/app/release-actions";
import { ReleaseCountdown } from "@/components/release-countdown";

function releaseLabel(date: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
}

export function ReleaseShowcase() {
  const [data, setData] = useState<ReleaseShowcaseData | null>(null);
  const refreshInProgress = useRef(false);

  const refresh = useCallback(async () => {
    if (refreshInProgress.current) return;
    refreshInProgress.current = true;
    try {
      setData(await getReleaseShowcase());
    } catch {
      setData({ upcoming: [], latestByArtist: [] });
    } finally {
      refreshInProgress.current = false;
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <section className="section-block release-showcase" id="new-releases">
      <div className="section-heading">
        <div><div className="section-kicker">SORTIES & ACTUALITÉS MUSICALES</div><h2>Les nouveautés des artistes</h2></div>
        <Link href="/artists" className="see-all">Tous les artistes <span aria-hidden="true">→</span></Link>
      </div>

      {data === null ? <p className="release-showcase-empty">Chargement des sorties…</p> : <>
        {data.upcoming.length > 0 && <div className="upcoming-releases">
          <div className="release-subheading"><span>BIENTÔT DISPONIBLE</span><small>Le compte à rebours suit l’heure locale de votre appareil.</small></div>
          <div className="upcoming-release-grid">
            {data.upcoming.map((release) => <Link className="upcoming-release-card" href={`/artists/${release.artistSlug}#upcoming-releases`} key={release.id}>
              <div className="upcoming-release-art">{release.artworkUrl ? <Image src={release.artworkUrl} alt={`Pochette de ${release.title}`} fill sizes="(max-width: 760px) 34vw, 150px"/> : <span>AC</span>}</div>
              <div className="upcoming-release-copy"><span>{release.artistName} · {releaseLabel(release.releaseAt)}</span><b>{release.title}</b><ReleaseCountdown releaseAt={release.releaseAt} onElapsed={refresh}/></div>
              <span className="upcoming-release-arrow" aria-hidden="true">↗</span>
            </Link>)}
          </div>
        </div>}

        {data.latestByArtist.length > 0 && <div className="latest-by-artist">
          <div className="release-subheading"><span>DERNIÈRES SORTIES</span><small>Les titres les plus récents de chaque artiste.</small></div>
          <div className="latest-artist-grid">
            {data.latestByArtist.map((artist) => <article className="latest-artist-card" key={artist.artistSlug}>
              <Link className="latest-artist-heading" href={`/artists/${artist.artistSlug}#discography`}><span>{artist.artistName}</span><b aria-hidden="true">→</b></Link>
              <div className="latest-song-list">
                {artist.songs.map((song) => <Link className="latest-song-row" href={`/artists/${artist.artistSlug}#discography`} key={song.id}>
                  <span className="latest-song-art">{song.artworkUrl ? <Image src={song.artworkUrl} alt="" fill sizes="48px"/> : <span>AC</span>}</span>
                  <span className="latest-song-copy"><b>{song.title}</b><small>Sorti le {releaseLabel(song.releaseAt)}</small></span>
                  <span className="latest-song-open" aria-hidden="true">↗</span>
                </Link>)}
              </div>
            </article>)}
          </div>
        </div>}

        {data.upcoming.length === 0 && data.latestByArtist.length === 0 && <p className="release-showcase-empty">Les prochaines sorties programmées et les nouveautés publiées par les artistes apparaîtront ici.</p>}
      </>}
    </section>
  );
}
