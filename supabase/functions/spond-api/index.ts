import { createClient } from "npm:@supabase/supabase-js@2.95.0";
import { ConnectionError, handleRequest } from "./core.mjs";
import { runSync } from "./sync.mjs";

Deno.serve((req: Request) => handleRequest(req, {
  credentials: () => ({ email: Deno.env.get("SPOND_EMAIL"), password: Deno.env.get("SPOND_PASSWORD") }),
  syncAction: async (input: { action: string }, client: any) => {
    if (["sync_pause", "sync_resume"].includes(input.action)) {
      const changed = await client.from("spond_sync_config").update({ enabled: input.action === "sync_resume" }).eq("singleton", true).select("enabled").single();
      if (changed.error) throw new ConnectionError("sync_unavailable", "Unable to change sync settings.", 503);
    }
    if (input.action === "sync_now") {
      const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}").default;
      const worker = createClient(Deno.env.get("SUPABASE_URL")!, key, { auth: { persistSession: false, autoRefreshToken: false } });
      await runSync(worker, { email: Deno.env.get("SPOND_EMAIL"), password: Deno.env.get("SPOND_PASSWORD") });
    }
    const status = await client.from("spond_sync_config").select("enabled,group_name,last_attempt_at,last_success_at,last_error,last_summary").eq("singleton",true).single();
    if (status.error) throw new ConnectionError("sync_unavailable", "Schedule sync is not available yet.", 503);
    return { ok: true, sync: status.data };
  },
  authorize: async (request: Request) => {
    const header = request.headers.get("Authorization");
    if (!header?.startsWith("Bearer ")) throw new ConnectionError("unauthorized", "Please sign in.", 401);
    const token = header.slice(7);
    const key = Deno.env.get("SUPABASE_ANON_KEY") || JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}").default;
    const client = createClient(Deno.env.get("SUPABASE_URL")!, key, {
      global: { headers: { Authorization: header } }, auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) throw new ConnectionError("unauthorized", "Invalid or expired session.", 401);
    const roles = await client.from("user_roles").select("role").eq("user_id", data.user.id);
    if (roles.error || !roles.data?.some((row: { role: string }) => ["manager", "admin"].includes(row.role))) {
      throw new ConnectionError("forbidden", "Manager access required.", 403);
    }
    // Decode assurance only after getUser has validated this token with Supabase Auth.
    const encoded = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=")));
    if (claims.aal !== "aal2") throw new ConnectionError("mfa_required", "Complete manager MFA before connecting Spond.", 403);
    return client;
  }
}));
