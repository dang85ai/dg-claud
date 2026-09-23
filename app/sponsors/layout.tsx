import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sponsors & Fundraising",
  description: "Sponsorship opportunities, package placements and fundraising information for Caledon SC U9 Girls 2026.",
  alternates: { canonical: "/sponsors" },
  openGraph: {
    title: "Sponsors & Fundraising | Caledon U9 Girls 2026",
    description: "Sponsorship opportunities, package placements and fundraising information for Caledon SC U9 Girls 2026.",
    url: "/sponsors"
  }
};

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
