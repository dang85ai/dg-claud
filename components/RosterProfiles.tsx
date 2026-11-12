"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, LockKeyhole, RotateCcw, ShieldCheck, Shirt, Users } from "lucide-react";
import { authedFetch, endpoints, publicFetch } from "@/lib/api";
import { SUPABASE_PUBLISHABLE_KEY, supabase } from "@/lib/supabase";
import { PlayerCardDownload } from "@/components/PlayerCardDownload";

type Player = {
  id: string;
  name: string;
  number: number | null;
  position: string | null;
  active: boolean;
  slot: string | null;
  show_on_field: boolean;
  public_visible: boolean;
  name_consent: boolean;
  photo_consent: boolean;
  photo_id: string | null;
  can_edit: boolean;
};

type Formation = { name: string; show_names: boolean };

type RosterSnapshot = {
  manager: boolean;
  players: Player[];
  formation: Formation | null;
};

type Kit = "home" | "away";
const formationSlots: Record<string, Array<{ slot: string; x: number; y: number }>> = {
  // Five on the field: goalkeeper, central defender, two midfielders and striker.
  "1-1-2-1": [
    { slot: "GK", x: 50, y: 87 }, { slot: "CB", x: 50, y: 68 },
    { slot: "LM", x: 27, y: 44 }, { slot: "RM", x: 73, y: 44 },
    { slot: "ST", x: 50, y: 18 }
  ],
  "1-2-1-1": [
    { slot: "GK", x: 50, y: 86 }, { slot: "LB", x: 27, y: 62 },
    { slot: "RB", x: 73, y: 62 }, { slot: "CM", x: 50, y: 40 },
    { slot: "ST", x: 50, y: 17 }
  ],
  "1-2-2": [
    { slot: "GK", x: 50, y: 86 }, { slot: "LB", x: 27, y: 62 },
    { slot: "RB", x: 73, y: 62 }, { slot: "LS", x: 27, y: 22 },
    { slot: "RS", x: 73, y: 22 }
  ],
  "1-3-2-1": [
    { slot: "GK", x: 50, y: 88 }, { slot: "LB", x: 21, y: 66 },
    { slot: "CB", x: 50, y: 66 }, { slot: "RB", x: 79, y: 66 },
    { slot: "LM", x: 32, y: 41 }, { slot: "RM", x: 68, y: 41 },
    { slot: "ST", x: 50, y: 16 }
  ],
  "1-2-3-1": [
    { slot: "GK", x: 50, y: 88 }, { slot: "LB", x: 27, y: 68 },
    { slot: "RB", x: 73, y: 68 }, { slot: "LM", x: 19, y: 41 },
    { slot: "CM", x: 50, y: 41 }, { slot: "RM", x: 81, y: 41 },
    { slot: "ST", x: 50, y: 16 }
  ],
  "1-3-3-2": [
    { slot: "GK", x: 50, y: 91 }, { slot: "LB", x: 22, y: 71 },
    { slot: "CB", x: 50, y: 71 }, { slot: "RB", x: 78, y: 71 },
    { slot: "LM", x: 20, y: 47 }, { slot: "CM", x: 50, y: 47 },
    { slot: "RM", x: 80, y: 47 }, { slot: "LS", x: 34, y: 19 },
    { slot: "RS", x: 66, y: 19 }
  ],
  "1-4-3-1": [
    { slot: "GK", x: 50, y: 91 }, { slot: "LB", x: 14, y: 72 },
    { slot: "LCB", x: 38, y: 72 }, { slot: "RCB", x: 62, y: 72 },
    { slot: "RB", x: 86, y: 72 }, { slot: "LM", x: 19, y: 45 },
    { slot: "CM", x: 50, y: 45 }, { slot: "RM", x: 81, y: 45 },
    { slot: "ST", x: 50, y: 17 }
  ]
};

