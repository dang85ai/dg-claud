// Privacy-safe conversion events. Never send player names, emails, jersey numbers,
// form fields, or other personally identifying details to analytics.
export type PublicConversionEvent = "team_kit_request_submitted" | "team_sponsorship_inquiry_submitted";
type AnalyticsWindow = Window & { gtag?: (...args: unknown[]) => void };

export function trackPublicConversion(eventName: PublicConversionEvent): void {
  if (typeof window === "undefined") return;
  const ga = (window as AnalyticsWindow).gtag;
  if (typeof ga !== "function") return; // GA4 is optional; no request is sent unless configured.
  ga("event", eventName, { event_category: "team_website", engagement_type: "form_submission" });
}
