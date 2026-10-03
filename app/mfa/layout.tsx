import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "MFA Security",
  description: "Secure multi-factor authentication for Caledon U9 Girls team management.",
  path: "/mfa",
  index: false
});

export default function RouteLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
