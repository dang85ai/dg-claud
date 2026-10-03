import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Game Day Guide",
  description: "Game-day checklist, arrival guidance, equipment reminders and sideline expectations for Caledon SC U9 Girls 2026–27.",
  alternates: { canonical: "/game-day" },
  openGraph: {
    title: "Game Day Guide | Caledon U9 Girls 2026–27",
    description: "Game-day checklist, arrival guidance, equipment reminders and sideline expectations for Caledon SC U9 Girls 2026–27.",
    url: "/game-day"
  }
};

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
