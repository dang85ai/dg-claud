import Image from "next/image";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { CinematicIntro } from "./CinematicIntro";
import styles from "./splash.module.css";

export const metadata = buildPageMetadata({
  title: "Caledon United FC 2018 Girls | Team Hub",
  description: "Meet the Caledon United FC 2018 Girls and find the team schedule, sponsors and 2026–27 Team Hub.",
  path: "/",
  absoluteTitle: true,
  previewImage: { url: "/assets/social/home.jpg", width: 1200, height: 630, alt: "Caledon United team artwork" }
});

export default function SplashPage() {
  return (
    <main className={styles.splash}>
      <CinematicIntro>
        <div className={styles.stripes} aria-hidden="true" />
        <div>
          <Image
            className={styles.crest}
            src="/assets/brand/caledon-united-crest.webp"
            width={160}
            height={160}
            alt=""
            priority
            unoptimized
          />
          <h1 id="splash-heading" tabIndex={-1} className={styles.title}>
            Caledon United FC
            <span className={styles.team}>2018 Girls</span>
          </h1>
          <p className={styles.tagline}>One Team. One Dream. United.</p>
          <nav className={styles.links} aria-label="Team website">
            <Link href="/about">Meet the Team</Link>
            <Link href="/schedule">Schedule</Link>
            <Link href="/sponsors">Sponsors</Link>
            <Link className={styles.enter} href="/home">Enter Website</Link>
          </nav>
        </div>
      </CinematicIntro>
    </main>
  );
}
