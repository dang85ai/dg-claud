import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Manager Command Centre",
  description: "Private Caledon U9 Girls management area.",
  path: "/admin",
  index: false
});

export default function RouteLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
