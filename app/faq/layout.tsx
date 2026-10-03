import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Parent FAQ",
  description: "Answers to common Caledon U9 Girls parent questions about schedules, attendance, venues, communication and team operations.",
  path: "/faq",
  index: true
});

export default function RouteLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
