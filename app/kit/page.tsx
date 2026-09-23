import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import { Backpack, CloudRain, Footprints, Shirt, Tags } from "lucide-react";

const groups = [
  {
    id: "home",
    Icon: Shirt,
    title: "Home Match Kit",
    subtitle: "Black",
    regular: 1620,
    best: 1484.85,
    items: [
      { sku: "KB1319", product: "adidas Tiro26 League Kids Jersey", colour: "Black", regular: 40, best: 40, retailer: "Adidas Canada / Sport Chek" },
      { sku: "KA8819", product: "adidas Tiro26 League Kids Shorts", colour: "Black/White", regular: 30, best: 20.99, retailer: "Sport Chek" },
      { sku: "ADI-25 TEAM", product: "adidas Team Match Socks", colour: "Black/White", regular: 18, best: 18, retailer: "Adidas Canada" },
      { sku: "DEC-HK", product: "Crest + Back Number + Optional Name", colour: "Customization", regular: 20, best: 20, retailer: "Team Supplier / Customizer" }
    ]
  },
  {
    id: "away",
    Icon: Shirt,
    title: "Away Match Kit",
    subtitle: "White",
    regular: 1620,
    best: 1484.85,
    items: [
      { sku: "KB1317", product: "adidas Tiro26 League Kids Jersey", colour: "White", regular: 40, best: 40, retailer: "Adidas Canada / Sport Chek" },
      { sku: "KA8819", product: "adidas Tiro26 League Kids Shorts", colour: "Black/White", regular: 30, best: 20.99, retailer: "Sport Chek" },
      { sku: "ADI-25 TEAM", product: "adidas Team Match Socks", colour: "White/Black", regular: 18, best: 18, retailer: "Adidas Canada" },
      { sku: "DEC-AK", product: "Crest + Back Number + Optional Name", colour: "Customization", regular: 20, best: 20, retailer: "Team Supplier / Customizer" }
    ]
  },
  {
    id: "tracksuit",
    Icon: Footprints,
    title: "Track Suit",
    subtitle: "Travel / Warm-up",
    regular: 1500,
    best: 1109.85,
    items: [
      { sku: "IJ9958", product: "adidas Tiro 24 Training Jacket Kids", colour: "Teamwear", regular: 20, best: 20, retailer: "Adidas Canada" },
      { sku: "KH1770", product: "adidas Tiro 26 League Training Pants Kids", colour: "Teamwear", regular: 65, best: 38.99, retailer: "Sport Chek" },
      { sku: "DEC-TS", product: "Crest + Player Initials", colour: "Customization", regular: 15, best: 15, retailer: "Team Supplier / Customizer" }
    ]
  },
  {
    id: "jacket",
    Icon: CloudRain,
    title: "Outdoor Jacket",
    subtitle: "Cold Weather / Sideline",
    regular: 1890,
    best: 1710,
    items: [
      { sku: "IP6670", product: "adidas Tiro 24 Winter Jacket Kids", colour: "Teamwear", regular: 114, best: 102, retailer: "Adidas Canada" },
      { sku: "DEC-OJ", product: "Crest + Player Initials", colour: "Customization", regular: 12, best: 12, retailer: "Team Supplier / Customizer" }
    ]
  },
  {
    id: "backpack",
    Icon: Backpack,
    title: "Backpack",
    subtitle: "Travel / Storage",
    regular: 1200,
    best: 1199.85,
    items: [
      { sku: "JJ7421", product: "adidas Stadium 4 Backpack", colour: "Teamwear", regular: 70, best: 69.99, retailer: "Sport Chek" },
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
        copy="Home, away, tracksuit, winter jacket and backpack package for the Caledon U9 Girls 2026 season."
      />

      <section className="section">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-6">
              <div className="text-sm font-black uppercase text-red-600">Current Team Fee</div>
              <div className="mt-2 text-5xl font-black">C$510</div>
              <p className="mt-3 text-sm text-neutral-600">
                Existing team fee retained separately from procurement price comparisons.
              </p>
            </div>

            <div className="card p-6">
              <div className="text-sm font-black uppercase text-red-600">Best-Price Target</div>
              <div className="mt-2 text-5xl font-black">C$465.96</div>
              <p className="mt-3 text-sm text-neutral-600">
                Per player based on the supplied September 23, 2026 pricing references.
              </p>
            </div>

            <div className="card p-6">
              <div className="text-sm font-black uppercase text-red-600">15-Player Savings</div>
              <div className="mt-2 text-5xl font-black">C$840.60</div>
              <p className="mt-3 text-sm text-neutral-600">
                Corrected itemized comparison: C$7,830 regular vs. C$6,989.40 best-price.
              </p>
            </div>
          </div>

          <div className="notice mt-6">
            <strong>Pricing note:</strong> Sale pricing, stock and team discounts can change. These figures are procurement references and should be re-verified before the final order.
          </div>

          <div className="mt-10 grid gap-8">
            {groups.map(({ id, Icon, title, subtitle, regular, best, items }) => (
              <section id={id} key={id} className="card overflow-hidden">
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
                    <div className="text-xs font-black uppercase text-white/50">15-player reference</div>
                    <div className="mt-1 text-lg font-black">
                      {money(regular)} → <span className="text-red-400">{money(best)}</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-neutral-100">
                      <tr>
                        <th className="px-4 py-3 font-black uppercase">SKU</th>
                        <th className="px-4 py-3 font-black uppercase">Product</th>
                        <th className="px-4 py-3 font-black uppercase">Colour / Use</th>
                        <th className="px-4 py-3 font-black uppercase">Regular</th>
                        <th className="px-4 py-3 font-black uppercase">Best Ref.</th>
                        <th className="px-4 py-3 font-black uppercase">Retailer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={`${id}-${item.sku}-${item.colour}`} className="border-t border-neutral-200">
                          <td className="whitespace-nowrap px-4 py-4 font-black">{item.sku}</td>
                          <td className="min-w-[260px] px-4 py-4">{item.product}</td>
                          <td className="whitespace-nowrap px-4 py-4 text-neutral-600">{item.colour}</td>
                          <td className="whitespace-nowrap px-4 py-4">{money(item.regular)}</td>
                          <td className="whitespace-nowrap px-4 py-4 font-black text-red-600">{money(item.best)}</td>
                          <td className="min-w-[180px] px-4 py-4 text-neutral-600">{item.retailer}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              Use the exact SKUs above to request team pricing, then verify sizing, decoration placement, stock and lead times before the final order. The current research suggests Sport Chek and Adidas Canada are the main reference points, with specialist team suppliers worth comparing for bulk decoration and fulfillment.
            </p>
          </section>
        </div>
      </section>
    </PublicShell>
  );
}
