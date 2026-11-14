import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";

const kitItems = [
  {
    id: "home",
    title: "Home Match Kit",
    detail: "Red jersey · Black shorts · Red socks",
    description: "Our red home strip, featuring black detailing, the Caledon United crest and illustrated name-and-number placement.",
    image: "/kit/home-match-kit-caledon-united-2026.jpg",
    alt: "Caledon United FC 2018 Girls home kit: red jersey, black shorts and red socks, with front and back views."
  },
  {
    id: "away",
    title: "Away Match Kit",
    detail: "White jersey · Black shorts · White socks",
    description: "Our white away strip with black accents and the matching Caledon United team crest.",
    image: "/kit/away-match-kit-caledon-united-2026.jpg",
    alt: "Caledon United FC 2018 Girls away kit: white jersey, black shorts and white socks, with front and back views."
  },
  {
    id: "goalkeeper",
    title: "Goalkeeper Kit",
    detail: "Neon jersey · Black shorts · Neon socks",
    description: "Long-sleeved neon goalkeeper jersey with black sleeve stripes and the Caledon United crest.",
    image: "/kit/goalkeeper-kit-caledon-united-2026.webp",
    alt: "Front and back views of the neon Caledon United goalkeeper jersey with black shorts and neon socks."
  },
  {
    id: "tracksuit",
    title: "Track Suit",
    detail: "Black · White stripes",
    description: "Coordinated training and travel jacket and pants, shown with the updated club crest and sample player personalization.",
    image: "/kit/track-suit-caledon-united-2026.webp",
    alt: "Black Caledon United FC 2018 Girls track suit front and back with white side stripes and the updated club crest."
  },
  {
    id: "jacket",
    title: "Outdoor Jacket",
    detail: "Black · Cold-weather layer",
    description: "A warm sideline layer illustrated with club branding and optional player personalization.",
    image: "/kit/outdoor-jacket-caledon-united-2026.webp",
    alt: "Caledon United FC 2018 Girls black outdoor winter jacket with updated crest, front and back views."
  },
  {
    id: "backpack",
    title: "Team Backpack",
    detail: "Black · White details",
    description: "A practical match-day and training backpack with the Caledon United crest and sample name placement.",
    image: "/kit/backpack-caledon-united-2026.webp",
    alt: "Caledon United FC 2018 Girls black team backpack with the updated crest, shown from front and side."
  }
];

export default function KitPage() {
  return (
    <PublicShell>
      <PublicPageHero banner="kit"
        eyebrow="Caledon United FC · 2018 Girls"
        title="Team Kit & Accessories"
        copy="Browse the planned 2026–27 teamwear collection."
      />
      <section className="py-4 sm:py-8" aria-label="Teamwear gallery">
        <div className="container">
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {kitItems.map(({ id, title, detail, description, image, alt }, index) => (
              <section id={id} key={id} className="card scroll-mt-28 overflow-hidden">
                <a href={image} className="block bg-white" aria-label={`View full-size ${title.toLowerCase()} illustration`}>
                  <Image
                    src={image}
                    alt={alt}
                    width={1122}
                    height={1402}
                    priority={index < 2}
                    sizes="(max-width: 1023px) 50vw, 580px"
                    className="h-auto w-full object-contain"
                  />
                </a>
                <div className="p-3 sm:p-6">
                  <h2 className="text-base font-black uppercase sm:text-2xl">{title}</h2>
                  <p className="mt-1 text-xs font-bold text-red-700 sm:text-sm">{detail}</p>
                  <p className="mt-2 text-sm text-neutral-700">{description}</p>
                </div>
              </section>
            ))}
          </div>
          <p className="mt-5 text-sm text-neutral-700">
            Names and numbers shown are examples. The team and supplier confirm sizing, availability and personalization.
          </p>
          <Link href="/order" className="btn btn-primary mt-4">Open Kit Request <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>
      <section aria-labelledby="practical-guide-title" className="section border-t border-neutral-200">
        <div className="container max-w-4xl">
          <h2 id="practical-guide-title" className="text-3xl font-black uppercase tracking-tight">Sizing and requests</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">Choose a size before submitting</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Start with the teamwear item you need and check the available size information. Compare it with a similar garment your player already wears comfortably. For outerwear, consider the layer she will usually wear underneath. If she is between sizes, ask the team about the specific item before choosing. A jacket and a match jersey can fit differently even when the label shows the same size.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">Double-check the request</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Confirm whether you need the home or away item and enter a size for each item you choose. If a request includes a jersey name, number or backpack initials, check the spelling and digits before sending. Keep notes limited to information that helps the team fulfil the request. Use the private team contact channel for unrelated family information.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">What happens after you submit</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">The team reviews the requested items, sizing and availability before confirming the next steps. Keep a note of what you requested. If you need to change a size or correct the spelling, contact the team with the original request details so it can locate the submission. Wait for confirmation before treating the request as a purchase.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">Pack the kit specified for the event</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Check the latest Spond invitation for which jersey, socks and footwear to bring. If you are waiting for a replacement item or have two similar jerseys, ask the manager what to bring before you leave. The kit gallery is a visual reference for identifying items.</p>
            </article>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/order" className="btn btn-light">Open kit request</a>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}


