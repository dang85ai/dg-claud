import { buildPageMetadata } from "@/lib/seo";
import type { ReactNode } from "react";

export const metadata = buildPageMetadata({
  title: "Photo & Media Safety",
  description: "Photo consent, privacy and media-safety practices for Caledon United FC 2018 Girls 2026–27.",
  path: "/photo-safety"
});

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
