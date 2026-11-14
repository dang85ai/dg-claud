import { buildPageMetadata } from "@/lib/seo";
import type { ReactNode } from "react";

export const metadata = buildPageMetadata({
  title: "Game Day Guide",
  description: "Game-day checklist, arrival guidance, equipment reminders and sideline expectations for Caledon United FC 2018 Girls 2026–27.",
  path: "/game-day"
});

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
