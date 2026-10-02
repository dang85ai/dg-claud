"use client";

import { useId, useState } from "react";

type Player = { name: string; number: number | null };

function KitIllustration({ away, number }: { away: boolean; number: number | null }) {
  const id = useId().replace(/:/g, "");
  const shirt = away ? "#f8fafc" : "#202126";
  const trim = away ? "#17181c" : "#ffffff";
  const sock = away ? "#f8fafc" : "#202126";
  return (
    <svg viewBox="0 0 260 350" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={id + "bg"}><stop stopColor="#fee2e2" /><stop offset="1" stopColor="#f5f5f5" /></radialGradient>
        <linearGradient id={id + "skin"} x2="1" y2="1"><stop stopColor="#d9ac87" /><stop offset="1" stopColor="#bd8866" /></linearGradient>
      </defs>
      <rect width="260" height="350" fill={"url(#" + id + "bg)"} />
      <circle cx="130" cy="149" r="103" fill="none" stroke="#fff" strokeWidth="1.5" />
      <circle cx="130" cy="149" r="83" fill="none" stroke="#fff" />
      <text x="16" y="27" fontSize="10" letterSpacing="2" fill="#b91c1c" fontWeight="700">CALEDON · U9</text>
      <ellipse cx="132" cy="325" rx="61" ry="7" fill="#171717" opacity=".1" />
      {/* Generic illustration: no likeness or appearance is inferred from the roster. */}
      <path d="M149 46 C182 25 188 57 175 87 C168 99 159 82 157 68Z" fill="#302725" />
      <circle cx="130" cy="59" r="31" fill="#302725" />
      <path d="M110 63 Q106 89 130 98 Q154 89 151 61 L130 49Z" fill={"url(#" + id + "skin)"} />
      <path d="M102 65 Q96 34 131 31 Q164 33 156 67 Q139 51 110 54Z" fill="#302725" />
      <path d="M121 90 L121 107 L139 107 L139 90" fill="#c79672" />
      <path d="M93 122 L76 170 Q72 181 80 185 Q88 188 92 176 L108 134 M167 122 L184 170 Q188 181 180 185 Q172 188 168 176 L152 134" fill={"url(#" + id + "skin)"} />
      <g style={{ transition: "fill 240ms ease" }} fill={shirt} stroke="#9ca3af" strokeWidth=".8">
        <path d="M119 100 L101 105 L80 130 L98 141 L105 133 L103 191 Q130 198 157 191 L155 133 L162 141 L180 130 L159 105 L141 100 L130 110Z" />
      </g>
      <path d="M119 101 L130 112 L141 101" fill="none" stroke={trim} strokeWidth="3" />
      <g fill="none" stroke={trim} strokeWidth="2">
        <path d="M104 107 L87 129 M108 108 L91 132 M112 109 L95 135 M156 107 L173 129 M152 108 L169 132 M148 109 L165 135" />
        <path d="M83 131 L97 139 M177 131 L163 139" strokeWidth="3" />
      </g>
      <circle cx="145" cy="130" r="9" fill="#dc001b" stroke="#fff" strokeWidth="1.5" />
      <text x="145" y="133" textAnchor="middle" fill="white" fontSize="6" fontWeight="900">CSC</text>
      <text x="115" y="132" textAnchor="middle" fill={trim} fontSize="7" fontWeight="800">U9</text>
      <rect x="113" y="148" width="35" height="22" rx="3" fill="none" stroke={trim} opacity=".65" />
      <text x="130" y="163" textAnchor="middle" fill={trim} fontSize="8" fontWeight="800">CALEDON</text>
      <path d="M108 146 L107 184 M151 146 L153 184" stroke={trim} fill="none" opacity=".12" />
      <path d="M104 190 Q130 196 156 190 L162 229 L138 232 L130 213 L122 232 L98 229Z" fill="#17181c" />
      <path d="M103 195 L100 225 M107 196 L104 226 M111 196 L108 226 M149 196 L152 226 M153 196 L156 226 M157 195 L160 225" stroke="white" strokeWidth="1.6" />
      {number !== null && <text x="115" y="217" fill="white" fontSize="14" textAnchor="middle" fontWeight="900">{number}</text>}
      <path d="M102 230 L105 267 L119 267 L121 231 M139 231 L141 267 L155 267 L158 230" fill={"url(#" + id + "skin)"} />
      <path d="M105 257 L105 308 L121 308 L119 257 M141 257 L139 308 L155 308 L155 257" fill={sock} stroke="#9ca3af" strokeWidth=".7" />
      <path d="M106 264 L119 264 M106 269 L119 269 M106 274 L119 274 M142 264 L154 264 M142 269 L154 269 M141 274 L154 274" stroke={trim} strokeWidth="2" />
      <path d="M105 302 Q99 304 92 316 Q91 325 120 319 L121 302Z M140 302 L140 319 Q169 325 168 316 Q161 304 155 302Z" fill="#27272a" />
      <path d="M96 319 L119 317 M142 317 L165 319" stroke="#fafafa" strokeWidth="2" />
      <circle cx="192" cy="305" r="18" fill="#fff" stroke="#737373" />
      <path d="M192 295 L201 302 L197 313 L186 313 L183 302Z" fill="#27272a" />
      <path d="M192 295 L192 287 M201 302 L209 300 M197 313 L202 320 M186 313 L181 320 M183 302 L175 300" stroke="#27272a" />
    </svg>
  );
}

export function PlayerKitCard({ name, number }: Player) {
  const [selectedAway, setSelectedAway] = useState(false);
  const [hovered, setHovered] = useState(false);
  const away = selectedAway || hovered;
  return (
    <article className="card min-w-0 overflow-hidden">
      <button
        type="button"
        aria-label={name + ": " + (away ? "away" : "home") + " kit illustration. Tap to switch kit."}
        aria-pressed={selectedAway}
        onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
        onPointerLeave={() => setHovered(false)}
        onClick={() => setSelectedAway(!selectedAway)}
        className="relative block aspect-[26/35] w-full overflow-hidden focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-red-600"
      >
        <KitIllustration away={away} number={number} />
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-neutral-900">{away ? "Away · White" : "Home · Black"}</span>
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-neutral-600">Kit illustration</span>
      </button>
      <div className="p-4">
        <div className="text-xs font-black uppercase tracking-[.12em] text-red-600">Squad</div>
        <h3 className="mt-1 break-words text-xl font-black uppercase">{name}</h3>
        <p className="mt-2 text-sm text-neutral-500">{number !== null ? "#" + number : "Number pending"}</p>
        <div className="mt-4 flex gap-2" aria-label={name + " kit selection"}>
          <button type="button" aria-pressed={!away} onClick={() => { setSelectedAway(false); setHovered(false); }} className={"min-h-11 flex-1 rounded-xl border px-2 text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600 " + (!away ? "border-black bg-black text-white" : "border-neutral-200 bg-white text-neutral-700")}>Home</button>
          <button type="button" aria-pressed={away} onClick={() => setSelectedAway(true)} className={"min-h-11 flex-1 rounded-xl border px-2 text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600 " + (away ? "border-black bg-black text-white" : "border-neutral-200 bg-white text-neutral-700")}>Away</button>
        </div>
      </div>
    </article>
  );
}
