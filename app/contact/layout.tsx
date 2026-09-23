import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contact the Team",
  description: "Contact the Caledon SC U9 Girls 2026 team manager and find verified club contact information.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact the Team | Caledon U9 Girls 2026",
    description: "Contact the Caledon SC U9 Girls 2026 team manager and find verified club contact information.",
    url: "/contact"
  }
};

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
