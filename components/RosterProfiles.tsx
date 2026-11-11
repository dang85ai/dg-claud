"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, LockKeyhole, RotateCcw, ShieldCheck, Shirt, UserRound, Users } from "lucide-react";
import { authedFetch, endpoints, publicFetch } from "@/lib/api";
import { SUPABASE_PUBLISHABLE_KEY, supabase } from "@/lib/supabase";

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
const DEFAULT_SQUAD_SIZE = 9;
const formationSlots: Record<string, Array<{ slot: string; x: number; y: number }>> = {
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

function KitIllustration({ kit, number }: { kit: Kit; number: number | null }) {
  const home = kit === "home";
  const primary = home ? "#C41523" : "#FAFAFA";
  const shadow = home ? "#880C19" : "#D9DDE1";
  const accents = home ? "#FFFFFF" : "#141517";
  const backNumber = number === null ? "—" : String(number);
  return (
    <svg viewBox="0 0 270 340" role="img" aria-label={`${home ? "Red home" : "White away"} football uniform illustration`} className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={home ? "roster-home-jersey" : "roster-away-jersey"} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={primary} />
          <stop offset="1" stopColor={shadow} />
        </linearGradient>
        <linearGradient id={home ? "roster-home-ground" : "roster-away-ground"} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={home ? "#FDE9EB" : "#F4F4F4"} />
          <stop offset="1" stopColor={home ? "#F4D6D9" : "#E6EAED"} />
        </linearGradient>
      </defs>
      <rect width="270" height="340" rx="18" fill={`url(#${home ? "roster-home-ground" : "roster-away-ground"})`} />
      <ellipse cx="135" cy="309" rx="89" ry="13" fill="#121212" opacity="0.12" />
      {/* T-shirt; side panels and shoulder stripes deliberately mimic the team kit silhouette. */}
      <path d="M94 44 L118 35 Q135 43 152 35 L176 44 L221 80 L200 116 L176 102 L176 211 L94 211 L94 102 L70 116 L49 80 Z" fill={`url(#${home ? "roster-home-jersey" : "roster-away-jersey"})`} stroke={home ? "#990E1C" : "#CDD1D7"} strokeWidth="2" />
      <path d="M116 36 Q135 57 154 36" stroke={accents} strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M94 45 L65 84 M102 48 L72 87 M108 51 L79 90 M176 45 L205 84 M168 48 L198 87 M162 51 L191 90" stroke={accents} strokeWidth="3.8" opacity="0.9" />
      <path d="M95 205 L175 205 L174 240 L139 236 L135 259 L129 236 L96 240 Z" fill="#17191D" />
      <path d="M100 211 L101 237 M106 211 L107 239 M164 211 L165 239 M170 211 L171 238" stroke="#ECECEC" strokeWidth="2" />
      <path d="M104 242 L128 245 L128 287 L101 287 Z M143 245 L166 242 L170 287 L143 287 Z" fill={home ? "#C41523" : "#F9FAFB"} stroke={home ? "#970E1A" : "#D2D8DE"} strokeWidth="1" />
      <path d="M103 264 L127 264 M103 272 L127 272 M145 264 L168 264 M145 272 L169 272" stroke={home ? "#FFFFFF" : "#18191D"} strokeWidth="4" />
      <path d="M101 283 L128 283 L135 295 L130 302 L88 302 L90 290 Z M145 283 L170 283 L182 292 L181 302 L140 302 L137 296 Z" fill="#1A1A1A" />
      <path d="M100 302 L131 302 M145 302 L179 302" stroke="#FFFFFF" strokeWidth="3" />
      <image href="/assets/brand/caledon-united-crest.webp" x="151" y="74" width="23" height="23" preserveAspectRatio="xMidYMid meet" />
      <text x="135" y="150" fontFamily="Arial, sans-serif" fontSize={backNumber === "—" ? "54" : "50"} fontWeight="900" textAnchor="middle" fill={accents}>{backNumber}</text>
      <text x="135" y="181" fontFamily="Arial, sans-serif" fontSize="8.5" fontWeight="800" letterSpacing="2" textAnchor="middle" fill={accents}>CALEDON UNITED</text>
    </svg>
  );
}

function ApprovedPortrait({ id, name, privateAccess }: { id: string; name: string; privateAccess: boolean }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    let blobUrl: string | null = null;
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
        blobUrl = URL.createObjectURL(dataBlob);
        if (active) setSrc(blobUrl);
      } catch { /* Missing or revoked photo consent: retain the neutral avatar. */ }
    })();
    return () => {
      active = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [id, privateAccess]);
  return src ? (
    // Private media is fetched with short-lived authorization and never turned into a public asset path.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={`Approved portrait of ${name}`} className="h-full w-full rounded-full object-cover" />
  ) : <UserRound aria-hidden="true" size={26} className="text-neutral-400" />;
}

