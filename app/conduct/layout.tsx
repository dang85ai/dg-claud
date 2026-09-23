import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Code of Conduct",
  description: "Player and parent expectations for respect, sportsmanship and constructive communication on Caledon SC U9 Girls 2026.",
  alternates: { canonical: "/conduct" },
  openGraph: {
    title: "Code of Conduct | Caledon U9 Girls 2026",
    description: "Player and parent expectations for respect, sportsmanship and constructive communication on Caledon SC U9 Girls 2026.",
    url: "/conduct"
  }
};

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
