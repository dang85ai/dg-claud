import { buildPageMetadata } from "@/lib/seo";
import type { ReactNode } from "react";

export const metadata = buildPageMetadata({
  title: "Parent Resources",
  description: "Get started with Spond, the Parent Portal, team forms, kit requests and game-day preparation for Caledon United FC 2018 Girls.",
  path: "/parents",
  previewImage: { url: "/assets/social/parents.jpg", width: 1200, height: 630, alt: "Caledon United parent resources artwork" }
});

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