function PlayerTile({ player, index, kit, privateAccess }: { player: Player | null; index: number; kit: Kit; privateAccess: boolean }) {
  const revealed = !!player;
  const name = revealed ? player.name : "Squad Member";
  return (
    <article className="card group overflow-hidden">
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        <KitIllustration kit={kit} number={player?.number ?? null} />
        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-800 shadow-sm">
          {kit === "home" ? "Home · Red" : "Away · White"}
        </div>
        {player?.photo_id ? <div className="absolute bottom-3 right-3 grid h-16 w-16 place-items-center overflow-hidden rounded-full border-4 border-white bg-white shadow-lg sm:h-20 sm:w-20">
          <ApprovedPortrait id={player.photo_id} name={player.name} privateAccess={privateAccess} />
        </div> : null}
      </div>
      <div className="p-4">
        <div className="text-[10px] font-black uppercase tracking-[.14em] text-red-700">2026–27 Squad · {index + 1}</div>
        <h3 className="mt-1 min-h-12 break-words text-lg font-black uppercase leading-tight sm:text-xl">{name}</h3>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-neutral-600">
          <span>{revealed && player.number !== null ? `#${player.number}` : "Number pending"}</span>
          <span>{revealed ? player.position || "Rotating positions" : "Private profile"}</span>
        </div>
        {player?.can_edit ? <Link href={privateAccess ? "/portal/players" : "/login"} className="mt-4 block rounded-xl border border-neutral-200 p-2 text-center text-xs font-black uppercase text-neutral-700 hover:border-red-500 hover:text-red-600">Manage Player</Link> : null}
      </div>
    </article>
  );
}

