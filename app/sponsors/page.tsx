import Image from "next/image";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Crown,
  Dumbbell,
  FileText,
  Handshake,
  Heart,
  HeartHandshake,
  Laptop,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  Shirt,
  Star,
  Trophy,
  Users
} from "lucide-react";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicShell } from "@/components/PublicShell";
import { SponsorshipInquiryForm } from "@/components/SponsorshipInquiryForm";

const tiers = [
  {
    name: "Community Supporter",
    price: "Any amount",
    suggested: "Suggested C$25+",
    Icon: Heart,
    accent: "bg-slate-100 text-slate-900",
    border: "border-slate-200",
    tagline: "Every contribution helps.",
    bestFor: "Individuals, soccer families and community supporters",
    recognition: "Mentioned in team communications",
    benefits: [
      "Name on team sponsor list",
      "Team thank-you message",
      "Option to remain anonymous"
    ]
  },
  {
    name: "Friend of the Team",
    price: "C$25–C$99",
    suggested: "Suggested C$50–C$99",
    Icon: Users,
    accent: "bg-cyan-50 text-cyan-950",
    border: "border-cyan-200",
    tagline: "A little support makes a big difference.",
    bestFor: "Family members, friends of players and small local businesses",
    recognition: "Team communications and approved social recognition",
    benefits: [
      "Name on team sponsor list",
      "Thank-you from the team",
      "Recognition in season newsletter",
      "Option to remain anonymous"
    ]
  },
  {
    name: "Team Supporter",
    price: "C$100–C$299",
    suggested: "Suggested C$100",
    Icon: Handshake,
    accent: "bg-amber-50 text-amber-950",
    border: "border-amber-200",
    tagline: "Great for families and local businesses.",
    bestFor: "Local businesses and passionate supporters",
    recognition: "Team communications, approved social posts and team poster",
    benefits: [
      "Name on team sponsor list",
      "Recognition as a supporter of the girls",
      "Team thank-you",
      "Recognition in season newsletter",
      "Optional family/player dedication",
      "Option to remain anonymous"
    ]
  },
  {
    name: "Digital Sponsor",
    price: "C$300–C$499",
    suggested: "Suggested C$300",
    Icon: Laptop,
    accent: "bg-red-50 text-red-950",
    border: "border-red-200",
    tagline: "Reach families online.",
    bestFor: "Digital businesses, online services and technology companies",
    recognition: "Website sponsor page and approved 2026 social posts",
    benefits: [
      "Name or logo on the 2026 team sponsor page",
      "Recognition in season social posts",
      "Team thank-you message",
      "Option to remain anonymous"
    ]
  },
  {
    name: "Team Sponsor",
    price: "C$500–C$2,999",
    suggested: "Suggested C$500",
    Icon: Shirt,
    accent: "bg-neutral-100 text-neutral-950",
    border: "border-neutral-300",
    tagline: "Major team-level support.",
    bestFor: "Local businesses and community organizations",
    recognition: "Prominent placement across approved team materials",
    benefits: [
      "Logo on an approved team-kit placement",
      "2026 sponsor page",
      "Recognition in season newsletter",
      "Season posts and team thank-you",
      "Optional family/player dedication",
      "First chance to renew next season"
    ]
  },
  {
    name: "Main Jersey Sponsor",
    price: "C$3,000",
    suggested: "Exclusive — one per team",
    Icon: Crown,
    accent: "bg-black text-white",
    border: "border-amber-400",
    tagline: "Put your business on the front of the team.",
    bestFor: "A business seeking the highest-visibility 2026 team placement",
    recognition: "Highest-visibility approved sponsorship package",
    benefits: [
      "Front-of-jersey logo on approved Home & Away kits",
      "2026 sponsor page",
      "Recognition in the digital package",
      "Team thank-you",
      "Featured in approved social content",
      "Team photo opportunity subject to player/guardian consent",
      "End-of-season thank-you",
      "First chance to renew next season"
    ],
    exclusive: true
  }
];

const uses = [
  ["League Fees", "⚽"],
  ["Team Kits", "👕"],
  ["Equipment", "🎒"],
  ["Field Rentals", "🏟️"],
  ["Tournaments", "🏆"],
  ["Training", "📚"],
  ["Team Development", "👥"]
];

