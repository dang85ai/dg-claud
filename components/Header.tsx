"use client";

import Link from "next/link";
import { Menu, Shield, X } from "lucide-react";
import { useState } from "react";

const nav = [
  ["Team", "/roster"],
  ["Schedule", "/schedule"],
  ["Kit", "/kit"],
  ["Media", "/media"],
  ["Sponsors", "/sponsors"],
  ["About", "/about"],
  ["Contact", "/contact"]
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white">
      <div className="container flex min-h-18 items-center justify-between gap-4">
        <Link href="/" className="flex min-h-12 items-center gap-3 font-black uppercase tracking-tight">
          <div
            aria-hidden="true"
            className="grid h-11 w-11 place-items-center rounded-full border-2 border-white bg-red-600 text-[11px] font-black"
          >
            CSC
          </div>
          <div className="leading-none">
            <div className="text-sm">Caledon Soccer Club</div>
            <div className="mt-1 text-xs tracking-[.16em] text-white/65">U9 Girls · 2026</div>
          </div>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-5 lg:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="py-4 text-sm font-bold hover:text-red-400">
              {label}
            </Link>
          ))}
          <Link href="/login" className="btn btn-primary !min-h-11 !px-4 text-sm">
            <Shield size={17} aria-hidden="true" />
            Parent Login
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          className="grid h-12 w-12 place-items-center rounded-xl border border-white/20 lg:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <nav aria-label="Mobile navigation" className="border-t border-white/10 bg-black px-4 pb-5 lg:hidden">
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
              Parent / Manager Login
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
