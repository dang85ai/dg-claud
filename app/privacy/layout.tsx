import { buildPageMetadata } from "@/lib/seo";
import type { ReactNode } from "react";

export const metadata = buildPageMetadata({
  title: "Privacy & Youth Safety",
  description: "Privacy and youth-safety information for the Caledon United FC 2018 Girls 2026–27 team website.",
  path: "/privacy"
});

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
