import type { Config } from "@netlify/functions";

export default async (request: Request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();

    const ADMIN_EMAIL = "daniel.f.guerra@gmail.com";
    const SUPABASE_URL =
      Netlify.env.get("NEXT_PUBLIC_SUPABASE_URL") ??
      "https://sgoxywyhaketjmdmkzhm.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY =
      Netlify.env.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ??
      "sb_publishable_CxLW1DX-RFPSAr8T1iSbtQ_XTIye7Yy";
    const ACTIVATION_URL =
      "https://caledon-u9-girls-2026.netlify.app/activate";

    if (email !== ADMIN_EMAIL) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "This recovery endpoint is only available for the configured administrator."
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
        }
      );
    }

    const upstream = await fetch(
      `${SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(ACTIVATION_URL)}`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      }
    );

    const raw = await upstream.text();
    let detail: any = null;

    if (raw) {
      try {
        detail = JSON.parse(raw);
      } catch {
        detail = raw;
      }
    }

    if (!upstream.ok) {
      const message =
        detail?.msg ??
        detail?.message ??
        detail?.error_description ??
        "Supabase rejected the recovery request.";

      return new Response(
        JSON.stringify({
          ok: false,
          error: String(message),
          status: upstream.status
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Password setup email requested successfully."
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to request password setup email."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
      }
    );
  }
};

export const config: Config = {
  path: "/api/admin/send-password-setup"
};
