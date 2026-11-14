import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import type { ReactNode } from "react";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header />
      <DevelopmentBanner />
      <main id="main-content">{children}</main>
      <Footer />
      <MobileNav />
    </div>
  );
}

