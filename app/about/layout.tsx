import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About the Team",
  description: "Learn about Caledon SC U9 Girls 2026 development goals, player pathway and team philosophy.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About the Team | Caledon U9 Girls 2026",
    description: "Learn about Caledon SC U9 Girls 2026 development goals, player pathway and team philosophy.",
    url: "/about"
  }
};

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
