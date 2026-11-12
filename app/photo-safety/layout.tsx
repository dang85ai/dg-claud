import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Photo & Media Safety",
  description: "Photo consent, privacy and media-safety practices for Caledon United FC 2018 Girls 2026–27.",
  alternates: { canonical: "/photo-safety" },
  openGraph: {
    title: "Photo & Media Safety | Caledon United FC 2018 Girls 2026–27",
    description: "Photo consent, privacy and media-safety practices for Caledon United FC 2018 Girls 2026–27.",
    url: "/photo-safety"
  }
};

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
