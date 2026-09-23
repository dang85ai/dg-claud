import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Photo & Media Safety",
  description: "Photo consent, privacy and media-safety practices for Caledon SC U9 Girls 2026.",
  alternates: { canonical: "/photo-safety" },
  openGraph: {
    title: "Photo & Media Safety | Caledon U9 Girls 2026",
    description: "Photo consent, privacy and media-safety practices for Caledon SC U9 Girls 2026.",
    url: "/photo-safety"
  }
};

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
