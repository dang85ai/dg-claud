import { buildPageMetadata } from "@/lib/seo";
import type { ReactNode } from "react";

export const metadata = buildPageMetadata({
  title: "Code of Conduct",
  description: "Player and parent expectations for respect, sportsmanship and constructive communication on Caledon United FC 2018 Girls 2026–27.",
  path: "/conduct"
});

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
