import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "End of Season",
  description: "Season recap, recognition, celebration and thank-you information for Caledon SC U9 Girls 2026.",
  alternates: { canonical: "/end-of-season" },
  openGraph: {
    title: "End of Season | Caledon U9 Girls 2026",
    description: "Season recap, recognition, celebration and thank-you information for Caledon SC U9 Girls 2026.",
    url: "/end-of-season"
  }
};

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
