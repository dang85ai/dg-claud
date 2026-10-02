import { MemberKitPricing } from "@/components/MemberKitPricing";
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
    items: [
      { sku: "KB1319", product: "adidas Tiro26 League Kids Jersey", colour: "Black / White", retailer: "Adidas Canada / Sport Chek" },
      { sku: "KA8819", product: "adidas Tiro26 League Kids Shorts", colour: "Black / White", retailer: "Sport Chek" },
      { sku: "ADI-25 TEAM", product: "adidas Team Match Socks", colour: "Black / White", retailer: "Adidas Canada" },
      { sku: "DEC-HK", product: "Crest + Back Number + Optional Name", colour: "Customization", retailer: "Team Supplier / Customizer" }
    ]
  },
  {
    id: "away",
    Icon: Shirt,
    title: "Away Match Kit",
    subtitle: "White / Black",
    image: "/kit/away-team-kit.webp",
    imageAlt: "Caledon U9 Girls 2026 away match kit visual showing the white adidas Tiro26 jersey, black shorts, white socks and decoration placement.",
    items: [
      { sku: "KB1317", product: "adidas Tiro26 League Kids Jersey", colour: "White / White / Black", retailer: "Adidas Canada / Sport Chek" },
      { sku: "KA8819", product: "adidas Tiro26 League Kids Shorts", colour: "Black / White", retailer: "Sport Chek" },
      { sku: "ADI-25 TEAM", product: "adidas Team Match Socks", colour: "White / Black", retailer: "Adidas Canada" },
      { sku: "DEC-AK", product: "Crest + Back Number + Optional Name", colour: "Customization", retailer: "Team Supplier / Customizer" }
    ]
  },
  {
    id: "tracksuit",
    Icon: Footprints,
    title: "Track Suit",
    subtitle: "Travel / Warm-up",
    image: "/kit/track-suit.webp",
    imageAlt: "Caledon U9 Girls 2026 adidas tracksuit visual showing the Tiro 24 training jacket, Tiro 26 training pants and player-initial decoration placement.",
    items: [
      { sku: "IJ9958", product: "adidas Tiro 24 Training Jacket Kids", colour: "Black / White", retailer: "Adidas Canada" },
      { sku: "KH1770", product: "adidas Tiro 26 League Training Pants Kids", colour: "Black / White", retailer: "Sport Chek" },
      { sku: "DEC-TS", product: "Crest + Player Initials", colour: "Customization", retailer: "Team Supplier / Customizer" }
    ]
  },
  {
    id: "jacket",
    Icon: CloudRain,
    title: "Outdoor Jacket",
    subtitle: "Cold Weather / Sideline",
    image: "/kit/outdoor-jacket.webp",
    imageAlt: "Caledon U9 Girls 2026 outdoor jacket visual showing the black adidas Tiro 24 winter jacket with club crest and player initials.",
    items: [
      { sku: "IP6670", product: "adidas Tiro 24 Winter Jacket Kids", colour: "Black / White", retailer: "Adidas Canada" },
      { sku: "DEC-OJ", product: "Crest + Player Initials", colour: "Customization", retailer: "Team Supplier / Customizer" }
    ]
  },
  {
    id: "backpack",
    Icon: Backpack,
    title: "Backpack",
    subtitle: "Travel / Storage",
    image: "/kit/backpack.webp",
    imageAlt: "Caledon U9 Girls 2026 adidas Stadium 4 backpack visual showing the club crest, player initials and storage features.",
    items: [
      { sku: "JJ7421", product: "adidas Stadium 4 Backpack", colour: "Black", retailer: "Sport Chek" },
      { sku: "DEC-BP", product: "Crest + Player Initials", colour: "Customization", retailer: "Team Supplier / Customizer" }
    ]
  }
];


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
          <MemberKitPricing />

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
            {groups.map(({ id, Icon, title, subtitle, image, imageAlt, items }, index) => (
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

          <section className="mt-10">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="card p-6">
                <div className="text-sm font-black uppercase tracking-[.14em] text-red-600">Sizing Guide</div>
                <h2 className="mt-2 text-3xl font-black uppercase">Fit before you order</h2>
                <div className="mt-5 grid gap-3">
                  {[
                    ["Jersey", "YXS–YXL", "Youth sizing — size up if between sizes."],
                    ["Shorts", "YXS–YXL", "Elastic waist."],
                    ["Socks", "YS–YL", "Shin-guard compatible."],
                    ["Tracksuit / Jacket", "Youth sizing", "Confirm fit using supplier size chart before ordering."]
                  ].map(([item, sizes, notes]) => (
                    <div key={item} className="grid gap-2 rounded-2xl bg-neutral-50 p-4 sm:grid-cols-[120px_110px_1fr]">
                      <div className="font-black">{item}</div>
                      <div className="text-sm font-bold text-red-600">{sizes}</div>
                      <div className="text-sm text-neutral-600">{notes}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-neutral-500">
                  Sizing is a planning guide only. Final supplier charts and player try-on samples should be used before the team order is placed.
                </p>
              </div>

              <div className="card p-6">
                <div className="text-sm font-black uppercase tracking-[.14em] text-red-600">Ordering</div>
                <h2 className="mt-2 text-3xl font-black uppercase">Where to buy</h2>
                <div className="mt-5 grid gap-4 text-sm text-neutral-600">
                  <p>
                    Check with the team manager before ordering. Member pricing and supplier instructions are available to authorized team families.
                  </p>
                  <div className="rounded-2xl bg-neutral-50 p-4">
                    <div className="text-xs font-black uppercase text-neutral-500">Order Deadline</div>
                    <div className="mt-1 font-black">To be confirmed</div>
                    <p className="mt-2 text-xs text-neutral-500">Allow time for sizing, stock, decoration and delivery before the first game.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="card p-6">
                <div className="text-sm font-black uppercase tracking-[.14em] text-red-600">Game Day</div>
                <h2 className="mt-2 text-3xl font-black uppercase">What to bring</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    "Jersey — home or away as instructed",
                    "Black shorts",
                    "Team socks",
                    "Shin guards — mandatory",
                    "Cleats — no metal studs",
                    "Water bottle",
                    "Hair tie, if needed",
                    "No jewelry"
                  ].map((item, index) => (
                    <div key={item} className="flex gap-3 rounded-xl bg-neutral-50 p-3 text-sm font-bold">
                      <span className={index === 7 ? "text-red-600" : "text-green-700"}>{index === 7 ? "✕" : "✓"}</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="card p-6">
                  <h3 className="text-xl font-black uppercase">Kit Care</h3>
                  <p className="mt-3 text-sm text-neutral-600">
                    Wash jerseys inside-out in cold water and avoid tumble drying. Name labels are recommended to reduce lost-item mix-ups.
                  </p>
                </div>
                <div className="card p-6">
                  <h3 className="text-xl font-black uppercase">Jersey Numbers</h3>
                  <p className="mt-3 text-sm text-neutral-600">
                    Numbers are assigned by the team for the season. Requests may be considered, but final assignments are not guaranteed until the roster is confirmed.
                  </p>
                </div>
                <div className="card p-6">
                  <h3 className="text-xl font-black uppercase">Lost & Found</h3>
                  <p className="mt-3 text-sm text-neutral-600">
                    Unclaimed team items can be posted through the Parent Portal so families can identify and recover them.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10 rounded-3xl bg-black p-7 text-white md:p-10">
            <div className="flex items-center gap-3">
              <Tags className="text-red-500" />
              <div className="text-xs font-black uppercase tracking-[.16em] text-red-500">Procurement Strategy</div>
            </div>
            <h2 className="mt-4 text-3xl font-black uppercase md:text-4xl">Confirm the team order before buying</h2>
            <p className="mt-4 max-w-3xl text-white/70">
              Use the exact SKUs and the decoration references above when requesting team pricing. Verify youth sizing, crest placement, numbers, initials, stock and lead times before the final order. The team manager will confirm supplier arrangements and the current squad order.
            </p>
          </section>
        </div>
      </section>
    </PublicShell>
  );
}
