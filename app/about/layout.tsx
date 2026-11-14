import { buildPageMetadata } from "@/lib/seo";
import type { ReactNode } from "react";

export const metadata = buildPageMetadata({
  title: "About the Team",
  description: "Learn about Caledon United FC 2018 Girls 2026–27 development goals, player pathway and team philosophy.",
  path: "/about"
});

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
