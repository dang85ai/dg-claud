
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("Authentication required.");

    const url = Deno.env.get("SUPABASE_URL")!;
    const publishableKey = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS")!)["default"];
    const supabase = createClient(url, publishableKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: userData, error: userError } = await supabase.auth.getUser(authHeader.slice(7));
    if (userError || !userData.user) throw new Error("Invalid or expired session.");

    const userId = userData.user.id;
    const [profileRes, rolesRes, guardianRes] = await Promise.all([
      supabase.from("profiles").select("id,full_name,display_name,phone").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("guardians").select("id,full_name,phone,neighbourhood").eq("user_id", userId).maybeSingle()
    ]);

    if (profileRes.error) throw profileRes.error;
    if (rolesRes.error) throw rolesRes.error;
    if (guardianRes.error) throw guardianRes.error;

    const guardian = guardianRes.data;
    const guardianId = guardian?.id ?? null;

    let mappings:any[] = [];
    let players:any[] = [];
    if (guardianId) {
      const mappingsRes = await supabase.from("player_guardians")
        .select("player_id,relationship,is_primary")
        .eq("guardian_id", guardianId);
      if (mappingsRes.error) throw mappingsRes.error;
      mappings = mappingsRes.data ?? [];

      const playerIds = mappings.map((m:any) => m.player_id);
      if (playerIds.length) {
        const playersRes = await supabase.from("players")
          .select("id,first_name,last_name,jersey_number,position")
          .in("id", playerIds)
          .eq("active", true);
        if (playersRes.error) throw playersRes.error;
        players = playersRes.data ?? [];
      }
    }

    const playerIds = players.map((p:any) => p.id);

    const [
      announcementsRes, eventsRes, ordersRes, formsRes, attendanceRes,
      carpoolRes, sisterhoodRes, mediaRes, preferencesRes, teamLinksRes
    ] = await Promise.all([
      supabase.from("announcements")
        .select("id,title,body,pinned,published_at,expires_at")
        .order("published_at", { ascending: false }).limit(20),
      supabase.from("events")
        .select("id,event_type,title,opponent,home_away,starts_at,ends_at,arrival_at,venue_name,venue_address,notes,uniform,status,weather_alert")
        .gte("starts_at", new Date(Date.now() - 86400000).toISOString())
        .order("starts_at", { ascending: true }).limit(50),
      guardianId
        ? supabase.from("kit_orders")
            .select("id,player_id,total_cad,payment_status,ordered_at,updated_at")
            .eq("guardian_id", guardianId).order("ordered_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      guardianId
        ? supabase.from("form_submissions")
            .select("id,form_template_id,player_id,signed_at,pdf_path")
            .eq("guardian_id", guardianId).order("signed_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      playerIds.length
        ? supabase.from("attendance")
            .select("event_id,player_id,status,note,updated_at")
            .in("player_id", playerIds)
        : Promise.resolve({ data: [], error: null }),
      supabase.from("carpool_posts")
        .select("id,created_by,player_id,kind,neighbourhood,seats,event_id,note,active,created_at")
        .eq("active", true).order("created_at", { ascending: false }).limit(50),
      supabase.from("sisterhood_posts")
        .select("id,player_id,category,body,status,created_at")
        .order("created_at", { ascending: false }).limit(50),
      supabase.from("media_items")
        .select("id,album_id,media_type,processed_private_path,thumbnail_path,status,caption,taken_at,created_at")
        .order("created_at", { ascending: false }).limit(50),
      supabase.from("notification_preferences")
        .select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("team_links")
        .select("link_key,label,url,description")
        .eq("enabled", true)
        .order("sort_order", { ascending: true })
    ]);

    const results = [announcementsRes, eventsRes, ordersRes, formsRes, attendanceRes, carpoolRes, sisterhoodRes, mediaRes, preferencesRes, teamLinksRes];
    for (const r of results) if (r.error) throw r.error;

    return new Response(JSON.stringify({
      user: { id: userId, email: userData.user.email ?? null },
      profile: profileRes.data,
      roles: (rolesRes.data ?? []).map((r:any) => r.role),
      guardian,
      player_links: mappings,
      players,
      announcements: announcementsRes.data ?? [],
      events: eventsRes.data ?? [],
      kit_orders: ordersRes.data ?? [],
      form_submissions: formsRes.data ?? [],
      attendance: attendanceRes.data ?? [],
      carpool: carpoolRes.data ?? [],
      sisterhood: sisterhoodRes.data ?? [],
      media: mediaRes.data ?? [],
      notification_preferences: preferencesRes.data ?? null,
      team_links: teamLinksRes.data ?? []
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load dashboard.";
    const status = message.includes("Authentication") || message.includes("session") ? 401 : 400;
    return new Response(JSON.stringify({ error: message }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  }
});
