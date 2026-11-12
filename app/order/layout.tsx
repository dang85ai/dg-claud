import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Team Kit Request",
  description: "Submit a teamwear request for Caledon United FC 2018 Girls, including sizes and customization preferences.",
  alternates: { canonical: "/order" },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } }
};

export default function OrderLayout({ children }: { children: ReactNode }) {
  return children;
}
