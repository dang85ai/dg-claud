import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Complete Team Invitation",
  description: "Private team account activation.",
  path: "/auth/finish",
  index: false
});

export default function RouteLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
