import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Parent Resources",
  description: "Parent resources for Caledon SC U9 Girls 2026–27 including game day, development, FAQ and team standards.",
  alternates: { canonical: "/parents" },
  openGraph: {
    title: "Parent Resources | Caledon U9 Girls 2026–27",
    description: "Parent resources for Caledon SC U9 Girls 2026–27 including game day, development, FAQ and team standards.",
    url: "/parents"
  }
};

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
