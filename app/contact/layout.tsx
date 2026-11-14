import { buildPageMetadata } from "@/lib/seo";
import type { ReactNode } from "react";

export const metadata = buildPageMetadata({
  title: "Contact the Team",
  description: "Contact the Caledon United FC 2018 Girls 2026–27 team manager and find verified club contact information.",
  path: "/contact"
});

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
