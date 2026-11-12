import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Team Roster",
  description: "Consent-controlled Caledon United FC 2018 Girls roster information. Player identity information is intentionally excluded from search indexing.",
  path: "/roster",
  index: false
});

export default function RouteLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