function ApprovedPortrait({ id, name, privateAccess }: { id: string; name: string; privateAccess: boolean }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setSrc(null);

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = privateAccess ? data.session?.access_token : undefined;
        if (privateAccess && !token) return;
        const url = `${endpoints.rosterApi}?photo=${encodeURIComponent(id)}${privateAccess ? "&private=true" : ""}`;
        const response = await fetch(url, {
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          cache: "no-store"
        });
        if (!response.ok) return;
        const dataBlob = await response.blob();
        if (!dataBlob.type.startsWith("image/")) return;
        objectUrl = URL.createObjectURL(dataBlob);
        if (active) setSrc(objectUrl);
      } catch {
        // The approved-photo service can withhold or revoke a photo at any time.
      }
    })();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id, privateAccess]);

  if (!src) return null;
  // Consent-controlled portraits are retrieved as non-cacheable blobs, never public image paths.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={`Approved portrait of ${name}`} className="absolute inset-0 h-full w-full object-cover object-top" />;
}

function PlayerCard({ player, kit, privateAccess }: { player: Player; kit: Kit; privateAccess: boolean }) {
  const isHome = kit === "home";
  const photoAllowed = Boolean(player.photo_id && (privateAccess || player.photo_consent));
  const number = player.number === null ? "—" : String(player.number);

  return (
    <article className="group overflow-hidden rounded-[26px] border border-white/15 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(0,0,0,0.25)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#17191D]">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(circle at 50% 34%,rgba(255,255,255,.13),transparent 58%),linear-gradient(150deg,#26282D 0%,#0C0D10 100%)" }}
        />
        <div className="absolute -right-2 top-12 text-[120px] font-black leading-none tracking-[-.12em] text-white/[.055] sm:text-[150px]" aria-hidden="true">{number}</div>
        {!photoAllowed && (
          <div className="absolute inset-0">
            <Image
              src={isHome ? "/roster/home-jersey-2026.webp" : "/roster/away-jersey-2026.webp"}
              alt=""
              fill
              unoptimized
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
              className="object-cover object-top opacity-95 transition-transform duration-500 group-hover:scale-[1.035]"
            />
          </div>
        )}
        {photoAllowed && player.photo_id ? <ApprovedPortrait key={player.photo_id} id={player.photo_id} name={player.name} privateAccess={privateAccess} /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          <span className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] ${isHome ? "bg-[#D91B2B] text-white" : "bg-white text-neutral-950"}`}>{isHome ? "Home squad" : "Away squad"}</span>
          <span className="rounded-xl border border-white/20 bg-black/75 px-3 py-1.5 text-3xl font-black tabular-nums tracking-[-.06em] text-white shadow-lg sm:text-4xl">{number}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className={`h-[3px] w-7 rounded-full ${isHome ? "bg-red-500" : "bg-white"}`} />
            <span className="text-[10px] font-bold uppercase tracking-[.18em] text-white/80">Caledon United FC</span>
          </div>
          <h3 className="break-words text-xl font-black uppercase leading-tight text-white sm:text-2xl">{player.name}</h3>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-white/75">{player.position || "Rotating positions"}</p>
        </div>
      </div>
      <div className="flex min-h-14 items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3">
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">{photoAllowed ? "Approved player portrait" : "Official match jersey"}</span>
        {player.can_edit ? (
          <Link href={privateAccess ? "/portal/players" : "/login"} className="inline-flex min-h-11 items-center gap-1.5 text-xs font-black uppercase text-red-700 hover:text-red-900">Manage <ArrowUpRight size={15} aria-hidden="true" /></Link>
        ) : <span className="text-xs font-black uppercase text-neutral-800">#{number}</span>}
      </div>
      {privateAccess && player.can_edit ? <PlayerCardDownload player={player} kit={kit} /> : null}
    </article>
  );
}

function FormationPitch({ snapshot, privateAccess }: { snapshot: RosterSnapshot | null; privateAccess: boolean }) {
  const name = snapshot?.formation?.name || "1-1-2-1";
  const slots = formationSlots[name] || formationSlots["1-1-2-1"];
  const canShowNames = snapshot?.formation?.show_names ?? false;
  const [selected, setSelected] = useState<Player | null>(null);

  return (
    <section className="mt-12 overflow-hidden rounded-[30px] border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-100 px-5 py-7 sm:px-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-red-700">On the pitch</p>
          <h3 className="mt-2 text-2xl font-black uppercase tracking-tight sm:text-3xl">How We Line Up</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">A development-first look at our positions. Players rotate, learn different roles and build their game understanding.</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Formation</p>
          <p className="mt-1 text-lg font-black text-neutral-900">{name === "1-1-2-1" ? "5v5 · 1–2–1 Diamond" : name}</p>
        </div>
      </div>
      <div className="grid gap-7 p-4 sm:p-7 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div
          className="relative mx-auto aspect-[4/5] w-full max-w-[640px] overflow-hidden rounded-[22px] border border-[#236248] bg-[#115437] sm:aspect-[10/9]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0,rgba(255,255,255,.035) 13%,transparent 13%,transparent 26%)" }}
        >
          <div className="absolute inset-[5%] rounded-sm border-2 border-white/45" aria-hidden="true" />
          <div className="absolute left-[5%] right-[5%] top-1/2 h-[2px] bg-white/40" aria-hidden="true" />
          <div className="absolute left-1/2 top-1/2 h-[24%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/45" aria-hidden="true" />
          <div className="absolute left-[29%] right-[29%] top-[5%] h-[14%] border-x-2 border-b-2 border-white/40" aria-hidden="true" />
          <div className="absolute bottom-[5%] left-[29%] right-[29%] h-[14%] border-x-2 border-t-2 border-white/40" aria-hidden="true" />
          {slots.map(({ slot, x, y }) => {
            const player = snapshot?.players.find(p => p.slot === slot && p.active);
            const showName = Boolean(player && canShowNames && (privateAccess || (player.public_visible && player.name_consent)));
            const photoAllowed = Boolean(player?.photo_id && (privateAccess || player.photo_consent) && (privateAccess || canShowNames));
            return (
              <div key={slot} className="absolute z-10 flex w-28 max-w-[29%] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
                style={{left:x+"%",top:y+"%"}}>
                <button type="button" className="flex min-h-14 w-full flex-col items-center rounded-xl text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
                  aria-label={showName&&player?player.name+" · "+slot:"Position "+slot}
                  onClick={()=>setSelected(showName&&player?player:null)}>
                  <span className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-full border-2 border-white bg-[#D71930] text-sm font-black text-white shadow-lg sm:h-16 sm:w-16">
                    {photoAllowed && player?.photo_id
                      ? <ApprovedPortrait id={player.photo_id} name={player.name} privateAccess={privateAccess}/>
                      : <span>{player?.number===null || !player ? slot : player.number}</span>}
                  </span>
                  {showName&&player?<span className="mt-1.5 max-w-full truncate rounded-md bg-[#0B1010]/90 px-2 py-1 text-[10px] font-bold text-white sm:text-xs">{player.name}</span>:null}
                  <span className="mt-1 text-[10px] font-bold text-white">{slot}</span>
                </button>
              </div>
            );
          })}
        </div>
        <aside className="flex flex-col justify-center gap-5 rounded-2xl bg-neutral-50 p-5">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="text-xs font-black uppercase tracking-[.15em] text-red-700">Development approach</div>
            <p className="mt-3 text-xl font-black uppercase leading-snug text-neutral-900">Every player learns every part of the game.</p>
            <p className="mt-3 text-sm leading-6 text-neutral-600">This board is a formation reference—not a fixed starting lineup or a player ranking.</p>
          </div>
          {selected ? (
            <div className="rounded-xl border border-red-200 bg-white p-4 text-sm">
              <p className="text-xs font-black uppercase text-red-700">Selected player</p>
              <p className="mt-2 font-black">{selected.name}{selected.number===null?"":" · #"+selected.number}</p>
              <p className="mt-1 text-neutral-600">{selected.position || "Rotating positions"}</p>
              <button className="mt-3 text-xs font-bold underline" onClick={()=>setSelected(null)}>Close details</button>
            </div>
          ) : <p className="text-xs text-neutral-600">Tap an assigned, approved player marker to view details. Empty markers remain unassigned.</p>}
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs font-semibold text-neutral-700">
            <span className="h-4 w-4 rounded bg-[#D71930]" aria-hidden="true" />
            Positions are shown in red
          </div>
          {privateAccess && snapshot?.manager ? <Link href="/admin/formation" className="btn btn-dark justify-center">Edit Formation</Link> : null}
        </aside>
      </div>
    </section>
  );
}

export function RosterProfiles() {
  const [kit, setKit] = useState<Kit>("home");
  const [publicRoster, setPublicRoster] = useState<RosterSnapshot | null>(null);
  const [privateRoster, setPrivateRoster] = useState<RosterSnapshot | null>(null);
  const [hasSession, setHasSession] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let publicLoaded = false;
    try {
      const publicData = await publicFetch<RosterSnapshot>(endpoints.rosterApi);
      setPublicRoster(publicData);
      publicLoaded = true;
    } catch {
      setPublicRoster(null);
    }
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setHasSession(true);
        try {
          const privateData = await authedFetch<RosterSnapshot>(`${endpoints.rosterApi}?private=true`);
          setPrivateRoster(privateData);
          setMessage(null);
        } catch {
          setPrivateRoster(null);
          setMessage("Some roster details are restricted to verified family accounts or managers. Complete MFA if prompted, or request a family link in the parent portal.");
        }
      } else {
        setHasSession(false);
        setPrivateRoster(null);
        setMessage(publicLoaded ? null : "The live roster is temporarily unavailable. No private player information has been exposed.");
      }
    } catch {
      setHasSession(false);
      setPrivateRoster(null);
      setMessage("The roster access check is temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const privateAccess = privateRoster !== null;
  const chosen = privateRoster ?? publicRoster;
  const visiblePlayers = useMemo(() => {
    const allowed = (chosen?.players ?? []).filter((p) => p.active && (privateAccess || (p.public_visible && p.name_consent)));
    const ordered = [...allowed].sort((a, b) => {
      if (a.number === null && b.number === null) return a.name.localeCompare(b.name);
      if (a.number === null) return 1;
      if (b.number === null) return -1;
      return a.number - b.number;
    });
    return ordered;
  }, [chosen, privateAccess]);

  return (
    <section id="player-roster" className="scroll-mt-28">
      <div className="overflow-hidden rounded-[30px] bg-[#0B0C10] px-5 py-7 text-white shadow-[0_20px_60px_rgba(0,0,0,.13)] sm:px-8 sm:py-9">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-white/15 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-red-400"><Users size={16} aria-hidden="true" /> 2026–27 Squad</div>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-4xl">Our Players</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Meet the team through approved player profiles. Select our red home or white away kit to view the official uniform artwork.</p>
          </div>
          <div className="inline-flex rounded-2xl border border-white/20 bg-white/10 p-1.5" role="group" aria-label="Select match kit">
            <button type="button" aria-pressed={kit === "home"} onClick={() => setKit("home")} className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-xs font-black uppercase transition sm:text-sm ${kit === "home" ? "bg-[#D71930] text-white shadow-lg" : "text-white/75 hover:bg-white/10"}`}><Shirt size={17} aria-hidden="true" /> Home</button>
            <button type="button" aria-pressed={kit === "away"} onClick={() => setKit("away")} className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-xs font-black uppercase transition sm:text-sm ${kit === "away" ? "bg-white text-neutral-950 shadow-lg" : "text-white/75 hover:bg-white/10"}`}><Shirt size={17} aria-hidden="true" /> Away</button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-white/65">
          <div className="inline-flex items-center gap-2"><LockKeyhole size={15} aria-hidden="true" />
            {privateAccess ? (privateRoster?.manager ? "Secure management view" : "Authorized family view") : "Public portraits appear only with guardian approval"}
          </div>
          <div className="flex items-center gap-4">
            {privateRoster?.manager ? <Link href="/admin/players" className="font-bold text-white underline decoration-red-500 underline-offset-4 hover:text-red-300">Manage Players</Link> : null}
            <Link href={hasSession ? "/portal/players" : "/login"} className="font-bold text-white underline decoration-red-500 underline-offset-4 hover:text-red-300">{hasSession ? "My Players" : "Family Login"}</Link>
            <button type="button" disabled={loading} onClick={() => void load()} className="inline-flex min-h-11 items-center gap-1.5 font-bold text-white hover:text-red-300 disabled:opacity-50"><RotateCcw size={15} aria-hidden="true" /> Refresh</button>
          </div>
        </div>
        {message ? <div className="mt-4 flex items-start gap-3 rounded-xl border border-white/15 bg-white/10 p-4 text-sm text-white/85"><ShieldCheck className="shrink-0 text-red-400" size={19} /><p>{message}</p></div> : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            {loading && visiblePlayers.length === 0 ? (
              <div aria-live="polite" className="grid gap-5 sm:grid-cols-2">
                {[0, 1].map((i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-[26px] bg-white/10" aria-hidden="true" />)}
                <span className="sr-only">Loading approved player profiles…</span>
              </div>
            ) : visiblePlayers.length ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {visiblePlayers.map((player) => <PlayerCard key={player.id} player={player} kit={kit} privateAccess={privateAccess} />)}
              </div>
            ) : (
              <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[24px] border border-white/15 bg-white/[.06] p-8 text-center">
                <Image src="/assets/brand/caledon-united-crest.webp?v=crest-20261111-v2" alt="" width={100} height={100} unoptimized className="h-20 w-20 object-contain opacity-75" />
                <h3 className="mt-6 text-xl font-black uppercase">Squad profiles are private</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">Player names and portraits will be shown here when guardian permissions allow them. Authorized families can sign in to see the profiles available to their account.</p>
                <Link href="/login" className="btn btn-primary mt-6">Open Family Portal</Link>
              </div>
            )}
          </div>

          <aside className="self-start overflow-hidden rounded-[24px] bg-white text-neutral-950">
            <div className="border-b border-neutral-200 px-5 py-5">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-700">Official teamwear</p>
              <h3 className="mt-1 text-xl font-black uppercase">{kit === "home" ? "Home Match Kit" : "Away Match Kit"}</h3>
              <p className="mt-1 text-xs font-medium text-neutral-600">{kit === "home" ? "Red jersey · Black shorts · Red socks" : "White jersey · Black shorts · White socks"}</p>
            </div>
            <div className="bg-neutral-50">
              <Image
                src={kit === "home" ? "/kit/home-match-kit-caledon-united-2026.jpg" : "/kit/away-match-kit-caledon-united-2026.jpg"}
                alt={kit === "home" ? "Caledon United FC red home kit front and back" : "Caledon United FC white away kit front and back"}
                width={1122}
                height={1402}
                sizes="(max-width: 1023px) 100vw, 300px"
                className="h-auto w-full"
              />
            </div>
            <div className="border-t border-neutral-200 px-5 py-4">
              <p className="text-xs leading-5 text-neutral-600">Illustrative teamwear reference. Name and number shown on the sample jersey are examples.</p>
              <Link href="/kit" className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs font-black uppercase text-red-700 hover:text-red-900">View the full kit collection <ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
          </aside>
        </div>
      </div>

      <FormationPitch snapshot={chosen} privateAccess={privateAccess} />
    </section>
  );
}