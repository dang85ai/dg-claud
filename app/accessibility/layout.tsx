import { buildPageMetadata } from "@/lib/seo";
import type { ReactNode } from "react";

export const metadata = buildPageMetadata({
  title: "Accessibility",
  description: "Accessibility commitments for the Caledon United FC 2018 Girls 2026–27 team website.",
  path: "/accessibility"
});

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
