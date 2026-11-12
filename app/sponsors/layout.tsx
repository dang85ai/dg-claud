import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sponsors & Fundraising",
  description: "Sponsorship opportunities, package placements and fundraising information for Caledon United FC 2018 Girls 2026–27.",
  alternates: { canonical: "/sponsors" },
  openGraph: {
    title: "Sponsors & Fundraising | Caledon United FC 2018 Girls 2026–27",
    description: "Sponsorship opportunities, package placements and fundraising information for Caledon United FC 2018 Girls 2026–27.",
    url: "/sponsors"
  }
};

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
