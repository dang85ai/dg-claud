import { buildPageMetadata } from "@/lib/seo";
import type { ReactNode } from "react";

export const metadata = buildPageMetadata({
  title: "Team Kit & Sizing",
  description: "Explore Caledon United FC 2018 Girls home, away and goalkeeper kits, training wear and accessories. Get sizing tips and request team kit.",
  path: "/kit",
  previewImage: { url: "/assets/social/kit.jpg", width: 1200, height: 630, alt: "Red home and white away Caledon United kits" }
});

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
