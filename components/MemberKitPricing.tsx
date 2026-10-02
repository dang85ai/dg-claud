"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
type Pricing = { packageRegular: number; packageBest: number; groups: Array<{ id: string; title: string; perPlayer: number; items: Array<{ sku: string; product: string; regular: number; best: number }> }> };
const money = (value: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(value);
export function MemberKitPricing() {
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [status, setStatus] = useState("Sign in with your team member account to view kit pricing.");
  useEffect(() => {
    let active = true;
    let generation = 0;
    async function load() {
      const current = ++generation;
      setPricing(null);
      const { data } = await supabase.auth.getSession();
      if (!active || current !== generation) return;
      if (!data.session) { setStatus("Sign in with your team member account to view kit pricing."); return; }
      setStatus("Checking team access…");
      try {
        const response = await fetch("/api/kit-pricing", { headers: { Authorization: "Bearer " + data.session.access_token }, cache: "no-store" });
        const result = await response.json();
        if (!active || current !== generation) return;
        if (!response.ok) { setStatus(result.error || "Team member access is required."); return; }
        setPricing(result); setStatus("");
      } catch { if (active && current === generation) setStatus("Kit pricing is unavailable. Please try again later."); }
    }
    void load();
    const { data: listener } = supabase.auth.onAuthStateChange(() => { generation++; setPricing(null); setTimeout(() => { if (active) void load(); }, 0); });
    return () => { active = false; generation++; listener.subscription.unsubscribe(); };
  }, []);
  return (
    <section className="card mb-8 p-6" aria-label="Member kit pricing">
      <h2 className="text-2xl font-black uppercase">Member kit pricing</h2>
      {!pricing ? <><p className="mt-3 text-sm text-neutral-600" role="status">{status}</p><Link href="/login" className="btn btn-primary mt-4">Member sign-in</Link></> : <>
        <p className="mt-3 text-sm text-neutral-600">Existing planning references, not a final team quote. Confirm current pricing, tax, stock and decoration with the manager before ordering. Team totals are being reviewed for the current squad.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-neutral-50 p-4"><div className="font-bold">Decorated package / player</div><div className="mt-2 text-3xl font-black">{money(pricing.packageRegular)}</div></div><div className="rounded-xl bg-neutral-50 p-4"><div className="font-bold">Sale reference / player</div><div className="mt-2 text-3xl font-black">{money(pricing.packageBest)}</div></div></div>
        <div className="mt-6 grid gap-4">{pricing.groups.map(group => <section className="rounded-2xl border border-neutral-200 p-4" key={group.id}><h3 className="font-black">{group.title} · {money(group.perPlayer)} / player</h3><ul className="mt-3 grid gap-2">{group.items.map(item => <li className="flex flex-wrap justify-between gap-2 border-t border-neutral-100 py-2 text-sm" key={item.sku}><span>{item.product}</span><span className="font-bold">{money(item.regular)} · Sale reference {money(item.best)}</span></li>)}</ul></section>)}</div>
      </>}
    </section>
  );
}
