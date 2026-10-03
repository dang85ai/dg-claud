import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Parent Login",
  description: "Secure sign-in for the Caledon U9 Girls parent portal.",
  path: "/login",
  index: false
});

export default function RouteLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
