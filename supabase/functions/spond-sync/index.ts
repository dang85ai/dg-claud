import { createClient } from "npm:@supabase/supabase-js@2.95.0";
import { runSync } from "../spond-api/sync.mjs";

Deno.serve(async (req: Request) => {
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
  if (req.method !== "POST") return reply({ error: "Method not allowed." }, 405);
  if (req.headers.has("Origin")) return reply({ error: "Server worker only." }, 403);
  const token = req.headers.get("Authorization")?.replace(/^Bearer /, "");
  if (!token || token.length !== 72) return reply({ error: "Unauthorized." }, 401);
  try {
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}").default;
    const client = createClient(Deno.env.get("SUPABASE_URL")!, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const authorized = await client.rpc("spond_sync_worker_authorized", { p_token: token });
    if (authorized.error || authorized.data !== true) return reply({ error: "Unauthorized." }, 401);
    return reply(await runSync(client, { email: Deno.env.get("SPOND_EMAIL"), password: Deno.env.get("SPOND_PASSWORD") }));
  } catch { return reply({ error: "Schedule sync failed. Check manager sync status." }, 502); }
});
