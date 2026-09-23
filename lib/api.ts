import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabase } from "@/lib/supabase";

export const endpoints = {
  publicSite: `${SUPABASE_URL}/functions/v1/public-site-data`,
  calendar: `${SUPABASE_URL}/functions/v1/team-calendar`,
  contact: `${SUPABASE_URL}/functions/v1/contact-submit`,
  parentDashboard: `${SUPABASE_URL}/functions/v1/parent-dashboard`,
  adminDashboard: `${SUPABASE_URL}/functions/v1/admin-dashboard`,
  parentActions: `${SUPABASE_URL}/functions/v1/parent-actions`,
  adminActions: `${SUPABASE_URL}/functions/v1/admin-actions`,
  mediaUpload: `${SUPABASE_URL}/functions/v1/media-upload`,
  formPdf: `${SUPABASE_URL}/functions/v1/form-pdf`,
  handoverExport: `${SUPABASE_URL}/functions/v1/handover-export`
};

export async function publicFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok) {
    const message = contentType.includes("application/json")
      ? (await response.json())?.error
      : await response.text();
    throw new Error(message || "Request failed.");
  }

  return response.json() as Promise<T>;
}

export async function authedFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Please sign in.");

  const response = await fetch(url, {
    ...init,
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok) {
    const body = contentType.includes("application/json")
      ? await response.json()
      : { error: await response.text() };
    const error = new Error(body.error || "Request failed.") as Error & {
      mfa_required?: boolean;
    };
    error.mfa_required = Boolean(body.mfa_required);
    throw error;
  }

  return response.json() as Promise<T>;
}
