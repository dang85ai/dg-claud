"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeDollarSign,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Mail,
  Phone,
  ShieldCheck,
  UserRoundCheck
} from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";
import { authedFetch, endpoints } from "@/lib/api";
import { supabase } from "@/lib/supabase";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  business_name: string | null;
  tier_key: string | null;
  amount_cad: number | null;
  notes: string | null;
  anonymous: boolean;
  status: "new" | "contacted" | "quoted" | "committed" | "declined" | "converted";
  admin_notes: string | null;
  converted_sponsor_id: string | null;
  created_at: string;
  sponsorship_tiers?: { name?: string | null } | null;
};

type Sponsor = {
  id: string;
  name: string;
  sponsorship_level: string | null;
  amount_cad: number | null;
  active: boolean;
  created_at: string;
};

const statusLabels: Record<Inquiry["status"], string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  committed: "Committed",
  declined: "Declined",
  converted: "Converted"
};

function money(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD"
  }).format(value);
}

export default function AdminSponsorsPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [status, setStatus] = useState("Loading sponsorship pipeline…");
  const [busy, setBusy] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const [inquiryRes, sponsorRes] = await Promise.all([
      supabase.from("sponsorship_inquiries")
        .select("id,name,email,phone,business_name,tier_key,amount_cad,notes,anonymous,status,admin_notes,converted_sponsor_id,created_at,sponsorship_tiers(name)")
        .order("created_at", { ascending: false }),
      supabase.from("sponsors")
        .select("id,name,sponsorship_level,amount_cad,active,created_at")
        .order("created_at", { ascending: false })
    ]);

    if (inquiryRes.error) throw inquiryRes.error;
    if (sponsorRes.error) throw sponsorRes.error;

    setInquiries((inquiryRes.data ?? []) as Inquiry[]);
    setSponsors((sponsorRes.data ?? []) as Sponsor[]);
    setNotes(Object.fromEntries((inquiryRes.data ?? []).map((item: any) => [item.id, item.admin_notes ?? ""])));
    setStatus("");
  }, []);

  useEffect(() => {
    (async () => {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        router.replace("/login");
        return;
      }
      const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal.error || aal.data.currentLevel !== "aal2") {
        router.replace("/mfa");
        return;
      }

      try {
        await load();
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Unable to load sponsorship pipeline.");
      }
    })();
  }, [load, router]);

  async function act(action: string, input: Record<string, unknown>) {
    setBusy(`${action}:${String(input.id ?? "")}`);
    setStatus("");
    try {
      await authedFetch(endpoints.adminActions, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, input })
      });
      await load();
      setStatus(action === "sponsorship_inquiry.convert"
        ? "Inquiry converted to an active sponsor."
        : "Sponsorship inquiry updated.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to update sponsorship inquiry.");
    } finally {
      setBusy("");
    }
  }

  const counts = useMemo(() => {
    const map = Object.fromEntries(Object.keys(statusLabels).map((key) => [key, 0])) as Record<Inquiry["status"], number>;
    inquiries.forEach((item) => { map[item.status] += 1; });
    return map;
  }, [inquiries]);

  const activeSponsors = sponsors.filter((item) => item.active);
  const activeValue = activeSponsors.reduce((sum, item) => sum + Number(item.amount_cad ?? 0), 0);

  return (
    <div className="min-h-screen bg-neutral-100">
      <PortalHeader title="Sponsorship Pipeline" isAdmin />
      <main className="container py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-black uppercase tracking-[.16em] text-red-600">Community Partnerships</div>
            <h1 className="mt-2 text-4xl font-black uppercase tracking-tight md:text-5xl">Sponsor Pipeline</h1>
            <p className="mt-3 max-w-2xl text-neutral-600">
              Review website inquiries, track follow-up, record commitments and convert confirmed supporters into active sponsors.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-black px-4 py-3 text-xs font-black uppercase text-white">
            <ShieldCheck size={16} /> MFA Protected
          </div>
        </div>

        {status ? <div className="notice mt-6 text-sm">{status}</div> : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-5">
            <Mail className="text-red-600" />
            <div className="mt-4 text-3xl font-black">{counts.new}</div>
            <div className="mt-1 text-xs font-black uppercase text-neutral-500">New Inquiries</div>
          </div>
          <div className="card p-5">
            <UserRoundCheck className="text-red-600" />
            <div className="mt-4 text-3xl font-black">{counts.contacted + counts.quoted}</div>
            <div className="mt-1 text-xs font-black uppercase text-neutral-500">In Follow-up</div>
          </div>
          <div className="card p-5">
            <CheckCircle2 className="text-red-600" />
            <div className="mt-4 text-3xl font-black">{activeSponsors.length}</div>
            <div className="mt-1 text-xs font-black uppercase text-neutral-500">Active Sponsors</div>
          </div>
          <div className="card p-5">
            <CircleDollarSign className="text-red-600" />
            <div className="mt-4 text-3xl font-black">{money(activeValue)}</div>
            <div className="mt-1 text-xs font-black uppercase text-neutral-500">Recorded Sponsor Value</div>
          </div>
        </div>

        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[.16em] text-red-600">Incoming</div>
              <h2 className="mt-2 text-3xl font-black uppercase">Sponsorship Inquiries</h2>
            </div>
            <div className="text-sm text-neutral-500">{inquiries.length} total inquiries</div>
          </div>

          <div className="mt-5 grid gap-5">
            {inquiries.length ? inquiries.map((item) => {
              const tierName = item.sponsorship_tiers?.name || item.tier_key || "General sponsorship";
              const itemBusy = busy.endsWith(item.id);

              return (
                <article key={item.id} className="card overflow-hidden">
                  <div className="grid gap-5 p-6 lg:grid-cols-[1fr_250px]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black uppercase text-red-700">
                          {statusLabels[item.status]}
                        </span>
                        {item.anonymous ? (
                          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black uppercase text-neutral-600">
                            Publicly Anonymous
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-black">{item.business_name || item.name}</h3>
                          {item.business_name ? <div className="mt-1 text-sm text-neutral-500">Contact: {item.name}</div> : null}
                        </div>
                        <div className="text-left lg:text-right">
                          <div className="text-xs font-black uppercase text-neutral-500">Amount</div>
                          <div className="mt-1 text-2xl font-black text-red-600">{money(item.amount_cad)}</div>
                          <div className="mt-1 text-sm font-bold">{tierName}</div>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-4 text-sm">
                        <a className="font-bold hover:text-red-600" href={`mailto:${item.email}`}>
                          <Mail className="mr-1 inline" size={15} /> {item.email}
                        </a>
                        {item.phone ? (
                          <a className="font-bold hover:text-red-600" href={`tel:${item.phone.replace(/[^+\d]/g, "")}`}>
                            <Phone className="mr-1 inline" size={15} /> {item.phone}
                          </a>
                        ) : null}
                      </div>

                      {item.notes ? (
                        <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
                          <div className="text-xs font-black uppercase text-neutral-500">Sponsor Message</div>
                          <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">{item.notes}</p>
                        </div>
                      ) : null}

                      <div className="field-group mt-5 !mb-0">
                        <label className="field-label" htmlFor={`notes-${item.id}`}>Manager notes</label>
                        <textarea
                          id={`notes-${item.id}`}
                          className="field"
                          value={notes[item.id] ?? ""}
                          onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                          maxLength={3000}
                          placeholder="Call notes, quote details, follow-up date, branding discussion…"
                        />
                      </div>
                    </div>

                    <aside className="grid content-start gap-2">
                      {item.status !== "converted" ? (
                        <>
                          {(["contacted","quoted","committed","declined"] as Inquiry["status"][]).map((next) => (
                            <button
                              key={next}
                              disabled={itemBusy}
                              onClick={() => act("sponsorship_inquiry.update", {
                                id: item.id,
                                status: next,
                                admin_notes: notes[item.id] ?? ""
                              })}
                              className={next === "committed" ? "btn btn-primary w-full" : "btn btn-light w-full"}
                            >
                              Mark {statusLabels[next]}
                            </button>
                          ))}

                          <button
                            disabled={itemBusy}
                            onClick={() => act("sponsorship_inquiry.convert", {
                              id: item.id,
                              admin_notes: notes[item.id] ?? ""
                            })}
                            className="btn btn-dark mt-2 w-full"
                          >
                            <Building2 size={17} /> Convert to Sponsor
                          </button>
                        </>
                      ) : (
                        <div className="rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-900">
                          Converted to active sponsor.
                        </div>
                      )}

                      <div className="mt-3 text-xs text-neutral-500">
                        Received {new Date(item.created_at).toLocaleString()}
                      </div>
                    </aside>
                  </div>
                </article>
              );
            }) : (
              <div className="card p-8 text-center text-neutral-600">No sponsorship inquiries yet.</div>
            )}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center gap-3">
            <BadgeDollarSign className="text-red-600" />
            <h2 className="text-3xl font-black uppercase">Active Sponsors</h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeSponsors.length ? activeSponsors.map((sponsor) => (
              <article className="card p-5" key={sponsor.id}>
                <div className="text-xs font-black uppercase text-red-600">{sponsor.sponsorship_level || "Sponsor"}</div>
                <h3 className="mt-2 text-xl font-black">{sponsor.name}</h3>
                <div className="mt-4 text-2xl font-black">{money(sponsor.amount_cad)}</div>
              </article>
            )) : (
              <div className="card p-6 text-sm text-neutral-600">No active sponsor records yet.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
