import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Team Kit & Accessories",
  description: "Explore Caledon United FC 2018 Girls home and away kits, training wear and accessories. Get sizing tips and request team kit.",
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