const faqs = [
  {
    q: "What happens to sponsorship funds?",
    a: "Sponsorship funds are designated for the U9 Girls program and its season costs, including league fees, kits, equipment, field rentals, tournaments, training and team development."
  },
  {
    q: "Can an individual sponsor the team?",
    a: "Yes. Community Supporter and Friend of the Team options are designed for families, friends and individual supporters as well as businesses."
  },
  {
    q: "Can a sponsor remain anonymous?",
    a: "Yes. Supporters can ask not to be publicly named."
  },
  {
    q: "Can we choose where our logo appears?",
    a: "For eligible sponsorship levels, placement is coordinated with the team based on the selected package, final kit design and available approved branding positions."
  },
  {
    q: "Is the Main Jersey Sponsor exclusive?",
    a: "Yes. The C$3,000 Main Jersey Sponsor is intended as a one-team, one-season exclusive placement."
  }
];

export default function SponsorsPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />

      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(90deg,transparent_49%,rgba(255,255,255,.14)_50%,transparent_51%),linear-gradient(rgba(255,0,0,.22)_1px,transparent_1px)] [background-size:260px_100%,100%_90px]" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-4xl">
            <div className="text-sm font-black uppercase tracking-[.2em] text-red-500">Caledon U9 Girls · 2026</div>
            <h1 className="mt-4 text-5xl font-black uppercase leading-[.92] tracking-tight md:text-7xl">
              Support Our Girls
              <span className="block text-red-500">Small Players, Big Dreams</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/75">
              Help give our girls an incredible 2026 soccer season. Every sponsorship—big or small—supports the season in front of them.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#sponsor-form" className="btn btn-primary">Become a Sponsor</a>
              <a href="#tiers" className="btn border border-white/20 bg-white/10 text-white">View Sponsorship Levels</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-black uppercase tracking-wide text-white/55">
              <span>Stronger Together</span>
              <span>Play • Learn • Grow • Belong</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-neutral-50">
        <div className="container">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                Icon: HeartHandshake,
                title: "Build Community",
                text: "Every contribution helps young athletes train, compete, build confidence, make friendships and enjoy a season they’ll remember.",
                highlight: "No minimum and no maximum. Every contribution helps."
              },
              {
                Icon: Megaphone,
                title: "Grow Your Business",
                text: "Support youth soccer while giving your business visibility through approved team, website, digital and kit placements.",
                highlight: "Exclusive Main Jersey Sponsor — C$3,000."
              },
              {
                Icon: Trophy,
                title: "Develop Future Athletes",
                text: "Support helps fund the facilities, equipment, training and competition opportunities that shape confident young players.",
                highlight: "Funds are designated for the U9 Girls program."
              }
            ].map(({ Icon, title, text, highlight }) => (
              <article className="card p-6" key={title}>
                <Icon className="text-red-600" size={28} />
                <h2 className="mt-4 text-2xl font-black uppercase">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{text}</p>
                <div className="mt-5 border-l-4 border-red-600 pl-4 text-xs font-black uppercase tracking-wide">
                  {highlight}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="tiers" className="section scroll-mt-24">
        <div className="container">
          <div className="max-w-3xl">
            <div className="text-sm font-black uppercase tracking-[.16em] text-red-600">Sponsorship Levels</div>
            <h2 className="section-title mt-3 !mb-0">A place for every supporter</h2>
            <p className="mt-4 text-neutral-600">
              Choose the level that fits your business, family or community contribution. Expand any card to see the full recognition package.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {tiers.map(({ name, price, suggested, Icon, accent, border, tagline, bestFor, recognition, benefits, exclusive }) => (
              <details key={name} className={`group overflow-hidden rounded-3xl border bg-white shadow-sm ${border}`}>
                <summary className="cursor-pointer list-none p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600">
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex gap-4">
                      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${accent}`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        {exclusive ? (
                          <div className="mb-2 inline-flex rounded-full bg-amber-400 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-black">
                            Exclusive
                          </div>
                        ) : null}
                        <h3 className="text-2xl font-black uppercase">{name}</h3>
                        <p className="mt-1 text-sm text-neutral-600">{tagline}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-red-600">{price}</div>
                      <div className="mt-1 text-xs font-bold text-neutral-500">{suggested}</div>
                    </div>
                  </div>
                  <div className="mt-5 text-xs font-black uppercase tracking-wide text-neutral-500">
                    Tap to view benefits +
                  </div>
                </summary>

                <div className="border-t border-neutral-200 p-6 pt-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <div className="text-xs font-black uppercase tracking-wide text-neutral-500">Benefits</div>
                      <ul className="mt-3 grid gap-3">
                        {benefits.map((benefit) => (
                          <li className="flex gap-2 text-sm" key={benefit}>
                            <CheckCircle2 className="mt-0.5 shrink-0 text-red-600" size={17} />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-neutral-50 p-4">
                      <div className="text-xs font-black uppercase tracking-wide text-neutral-500">Recognition</div>
                      <p className="mt-2 text-sm">{recognition}</p>
                      <div className="mt-4 text-xs font-black uppercase tracking-wide text-neutral-500">Best for</div>
                      <p className="mt-2 text-sm">{bestFor}</p>
                    </div>
                  </div>
                  <a href="#sponsor-form" className="btn btn-primary mt-5">
                    {exclusive ? "Become Main Sponsor" : name.includes("Sponsor") ? "Sponsor Now" : "Support Now"}
                  </a>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-neutral-100">
        <div className="container">
          <div className="max-w-3xl">
            <div className="text-sm font-black uppercase tracking-[.16em] text-red-600">Brand Visibility</div>
            <h2 className="section-title mt-3 !mb-0">Where your brand can appear</h2>
            <p className="mt-4 text-neutral-600">
              The examples below use the approved 2026 sponsorship mockups for each team package. Final placement depends on sponsorship level, available space, club approval and the final decoration layout.
            </p>
          </div>

          <article className="card mt-8 overflow-hidden">
            <div className="bg-black p-5 text-white md:p-6">
              <div className="text-xs font-black uppercase tracking-wide text-red-500">Complete Overview</div>
              <h3 className="mt-1 text-2xl font-black uppercase md:text-3xl">All Sponsorship Placement Options</h3>
            </div>
            <Image
              src="/sponsors/sponsor-all-options.webp"
              alt="Overview of Caledon U9 Girls 2026 sponsorship placement options across the home kit, away kit, tracksuit, backpack and outdoor jacket."
              width={1536}
              height={1024}
              unoptimized
              className="h-auto w-full"
              sizes="100vw"
            />
          </article>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <article className="card overflow-hidden">
              <div className="bg-black p-5 text-white">
                <div className="text-xs font-black uppercase tracking-wide text-red-500">Match Kit</div>
                <h3 className="mt-1 text-2xl font-black uppercase">Home Match Kit Sponsorship</h3>
              </div>
              <Image
                src="/sponsors/sponsor-home-match-kit.webp"
                alt="Caledon U9 Girls 2026 black home match kit showing main sponsor, secondary sponsor and sleeve sponsor placement examples."
                width={1122}
                height={1402}
                unoptimized
                className="h-auto w-full"
                sizes="(max-width: 1023px) 100vw, 50vw"
              />
              <div className="p-6">
                <ul className="grid gap-3 text-sm">
                  <li><strong>Main Jersey Logo:</strong> front center · exclusive package · C$3,000.</li>
                  <li><strong>Secondary Jersey Logo:</strong> right-chest area · C$500–C$2,000.</li>
                  <li><strong>Sleeve Logo:</strong> upper arm · C$300–C$700.</li>
                </ul>
              </div>
            </article>

            <article className="card overflow-hidden">
              <div className="bg-black p-5 text-white">
                <div className="text-xs font-black uppercase tracking-wide text-red-500">Match Kit</div>
                <h3 className="mt-1 text-2xl font-black uppercase">Away Match Kit Sponsorship</h3>
              </div>
              <Image
                src="/sponsors/sponsor-away-match-kit.webp"
                alt="Caledon U9 Girls 2026 white away match kit showing main sponsor, secondary sponsor and sleeve sponsor placement examples."
                width={1122}
                height={1402}
                unoptimized
                className="h-auto w-full"
                sizes="(max-width: 1023px) 100vw, 50vw"
              />
              <div className="p-6">
                <ul className="grid gap-3 text-sm">
                  <li><strong>Main Jersey Logo:</strong> front center · premium placement · C$3,000.</li>
                  <li><strong>Secondary Jersey Logo:</strong> right-chest area · C$500–C$2,000.</li>
                  <li><strong>Sleeve Logo:</strong> upper arm · C$300–C$700.</li>
                </ul>
              </div>
            </article>

            <article className="card overflow-hidden">
              <div className="bg-black p-5 text-white">
                <div className="text-xs font-black uppercase tracking-wide text-red-500">Travel / Warm-up</div>
                <h3 className="mt-1 text-2xl font-black uppercase">Track Suit Sponsorship</h3>
              </div>
              <Image
                src="/sponsors/sponsor-track-suit.webp"
                alt="Caledon U9 Girls 2026 black tracksuit sponsorship mockup showing sponsor placement on the upper back with player personalization."
                width={1122}
                height={1402}
                unoptimized
                className="h-auto w-full"
                sizes="(max-width: 1023px) 100vw, 50vw"
              />
              <div className="p-6 text-sm text-neutral-700">
                Sponsor branding can be coordinated on the approved tracksuit placement while preserving the club crest, adidas branding and player personalization.
              </div>
            </article>

            <article className="card overflow-hidden">
              <div className="bg-black p-5 text-white">
                <div className="text-xs font-black uppercase tracking-wide text-red-500">Cold Weather / Sideline</div>
                <h3 className="mt-1 text-2xl font-black uppercase">Outdoor Jacket Sponsorship</h3>
              </div>
              <Image
                src="/sponsors/sponsor-jacket.webp"
                alt="Caledon U9 Girls 2026 outdoor jacket sponsorship mockup showing a large sponsor logo placement on the back."
                width={1122}
                height={1402}
                unoptimized
                className="h-auto w-full"
                sizes="(max-width: 1023px) 100vw, 50vw"
              />
              <div className="p-6 text-sm text-neutral-700">
                The outdoor jacket offers a high-visibility back placement for an approved sponsor while retaining the club crest and player name.
              </div>
            </article>

            <article className="card overflow-hidden lg:col-span-2">
              <div className="bg-black p-5 text-white">
                <div className="text-xs font-black uppercase tracking-wide text-red-500">Travel / Storage</div>
                <h3 className="mt-1 text-2xl font-black uppercase">Backpack Sponsorship</h3>
              </div>
              <div className="mx-auto max-w-4xl">
                <Image
                  src="/sponsors/sponsor-backpack.webp"
                  alt="Caledon U9 Girls 2026 backpack sponsorship mockup showing sponsor logo placement on the front pocket below the club crest."
                  width={1122}
                  height={1402}
                  unoptimized
                  className="h-auto w-full"
                  sizes="(max-width: 1023px) 100vw, 900px"
                />
              </div>
              <div className="border-t border-neutral-200 p-6 text-sm text-neutral-700">
                The backpack provides a prominent front-pocket sponsor placement that travels with the team throughout the season.
              </div>
            </article>

            <article className="card p-6">
              <Laptop className="text-red-600" size={28} />
              <h3 className="mt-4 text-2xl font-black uppercase">Digital & Print</h3>
              <div className="mt-5 grid gap-3 text-sm">
                <div><strong>Team sponsor page:</strong> logo + approved website link · C$300+.</div>
                <div><strong>Approved social recognition:</strong> season posts · C$300+.</div>
                <div><strong>Season newsletter:</strong> sponsor section · included at C$100+ tiers.</div>
                <div><strong>Team poster:</strong> sponsor recognition · C$100+.</div>
              </div>
            </article>

            <article className="card p-6">
              <Dumbbell className="text-red-600" size={28} />
              <h3 className="mt-4 text-2xl font-black uppercase">Equipment, Field & Training</h3>
              <div className="mt-5 grid gap-3 text-sm">
                <div><strong>Equipment Sponsor:</strong> support training equipment · C$500–C$1,500.</div>
                <div><strong>Field Sponsor:</strong> support field-rental time · C$200–C$500.</div>
                <div><strong>Training Sponsor:</strong> support a training initiative · C$300–C$1,000.</div>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="text-center">
            <div className="text-sm font-black uppercase tracking-[.16em] text-red-600">Your Sponsorship Makes a Difference</div>
            <h2 className="section-title mt-3">Where support goes</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {uses.map(([label, icon]) => (
              <div className="card grid min-h-36 place-items-center p-5 text-center" key={label}>
                <div>
                  <div className="text-3xl" aria-hidden="true">{icon}</div>
                  <div className="mt-3 text-sm font-black uppercase">{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-8 max-w-4xl rounded-3xl bg-red-600 p-7 text-center text-white">
            <p className="text-lg font-black">
              Every dollar helps our girls spend more time playing, learning, competing and enjoying the game.
            </p>
            <p className="mt-2 text-sm text-white/80">
              Sponsorship funds are designated for the U9 Girls program and the season costs shown above.
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-black text-white">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <div className="text-sm font-black uppercase tracking-[.16em] text-red-500">How to Sponsor</div>
              <h2 className="mt-3 text-4xl font-black uppercase tracking-tight md:text-5xl">It’s easy to support our girls</h2>

              <div className="mt-8 grid gap-5">
                {[
                  ["1", "Complete the form", "Use the online sponsorship-interest form below from your phone or computer."],
                  ["2", "Choose your recognition", "Tell us your preferred sponsorship level, branding option and whether you want to remain anonymous."],
                  ["3", "Confirm payment", "The team will confirm the selected package and provide the appropriate payment instructions."]
                ].map(([number, title, text]) => (
                  <div className="flex gap-4" key={number}>
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-600 font-black">{number}</div>
                    <div>
                      <h3 className="font-black uppercase">{title}</h3>
                      <p className="mt-1 text-sm text-white/65">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-xs font-black uppercase tracking-wide text-red-500">Sponsor Commitment</div>
              <h3 className="mt-3 text-2xl font-black uppercase">More than a sponsorship—you’re building the team.</h3>
              <div className="mt-5 grid gap-3 text-sm text-white/70">
                <div className="flex gap-3"><Star className="shrink-0 text-red-500" size={18} /> Every sponsor is recognized unless they prefer to remain anonymous.</div>
                <div className="flex gap-3"><FileText className="shrink-0 text-red-500" size={18} /> Businesses can submit a logo for eligible digital and team sponsorship packages.</div>
                <div className="flex gap-3"><HeartHandshake className="shrink-0 text-red-500" size={18} /> Your support helps create a season the girls can enjoy and remember.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="sponsor-form" className="section scroll-mt-24 bg-neutral-50">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <div className="text-sm font-black uppercase tracking-[.16em] text-red-600">Become a Sponsor</div>
              <h2 className="section-title mt-3 !mb-0">Start the conversation</h2>
              <p className="mt-4 text-neutral-600">
                Tell us the level you’re considering and we’ll use your submission to coordinate the package, branding and payment details.
              </p>

              <div className="mt-6 grid gap-3">
                <a href="mailto:girlsoccer@r5play.net" className="card flex min-h-16 items-center gap-4 p-4 hover:border-red-500">
                  <Mail className="text-red-600" />
                  <div>
                    <div className="text-xs font-black uppercase text-neutral-500">Email</div>
                    <div className="font-black">girlsoccer@r5play.net</div>
                  </div>
                </a>
                <a href="tel:+18555926444" className="card flex min-h-16 items-center gap-4 p-4 hover:border-red-500">
                  <Phone className="text-red-600" />
                  <div>
                    <div className="text-xs font-black uppercase text-neutral-500">Phone</div>
                    <div className="font-black">1-(855) 592-6444</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="card p-6 md:p-8">
              <SponsorshipInquiryForm />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="text-sm font-black uppercase tracking-[.16em] text-red-600">Ways to Pay</div>
          <h2 className="section-title mt-3">Payment options</h2>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="card p-6">
              <Banknote className="text-red-600" />
              <h3 className="mt-4 font-black uppercase">Interac e-Transfer</h3>
              <p className="mt-2 text-sm text-neutral-600">girlsoccer@r5play.net</p>
            </div>
            <div className="card p-6">
              <CreditCard className="text-red-600" />
              <h3 className="mt-4 font-black uppercase">Credit / Debit Card</h3>
              <p className="mt-2 text-sm text-neutral-600">Stripe checkout will be added before public launch.</p>
            </div>
            <div className="card p-6">
              <Banknote className="text-red-600" />
              <h3 className="mt-4 font-black uppercase">Cash</h3>
              <p className="mt-2 text-sm text-neutral-600">Accepted by arrangement with the team.</p>
            </div>
            <div className="card p-6">
              <FileText className="text-red-600" />
              <h3 className="mt-4 font-black uppercase">Cheque</h3>
              <p className="mt-2 text-sm text-neutral-600">Payable to Rivers5 Inc.</p>
            </div>
          </div>

          <div className="notice mt-6">
            Live card payments are intentionally disabled during development. Sponsorship payment details should be confirmed with the team before funds are sent.
          </div>
        </div>
      </section>

      <section className="section bg-neutral-100">
        <div className="container">
          <div className="max-w-3xl">
            <div className="text-sm font-black uppercase tracking-[.16em] text-red-600">FAQ</div>
            <h2 className="section-title mt-3 !mb-0">Common sponsorship questions</h2>
          </div>

          <div className="mt-7 grid gap-3">
            {faqs.map((item) => (
              <details className="card p-5" key={item.q}>
                <summary className="cursor-pointer font-black">{item.q}</summary>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{item.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-black p-7 text-white md:p-9">
            <div>
              <div className="text-xs font-black uppercase tracking-[.16em] text-red-500">Back the Girls</div>
              <h2 className="mt-2 text-3xl font-black uppercase">Build the team. Be part of their 2026 season.</h2>
              <p className="mt-2 text-sm text-white/60">Community • Opportunity • Confidence • Friendships • Brighter Tomorrows</p>
            </div>
            <a href="#sponsor-form" className="btn btn-primary">Become a Sponsor</a>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