function FormationPitch({ snapshot, privateAccess }: { snapshot: RosterSnapshot | null; privateAccess: boolean }) {
  const name = snapshot?.formation?.name || "1-2-1-1";
  const slots = formationSlots[name] || formationSlots["1-2-1-1"];
  const canShowNames = snapshot?.formation?.show_names ?? false;
  return (
    <section className="mt-10 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
      <div className="flex flex-wrap items-end justify-between gap-3 p-6">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-red-700">Tactical Lineup</div>
          <h3 className="mt-2 text-2xl font-black uppercase">Team Formation</h3>
          <p className="mt-2 text-sm text-neutral-600">Positions rotate during development. Only approved identities appear in the lineup.</p>
        </div>
        <span className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-black uppercase text-neutral-700">{slots.length}v{slots.length} · {name}</span>
      </div>
      <div className="mx-4 mb-4 sm:mx-6 sm:mb-6">
        <div className="relative aspect-[5/6] max-h-[520px] min-h-[350px] overflow-hidden rounded-2xl bg-[#17683C] sm:aspect-[16/10]">
          <div className="absolute inset-4 rounded-md border-2 border-white/55" />
          <div className="absolute left-4 right-4 top-1/2 h-px bg-white/60" />
          <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/60 sm:h-32 sm:w-32" />
          <div className="absolute left-1/4 right-1/4 top-4 h-[14%] border-x-2 border-b-2 border-white/60" />
          <div className="absolute bottom-4 left-1/4 right-1/4 h-[14%] border-x-2 border-t-2 border-white/60" />
          {slots.map(({ slot, x, y }) => {
            const player = snapshot?.players.find((p) => p.slot === slot && p.active);
            // The backend only returns players/slots permitted for this viewer.
            // For unapproved public profiles, show only generic slot names.
            const displayName = player && (privateAccess || (player.public_visible && player.name_consent)) && canShowNames ? player.name : null;
            return <div key={slot} className="absolute z-10 flex w-[100px] max-w-[26%] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center" style={{ left: `${x}%`, top: `${y}%` }}>
              <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-[#BE172A] text-[10px] font-black text-white shadow-lg sm:h-12 sm:w-12 sm:text-xs">{slot}</div>
              {displayName ? <span className="mt-1 max-w-full truncate rounded bg-black/70 px-2 py-1 text-[10px] font-bold text-white sm:text-xs">{displayName}</span> : null}
            </div>;
          })}
        </div>
      </div>
      {privateAccess && snapshot?.manager ? <div className="border-t border-neutral-200 p-5 text-center"><Link href="/admin/formation" className="btn btn-light">Edit Formation</Link></div> : null}
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
    return Array.from({ length: Math.max(DEFAULT_SQUAD_SIZE, ordered.length) }, (_, index) => ordered[index] ?? null);
  }, [chosen, privateAccess]);

  return (
    <section id="player-roster" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.15em] text-red-700"><Users size={16} aria-hidden="true" /> 2026–27 Team Roster</div>
          <h2 className="mt-2 text-3xl font-black uppercase">Meet the Squad</h2>
          <p className="mt-3 max-w-2xl text-sm text-neutral-600">
            Explore our home and away jerseys. Names, jersey numbers and approved player photographs appear according to the team's guardian-consent and account-access settings.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white p-1 shadow-sm" role="group" aria-label="Select team jersey">
          <button type="button" aria-pressed={kit === "home"} onClick={() => setKit("home")} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold transition ${kit === "home" ? "bg-[#BA1728] text-white" : "text-neutral-700 hover:bg-neutral-100"}`}><Shirt size={16} aria-hidden="true" /> Home · Red</button>
          <button type="button" aria-pressed={kit === "away"} onClick={() => setKit("away")} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold transition ${kit === "away" ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"}`}><Shirt size={16} aria-hidden="true" /> Away · White</button>
        </div>
      </div>

      {message ? <div className="notice mt-5 flex items-start gap-2 text-sm"><ShieldCheck size={18} className="shrink-0 text-red-700" /><p>{message}</p></div> : null}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-neutral-100 px-4 py-3 text-xs text-neutral-600">
        <span className="inline-flex items-center gap-2"><LockKeyhole size={15} aria-hidden="true" /> {privateAccess ? (privateRoster?.manager ? "Manager roster view · secured with MFA" : "Private family roster view") : "Public profiles require guardian approval"}</span>
        <div className="flex flex-wrap items-center gap-3">
          {privateRoster?.manager ? <Link href="/admin/players" className="font-black text-red-700 underline underline-offset-2">Manage Players</Link> : null}
          {hasSession ? <Link href="/portal/players" className="font-black text-red-700 underline underline-offset-2">My Players</Link> : <Link href="/login" className="font-black text-red-700 underline underline-offset-2">Family Login</Link>}
          <button type="button" disabled={loading} onClick={() => void load()} className="inline-flex items-center gap-1 font-black text-neutral-700 hover:text-red-700 disabled:opacity-50"><RotateCcw size={14} /> Refresh</button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visiblePlayers.map((player, index) => <PlayerTile key={player?.id ?? `private-placeholder-${index}`} player={player} index={index} kit={kit} privateAccess={privateAccess} />)}
      </div>
      {loading ? <div aria-live="polite" className="mt-4 text-sm text-neutral-500">Checking current roster permissions…</div> : null}
      {visiblePlayers.every((p) => p === null) ? <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 text-sm text-neutral-700">
        <p><strong>Player information is not public yet.</strong> The squad is registered, but player names and portraits are shown only after the required guardian approvals. Authorized families and managers can sign in to view their linked player records.</p>
      </div> : null}
      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-neutral-500"><ChevronLeft size={14} aria-hidden="true" /> Switch between red home and white away player cards <ChevronRight size={14} aria-hidden="true" /></div>
      <FormationPitch snapshot={chosen} privateAccess={privateAccess} />
    </section>
  );
}