"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpenCheck,
  CalendarDays,
  ClipboardList,
  Home,
  LogOut,
  Package,
  ShieldCheck,
  Shirt,
  SlidersHorizontal,
  Users
} from "lucide-react";
import type { ComponentType } from "react";
import { supabase } from "@/lib/supabase";

type PortalNavItem = {
  label: string;
  href: string;
  Icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
};

const parentNavigation: PortalNavItem[] = [
  { label: "Dashboard", href: "/portal", Icon: Home },
  { label: "My Players", href: "/portal/players", Icon: Users },
  { label: "Team Schedule", href: "/portal/schedule", Icon: CalendarDays },
  { label: "Parent Tools", href: "/portal/tools", Icon: ClipboardList },
  { label: "Training", href: "/portal/training", Icon: BookOpenCheck },
  { label: "Team Kit", href: "/kit", Icon: Shirt },
  { label: "Kit Request", href: "/order", Icon: Package }
];

const managementNavigation: PortalNavItem[] = [
  { label: "Dashboard", href: "/admin", Icon: Home },
  { label: "Team Operations", href: "/admin/operations", Icon: SlidersHorizontal },
  { label: "Player Administration", href: "/admin/players", Icon: Users },
  { label: "Family Links", href: "/admin/families", Icon: Users },
  { label: "Formation", href: "/admin/formation", Icon: ClipboardList },
  { label: "Accounts", href: "/admin/accounts", Icon: ShieldCheck },
  { label: "Spond", href: "/admin/spond", Icon: CalendarDays },
  { label: "Sponsors", href: "/admin/sponsors", Icon: Users },
  { label: "Management Tools", href: "/admin/manage", Icon: SlidersHorizontal },
  { label: "Team Kit", href: "/kit", Icon: Shirt },
  { label: "Kit Request", href: "/order", Icon: Package }
];

export function PortalHeader({
  title,
  isAdmin = false
}: {
  title: string;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const navigation = isAdmin ? managementNavigation : parentNavigation;

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="container flex min-h-18 items-center justify-between gap-4 py-3">
        <div className="min-w-0">
          <div className="text-xs font-black uppercase tracking-[.16em] text-red-600">
            {isAdmin ? "Command Centre" : "Private Team Portal"}
          </div>
          <div className="mt-1 text-base font-black uppercase sm:text-lg">{title}</div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isAdmin ? (
            <div className="hidden items-center gap-2 rounded-full bg-black px-3 py-2 text-xs font-black uppercase text-white lg:flex">
              <ShieldCheck size={15} aria-hidden /> MFA Protected
            </div>
          ) : null}
          <Link href="/" className="btn btn-light !min-h-11 !px-3 text-sm sm:!px-4">Team Site</Link>
          <button type="button" onClick={signOut} aria-label="Sign out" className="btn btn-dark !min-h-11 !px-3 text-sm sm:!px-4">
            <LogOut size={16} aria-hidden /> <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      <nav
        aria-label={isAdmin ? "Management portal navigation" : "Parent portal navigation"}
        className="border-t border-neutral-200 bg-neutral-50"
      >
        <div className="container">
          <div className="flex max-w-full gap-1 overflow-x-auto py-2" role="list">
            {navigation.map(({ label, href, Icon }) => {
              const active = pathname === href || (href.startsWith(isAdmin ? "/admin/" : "/portal/") && pathname.startsWith(href + "/"));
              return (
                <div role="listitem" key={href} className="shrink-0">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={
                      "inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 " +
                      (active
                        ? "bg-black text-white"
                        : "text-neutral-700 hover:bg-white hover:text-red-600")
                    }
                  >
                    <Icon size={17} aria-hidden />
                    {label}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}
