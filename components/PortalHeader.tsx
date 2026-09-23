"use client";

import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function PortalHeader({
  title,
  isAdmin = false
}: {
  title: string;
  isAdmin?: boolean;
}) {
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="container flex min-h-18 items-center justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[.16em] text-red-600">
            {isAdmin ? "Command Centre" : "Private Team Portal"}
          </div>
          <div className="mt-1 text-lg font-black uppercase">{title}</div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="hidden items-center gap-2 rounded-full bg-black px-3 py-2 text-xs font-black uppercase text-white sm:flex">
              <ShieldCheck size={15} /> MFA Protected
            </div>
          ) : null}
          <Link href="/" className="btn btn-light !min-h-11 !px-4 text-sm">Team Site</Link>
          <button onClick={signOut} className="btn btn-dark !min-h-11 !px-4 text-sm">
            <LogOut size={16} /> <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
