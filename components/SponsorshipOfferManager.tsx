"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Copy, Eye, EyeOff, Save, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Campaign = {
  slug: string; season_label: string; heading: string; tagline: string;
  description: string; contact_email: string; cheque_payee: string;
  is_current: boolean; updated_at: string;
};
type Offer = {
  id: string; campaign_slug: string; offer_key: string; name: string; description: string;
  pricing_mode: "any" | "fixed" | "starting_at" | "contact";
  price_cad: number | null; availability: "available" | "reserved" | "sold";
  is_visible: boolean; benefits: string[]; sort_order: number;
};

export function SponsorshipOfferManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selected, setSelected] = useState("");
  const [campaignDraft, setCampaignDraft] = useState<Campaign | null>(null);
  const [offerDrafts, setOfferDrafts] = useState<Record<string, Offer>>({});
  const [benefitText, setBenefitText] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("Loading editable sponsorship packages…");
  const [busy, setBusy] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newSeasonLabel, setNewSeasonLabel] = useState("");
  const [newOfferName, setNewOfferName] = useState("");

  const load = useCallback(async (preferred?: string) => {
    const [seasons, allOffers] = await Promise.all([
      supabase.from("sponsorship_campaigns").select("*").order("created_at", { ascending: false }),
      supabase.from("sponsorship_offers").select("*").order("sort_order", { ascending: true })
    ]);
    if (seasons.error) throw seasons.error;
    if (allOffers.error) throw allOffers.error;
    const list = (seasons.data || []) as Campaign[];
    setCampaigns(list);
    setOffers((allOffers.data || []) as Offer[]);
    setSelected((current) => preferred || current || list.find((season) => season.is_current)?.slug || list[0]?.slug || "");
    setMessage("");
  }, []);

  useEffect(() => {
    load().catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load packages. Manager login and MFA are required."));
  }, [load]);

  const campaign = useMemo(() => campaigns.find((item) => item.slug === selected), [campaigns, selected]);
  const shownOffers = useMemo(() => offers.filter((item) => item.campaign_slug === selected).sort((a, b) => a.sort_order - b.sort_order), [offers, selected]);
  useEffect(() => {
    setCampaignDraft(campaign ? { ...campaign } : null);
  }, [campaign]);
  useEffect(() => {
    const drafts: Record<string, Offer> = {};
    const descriptions: Record<string, string> = {};
    for (const offer of shownOffers) {
      drafts[offer.id] = { ...offer };
      descriptions[offer.id] = Array.isArray(offer.benefits) ? offer.benefits.join("\n") : "";
    }
    setOfferDrafts(drafts);
    setBenefitText(descriptions);
  }, [shownOffers]);

  function editOffer(id: string, patch: Partial<Offer>) {
    setOfferDrafts((previous) => ({ ...previous, [id]: { ...previous[id], ...patch } }));
  }

  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key);
    setMessage("");
    try { await fn(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save changes."); }
    finally { setBusy(""); }
  }

  function saveCampaign() {
    if (!campaignDraft) return;
    void run("campaign", async () => {
      const { error, data } = await supabase.from("sponsorship_campaigns").update({
        season_label: campaignDraft.season_label.trim(),
        heading: campaignDraft.heading.trim(),
        tagline: campaignDraft.tagline.trim(),
        description: campaignDraft.description.trim(),
        contact_email: campaignDraft.contact_email.trim(),
        cheque_payee: campaignDraft.cheque_payee.trim(),
        updated_at: new Date().toISOString()
      }).eq("slug", campaignDraft.slug).select("slug").single();
      if (error) throw error;
      if (!data) throw new Error("The season was not saved; check manager permissions.");
      await load(selected);
      setMessage("Season details saved. The public sponsorship page reads the latest values on refresh.");
    });
  }

  function saveOffer(id: string) {
    const draft = offerDrafts[id];
    if (!draft) return;
    void run(id, async () => {
      const numberValue = draft.price_cad === null || String(draft.price_cad).trim() === "" ? null : Number(draft.price_cad);
      if (["fixed", "starting_at"].includes(draft.pricing_mode) && (!numberValue || numberValue <= 0)) {
        throw new Error("Enter a price greater than zero for fixed-price or starting-at packages.");
      }
      const { error, data } = await supabase.from("sponsorship_offers").update({
        name: draft.name.trim(), description: draft.description.trim(),
        pricing_mode: draft.pricing_mode,
        price_cad: ["any", "contact"].includes(draft.pricing_mode) ? null : numberValue,
        availability: draft.availability, is_visible: draft.is_visible,
        benefits: (benefitText[id] || "").split("\n").map((line) => line.trim()).filter(Boolean),
        sort_order: Number(draft.sort_order) || 100, updated_at: new Date().toISOString()
      }).eq("id", id).select("id").single();
      if (error) throw error;
      if (!data) throw new Error("The package was not saved; check manager permissions.");
      await load(selected);
      setMessage(draft.name + " saved. Public availability and pricing will reflect this update on refresh.");
    });
  }

  function cloneSeason() {
    void run("clone", async () => {
      const slug = newSlug.trim().toLowerCase();
      const label = newSeasonLabel.trim();
      if (!/^[a-z0-9][a-z0-9-]{2,59}$/.test(slug) || label.length < 4) throw new Error("Enter a season identifier such as 2027-28-winter and a full season label.");
      const { error } = await supabase.rpc("sponsorship_clone_campaign", { p_slug: slug, p_season_label: label });
      if (error) throw error;
      setNewSlug(""); setNewSeasonLabel("");
      await load(slug);
      setMessage("New season created as a draft. All placements have reset to AVAILABLE. Review every package before publishing.");
    });
  }

  function publishSeason() {
    if (!campaign || campaign.is_current) return;
    if (!window.confirm("Publish " + campaign.season_label + " as the current sponsorship season? This replaces the publicly displayed season.")) return;
    void run("publish", async () => {
      const { error } = await supabase.rpc("sponsorship_publish_campaign", { p_slug: campaign.slug });
      if (error) throw error;
      await load(campaign.slug);
      setMessage(campaign.season_label + " is now the live sponsorship season.");
    });
  }

  function addOffer() {
    if (!campaign) return;
    void run("add", async () => {
      const name = newOfferName.trim();
      const key = name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0,60);
      if (name.length < 3 || key.length < 3) throw new Error("Enter a descriptive package name.");
      const { error } = await supabase.from("sponsorship_offers").insert({
        campaign_slug: campaign.slug, offer_key: key, name, pricing_mode: "contact", price_cad: null,
        availability: "available", is_visible: false, description: "", benefits: [],
        sort_order: shownOffers.length ? Math.max(...shownOffers.map((item) => item.sort_order)) + 10 : 10
      });
      if (error) throw error;
      setNewOfferName("");
      await load(selected);
      setMessage("New package added as HIDDEN. Edit it and make it visible when ready.");
    });
  }

  return (
    <section id="sponsorship-offers" className="mt-8 scroll-mt-24 rounded-3xl border-2 border-red-200 bg-white p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[.16em] text-red-600">Live sponsorship controls</div>
          <h2 className="mt-2 text-2xl font-black uppercase md:text-3xl">Pricing & availability manager</h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">Edit public package prices, wording and sold/reserved status without a website deployment. Only admin/manager MFA sessions can save.</p>
        </div>
        <a href="/sponsors" target="_blank" rel="noopener noreferrer" className="btn btn-light text-sm">Preview public page</a>
      </div>
      {message && <div role="status" aria-live="polite" className="notice mt-5 text-sm">{message}</div>}
      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div className="field-group !mb-0 min-w-[240px] flex-1">
          <label htmlFor="sponsor-season" className="field-label">Season to edit</label>
          <select id="sponsor-season" className="field" value={selected} onChange={(e) => setSelected(e.target.value)}>
            {campaigns.map((item) => <option key={item.slug} value={item.slug}>{item.season_label}{item.is_current ? " — LIVE" : " — Draft / Archived"}</option>)}
          </select>
        </div>
        {campaign && !campaign.is_current ? <button className="btn btn-primary" disabled={Boolean(busy)} onClick={publishSeason}>Publish this season</button> : null}
        {campaign?.is_current ? <span className="rounded-full bg-green-50 px-4 py-3 text-sm font-black uppercase text-green-800"><CheckCircle2 className="mr-2 inline" size={17} />Live season</span> : null}
      </div>
      {campaignDraft && (
        <div className="mt-6 rounded-2xl bg-neutral-50 p-4 md:p-6">
          <h3 className="text-xl font-black uppercase">Season information</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {([
              ["season_label", "Season label"],
              ["heading", "Page heading"],
              ["tagline", "Team tagline"],
              ["contact_email", "Contact / e-transfer email"],
              ["cheque_payee", "Cheques payable to"]
            ] as const).map(([key, label]) => (
              <div className="field-group !mb-0" key={key}>
                <label className="field-label" htmlFor={"sponsor-campaign-" + key}>{label}</label>
                <input id={"sponsor-campaign-" + key} className="field" value={campaignDraft[key]} maxLength={key === "contact_email" ? 254 : 180} onChange={(e) => setCampaignDraft((old) => old ? { ...old, [key]: e.target.value } : null)} />
              </div>
            ))}
            <div className="field-group !mb-0 md:col-span-2">
              <label className="field-label" htmlFor="sponsor-campaign-description">Introductory description</label>
              <textarea id="sponsor-campaign-description" className="field" rows={3} maxLength={700} value={campaignDraft.description} onChange={(e) => setCampaignDraft((old) => old ? { ...old, description: e.target.value } : null)} />
            </div>
          </div>
          <button className="btn btn-primary mt-5" disabled={Boolean(busy)} onClick={saveCampaign}><Save size={17} />{busy === "campaign" ? "Saving…" : "Save season details"}</button>
        </div>
      )}
      <div className="mt-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="text-xl font-black uppercase">Sponsorship packages ({shownOffers.length})</h3>
          <p className="text-xs text-neutral-500">Save each package after editing. HIDDEN removes it from the public page.</p>
        </div>
        <div className="mt-4 grid gap-5 xl:grid-cols-2">
          {shownOffers.map((item) => {
            const value = offerDrafts[item.id];
            if (!value) return null;
            return (
              <article className="rounded-2xl border border-neutral-200 p-5" key={item.id}>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className={"rounded-full px-3 py-1 text-xs font-black uppercase " + (value.availability === "sold" ? "bg-red-100 text-red-800" : value.availability === "reserved" ? "bg-amber-100 text-amber-900" : "bg-green-100 text-green-800")}>{value.availability}</span>
                  <span className="text-xs font-bold uppercase text-neutral-500">{value.is_visible ? <Eye className="mr-1 inline" size={15} /> : <EyeOff className="mr-1 inline" size={15} />}{value.is_visible ? "Public" : "Hidden"}</span>
                </div>
                <div className="field-group !mb-0"><label className="field-label" htmlFor={"name-" + item.id}>Package name</label><input id={"name-" + item.id} className="field" maxLength={100} value={value.name} onChange={(e) => editOffer(item.id, { name: e.target.value })} /></div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="field-group !mb-0">
                    <label className="field-label" htmlFor={"mode-" + item.id}>Pricing type</label>
                    <select id={"mode-" + item.id} className="field" value={value.pricing_mode} onChange={(e) => editOffer(item.id, { pricing_mode: e.target.value as Offer["pricing_mode"] })}>
                      <option value="any">Any amount</option><option value="starting_at">Price and up</option><option value="fixed">Fixed price</option><option value="contact">Contact for pricing</option>
                    </select>
                  </div>
                  <div className="field-group !mb-0">
                    <label className="field-label" htmlFor={"price-" + item.id}>Price (CAD)</label>
                    <input id={"price-" + item.id} className="field" type="number" step="0.01" min="0.01" max="1000000" disabled={value.pricing_mode === "any" || value.pricing_mode === "contact"} value={value.price_cad ?? ""} onChange={(e) => editOffer(item.id, { price_cad: e.target.value === "" ? null : Number(e.target.value) })} />
                  </div>
                  <div className="field-group !mb-0">
                    <label className="field-label" htmlFor={"availability-" + item.id}>Placement availability</label>
                    <select id={"availability-" + item.id} className="field" value={value.availability} onChange={(e) => editOffer(item.id, { availability: e.target.value as Offer["availability"] })}>
                      <option value="available">Available</option><option value="reserved">Reserved / pending</option><option value="sold">Sold out</option>
                    </select>
                  </div>
                  <div className="field-group !mb-0">
                    <label className="field-label" htmlFor={"visibility-" + item.id}>Public visibility</label>
                    <select id={"visibility-" + item.id} className="field" value={value.is_visible ? "visible" : "hidden"} onChange={(e) => editOffer(item.id, { is_visible: e.target.value === "visible" })}>
                      <option value="visible">Visible</option><option value="hidden">Hidden</option>
                    </select>
                  </div>
                </div>
                <div className="field-group mt-4 !mb-0"><label className="field-label" htmlFor={"description-" + item.id}>Public description</label><textarea id={"description-" + item.id} className="field" rows={2} maxLength={650} value={value.description} onChange={(e) => editOffer(item.id, { description: e.target.value })} /></div>
                <div className="field-group mt-4 !mb-0"><label className="field-label" htmlFor={"benefits-" + item.id}>Benefits (one per line)</label><textarea id={"benefits-" + item.id} className="field" rows={3} value={benefitText[item.id] || ""} onChange={(e) => setBenefitText((old) => ({ ...old, [item.id]: e.target.value }))} /></div>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                  <div className="field-group !mb-0 max-w-28"><label className="field-label" htmlFor={"order-" + item.id}>Order</label><input id={"order-" + item.id} className="field" type="number" min="0" max="10000" value={value.sort_order} onChange={(e) => editOffer(item.id, { sort_order: Number(e.target.value) })} /></div>
                  <button className="btn btn-primary" disabled={Boolean(busy)} onClick={() => saveOffer(item.id)}><Save size={16} />{busy === item.id ? "Saving…" : "Save package"}</button>
                </div>
              </article>
            );
          })}
        </div>
        {campaign && (
          <div className="mt-5 flex flex-wrap items-end gap-3 rounded-xl bg-neutral-50 p-4">
            <div className="field-group !mb-0 min-w-[220px] flex-1"><label className="field-label" htmlFor="new-offer-name">Add a new sponsorship package</label><input id="new-offer-name" className="field" value={newOfferName} onChange={(e) => setNewOfferName(e.target.value)} placeholder="Example: Training Kit Sponsor" /></div>
            <button className="btn btn-dark" disabled={Boolean(busy)} onClick={addOffer}>Add hidden package</button>
          </div>
        )}
      </div>
      <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-2 text-lg font-black uppercase"><Copy size={21} className="text-red-600" />Prepare next season</div>
        <p className="mt-2 text-sm text-neutral-700">Copy the current season's packages into a new draft. Prices and descriptions carry over, but SOLD / RESERVED placements reset to AVAILABLE. The current public page stays unchanged until you publish the new season.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div className="field-group !mb-0"><label className="field-label" htmlFor="new-season-slug">Season ID</label><input className="field" id="new-season-slug" placeholder="2027-28-winter" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} /></div>
          <div className="field-group !mb-0"><label className="field-label" htmlFor="new-season-label">Display season</label><input className="field" id="new-season-label" placeholder="2027–2028 Winter Season" value={newSeasonLabel} onChange={(e) => setNewSeasonLabel(e.target.value)} /></div>
          <button className="btn btn-dark" disabled={Boolean(busy)} onClick={cloneSeason}>Copy to draft</button>
        </div>
        <p className="mt-4 text-xs text-neutral-600"><ShieldCheck className="mr-1 inline" size={15} />Changes are permission-controlled and take effect on the public page when refreshed.</p>
      </div>
    </section>
  );
}
