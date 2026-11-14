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
      <main id="main-content" tabIndex={-1}>{children}</main>
      <Footer />
      <MobileNav />
    </div>
  );
}

