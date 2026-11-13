"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase-public";

export type SponsorDirectoryEntry = {
  id: string;
  name: string;
  logo_path: string | null;
  website_url: string | null;
  sponsorship_level: string;
};

const endpoint = `${SUPABASE_URL}/functions/v1/sponsor-directory`;
let cache: { items: SponsorDirectoryEntry[]; expires: number } | null = null;
let pending: Promise<SponsorDirectoryEntry[]> | null = null;

function safeWebsite(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password ? parsed.href : null;
  } catch {
    return null;
  }
}

function safeLogo(url: string | null): string | null {
  if (!url) return null;
  if (/^\/assets\/sponsors\/[a-zA-Z0-9_./-]+\.(webp|png|jpe?g)$/i.test(url) && !url.includes("..")) return url;
  return safeWebsite(url);
}

function loadSponsors(): Promise<SponsorDirectoryEntry[]> {
  if (cache && Date.now() < cache.expires) return Promise.resolve(cache.items);
  if (pending) return pending;

  pending = fetch(endpoint, {
    method: "GET",
    cache: "no-store",
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY }
  }).then(async (response) => {
    if (!response.ok) throw new Error("Sponsor directory unavailable");
    const body = await response.json() as { sponsors?: SponsorDirectoryEntry[] };
    const items = (Array.isArray(body.sponsors) ? body.sponsors : [])
      .filter((item) => item && item.name && safeLogo(item.logo_path))
      .slice(0, 80);
    cache = { items, expires: Date.now() + 60_000 };
    return items;
  }).finally(() => { pending = null; });

  return pending;
}

function useSponsorDirectory() {
  const [sponsors, setSponsors] = useState<SponsorDirectoryEntry[]>([]);
  useEffect(() => {
    let current = true;
    loadSponsors().then((items) => { if (current) setSponsors(items); })
      .catch(() => { if (current) setSponsors([]); });
    return () => { current = false; };
  }, []);
  return sponsors;
}

function SponsorLogo({ sponsor, className = "" }: { sponsor: SponsorDirectoryEntry; className?: string }) {
  const src = safeLogo(sponsor.logo_path);
  if (!src) return null;
  return (
    <img
      src={src}
      alt={`${sponsor.name} sponsor logo`}
      loading="lazy"
      decoding="async"
      width={240}
      height={150}
      className={"h-32 w-full max-w-60 object-contain " + className}
    />
  );
}

/** Public sponsor-only display, without amounts or private sponsor details. */
export function SponsorLogoBanner() {
  const sponsors = useSponsorDirectory();
  if (!sponsors.length) return null;

  return (
    <section aria-labelledby="footer-sponsors-title" className="border-t-4 border-red-600 bg-white text-neutral-900">
      <div className="container py-9 sm:py-11">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[.2em] text-red-600">Community Partners</div>
            <h2 id="footer-sponsors-title" className="mt-2 text-2xl font-black uppercase sm:text-3xl">Proudly Supported By</h2>
            <p className="mt-2 text-sm text-neutral-600">Thank you to the businesses supporting our 2018 girls team.</p>
          </div>
          <Link href="/sponsors#packages" className="text-sm font-black text-red-600 underline underline-offset-4 hover:text-red-800">
            Become a sponsor
          </Link>
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-4 lg:justify-start">
          {sponsors.map((sponsor) => {
            const url = safeWebsite(sponsor.website_url);
            const content = (
              <>
                <div className="flex h-36 w-full items-center justify-center rounded-xl bg-white px-4">
                  <SponsorLogo sponsor={sponsor} />
                </div>
                <div className="mt-3 text-center text-sm font-black uppercase leading-snug">{sponsor.name}</div>
                <div className="mt-1 text-center text-xs text-neutral-500">{sponsor.sponsorship_level || "Team Sponsor"}</div>
                {url ? <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-600">Visit sponsor <ExternalLink size={12} /></span> : null}
              </>
            );
            const cls = "group flex w-full max-w-64 flex-col items-center rounded-2xl border border-neutral-200 bg-neutral-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-md";
            return url ? (
              <a key={sponsor.id} href={url} target="_blank" rel="noopener noreferrer sponsored" className={cls}>
                {content}
              </a>
            ) : (
              <div key={sponsor.id} className={cls}>{content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Shows the sponsor for a sold package; updates automatically when manager changes the sponsor directory. */
export function SponsorPlacementHighlight({ placement }: { placement: string }) {
  const sponsors = useSponsorDirectory();
  const matching = sponsors.filter((sponsor) =>
    sponsor.sponsorship_level.toLowerCase() === placement.toLowerCase()
  );
  if (!matching.length) return null;

  return (
    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50/50 p-4">
      <div className="text-xs font-black uppercase tracking-wide text-red-700">Proudly sponsored by</div>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {matching.map((sponsor) => {
          const url = safeWebsite(sponsor.website_url);
          const content = (
            <>
              <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-lg bg-white p-2">
                <SponsorLogo sponsor={sponsor} className="!h-20 !w-28" />
              </div>
              <span className="text-sm font-black uppercase text-neutral-900">{sponsor.name}</span>
              {url ? <ExternalLink size={16} className="text-red-600" /> : null}
            </>
          );
          return url ? (
            <a key={sponsor.id} href={url} target="_blank" rel="noopener noreferrer sponsored" className="flex flex-wrap items-center gap-3 hover:underline">{content}</a>
          ) : <div key={sponsor.id} className="flex flex-wrap items-center gap-3">{content}</div>;
        })}
      </div>
    </div>
  );
}
