import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ArrowRight, CheckCircle2, Heart, Mail, ShieldCheck, Shirt, Trophy, Users, Wallet } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { SponsorshipInquiryForm } from "@/components/SponsorshipInquiryForm";
import { SponsorPlacementHighlight } from "@/components/SponsorLogoBanner";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase-public";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sponsorship Opportunities",
  description: "Support Caledon United FC 2018 Girls. See up-to-date jersey sponsorship availability, business sponsorship packages and community supporter opportunities.",
  alternates: { canonical: "/sponsors" }
};

type Campaign = {
  slug: string; season_label: string; heading: string; tagline: string;
  description: string; contact_email: string; cheque_payee: string;
};
type Offer = {
  id: string; offer_key: string; name: string; description: string;
  pricing_mode: "any" | "fixed" | "starting_at" | "contact";
  price_cad: number | null; availability: "available" | "reserved" | "sold";
  is_visible: boolean; benefits: string[]; sort_order: number;
};

function formattedPrice(offer: Offer) {
  if (offer.pricing_mode === "any") return "Any amount";
  if (offer.pricing_mode === "contact" || offer.price_cad == null) return "Contact for pricing";
  const amount = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(Number(offer.price_cad));
  return offer.pricing_mode === "starting_at" ? amount + " and up" : amount;
}

function IconForOffer({ offerKey }: { offerKey: string }) {
  if (offerKey === "community_supporter") return <Heart size={26} aria-hidden />;
  if (offerKey === "business_sponsor") return <Users size={26} aria-hidden />;
  return <Shirt size={26} aria-hidden />;
}

async function sponsorshipData(): Promise<{ campaign: Campaign | null; offers: Offer[]; error: boolean }> {
  const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const current = await db.from("sponsorship_campaigns")
    .select("slug,season_label,heading,tagline,description,contact_email,cheque_payee")
    .eq("is_current", true).maybeSingle();
  if (current.error || !current.data) return { campaign: null, offers: [], error: true };
  const packages = await db.from("sponsorship_offers")
    .select("id,offer_key,name,description,pricing_mode,price_cad,availability,is_visible,benefits,sort_order")
    .eq("campaign_slug", current.data.slug).eq("is_visible", true)
    .order("sort_order", { ascending: true });
  if (packages.error) return { campaign: current.data as Campaign, offers: [], error: true };
  return { campaign: current.data as Campaign, offers: (packages.data || []) as Offer[], error: false };
}

