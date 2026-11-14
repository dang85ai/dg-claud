"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, Shield, X } from "lucide-react";
import { useState } from "react";

const nav = [
  ["Team", "/roster"],
  ["Schedule", "/schedule"],
  ["Kit", "/kit"],
  ["Order", "/order"],
  ["Media", "/media"],
  ["Sponsors", "/sponsors"],
  ["Parent Resources", "/parents"],
  ["About", "/about"],
  ["Contact", "/contact"]
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white">
      <div className="container flex min-h-22 items-center justify-between gap-4 py-3 xl:min-h-26">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2 font-black uppercase tracking-tight sm:gap-3">
          <Image
            src="/assets/brand/caledon-united-crest.webp?v=crest-20261111-v2"
            alt="Caledon United Football Club crest"
            width={72}
            height={72}
            priority
            unoptimized
            className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16 xl:h-18 xl:w-18"
          />
          <div className="min-w-0 leading-none">
            <div className="truncate text-xs sm:text-sm">Caledon United FC</div>
            <div className="mt-1 text-[10px] tracking-[.08em] text-white/65 sm:text-xs sm:tracking-[.14em]">
              2018 Girls · 2026–27
            </div>
          </div>
        </Link>

        <nav aria-label="Primary navigation" className="hidden shrink-0 items-center gap-5 whitespace-nowrap xl:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="py-4 text-sm font-bold hover:text-red-400 xl:text-base">
              {label}
            </Link>
          ))}
          <Link href="/login" className="btn btn-primary !min-h-12 !px-4 text-sm xl:text-base">
            <Shield size={17} aria-hidden="true" />
            Sign In
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/20 xl:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <nav aria-label="Mobile navigation" className="max-h-[calc(100dvh-5.5rem)] overflow-y-auto border-t border-white/10 bg-black px-4 pb-5 xl:hidden">
          <div className="container grid">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center border-b border-white/10 font-bold"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="btn btn-primary mt-4"
            >
              Sign In
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}


