import { buildPageMetadata } from "@/lib/seo";
import type { ReactNode } from "react";

export const metadata = buildPageMetadata({
  title: "Player Development",
  description: "U9 player-development priorities, home-practice ideas and parent guidance for Caledon United FC 2018 Girls 2026–27.",
  path: "/development"
});

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
