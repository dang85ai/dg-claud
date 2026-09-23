import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Team Roster",
  description: "Consent-controlled roster information for Caledon SC U9 Girls 2026, with public player data intentionally limited.",
  alternates: { canonical: "/roster" },
  openGraph: {
    title: "Team Roster | Caledon U9 Girls 2026",
    description: "Consent-controlled roster information for Caledon SC U9 Girls 2026, with public player data intentionally limited.",
    url: "/roster"
  }
};

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