export default async function SponsorsPage() {
  const { campaign, offers, error } = await sponsorshipData();
  const available = offers.filter((offer) => offer.availability === "available");
  return (
    <PublicShell>
      <section className="relative isolate overflow-hidden bg-black text-white">
        <div className="pointer-events-none absolute -right-24 -top-40 size-[550px] rounded-full bg-red-700/30 blur-[125px]" />
        <div className="pointer-events-none absolute -bottom-60 left-1/4 size-[520px] rounded-full bg-red-800/20 blur-[110px]" />
        <div className="container relative grid items-center gap-9 py-14 lg:grid-cols-[1fr_320px] lg:py-20">
          <div>
            <div className="text-sm font-black uppercase tracking-[.19em] text-red-400">Caledon United FC 2018 Girls</div>
            <div className="mt-4 inline-block bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-white">
              {campaign?.season_label || "Team sponsorship"}
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black uppercase leading-[.98] tracking-tight sm:text-6xl">
              {campaign?.heading || "Sponsorship Opportunities"}
              <span className="mt-2 block text-red-500">Sponsorship Opportunities</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
              {campaign?.description || "Find current sponsorship packages and support local girls' soccer."}
            </p>
            <div className="mt-6 text-xl font-black uppercase tracking-wide text-red-400">
              {campaign?.tagline || "Local girls. Stronger together."}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#packages" className="btn btn-primary">View packages <ArrowRight size={18} /></a>
              <a href="#sponsor-form" className="btn border border-white/25 bg-white/10 text-white">Become a sponsor</a>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[280px] rounded-full bg-white/5 p-4 ring-1 ring-white/15 lg:max-w-none">
            <Image src="/assets/brand/caledon-united-crest.webp" alt="Caledon United Football Club 1973 crest" width={330} height={330} priority unoptimized className="h-auto w-full object-contain" />
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="container py-10">
          <h2 className="text-center text-2xl font-black uppercase sm:text-3xl">Your support helps provide</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Training & equipment", Icon: Shirt },
              { name: "Tournament opportunities", Icon: Trophy },
              { name: "Team development", Icon: Users },
              { name: "Reduced costs for families", Icon: Heart }
            ].map(({ name, Icon }) => (
              <div key={name} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
                <Icon className="shrink-0 text-red-600" size={27} />
                <div className="text-sm font-black uppercase leading-snug">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="packages" className="section scroll-mt-24 bg-white">
        <div className="container">
          <div className="max-w-3xl">
            <div className="text-xs font-black uppercase tracking-[.2em] text-red-600">Sponsor packages</div>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-4xl">Support our girls</h2>
            <p className="mt-3 text-neutral-600">Pricing and availability are managed by our team for each season. Sold placements remain visible so supporters can see which opportunities are taken.</p>
          </div>
          {error ? (
            <div role="alert" className="mt-7 rounded-xl border border-red-300 bg-red-50 p-5 text-red-900">
              Sponsorship availability cannot be confirmed at the moment. Please contact the team directly before making a commitment.
            </div>
          ) : null}
          {!error && offers.length === 0 ? (
            <div className="mt-7 rounded-xl border border-neutral-200 p-6">There are no published sponsorship packages for this season.</div>
          ) : null}
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {offers.map((offer) => {
              const sold = offer.availability === "sold";
              const reserved = offer.availability === "reserved";
              return (
                <article key={offer.id} className={"overflow-hidden rounded-3xl border bg-white shadow-sm " + (sold ? "border-neutral-300" : "border-red-200")}>
                  <div className={"flex items-start justify-between gap-4 p-6 " + (sold ? "bg-neutral-900 text-white" : "bg-black text-white")}>
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-red-600 text-white">
                        <IconForOffer offerKey={offer.offer_key} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl font-black uppercase leading-tight sm:text-2xl">{offer.name}</h3>
                        {offer.offer_key.includes("home") ? <div className="mt-2 text-xs font-black uppercase text-white/65">Home jersey placement</div> : null}
                        {offer.offer_key.includes("away") ? <div className="mt-2 text-xs font-black uppercase text-white/65">Away jersey placement</div> : null}
                      </div>
                    </div>
                    <span className={"shrink-0 rounded-full px-3 py-1 text-xs font-black uppercase " + (sold ? "bg-red-600 text-white" : reserved ? "bg-amber-400 text-black" : "bg-white/15 text-white")}>
                      {sold ? "Sold" : reserved ? "Reserved" : "Available"}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className={"text-3xl font-black uppercase " + (sold ? "text-neutral-500" : "text-red-600")}>
                      {sold ? "Sold out" : formattedPrice(offer)}
                    </div>
                    {sold && offer.price_cad != null ? <div className="mt-1 text-sm text-neutral-500">Package value: {formattedPrice(offer)}</div> : null}
                    {reserved ? <p className="mt-2 text-sm font-bold text-amber-800">This placement is pending confirmation.</p> : null}
                    <p className="mt-4 text-sm leading-relaxed text-neutral-600">{offer.description}</p>
                    {sold && offer.offer_key === "home_main_logo" ? (
                      <SponsorPlacementHighlight placement="Home Jersey Main Logo Sponsor" />
                    ) : null}
                    {sold && offer.offer_key === "home_sleeve_logo" ? (
                      <SponsorPlacementHighlight placement="Home Jersey Sleeve Sponsor" />
                    ) : null}
                    {sold && (offer.offer_key === "home_main_logo" || offer.offer_key === "home_sleeve_logo") ? (
                      <a href="#home-kit-preview" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-red-700 underline underline-offset-4 hover:text-red-900">
                        <Shirt size={18} aria-hidden="true" /> View our sponsored Home Match Kit <ArrowRight size={16} aria-hidden="true" />
                      </a>
                    ) : null}
                    {Array.isArray(offer.benefits) && offer.benefits.length ? (
                      <ul className="mt-4 space-y-2">
                        {offer.benefits.map((benefit, idx) => <li key={idx} className="flex gap-2 text-sm"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-red-600" /><span>{benefit}</span></li>)}
                      </ul>
                    ) : null}
                    <div className="mt-6">
                      {sold ? <div className="rounded-xl bg-neutral-100 px-4 py-3 text-center text-sm font-black uppercase text-neutral-500">This placement has been secured</div> :
                        reserved ? <a href={"mailto:" + (campaign?.contact_email || "girlsoccer2018@gmail.com")} className="btn btn-light w-full">Ask about availability</a> :
                        <a href="#sponsor-form" className="btn btn-primary w-full">Enquire about this package <ArrowRight size={17} /></a>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="home-kit-preview" aria-labelledby="home-kit-preview-title" className="scroll-mt-24 border-y border-neutral-800 bg-neutral-950 text-white">
        <div className="container grid items-center gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(340px,470px)] lg:gap-14 lg:py-16">
          <div>
            <div className="text-xs font-black uppercase tracking-[.2em] text-red-400">2026–2027 Winter League · Our Home Kit</div>
            <h2 id="home-kit-preview-title" className="mt-4 text-3xl font-black uppercase leading-tight tracking-tight sm:text-5xl">
              Home Match Kit <span className="block text-red-500">with Sponsors</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75">
              A preview of our red home jersey showing the two businesses supporting our girls on the pitch this season.
              The design features our jersey chest sponsor and sleeve sponsor together.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/20 bg-white/5 p-5">
                <div className="text-xs font-black uppercase tracking-widest text-red-400">Front chest sponsor</div>
                <div className="mt-2 text-lg font-black">JB Aluminum Products Limited</div>
                <div className="mt-2 text-sm text-white/60">Home jersey main logo · Secured</div>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/5 p-5">
                <div className="text-xs font-black uppercase tracking-widest text-red-400">Sleeve sponsor</div>
                <div className="mt-2 text-lg font-black">Knockout Sports Bar &amp; Grill</div>
                <div className="mt-2 text-sm text-white/60">Home jersey sleeve logo · Secured</div>
              </div>
            </div>
            <p className="mt-6 max-w-xl text-sm text-white/60">
              Illustration for sponsorship presentation. The final production kit, logo scale and placement may differ.
              The sample player name and number are illustrative.
            </p>
            <a href="#packages" className="mt-6 inline-flex items-center gap-2 text-sm font-black uppercase text-red-300 underline underline-offset-4 hover:text-white">
              View sponsorship opportunities <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
          <figure className="mx-auto w-full max-w-[470px] overflow-hidden rounded-3xl border border-neutral-200 bg-white p-3 text-neutral-900 shadow-2xl sm:p-4">
            <a href="/assets/sponsors/2026-27-home-match-kit-sponsored.webp" target="_blank" rel="noopener noreferrer" aria-label="View full-size sponsored Home Match Kit sample">
              <Image
                src="/assets/sponsors/2026-27-home-match-kit-sponsored.webp"
                width={1122}
                height={1402}
                alt="2026–2027 Caledon United U9 Girls red home match kit mockup. Front jersey displays JB Aluminum Products Limited on the chest and Knockout Sports on the sleeves; back jersey shows an illustrative player name and number. Matching black shorts and red socks."
                unoptimized
                className="h-auto w-full rounded-2xl object-contain"
              />
            </a>
            <figcaption className="px-2 py-3 text-center text-xs font-medium text-neutral-600">
              2026–27 Winter League · Home Match Kit sample · Tap to enlarge
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section bg-neutral-100">
        <div className="container grid gap-7 lg:grid-cols-[1.35fr_.65fr]">
          <div id="sponsor-form" className="scroll-mt-24 rounded-3xl border border-neutral-200 bg-white p-6 md:p-8">
            <div className="text-xs font-black uppercase tracking-[.16em] text-red-600">Sponsorship commitment</div>
            <h2 className="mt-2 text-3xl font-black uppercase">Ready to support our girls?</h2>
            <p className="mt-3 text-neutral-600">Complete our sponsorship interest form and the team will follow up to confirm your package and payment details.</p>
            <div className="mt-7"><SponsorshipInquiryForm offers={available} seasonLabel={campaign?.season_label || "Current season"} /></div>
          </div>
          <aside className="rounded-3xl bg-black p-6 text-white md:p-8">
            <div className="text-xs font-black uppercase tracking-[.16em] text-red-400">Support & payment information</div>
            <h2 className="mt-3 text-2xl font-black uppercase">Get in touch</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70">Email or e-transfer contact:</p>
            <a className="mt-3 flex items-center gap-2 break-all text-sm font-black text-red-400 underline underline-offset-4" href={"mailto:" + (campaign?.contact_email || "girlsoccer2018@gmail.com")}>
              <Mail className="shrink-0" size={19} />{campaign?.contact_email || "girlsoccer2018@gmail.com"}
            </a>
            <div className="mt-7 border-t border-white/20 pt-6">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-white/60"><Wallet size={18} />Cheques payable to</div>
              <p className="mt-3 font-black">{campaign?.cheque_payee || "Caledon United FC 2018 Girls"}</p>
            </div>
            <div className="mt-7 border-t border-white/20 pt-6 text-sm text-white/65">
              <ShieldCheck className="mb-2 text-red-400" size={22} />
              Sponsorship terms, placement and payment are confirmed by the team. This website does not collect payments.
            </div>
            <Link href="/contact" className="btn btn-primary mt-7 w-full">Contact the team</Link>
          </aside>
        </div>
      </section>
      <div className="bg-black px-4 py-6 text-center text-sm font-black uppercase tracking-widest text-red-400">
        Caledon United FC 2018 Girls · {campaign?.season_label || "Team season"} · {campaign?.tagline || "Local girls. Stronger together."}
      </div>
    </PublicShell>
  );
}
