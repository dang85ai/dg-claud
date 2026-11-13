import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Backpack, CloudRain, Footprints, Shirt } from "lucide-react";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";

const kitItems = [
  {
    id: "home",
    title: "Home Match Kit",
    detail: "Red jersey · Black shorts · Red socks",
    description: "Our red home strip, featuring black detailing, the Caledon United crest and illustrated name-and-number placement.",
    image: "/kit/home-match-kit-caledon-united-2026.jpg",
    alt: "Caledon United FC 2018 Girls home kit: red jersey, black shorts and red socks, with front and back views.",
    Icon: Shirt
  },
  {
    id: "away",
    title: "Away Match Kit",
    detail: "White jersey · Black shorts · White socks",
    description: "Our white away strip with black accents and the matching Caledon United team crest.",
    image: "/kit/away-match-kit-caledon-united-2026.jpg",
    alt: "Caledon United FC 2018 Girls away kit: white jersey, black shorts and white socks, with front and back views.",
    Icon: Shirt
  },
  {
    id: "tracksuit",
    title: "Track Suit",
    detail: "Black · White stripes",
    description: "Coordinated training and travel jacket and pants, shown with the updated club crest and sample player personalization.",
    image: "/kit/track-suit-caledon-united-2026.webp",
    alt: "Black Caledon United FC 2018 Girls track suit front and back with white side stripes and the updated club crest.",
    Icon: Footprints
  },
  {
    id: "jacket",
    title: "Outdoor Jacket",
    detail: "Black · Cold-weather layer",
    description: "A warm sideline layer illustrated with club branding and optional player personalization.",
    image: "/kit/outdoor-jacket-caledon-united-2026.webp",
    alt: "Caledon United FC 2018 Girls black outdoor winter jacket with updated crest, front and back views.",
    Icon: CloudRain
  },
  {
    id: "backpack",
    title: "Team Backpack",
    detail: "Black · White details",
    description: "A practical match-day and training backpack with the Caledon United crest and sample name placement.",
    image: "/kit/backpack-caledon-united-2026.webp",
    alt: "Caledon United FC 2018 Girls black team backpack with the updated crest, shown from front and side.",
    Icon: Backpack
  }
];

export default function KitPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero banner="kit"
        eyebrow="Caledon United FC · 2018 Girls"
        title="Team Kit & Accessories"
        copy="Explore the 2026–27 teamwear collection. These illustrations show the planned look, club crest and personalization positions — not a price list or confirmed supplier order."
      />
      <section className="section">
        <div className="container">
          <div className="flex flex-col gap-5 rounded-3xl bg-black p-6 text-white sm:flex-row sm:items-center sm:justify-between md:p-8">
            <div>
              <div className="text-xs font-black uppercase tracking-[.18em] text-red-400">Interested in teamwear?</div>
              <h2 className="mt-2 text-2xl font-black uppercase sm:text-3xl">Request your kit</h2>
              <p className="mt-3 max-w-xl text-sm text-white/70">Use the separate order-request form to select items, supply sizes and share personalization details. Requests are reviewed by the team before any order is confirmed.</p>
            </div>
            <Link href="/order" className="btn btn-primary shrink-0"><span>Open order request form</span><ArrowRight size={18} /></Link>
          </div>

          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Jump to teamwear sections">
            {kitItems.map((item) => (
              <a href={"#" + item.id} key={item.id} className="btn btn-light shrink-0 !min-h-11 text-sm">{item.title}</a>
            ))}
          </nav>

          <div className="mt-9 grid gap-8">
            {kitItems.map(({ id, title, detail, description, image, alt, Icon }, index) => (
              <section id={id} key={id} className="card scroll-mt-28 overflow-hidden">
                <div className="flex items-center gap-4 bg-black px-5 py-5 text-white md:px-7">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-600"><Icon size={25} aria-hidden="true" /></div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.12em] text-red-400">{detail}</p>
                    <h2 className="mt-1 text-2xl font-black uppercase">{title}</h2>
                  </div>
                </div>
                <div className="grid items-center lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
                  <div className="bg-neutral-50 p-4 sm:p-6">
                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                      <Image
                        src={image}
                        alt={alt}
                        width={1122}
                        height={1402}
                        priority={index === 0}
                        sizes="(max-width: 1023px) 100vw, 55vw"
                        className="h-auto w-full object-contain"
                      />
                    </div>
                  </div>
                  <div className="p-6 md:p-9">
                    <h3 className="text-2xl font-black uppercase">{title}</h3>
                    <p className="mt-4 text-base leading-7 text-neutral-600">{description}</p>
                    <div className="mt-5 rounded-2xl bg-neutral-100 p-4 text-sm leading-6 text-neutral-600">
                      The player name and number shown are examples only. Final fit, sizing, item availability and personalization are subject to team and supplier confirmation.
                    </div>
                    <Link href="/order" className="btn btn-primary mt-6"><span>Request this item</span><ArrowRight size={18} /></Link>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="card p-6 md:p-8">
              <div className="text-sm font-black uppercase tracking-[.12em] text-red-600">Fit & sizing</div>
              <h2 className="mt-2 text-2xl font-black uppercase">Choose sizes with care</h2>
              <p className="mt-4 text-sm leading-7 text-neutral-600">When requesting items, provide each player's youth jersey, shorts, sock and outerwear sizes. Select "Not sure" on the form if a try-on or supplier size chart is needed before ordering.</p>
            </div>
            <div className="card p-6 md:p-8">
              <div className="text-sm font-black uppercase tracking-[.12em] text-red-600">Request process</div>
              <h2 className="mt-2 text-2xl font-black uppercase">No payment on this page</h2>
              <p className="mt-4 text-sm leading-7 text-neutral-600">The form records what your family is interested in. It does not place a purchase, collect payment or confirm a jersey number. The team will follow up separately with next steps.</p>
            </div>
          </div>

          <div className="mt-10 rounded-3xl bg-black px-6 py-9 text-center text-white md:px-12">
            <h2 className="text-3xl font-black uppercase">Ready to request your kit?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-white/70">One request per player helps keep sizes and customization clear.</p>
            <Link href="/order" className="btn btn-primary mt-6"><span>Go to order request</span><ArrowRight size={18} /></Link>
          </div>
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

