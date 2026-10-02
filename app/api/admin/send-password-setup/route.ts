import { NextResponse } from "next/server";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://sgoxywyhaketjmdmkzhm.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_CxLW1DX-RFPSAr8T1iSbtQ_XTIye7Yy";

const ADMIN_EMAIL = "daniel.f.guerra@gmail.com";
const ACTIVATION_URL = "https://caledon-u9-girls-2026.netlify.app/activate";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { ok: false, error: "This activation endpoint is only available for the configured administrator." },
        { status: 403 }
      );
    }

    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(ACTIVATION_URL)}`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email }),
        cache: "no-store"
      }
    );

    const raw = await response.text();
    let detail: unknown = null;

    if (raw) {
      try {
        detail = JSON.parse(raw);
      } catch {
        detail = raw;
      }
    }

    if (!response.ok) {
      const message =
        typeof detail === "object" && detail && "msg" in detail
          ? String((detail as { msg?: unknown }).msg ?? "Supabase rejected the recovery request.")
          : typeof detail === "object" && detail && "message" in detail
            ? String((detail as { message?: unknown }).message ?? "Supabase rejected the recovery request.")
            : "Supabase rejected the recovery request.";

      return NextResponse.json(
        { ok: false, error: message, status: response.status },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { ok: true, message: "Password setup email requested successfully." },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to request the password setup email."
      },
      { status: 500 }
    );
  }
}
