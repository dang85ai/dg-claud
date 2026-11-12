import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "End of Season",
  description: "Season recap, recognition, celebration and thank-you information for Caledon United FC 2018 Girls 2026–27.",
  // Season recap is a placeholder until real 2026–27 results and events can be published.
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  openGraph: {
    title: "End of Season | Caledon United FC 2018 Girls 2026–27",
    description: "Season recap, recognition, celebration and thank-you information for Caledon United FC 2018 Girls 2026–27.",
    url: "/end-of-season"
  }
};

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
