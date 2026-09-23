import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Photos & Media",
  description: "Consent-controlled team photos, albums and game recaps for Caledon SC U9 Girls 2026.",
  alternates: { canonical: "/media" },
  openGraph: {
    title: "Photos & Media | Caledon U9 Girls 2026",
    description: "Consent-controlled team photos, albums and game recaps for Caledon SC U9 Girls 2026.",
    url: "/media"
  }
};

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
