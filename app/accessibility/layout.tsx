import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "Accessibility commitments for the Caledon SC U9 Girls 2026 team website.",
  alternates: { canonical: "/accessibility" },
  openGraph: {
    title: "Accessibility | Caledon U9 Girls 2026",
    description: "Accessibility commitments for the Caledon SC U9 Girls 2026 team website.",
    url: "/accessibility"
  }
};

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
