import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Team Kit & Accessories",
  description: "Browse the Caledon United FC 2018 Girls 2026–27 home and away match kits, track suit, outdoor jacket and team backpack. See the designs and send a separate order request.",
  alternates: { canonical: "/kit" },
  openGraph: {
    title: "Team Kit & Accessories | Caledon United FC 2018 Girls",
    description: "Explore the five-piece Caledon United FC 2018 Girls teamwear collection, including match kits and accessories.",
    url: "/kit"
  }
};

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
