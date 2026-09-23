import Image from "next/image";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import { Backpack, CloudRain, Footprints, Shirt, Tags } from "lucide-react";

const groups = [
  {
    id: "home",
    Icon: Shirt,
    title: "Home Match Kit",
    subtitle: "Black / White",
    image: "/kit/home-team-kit.webp",
    imageAlt: "Caledon U9 Girls 2026 home match kit visual showing the black adidas Tiro26 jersey, shorts, socks and decoration placement.",
    regular: 1620,
    best: 1484.85,
    perPlayer: 108,
    items: [
      { sku: "KB1319", product: "adidas Tiro26 League Kids Jersey", colour: "Black / White", regular: 40, best: 40, retailer: "Adidas Canada / Sport Chek" },
      { sku: "KA8819", product: "adidas Tiro26 League Kids Shorts", colour: "Black / White", regular: 30, best: 20.99, retailer: "Sport Chek" },
      { sku: "ADI-25 TEAM", product: "adidas Team Match Socks", colour: "Black / White", regular: 18, best: 18, retailer: "Adidas Canada" },
      { sku: "DEC-HK", product: "Crest + Back Number + Optional Name", colour: "Customization", regular: 20, best: 20, retailer: "Team Supplier / Customizer" }
    ]
  },
  {
    id: "away",
    Icon: Shirt,
    title: "Away Match Kit",
    subtitle: "White / Black",
    image: "/kit/away-team-kit.webp",
    imageAlt: "Caledon U9 Girls 2026 away match kit visual showing the white adidas Tiro26 jersey, black shorts, white socks and decoration placement.",
    regular: 1620,
    best: 1484.85,
    perPlayer: 108,
    items: [
      { sku: "KB1317", product: "adidas Tiro26 League Kids Jersey", colour: "White / White / Black", regular: 40, best: 40, retailer: "Adidas Canada / Sport Chek" },
      { sku: "KA8819", product: "adidas Tiro26 League Kids Shorts", colour: "Black / White", regular: 30, best: 20.99, retailer: "Sport Chek" },
      { sku: "ADI-25 TEAM", product: "adidas Team Match Socks", colour: "White / Black", regular: 18, best: 18, retailer: "Adidas Canada" },
      { sku: "DEC-AK", product: "Crest + Back Number + Optional Name", colour: "Customization", regular: 20, best: 20, retailer: "Team Supplier / Customizer" }
    ]
  },
  {
    id: "tracksuit",
    Icon: Footprints,
    title: "Track Suit",
    subtitle: "Travel / Warm-up",
    image: "/kit/track-suit.webp",
    imageAlt: "Caledon U9 Girls 2026 adidas tracksuit visual showing the Tiro 24 training jacket, Tiro 26 training pants and player-initial decoration placement.",
    regular: 1500,
    best: 1109.85,
    perPlayer: 100,
    items: [
      { sku: "IJ9958", product: "adidas Tiro 24 Training Jacket Kids", colour: "Black / White", regular: 20, best: 20, retailer: "Adidas Canada" },
      { sku: "KH1770", product: "adidas Tiro 26 League Training Pants Kids", colour: "Black / White", regular: 65, best: 38.99, retailer: "Sport Chek" },
      { sku: "DEC-TS", product: "Crest + Player Initials", colour: "Customization", regular: 15, best: 15, retailer: "Team Supplier / Customizer" }
    ]
  },
  {
    id: "jacket",
    Icon: CloudRain,
    title: "Outdoor Jacket",
    subtitle: "Cold Weather / Sideline",
    image: "/kit/outdoor-jacket.webp",
    imageAlt: "Caledon U9 Girls 2026 outdoor jacket visual showing the black adidas Tiro 24 winter jacket with club crest and player initials.",
    regular: 1710,
    best: 1710,
    perPlayer: 114,
    items: [
      { sku: "IP6670", product: "adidas Tiro 24 Winter Jacket Kids", colour: "Black / White", regular: 102, best: 102, retailer: "Adidas Canada" },
      { sku: "DEC-OJ", product: "Crest + Player Initials", colour: "Customization", regular: 12, best: 12, retailer: "Team Supplier / Customizer" }
    ]
  },
  {
    id: "backpack",
    Icon: Backpack,
    title: "Backpack",
    subtitle: "Travel / Storage",
    image: "/kit/backpack.webp",
    imageAlt: "Caledon U9 Girls 2026 adidas Stadium 4 backpack visual showing the club crest, player initials and storage features.",
    regular: 1200,
    best: 1199.85,
    perPlayer: 80,
    items: [
      { sku: "JJ7421", product: "adidas Stadium 4 Backpack", colour: "Black", regular: 70, best: 69.99, retailer: "Sport Chek" },
      { sku: "DEC-BP", product: "Crest + Player Initials", colour: "Customization", regular: 10, best: 10, retailer: "Team Supplier / Customizer" }
    ]
  }
];

function money(value: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD"
  }).format(value);
}

