import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Player Development",
  description: "U9 player-development priorities, home-practice ideas and parent guidance for Caledon SC U9 Girls 2026.",
  alternates: { canonical: "/development" },
  openGraph: {
    title: "Player Development | Caledon U9 Girls 2026",
    description: "U9 player-development priorities, home-practice ideas and parent guidance for Caledon SC U9 Girls 2026.",
    url: "/development"
  }
};

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
