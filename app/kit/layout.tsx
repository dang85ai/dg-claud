import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Team Kit",
  description: "Caledon SC U9 Girls 2026 home and away kits, tracksuit, jacket, backpack, sizing, SKUs and ordering guidance.",
  alternates: { canonical: "/kit" },
  openGraph: {
    title: "Team Kit | Caledon U9 Girls 2026",
    description: "Caledon SC U9 Girls 2026 home and away kits, tracksuit, jacket, backpack, sizing, SKUs and ordering guidance.",
    url: "/kit"
  }
};

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