export default function KitPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="Adidas Teamwear"
        title="2026 Team Kit"
        copy="The complete five-part Caledon U9 Girls package: home, away, tracksuit, outdoor jacket and backpack, matched to the approved SKU references and decoration layout."
      />

      <section className="section">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-6">
              <div className="text-sm font-black uppercase text-red-600">Decorated Package</div>
              <div className="mt-2 text-5xl font-black">C$510</div>
              <p className="mt-3 text-sm text-neutral-600">
                Per player. The 15-player package baseline is C$7,650.
              </p>
            </div>

            <div className="card p-6">
              <div className="text-sm font-black uppercase text-red-600">Best-Price Reference</div>
              <div className="mt-2 text-5xl font-black">C$465.96</div>
              <p className="mt-3 text-sm text-neutral-600">
                Per player using the supplied sale-price references.
              </p>
            </div>

            <div className="card p-6">
              <div className="text-sm font-black uppercase text-red-600">15-Player Savings</div>
              <div className="mt-2 text-5xl font-black">C$660.60</div>
              <p className="mt-3 text-sm text-neutral-600">
                C$7,650 package baseline → C$6,989.40 best-price reference. Save C$44.04/player (8.6%).
              </p>
            </div>
          </div>

          <div className="notice mt-6">
            <strong>Pricing note:</strong> The visuals below are the approved package reference boards matched to the listed SKUs. Sale pricing, stock, sizing and team discounts can change and should be re-verified before the final order.
          </div>

          <nav className="mt-6 flex flex-wrap gap-2" aria-label="Kit sections">
            {groups.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="btn btn-light shrink-0 !min-h-11 text-sm"
              >
                {group.title}
              </a>
            ))}
          </nav>

          <div className="mt-10 grid gap-8">
            {groups.map(({ id, Icon, title, subtitle, image, imageAlt, regular, best, perPlayer, items }, index) => (
              <section id={id} key={id} className="card scroll-mt-28 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 bg-black p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600">
                      <Icon size={26} aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-[.16em] text-red-500">{subtitle}</div>
                      <h2 className="mt-1 text-2xl font-black uppercase">{title}</h2>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black uppercase text-white/50">Decorated package</div>
                    <div className="mt-1 text-lg font-black">{money(perPlayer)} / player</div>
                    <div className="mt-1 text-xs text-white/60">
                      15 players: {money(regular)}
                      {best !== regular ? <> · Best ref. <span className="text-red-400">{money(best)}</span></> : null}
                    </div>
                  </div>
                </div>

                <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_minmax(520px,1.15fr)]">
                  <div className="border-b border-neutral-200 bg-neutral-50 p-4 sm:p-6 xl:border-b-0 xl:border-r">
                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                      <Image
                        src={image}
                        alt={imageAlt}
                        width={1122}
                        height={1402}
                        priority={index === 0}
                        unoptimized
                        className="h-auto w-full object-contain"
                        sizes="(max-width: 1279px) 100vw, 48vw"
                      />
                    </div>
                    <p className="mt-3 text-xs text-neutral-500">
                      Package mockup / decoration reference. Product selection corresponds to the SKUs in the table.
                    </p>
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="mb-4 hidden grid-cols-[120px_minmax(0,1fr)] gap-4 border-b border-neutral-200 pb-3 text-xs font-black uppercase tracking-wide text-neutral-500 md:grid">
                      <div>SKU</div>
                      <div>Product Details</div>
                    </div>

                    <div className="grid gap-4">
                      {items.map((item) => (
                        <article
                          key={`${id}-${item.sku}-${item.colour}`}
                          className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
                        >
                          <div className="grid gap-3 md:grid-cols-[120px_minmax(0,1fr)] md:gap-4">
                            <div>
                              <div className="text-[11px] font-black uppercase tracking-wide text-neutral-400 md:hidden">SKU</div>
                              <div className="mt-1 inline-flex rounded-lg bg-black px-3 py-2 text-sm font-black text-white md:mt-0">
                                {item.sku}
                              </div>
                            </div>

                            <div className="min-w-0">
                              <div className="text-[11px] font-black uppercase tracking-wide text-neutral-400 md:hidden">Product</div>
                              <h3 className="mt-1 break-words text-base font-black leading-snug text-neutral-950 md:mt-0 md:text-lg">
                                {item.product}
                              </h3>

                              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl bg-neutral-50 p-3">
                                  <div className="text-[10px] font-black uppercase tracking-wide text-neutral-400">Colour / Use</div>
                                  <div className="mt-1 text-sm font-bold text-neutral-700">{item.colour}</div>
                                </div>

                                <div className="rounded-xl bg-neutral-50 p-3">
                                  <div className="text-[10px] font-black uppercase tracking-wide text-neutral-400">Retailer</div>
                                  <div className="mt-1 break-words text-sm font-bold text-neutral-700">{item.retailer}</div>
                                </div>

                                <div className="rounded-xl bg-neutral-50 p-3">
                                  <div className="text-[10px] font-black uppercase tracking-wide text-neutral-400">Package Price</div>
                                  <div className="mt-1 text-lg font-black">{money(item.regular)}</div>
                                </div>

                                <div className="rounded-xl bg-red-50 p-3">
                                  <div className="text-[10px] font-black uppercase tracking-wide text-red-500">Best Reference</div>
                                  <div className="mt-1 text-lg font-black text-red-600">{money(item.best)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <section className="mt-10 rounded-3xl bg-black p-7 text-white md:p-10">
            <div className="flex items-center gap-3">
              <Tags className="text-red-500" />
              <div className="text-xs font-black uppercase tracking-[.16em] text-red-500">Procurement Strategy</div>
            </div>
            <h2 className="mt-4 text-3xl font-black uppercase md:text-4xl">Request a 15-player team quote before ordering</h2>
            <p className="mt-4 max-w-3xl text-white/70">
              Use the exact SKUs and the decoration references above when requesting team pricing. Verify youth sizing, crest placement, numbers, initials, stock and lead times before the final order. Compare Sport Chek, Adidas Canada and a specialist team supplier for the best combined product and decoration quote.
            </p>
          </section>
        </div>
      </section>
    </PublicShell>
  );
}
