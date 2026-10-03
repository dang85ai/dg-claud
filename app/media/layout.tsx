import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Photos & Media",
  description: "Consent-controlled Caledon U9 Girls team media. Public gallery content is intentionally excluded from search indexing.",
  path: "/media",
  index: false
});

export default function RouteLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
