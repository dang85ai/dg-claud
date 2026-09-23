import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Privacy & Youth Safety",
  description: "Privacy and youth-safety information for the Caledon SC U9 Girls 2026 team website.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy & Youth Safety | Caledon U9 Girls 2026",
    description: "Privacy and youth-safety information for the Caledon SC U9 Girls 2026 team website.",
    url: "/privacy"
  }
};

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
