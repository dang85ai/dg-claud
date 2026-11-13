import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Request a Parent Invite",
  description: "Request access to the Caledon United FC 2018 Girls Parent Portal.",
  alternates: { canonical: "/request-invite" },
  robots: { index: false, follow: true }
};

export default function RequestInviteLayout({ children }: { children: ReactNode }) {
  return children;
}
