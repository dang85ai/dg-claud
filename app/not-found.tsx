import type { Metadata } from "next";
import Link from "next/link";
import { CircleOff, CalendarDays, Shirt, Users, Mail } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";

export const metadata: Metadata = {
  title: "Page Not Found | Caledon U9 Girls 2026",
  robots: {
    index: false,
    follow: true
  }
};

export default function NotFound() {
  return (
    <PublicShell>
      <section className="section">
        <div className="container max-w-4xl">
          <div className="card overflow-hidden">
            <div className="bg-black p-8 text-white md:p-12">
              <CircleOff className="text-red-500" size={42} />
              <div className="mt-6 text-sm font-black uppercase tracking-[.16em] text-red-500">404 · Page Not Found</div>
              <h1 className="mt-3 text-4xl font-black uppercase tracking-tight md:text-6xl">
                That page took a wrong turn on the field.
              </h1>
              <p className="mt-5 max-w-2xl text-white/70">
                The link may be outdated or the page may have moved. Use one of the team shortcuts below to get back in play.
              </p>
            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-2 md:p-8">
              <Link href="/schedule" className="card flex items-center gap-3 p-4 hover:border-red-500">
                <CalendarDays className="text-red-600" size={20} />
                <span className="font-black">Schedule</span>
              </Link>
              <Link href="/roster" className="card flex items-center gap-3 p-4 hover:border-red-500">
                <Users className="text-red-600" size={20} />
                <span className="font-black">Roster</span>
              </Link>
              <Link href="/kit" className="card flex items-center gap-3 p-4 hover:border-red-500">
                <Shirt className="text-red-600" size={20} />
                <span className="font-black">Team Kit</span>
              </Link>
              <Link href="/contact" className="card flex items-center gap-3 p-4 hover:border-red-500">
                <Mail className="text-red-600" size={20} />
                <span className="font-black">Contact</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
