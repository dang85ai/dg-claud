import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const site = "https://caledonunited2018girls.ca";
const headers = {
  "Access-Control-Allow-Origin": site,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store"
};
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return reply({ error: "Method not allowed." }, 405);
  if (req.headers.get("Origin") !== site) return reply({ error: "Use the team website." }, 403);

  try {
    const body = await req.text();
    if (body.length > 4096) return reply({ error: "Request is too large." }, 400);
    const input = JSON.parse(body);
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}").default
      || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    if (input.action === "submit") {
      if (clean(input.website)) return reply({ ok: true });
      const parent_name = clean(input.parent_name);
      const player_name = clean(input.player_name);
      const email = clean(input.email).toLowerCase();
      if (!parent_name || parent_name.length > 100 || !player_name || player_name.length > 100 ||
          email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return reply({ error: "Enter your name, a valid email and the player’s name." }, 400);
      }
      const result = await admin.from("parent_invite_requests").insert({ parent_name, player_name, email });
      if (result.error && result.error.code !== "23505") throw result.error;
      return reply({ ok: true });
    }

    if (!["approve", "decline"].includes(input.action)) return reply({ error: "Unknown action." }, 400);
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return reply({ error: "Sign in to review requests." }, 401);
    const token = auth.slice(7);
    const user = await admin.auth.getUser(token);
    if (user.error || !user.data.user) return reply({ error: "Sign in again." }, 401);
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    const roles = await admin.from("user_roles").select("role").eq("user_id", user.data.user.id);
    if (payload.aal !== "aal2" || !roles.data?.some(role => ["admin", "manager"].includes(role.role))) {
      return reply({ error: "Manager MFA required." }, 403);
    }

    const reviewed_at = new Date().toISOString();
    const claim = await admin.from("parent_invite_requests")
      .update({ status: input.action === "approve" ? "sending" : "declined", reviewed_at, reviewed_by: user.data.user.id })
      .eq("id", input.id).in("status", ["pending", "failed"]).select("id,email,parent_name").maybeSingle();
    if (claim.error) throw claim.error;
    if (!claim.data) return reply({ error: "This request has already been reviewed or is being sent." }, 409);
    if (input.action === "decline") return reply({ message: "Request declined." });

    const publishable = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}").default
      || Deno.env.get("SUPABASE_ANON_KEY")!;
    const manager = createClient(url, publishable, {
      global: { headers: { Authorization: auth } }, auth: { persistSession: false }
    });
    const { id, email, parent_name } = claim.data;
    let status = "failed";
    let message = "The invitation email could not be confirmed. Check the mail settings before retrying.";
    try {
      const prepared = await manager.rpc("prepare_parent_activation", { invite_email: email, invite_full_name: parent_name });
      if (prepared.error) throw prepared.error;
      const sent = await admin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: parent_name },
        redirectTo: site + "/auth/finish"
      });
      if (!sent.error) {
        status = "accepted";
        message = "Invitation accepted for sending. Inbox delivery is unconfirmed.";
      } else if (sent.error.code === "email_exists") {
        status = "existing";
        message = "An account already exists. Ask the parent to sign in or recover their password.";
      }
    } catch {
      // Persist the failed attempt without recording tokens or provider details.
    }
    const saved = await admin.from("parent_invite_requests").update({ status }).eq("id", id).eq("status", "sending");
    if (saved.error) throw saved.error;
    return reply({ message });
  } catch {
    return reply({ error: "Unable to process the request. Please try again later." }, 400);
  }
});

