"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
// Keep analytics away from account, youth-profile, forms and management routes.
const privateRoute = /^\/(?:portal|admin|roster|media|order|login|mfa|activate|auth|__forms)(?:\/|$)/;
type AnalyticsWindow = Window & { gtag?: (...args: unknown[]) => void };

export function Analytics() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const publicPage = Boolean(pathname && !privateRoute.test(pathname));

  useEffect(() => {
    if (!measurementId || typeof window === "undefined") return;
    // Explicitly disable Google Analytics if client-side navigation reaches a protected route.
    (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = !publicPage;

    if (!publicPage || !ready || !pathname) return;
    const ga = (window as AnalyticsWindow).gtag;
    if (typeof ga !== "function") return;

    // No search parameters, player names, form data, or account IDs are sent.
    ga("event", "page_view", {
      page_path: pathname,
      page_location: window.location.origin + pathname,
      send_to: measurementId
    });
  }, [publicPage, pathname, ready]);

  if (!measurementId || !publicPage) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4-config" strategy="afterInteractive" onReady={() => setReady(true)}>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            send_page_view: false,
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
    </>
  );
}
